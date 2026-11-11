"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const href = "/demos/teacher";

export function TeacherDemoLink({
  onFocus,
  onPointerEnter,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "prefetch">) {
  const router = useRouter();

  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onFocus={(event) => {
        onFocus?.(event);
        if (event.currentTarget.matches(":focus-visible")) router.prefetch(href);
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse" || event.pointerType === "pen") router.prefetch(href);
      }}
    />
  );
}
