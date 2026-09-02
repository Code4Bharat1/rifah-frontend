"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/providers/auth-provider";
import { useRouter } from "next/navigation";

export function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  roleTarget = "customer",
  text = "Continue with Google",
  onSuccess,
  onError,
  className = "",
  disabled = false,
}) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    (typeof window !== "undefined" ? window.ENV?.GOOGLE_CLIENT_ID : "");

  useEffect(() => {
    // Load Google Identity Services script if not present
    if (typeof window !== "undefined" && !window.google && clientId) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [clientId]);

  const handleGoogleClick = () => {
    if (disabled || loading) return;

    if (!clientId) {
      const errorMsg =
        "Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env file.";
      if (onError) onError(errorMsg);
      else alert(errorMsg);
      return;
    }

    if (typeof window === "undefined" || !window.google) {
      // Fallback: direct OAuth2 redirect or GIS
      const redirectUri = `${window.location.origin}/api/auth/callback/google`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${Date.now()}`;
      window.location.href = googleAuthUrl;
      return;
    }

    setLoading(true);

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Fetch user info with access token to send credential
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const userInfo = await userInfoRes.json();

              // If id_token exists in response or simulated token
              const credential = tokenResponse.id_token || tokenResponse.access_token;

              const loggedInUser = await loginWithGoogle({
                credential,
                roleTarget,
              });

              if (onSuccess) {
                onSuccess(loggedInUser);
              } else if (loggedInUser.isProfileComplete === false) {
                router.push("/onboarding");
              } else if (loggedInUser.role === "business_owner") {
                router.push("/biz");
              } else {
                router.push("/me");
              }
            } catch (err) {
              const msg = err.message || "Google authentication failed on server.";
              if (onError) onError(msg);
              else alert(msg);
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          setLoading(false);
          const msg = err.message || "Google sign-in was cancelled or failed.";
          if (onError) onError(msg);
        },
      });

      client.requestAccessToken();
    } catch (err) {
      // Fallback to ID token prompt
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const loggedInUser = await loginWithGoogle({
              credential: response.credential,
              roleTarget,
            });

            if (onSuccess) {
              onSuccess(loggedInUser);
            } else if (loggedInUser.isProfileComplete === false) {
              router.push("/onboarding");
            } else if (loggedInUser.role === "business_owner") {
              router.push("/biz");
            } else {
              router.push("/me");
            }
          } catch (serverErr) {
            const msg = serverErr.message || "Failed to authenticate with Google.";
            if (onError) onError(msg);
            else alert(msg);
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={`relative flex w-full items-center justify-center gap-3 border-border bg-surface font-medium hover:border-primary/40 hover:bg-muted/40 transition-colors ${className}`}
      onClick={handleGoogleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span>Authenticating with Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon className="h-4 w-4 shrink-0" />
          <span>{text}</span>
        </>
      )}
    </Button>
  );
}

export default GoogleAuthButton;
