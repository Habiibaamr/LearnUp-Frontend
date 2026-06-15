import { getItem } from "../utils/storage.js";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function getStoredToken() {
  const session = getItem("learnup:session") || {};
  const currentUser = getItem("learnup:currentUser") || {};

  return (
    session.accessToken ||
    session.access_token ||
    session.token ||
    currentUser.accessToken ||
    currentUser.access_token ||
    currentUser.token ||
    ""
  );
}

function getErrorMessage(status, data, fallback) {
  if (data?.detail) {
    return Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg || item.message || String(item)).join(", ")
      : String(data.detail);
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
  if (!API_BASE_URL) {
    console.info(
      "[LearnUp] VITE_API_BASE_URL is not configured; no backend request was sent.",
    );

    return {
      ok: false,
      status: 0,
      data: null,
      message: "VITE_API_BASE_URL is not configured.",
    };
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const token = getStoredToken();
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const hasBody = body !== undefined && body !== null;

  if (hasBody && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
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
      return {
        ok: false,
        status: response.status,
        data,
        message: getErrorMessage(response.status, data),
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
      message: "OK",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: error?.message || "Network request failed.",
    };
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

export { API_BASE_URL };
