import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAuth } from "@/lib/withAuth";

const prisma = new PrismaClient();

export const POST = withAuth(async (req: Request, user: any) => {
  try {
    const { comment, postId } = await req.json();

    // Validate input
    if (!comment || !postId) {
      return NextResponse.json(
        { message: "comment and postId are required" },
        { status: 400 }
      );
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Create the comment
    const myComment = await prisma.comments.create({
      data: {
        comment,
        postId,
        userId: user.userId,
      },
      select: {
        id: true,
        post: {
          select: {
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            fileUrl: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Comment added successfully",
        myComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
