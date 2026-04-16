import { createContext, useContext, useRef } from "react";

const TransferContext = createContext();

export const TransferProvider = ({ children }) => {
  const pcRef = useRef(null);
  const channelRef = useRef(null);

  return (
    <TransferContext.Provider value={{ pcRef, channelRef }}>
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => useContext(TransferContext);