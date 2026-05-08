const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Auth
export const authApi = {
  signup: (name: string, email: string, password: string, confirmPassword: string) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password, confirmPassword }) }),
  login: (email: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: (token: string) => request("/api/auth/me", {}, token),
  updateProfile: (token: string, data: object) =>
    request("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) }, token),
};

// Reports
export const reportsApi = {
  list: (token: string) => request("/api/reports", {}, token),
  create: (token: string, formData: FormData) =>
    fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      return d;
    }),
  delete: (token: string, id: string) =>
    request(`/api/reports/${id}`, { method: "DELETE" }, token),
};

// Activity
export const activityApi = {
  list: (token: string, days = 14) => request(`/api/activity?days=${days}`, {}, token),
  log: (token: string, data: object) =>
    request("/api/activity", { method: "POST", body: JSON.stringify(data) }, token),
};

// Risk
export const riskApi = {
  get: (token: string) => request("/api/risk", {}, token),
};

// Chatbot
export const chatbotApi = {
  send: (token: string, message: string, history: { role: string; content: string }[]) =>
    request("/api/chatbot", { method: "POST", body: JSON.stringify({ message, history }) }, token),
};
