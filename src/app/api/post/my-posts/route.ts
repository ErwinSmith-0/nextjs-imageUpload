// File: src/app/api/protected/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../../../../lib/withAuth";
import { PrismaClient } from "@prisma/client";
// Initialize Prisma Client
const prisma = new PrismaClient();
export const GET = withAuth(async (req: NextRequest, user: any) => {
  // Logic for the protected route
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      authorId: user.userId,
    },
    select: {
      id: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      Comments: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      content: true,
      fileUrl: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({
    message: "All Posts",
    posts,
  });
});
