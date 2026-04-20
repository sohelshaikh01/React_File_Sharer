import { useEffect, useState } from "react";
import { transferAPI } from "../api/transfer.api";

// ✅ moved outside (fixes your error)
const Card = ({ t }) => {
  const percent =
    t.status === "completed" ? 100 :
    t.status === "started" ? 0 : 50;

  const formatFileSize = (bytes = 0) => {
    const KB = 1024;
    const MB = KB * 1024;

    if (bytes < KB) return `${bytes} B`;

    if (bytes < MB) {
      const value = bytes / KB;
      return `${Number.isInteger(value) ? value : value.toFixed(1)} KB`;
    }

    const value = bytes / MB;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-4 items-center bg-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100">
      
      {/* File Name */}
      <p className="font-medium text-gray-800 truncate">
        {t.fileMeta.fileName}
      </p>

      {/* Size */}
      <p className="text-sm text-gray-500 text-center">
        {formatFileSize(t.fileMeta.fileSize)}
      </p>

      {/* Date */}
      <p className="text-xs text-gray-400 text-center">
        {new Date(t.createdAt).toLocaleString()}
      </p>

      {/* Completion */}
      <div className="flex items-center gap-2">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${
              percent === 100
                ? "bg-green-500"
                : percent === 0
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-10 text-right">
          {percent}%
        </span>
      </div>
    </div>
  );
};

export default function History() {
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await transferAPI.history();
      setSentFiles(res.data.data.sentFiles || []);
      setReceivedFiles(res.data.data.receivedFiles || []);
    })();
  }, []);

  return (
    <div className="py-10 px-14 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen w-full">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl mb-6 font-bold text-gray-800">
          History
        </h1>

        {/* SENT FILES */}
        <h2 className="mb-3 text-xl font-semibold text-gray-700">
          Sent Files
        </h2>

        {sentFiles.length > 0 ? (
          <div className="bg-gray-100 rounded-xl p-4 mb-10 border">

            {/* Header */}
            <div className="grid grid-cols-4 pb-3 mb-3 border-b border-dashed text-gray-600 font-semibold  ">
              <p>File Name</p>
              <p className="text-center">Size</p>
              <p className="text-center">Date</p>
              <p className="text-center">Completion</p>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {sentFiles.map((t) => (
                <Card key={t._id} t={t} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-8 text-center text-gray-400">
            No files sent
          </p>
        )}

        {/* RECEIVED FILES */}
        <h2 className="mb-3 text-xl font-semibold text-gray-700">
          Received Files
        </h2>

        {receivedFiles.length > 0 ? (
          <div className="bg-linear-to-br from-gray-100 to-green-50 rounded-xl p-4 mb-10 border">

            {/* Header */}
            <div className="grid grid-cols-4 pb-3 mb-3 border-b border-dashed text-gray-600 font-semibold ">
              <p>File Name</p>
              <p className="text-center">Size</p>
              <p className="text-center">Date</p>
              <p className="text-center">Completion</p>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {receivedFiles.map((t) => (
                <Card key={t._id} t={t} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-8 text-center text-gray-400">
            No files received
          </p>
        )}

      </div>
    </div>
  );
}