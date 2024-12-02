// File: src/app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../../../../lib/withAuth";

export const GET = withAuth(async (req: NextRequest, user: any) => {
  // Logic for the protected route
  return NextResponse.json({
    message: "Protected content",
    user,
  });
});
