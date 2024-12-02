import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function authMiddleware(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const secretKey = process.env.JWT_SECRET; // Ensure this is set in your `.env` file
    const decoded = jwt.verify(token, secretKey!);
    return { user: decoded }; // Attach decoded user info
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
