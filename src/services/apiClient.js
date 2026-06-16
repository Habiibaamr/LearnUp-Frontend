const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://learn-up-project-vnmh.vercel.app"
).replace(/\/+$/, "");
const ACCESS_TOKEN_STORAGE_KEY = "learnup_access_token";

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, path = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.path = path;
  }
}

function getAccessToken() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return "";
    }

    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function getErrorMessage(status, data, fallback) {
  if (status === 401) {
    return "Your session expired. Please login again.";
  }

  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          const fieldPath = Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== "body").join(".")
            : "";
          const message = item.msg || item.message || String(item);

          return fieldPath ? `${fieldPath}: ${message}` : message;
        })
        .join(", ");
    }

    return String(data.detail);
  }

  if (data?.message) {
    return String(data.message);
  }

  return fallback || `Request failed with status ${status}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request(path, { method = "GET", body, headers = {}, signal } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!API_BASE_URL) {
    throw new ApiError("VITE_API_BASE_URL is not configured.", {
      status: 0,
      path: normalizedPath,
    });
  }

  const token = getAccessToken();
  const requestHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const hasBody = body !== undefined && body !== null;

  if (body instanceof FormData) {
    delete requestHeaders["Content-Type"];
  }

  try {
    if (normalizedPath === "/admin/create-student-account") {
      console.log("CALLING BACKEND CREATE STUDENT");
    }

    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method,
      headers: requestHeaders,
      body: hasBody
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      signal,
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(getErrorMessage(response.status, data), {
        status: response.status,
        data,
        path: normalizedPath,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error?.message || "Network request failed.", {
      status: 0,
      path: normalizedPath,
    });
  }
}

export const apiClient = {
  request,
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL };
