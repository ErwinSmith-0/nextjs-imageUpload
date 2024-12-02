import { NextResponse } from "next/server";
import { authMiddleware } from "../middleware/middleware";

export function withAuth(handler: Function) {
  return async (req: Request) => {
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Middleware returned an error response
    }

    // Pass the authenticated user to the handler
    const { user } = authResult;
    return handler(req, user);
  };
}
