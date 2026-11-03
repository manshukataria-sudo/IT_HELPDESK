export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await apiFetch(endpoint, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      message: text || "Invalid server response",
    };
  }

  if (!response.ok) {
    console.error("API Error:", response.status, data);
    throw new Error(data.message || "Request failed");
  }

  return data;
};
