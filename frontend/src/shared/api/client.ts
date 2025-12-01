const API_BASE = "http://localhost:8000";

async function request<T = any>(path: string, init: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: HeadersInit = {
    ...init.headers,
  };

  // FormData의 경우 Content-Type을 설정하지 않음
  // 브라우저가 자동으로 multipart/form-data로 설정하도록 함
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const defaultInit: RequestInit = {
    credentials: "include", // include cookies for httpOnly token
    ...init,
    headers,
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
