import API from "./baseAPI";

export const signalAPI = {
  // OFFER
  sendOffer: ({ sessionId, offer }) =>
    API.post("/signal/offer", { sessionId, offer }),

  getOffer: (sessionId) =>
    API.get(`/signal/offer/${sessionId}`),

  // ANSWER
  sendAnswer: ({ sessionId, answer }) =>
    API.post("/signal/answer", { sessionId, answer }),

  getAnswer: (sessionId) =>
    API.get(`/signal/answer/${sessionId}`),

  // ICE
  sendCandidate: ({ sessionId, candidate }) =>
    API.post("/signal/candidate", { sessionId, candidate }),

  getCandidates: (sessionId) =>
    API.get(`/signal/candidate/${sessionId}`),
};