import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable";
import path from "path";
import fs from "fs/promises";
import { withAuth } from "@/lib/withAuth";
import { Readable } from "stream";
import { IncomingMessage } from "http"; // Import IncomingMessage from http

// Initialize Prisma Client
const prisma = new PrismaClient();

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert Web API Request to Node.js IncomingMessage
function createIncomingMessage(req: Request): IncomingMessage {
  const readable = Readable.from(
    req.body as unknown as AsyncIterable<Uint8Array>
  );
  const incomingMessage = Object.assign(readable, {
    headers: Object.fromEntries(req.headers),
    method: req.method,
    url: req.url,
  });
  return incomingMessage as IncomingMessage;
}

export const POST = withAuth(async (req: Request, user: any) => {
  try {
    // Convert the Request object to a Node.js IncomingMessage-like object
    const nodeReq = createIncomingMessage(req);

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "public/uploads"),
      keepExtensions: true,
    });

    const parsedData = await new Promise((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = parsedData as any;

    // Extract fields and file from parsed data
    const title = fields.title[0];
    const content = fields.content[0] || null; // Content is optional
    const published = fields.published[0] === "true"; // Parse published status
    // const published = fields.published; // Parse published status
    const file = files?.file; // Assumes the file input is named "file"

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }
    console.log(user);
    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 }
      );
    }
    // console.log(file[0].newFilename);

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate file path for saving
    const fileUrl = `/uploads/${file[0].newFilename}`;

    // Create the post in the database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        fileUrl,
        authorId: user.userId, // Author ID from the authenticated user
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
});
