let refreshPromise: Promise<string | null> | null = null;
let redirecting = false;

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

function redirectToLogin(): Response {
  if (!redirecting) {
    redirecting = true;
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
    window.location.href = "/login";
  }
  return new Response(null, { status: 401 });
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Already redirecting to login — don't fire more requests
  if (redirecting) return new Response(null, { status: 401 });

  const token = localStorage.getItem("accessToken");
  if (!token) {
    // No token at all — try a refresh before giving up
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const freshToken = await refreshPromise;
    if (!freshToken) return redirectToLogin();
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status !== 401) return res;

  // Deduplicate concurrent refresh calls
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newToken = await refreshPromise;
  if (!newToken) return redirectToLogin();

  // Retry with the new token
  headers.set("Authorization", `Bearer ${newToken}`);
  return fetch(input, { ...init, headers });
}
