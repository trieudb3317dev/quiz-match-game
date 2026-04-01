import { refreshToken } from "./auth";

// Performs a fetch that includes cookies and will attempt a single refresh+retry if the
// server responds with 401 Unauthorized. Returns the Response object (caller handles json parsing).
export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const baseInit: RequestInit = { credentials: "include", ...(init || {}) };

  const res = await fetch(input, baseInit);
  if (res.status !== 401) return res;

  // If 401, attempt to refresh once and retry
  try {
    await refreshToken();
  } catch (err) {
    // refresh failed; propagate original 401-like response by throwing
    const errObj: any = new Error("Refresh token failed");
    errObj.cause = err;
    throw errObj;
  }

  // Retry the original request after successful refresh
  return await fetch(input, baseInit);
}
