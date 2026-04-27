import API from "./baseAPI";

export const signalAPI = {
  sendOffer: ({ sessionId, offer }) =>
    API.post("/signal/offer", { sessionId, offer }),

  getOffer: (sessionId) =>
    API.get(`/signal/offer/${sessionId}`),

  sendAnswer: ({ sessionId, answer }) =>
    API.post("/signal/answer", { sessionId, answer }),

  getAnswer: (sessionId) =>
    API.get(`/signal/answer/${sessionId}`),

  sendCandidate: ({ sessionId, candidate, role }) =>
    API.post("/signal/candidate", { sessionId, candidate, role }),

  getCandidates: (sessionId, role) =>
    API.get(`/signal/candidate/${sessionId}/${role}`),
};