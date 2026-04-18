import { supabase } from "../lib/supabaseClient";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

function extFromUri(uri: string) {
  const clean = uri.split("?")[0];
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
  return ext || "jpg";
}

function getContentType(ext: string) {
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return `image/${ext}`;
}

export async function uploadCapturePhoto(userId: string, uri: string) {
  const ext = extFromUri(uri);
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const arrayBuffer = decode(base64);

  const { error: uploadError, data } = await supabase.storage
    .from("captures")
    .upload(filePath, arrayBuffer, {
      contentType: getContentType(ext),
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: pub } = supabase.storage
    .from("captures")
    .getPublicUrl(data.path);

  return {
    filePath: data.path,
    publicUrl: pub.publicUrl,
  };
}

export async function createCapture(payload: {
  user_id: string;
  species: string;
  weight_kg: number;
  size_cm?: number | null;
  city: string;
  zone: string;
  captured_at: string;
  photo_path?: string | null;
  photo_url?: string | null;
  ai_confidence?: number | null;
  ai_legal?: boolean | null;
  ai_rule?: string | null;
}) {
  const { error } = await supabase.from("captures").insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}