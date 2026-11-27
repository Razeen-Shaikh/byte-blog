import { z } from "zod";

import { auth } from "@/lib/auth";
import { ApiError, jsonCreated, jsonError } from "@/lib/api";

const uploadSchema = z.object({
  file: z.string().min(1),
  folder: z.string().max(80).optional(),
  filename: z.string().max(120).optional(),
});

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const body = await request.json();
    const { file, folder, filename } = uploadSchema.parse(body);

    if (!file.startsWith("data:")) {
      throw new ApiError("File must be a base64 data URL", 400);
    }

    if (hasCloudinaryConfig()) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      const uploaded = await cloudinary.uploader.upload(file, {
        folder: folder ?? "byte-blog",
        public_id: filename,
        resource_type: "auto",
      });

      return jsonCreated({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        provider: "cloudinary",
      });
    }

    if (!process.env.UPLOAD_STUB_ENABLED) {
      throw new ApiError(
        "Image upload is not configured. Set Cloudinary environment variables or enable UPLOAD_STUB_ENABLED=true for placeholder URLs.",
        503,
      );
    }

    const placeholder =
      process.env.UPLOAD_STUB_BASE_URL ??
      "https://placehold.co/1200x630/1e293b/e2e8f0/png?text=Byte+Blog";

    return jsonCreated({
      url: placeholder,
      provider: "stub",
      message: "Stored as placeholder URL (no persistent object storage configured).",
    });
  } catch (error) {
    return jsonError(error);
  }
}