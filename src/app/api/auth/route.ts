import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ error: "Hi" }, { status: 200 });
}
