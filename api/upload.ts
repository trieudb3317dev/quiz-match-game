import Constants from "expo-constants";
import { authFetch } from "./request";

const BASE_URL =
  Constants.expoConfig?.extra?.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";
const PREFIX = Constants.expoConfig?.extra?.NEXT_PUBLIC_API_PREFIX || "/api/v1";
const API_URL = `${BASE_URL}${PREFIX}`;

// Upload a file (FormData) to the server cloudinary endpoint. Accepts a React Native file object.
export async function uploadFileRN(file: {
  uri: string;
  name?: string;
  type?: string;
}) {
  const form = new FormData();
  // In React Native, FormData file field should be an object with uri, name, type
  form.append("file", {
    uri: file.uri,
    name: file.name || "avatar.jpg",
    type: file.type || "image/jpeg",
  } as any);

  const res = await authFetch(`${API_URL}/cloudinary/upload/file`, {
    method: "POST",
    body: form,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {}

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "Upload failed";
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
