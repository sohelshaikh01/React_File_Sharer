import { useEffect, useState } from "react";
import { transferAPI } from "../api/transfer.api";

export default function History() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await transferAPI.history();
      setSent(res.data.data.sentFiles || []);
      setReceived(res.data.data.receivedFiles || []);
    })();
  }, []);

  const Card = ({ t }) => {
    const percent =
      t.status === "completed" ? 100 :
      t.status === "started" ? 0 : 50;

    return (
      <div className="bg-white shadow p-4 rounded-lg flex justify-between">
        <div>
          <p className="font-medium">{t.fileMeta.fileName}</p>
          <p className="text-sm text-gray-400">
            {Math.round(t.fileMeta.fileSize / 1024)} KB
          </p>
        </div>

        <div className="text-right">
          <p>{percent}%</p>
          <p className="text-xs text-gray-500">
            {new Date(t.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <h1 className="text-2xl mb-6 font-semibold">History</h1>

      <h2 className="mb-2">Sent</h2>
      <div className="space-y-3 mb-6">
        {sent.map((t) => <Card key={t._id} t={t} />)}
      </div>

      <h2 className="mb-2">Received</h2>
      <div className="space-y-3">
        {received.map((t) => <Card key={t._id} t={t} />)}
      </div>
    </div>
  );
}