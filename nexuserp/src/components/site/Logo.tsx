import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly href?: string;
  readonly variant?: "light" | "dark" | "public";
}

export function Logo({ className, size = "md", href = "/", variant = "light" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      {/* X Icon: yellow arms + silver arms + hub */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow arms (top-left to bottom-right) */}
        <path
          d="M8 8 L22 24 L8 40"
          stroke="#FFD54A"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M40 8 L26 24 L40 40"
          stroke="#FFD54A"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Silver arms (top-right to bottom-left) */}
        <path
          d="M40 8 L24 24"
          stroke="#C7CCD1"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 40 L24 24"
          stroke="#C7CCD1"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center hub */}
        <circle cx="24" cy="24" r="5" fill="#C7CCD1" />
        <circle cx="24" cy="24" r="3" fill="#E8EAED" />
      </svg>

      {/* Brand name */}
      <span className={cn("font-sora font-semibold tracking-tight", text)}>
        <span
          className={
            variant === "dark"
              ? "text-ice-white"
              : variant === "public"
                ? "text-pub-text"
                : "text-graphite"
          }
        >
          nexus
        </span>
        <span className={variant === "public" ? "text-electric" : undefined} style={variant === "public" ? undefined : { color: "#FFD54A" }}>ERP</span>
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
