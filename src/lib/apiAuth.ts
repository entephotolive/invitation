import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function requireUserId(req: NextRequest): Promise<string> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

