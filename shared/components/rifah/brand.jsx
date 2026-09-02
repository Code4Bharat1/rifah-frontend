import Link from "next/link";

const logo = "/rifah1-logo.png";
import { cn } from "@shared/lib/utils";

export function RifahLogo({
  className,
  to = "/",
  label = "RIFAH Connect",
  showLabel = true,
  onDark = false,
}





) {
  return (
    <Link href={to} className={cn("flex min-w-0 items-center gap-2.5", className)} aria-label="RIFAH Connect home">
      <img
        src={logo}
        alt="RIFAH Chamber of Commerce and Industry"
        className="h-10 w-auto shrink-0 md:h-12"
      />
      {showLabel && (
        <span
          className={cn(
            "hidden min-w-0 border-l pl-2.5 text-sm font-semibold tracking-tight sm:block",
            onDark ? "border-primary-foreground/25 text-primary-foreground" : "border-border text-navy dark:text-foreground",
          )}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className }) {
  return <img src={logo} alt="RIFAH" className={cn("h-7 w-auto", className)} />;
}

