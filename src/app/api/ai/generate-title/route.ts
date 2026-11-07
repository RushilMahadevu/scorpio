import { NextResponse } from "next/server";
import { withAuthorizedRequest } from "@/lib/auth-verify";
export const POST = withAuthorizedRequest(async () => NextResponse.json({ title: "Physics conversation" }));
