export function classInvitePath(code: string) {
  return `/join/class/${encodeURIComponent(code)}`;
}

export function networkInvitePath(code: string) {
  return `/join/network/${encodeURIComponent(code)}`;
}

export function inviteAuthPath(page: "signup" | "login", kind: "class" | "network", code: string) {
  return `/${page}?${new URLSearchParams({ [kind === "class" ? "classCode" : "teacherInvite"]: code })}`;
}
