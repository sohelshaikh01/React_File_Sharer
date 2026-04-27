import API from "./baseAPI";

export const transferAPI = {
  // start transfer
  start: ({ receiversId, fileMeta }) =>
    API.post("/transfer/start", { receiversId, fileMeta }),

  // update progress
  update: ({ transferId, progress }) =>
    API.post("/transfer/update", { transferId, progress }),

  // complete transfer
  complete: ({ transferId }) =>
    API.post("/transfer/complete", { transferId }),

  // history
  history: () =>
    API.get("/transfer/history"),
};