const API_BASE = "http://127.0.0.1:8001";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      window.location.href = "/";
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.detail || "Request failed", response.status);
  }

  return response.json();
}

// auth apis
export async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.detail || "Login failed", response.status);
  }

  return response.json();
}

export async function apiRegister(email, password, gender) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, gender }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.detail || "Registration failed", response.status);
  }

  return response.json();
}

// wardrobe apis
export async function getWardrobe() {
  const data = await fetchWithAuth("/wardrobe");
  return data.map((item) => ({
    ...item,
    image_url: resolveImageUrl(item.image_url),
  }));
}

export async function addWardrobeItem(file) {
  const formData = new FormData();
  formData.append("file", file);
  const item = await fetchWithAuth("/wardrobe/add", {
    method: "POST",
    body: formData,
  });
  return { ...item, image_url: resolveImageUrl(item.image_url) };
}

export async function deleteWardrobeItem(id) {
  return fetchWithAuth(`/wardrobe/${id}`, {
    method: "DELETE",
  });
}

// recommend api
export async function getRecommendation(file) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await fetchWithAuth("/recommend", {
    method: "POST",
    body: formData,
  });
  return {
    ...data,
    from_wardrobe: data.from_wardrobe.map((item) => ({
      ...item,
      image_url: resolveImageUrl(item.image_url),
    })),
    from_internet: data.from_internet.map((item) => ({
      ...item,
      image_url: resolveImageUrl(item.image_url),
    })),
  };
}

// history api
export async function getHistory() {
  const data = await fetchWithAuth("/history");
  return data.map((entry) => ({
    ...entry,
    image_urls: entry.image_urls?.map(resolveImageUrl),
  }));
}