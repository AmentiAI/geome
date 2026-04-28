import { env } from "./env";

/**
 * Cloudflare R2 client (S3-compatible).
 *
 * We avoid pulling @aws-sdk/client-s3 into the bundle by default. When you need
 * presigned uploads (level thumbnails, audio, avatars), install the SDK and
 * implement here:
 *
 *   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
 *   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
 *
 * For now this module exposes the public URL helper used to construct asset
 * URLs that the game/web can read directly.
 */

export function r2PublicUrl(key: string): string {
  const base = env.R2_PUBLIC_BASE_URL();
  if (!base) return `/r2-stub/${key}`;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export function r2Configured(): boolean {
  return !!(env.R2_ACCOUNT_ID() && env.R2_ACCESS_KEY_ID() && env.R2_SECRET_ACCESS_KEY());
}

export type PresignResult = { uploadUrl: string; publicUrl: string; key: string };

export async function presignUpload(_key: string, _contentType: string): Promise<PresignResult> {
  // TODO: implement with @aws-sdk/client-s3 + s3-request-presigner once R2
  // credentials are populated. Throwing here surfaces the missing piece clearly.
  throw new Error("R2 presign not yet implemented — install @aws-sdk/client-s3 and finish r2.ts");
}
