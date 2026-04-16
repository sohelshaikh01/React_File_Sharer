import API from "./baseAPI";

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  me: () => API.get("/auth/me"),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
};