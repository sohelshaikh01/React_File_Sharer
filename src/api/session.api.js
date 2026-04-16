import API from "./baseAPI";

export const sessionAPI = {
  // ✅ create session
  create: (fileMeta) =>
    API.post("/session/create", { fileMeta }),

  // ✅ get session (expects sessionCode)
  get: (sessionCode) =>
    API.post("/session", { sessionCode }),

  // ✅ join session
  join: (sessionCode) =>
    API.post("/session/join", { sessionCode }),

  // ✅ delete session (params)
  delete: (sessionId) =>
    API.delete(`/session/${sessionId}`),
};