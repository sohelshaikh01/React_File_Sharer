import React, { useRef, useState } from "react";
import { sessionAPI } from "../api/session.api";
import { signalAPI } from "../api/signal.api";

export default function Receive() {
  const [code, setCode] = useState("");
  const [session, setSession] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState(null);

  const chunks = useRef([]);
  const received = useRef(0);
  const pcRef = useRef(null);

  const join = async () => {
    const res = await sessionAPI.join(code);
    setSession(res.data.data);
    startRTC(res.data.data);
  };

  const fileSizer = (bytes) => {
    if (bytes >= 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";

    if (bytes >= 1024)
      return (bytes / 1024).toFixed(1) + " KB";

    return bytes + " B";
  };

  const startRTC = async (s) => {
    const sessionId = s.sessionCode;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    pc.ondatachannel = (e) => {
      const dc = e.channel;

      dc.onmessage = (ev) => {
        chunks.current.push(ev.data);
        received.current += ev.data.byteLength;

        const percent =
          (received.current / s.fileMeta.fileSize) * 100;

        setProgress(percent);

        // ✅ FIX: handle completion here instead of onclose
        if (received.current === s.fileMeta.fileSize) {
          const blob = new Blob(chunks.current);
          const url = URL.createObjectURL(blob);

          setFileUrl(url);
          setProgress(100);
        }
      };

      // optional fallback (not required now)
      dc.onclose = () => {};
    };

    const answerPollRef = setInterval(async () => {
      try {
        const offerRes = await signalAPI.getOffer(sessionId);

        if (offerRes.data.data && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(
            offerRes.data.data.data
          );

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await signalAPI.sendAnswer({
            sessionId,
            answer,
          });
        }

        const cands = await signalAPI.getCandidates(sessionId);

        cands.data.data.forEach((c) => {
          try {
            pc.addIceCandidate(c.candidate);
          } catch {}
        });
      } catch {}
    }, 2000);

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        clearInterval(answerPollRef);
      }
    };
  };

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50">
      <div className="flex flex-col w-full min-h-screen py-10 px-14 items-center bg-linear-to-br from-blue-50 to-green-50">
        {!session ? (
          <div>
            <h2 className="text-2xl font-bold mb-1"> Enter Session Code </h2>
            <p className="text-gray-500 mb-4">
              Securely connect to a session to a begin receving
              architectural grade files.
            </p>

            <input value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-200/50 text-center outline-none p-3 px-5 rounded-xl text-xl mb-4"
              placeholder="🔑 Enter Session Code" />
            <button disabled={!code} onClick={join}
              className="rounded-xl px-5 py-2.5 bg-linear-to-r from-blue-600 to-sky-500 text-white w-full disabled:opacity-70" > Join Session </button>
          </div>
        ) : (
          <div className="max-w-2xl flex flex-col items-center">
            <h1 className="text-2xl font-bold "> Session Connected </h1>
            <p className="text-gray-500 mb-4"> Receiving files </p>

            <div className="relative flex items-center justify-center rounded-full"
              style={{ width: 140, height: 140, background: `conic-gradient(#2563eb ${progress}%, #e5e7eb ${progress}%)`, }} >

              <div className="absolute w-27.5 h-27.5 bg-white rounded-full flex flex-col items-center justify-center">
                <p className="font-bold text-2xl text-blue-500"> {Math.floor(progress)}% </p>
                <p className="text-xs text-gray-500"> SYNCING </p>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-xl font-medium"> {session?.fileMeta?.fileName} </p>
              <p> 
                {fileSizer(session?.fileMeta?.fileSize)} •{" "}
                {fileSizer(
                  session?.fileMeta?.fileSize -
                    (progress / 100) *
                      session?.fileMeta?.fileSize
                )}{" "}
                Remaining
              </p>
            </div>

            {progress === 100 && fileUrl && (
              <button onClick={() => {
                  const link = document.createElement("a");
                  link.href = fileUrl;
                  link.download = session?.fileMeta?.fileName;
                  link.click();
                }}
                className="mt-3 block bg-linear-to-br from-blue-600 to-sky-500 font-semibold text-white py-2.5 px-5 rounded-xl w-full text-center"
              > Download File </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}