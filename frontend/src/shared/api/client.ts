const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request<T = any>(path: string, init: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const defaultInit: RequestInit = {
    credentials: "include", // include cookies for httpOnly token
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  };

  const res = await fetch(url, defaultInit);

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let errorBody: any = null;
    try {
      if (contentType.includes("application/json"))
        errorBody = await res.json();
      else errorBody = await res.text();
    } catch (err) {
      errorBody = null;
    }
    const error = new Error(
      errorBody?.message || res.statusText || "Request failed",
    );
    (error as any).status = res.status;
    (error as any).body = errorBody;
    throw error;
  }

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

export default request;
