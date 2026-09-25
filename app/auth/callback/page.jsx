'use client';

import { useEffect, useState } from 'react';

// RIF-040: bridge page for native Google Sign-In. The RIFAH mobile app opens
// Google's OAuth consent screen in the system browser with this page's URL as
// the redirect_uri (Google's Web-type OAuth client only accepts https redirect
// URIs, not the app's custom `rifah://` scheme). Google redirects back here
// with the token in the URL fragment; this page immediately hands it off to
// the native app via the `rifah://auth/callback` deep link, which the app
// handles at src/app/auth/callback.tsx (rifah-app repo).
export default function GoogleAuthCallbackPage() {
  const [deepLink, setDeepLink] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const query = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;
    const params = new URLSearchParams(hash || query);

    const oauthError = params.get('error');
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');
    const state = params.get('state');

    if (!idToken && !accessToken) {
      setError('missing_token');
      return;
    }

    const forward = new URLSearchParams();
    if (idToken) forward.set('id_token', idToken);
    if (accessToken) forward.set('access_token', accessToken);
    if (state) forward.set('state', state);

    const url = `rifah://auth/callback?${forward.toString()}`;
    setDeepLink(url);
    window.location.href = url;
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {error ? (
        <>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#DC2626' }}>
            Google sign-in didn&apos;t complete ({error}).
          </p>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Please return to the RIFAH app and try again.
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
            Signing you in&hellip;
          </p>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Redirecting back to the RIFAH app.
          </p>
          {deepLink && (
            <a
              href={deepLink}
              style={{
                marginTop: 8,
                padding: '10px 20px',
                borderRadius: 10,
                background: '#0077E6',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Open RIFAH App
            </a>
          )}
        </>
      )}
    </div>
  );
}
