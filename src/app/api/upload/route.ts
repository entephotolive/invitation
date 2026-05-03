import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/apiAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireUserId(req);
    const body = (await req.json()) as { dataUrl?: string; kind?: "cover" | "music" };
    if (!body.dataUrl) {
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });
    }

    const baseFolder = process.env.CLOUDINARY_FOLDER || "invitations";
    const folder = body.kind ? `${baseFolder}/${body.kind}` : baseFolder;
    const asset = await uploadToCloudinary(body.dataUrl, folder);

    return NextResponse.json(asset);
  } catch (e: any) {
    const message = e?.message || "Upload failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

