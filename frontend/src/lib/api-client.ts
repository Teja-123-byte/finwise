import { getAuthTokenCookie } from "@/lib/auth-cookie";

const API_URL = import.meta.env.VITE_API_URL ?? "https://finwise-backend-x5st.onrender.com/api";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthTokenCookie();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the API. Start it with `npm run api` and check VITE_API_URL.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "The request could not be completed.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
