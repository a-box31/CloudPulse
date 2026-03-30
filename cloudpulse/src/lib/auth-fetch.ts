let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = await res.json();
    const token = data.accessToken;
    localStorage.setItem("accessToken", token);
    document.cookie = `accessToken=${token}; path=/; max-age=900; samesite=lax`;
    return token;
  } catch {
    return null;
  }
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    // No token at all — try a refresh before giving up
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    token = await refreshPromise;
    if (!token) {
      window.location.href = "/login";
      return new Response(null, { status: 401 });
    }
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status !== 401) return res;

  // Token expired — try to refresh
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newToken = await refreshPromise;
  if (!newToken) {
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
    window.location.href = "/login";
    return res;
  }

  // Retry with the new token
  headers.set("Authorization", `Bearer ${newToken}`);
  return fetch(input, { ...init, headers });
}
