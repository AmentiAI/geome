import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ablyConfigured, ablyRest } from "@/lib/ably";

export async function GET() {
  if (!ablyConfigured()) return new NextResponse("Realtime disabled", { status: 503 });
  const { userId } = await auth();
  const tokenRequest = await ablyRest().auth.createTokenRequest({ clientId: userId ?? "anon" });
  return NextResponse.json(tokenRequest);
}
