"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  className,
  children = "Sair",
  callbackUrl = "/login",
}: {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly callbackUrl?: string;
}) {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl })} className={className}>
      {children}
    </button>
  );
}
