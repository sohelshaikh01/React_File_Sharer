import React, { useEffect, useRef, useState } from "react";
import { sessionAPI } from "../api/session.api";
import { signalAPI } from "../api/signal.api";
import { transferAPI } from "../api/transfer.api";
import { toast } from "react-toastify";

export default function Transfer() {
  const [file, setFile] = useState(null);
  const [session, setSession] = useState(null);
  const [receivers, setReceivers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const transferIdRef = useRef(null);
  const pollRef = useRef(null);
  const offsetRef = useRef(0);

  const fileSizer = (bytes) => {
    if (bytes >= 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024)
      return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  const generateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    return () => {
      // component unmount cleanup
      if (session?._id) {
        sessionAPI.delete(session._id);
      }

      pcRef.current?.close();
      dcRef.current?.close();
    };
  }, [session]);

  // ---------------- CREATE SESSION ----------------
  const createSession = async () => {
    try {
      // ✅ generate hash
      const fileHash = await generateHash(file);

      // ✅ FIXED payload (with hash)
      const res = await sessionAPI.create({
        fileName: file.name,
        fileSize: file.size,
        fileHash,
      });

      setSession(res.data.data);

      const t = await transferAPI.start({
        receiversId:[],
        fileMeta: {
          fileName: file.name,
          fileSize: file.size,
          fileHash,
        },
      });

      transferIdRef.current = t.data.data._id;

      initWebRTC(res.data.data.sessionCode);
      startPolling(res.data.data.sessionCode);
    } catch {
      toast.error("Failed");
    }
  };

  // ---------------- POLLING ----------------
  const startPolling = (code) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await sessionAPI.get(code);
        const recs = res.data.data.receivers || [];

        setReceivers(recs);

        if (recs.length >= 5) {

          // update receivers
          
          clearInterval(pollRef.current);
        }

      } catch {}
    }, 2000);
  };

  // ---------------- WEBRTC ----------------
  const initWebRTC = async (sessionId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    const dc = pc.createDataChannel("file");
    dcRef.current = dc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalAPI.sendCandidate({ sessionId, candidate: e.candidate });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await signalAPI.sendOffer({ sessionId, offer });

    const answerPollRef = setInterval(async () => {
      try {
        const ans = await signalAPI.getAnswer(sessionId);

        if (ans.data.data) {
          await pc.setRemoteDescription(ans.data.data.data);
          clearInterval(answerPollRef);
        }

      } catch {}
    }, 2000);
  };

  // ---------------- START ----------------
  const startSending = () => {
    clearInterval(pollRef.current); // ✅ stop session polling
    setIsStarted(true);
    setIsPaused(false);
    sendChunks();
  };

  const sendChunks = () => {
    if (isPaused || dcRef.current.readyState !== "open") return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      dcRef.current.send(e.target.result);
      offsetRef.current += e.target.result.byteLength;

      const prog = (offsetRef.current / file.size) * 100;
      setProgress(prog);

      await transferAPI.update({
        transferId: transferIdRef.current,
        progress: Math.floor(prog),
      });

      if (offsetRef.current < file.size) sendChunks();
      else {
        // ✅ FIXED
        await transferAPI.complete(transferIdRef.current);

        // ✅ delete session after complete
        if (session?._id) {
          await sessionAPI.delete(session._id);
        }

        toast.success("Completed");
      }
    };

    reader.readAsArrayBuffer(
      file.slice(offsetRef.current, offsetRef.current + 16000)
    );
  };

  const stop = async () => {
    clearInterval(pollRef.current); // ✅ stop session polling

    pcRef.current?.close();
    dcRef.current?.close();

    if (session?._id) {
      await sessionAPI.delete(session._id);
    }

    await transferAPI.update({
      transferId: transferIdRef.current,
      progress: Math.floor(progress),
    });

    setSession(null);
    setFile(null);
    setProgress(0);
    setIsStarted(false);
    setIsPaused(false);
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(String(session?.sessionCode));
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col w-full py-10 px-14 items-center bg-linear-to-br from-blue-50 to-green-50">

        {!session ? (
          <div className="">
            <h1 className="text-2xl font-bold mb-1">Weightless sharing</h1>
            <p className="text-gray-500 mb-4">Drop your file into the field and watch them sync Across the globe instantly.</p>

            <div className="bg-white rounded-2xl h-50 border-2 border-dashed border-blue-500 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <p className="rounded-full p-4 text-2xl bg-linear-to-r from-blue-600 to-sky-500/80">{file ? "⬆️" : "📄"}</p>
                <label className={`${file ? "font-semibold text-xl" : "font-bold text-xl"}`} >{file ? file.name : "Choose File"}</label>
                {file && (<label>{fileSizer(file.size)}</label>)}
              </div>

              <input type="file" onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button disabled={!file} onClick={createSession}
              className="mt-5 w-full bg-linear-to-r from-blue-600 to-sky-500 text-white py-[10px] px-5 rounded-xl disabled:opacity-70"
            >
              Create Session
            </button>

          </div>
        ) : (
          <div className="flex flex-col max-w-2xl justify-center">
            
            {!isStarted && (
              <div className="text-center">
                <h1 className="text-2xl font-bold">Active Room</h1>
                <p className="font-xl text-gray-500 mb-4">LIVE SESSION</p>

                <div className="bg-white p-6 rounded-2xl space-y-4 text-center mb-6">
                
                <p className="text-gray-500 font-bold text-sm">SHARE THIS CODE</p>
                <div className="flex flex-row gap-2">
                  {String(session.sessionCode).split("").map((char, i) => (
                    <p
                    className="bg-slate-200/70 rounded-lg p-2 px-3 font-semibold text-xl"
                      key={i}
                    >
                      {char}
                    </p>
                  ))}
                </div>
                <button onClick={copySessionCode} type="button" className="text-blue-500 font-semibold hover:text-blue-400 transition">📋Copy Invite Code</button>
              </div>
            </div>)}

            {!isStarted && receivers.length < 5 && (
              <div className="bg-white p-4 py-3 text-black text-xl rounded-xl flex items-center gap-3 mb-6">
                
                <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <p> Waiting... {receivers.length}/5 </p>

              </div>
            )}

            {receivers.length > 0 && !isStarted && (
              <button onClick={startSending}
                className="bg-linear-to-br from-blue-600 to-sky-500 text-white px-4 py-2 rounded-lg" >
                Start Sync Session 🚀
              </button>
            )}

            {isStarted && (
              <>
                <h1 className="font-bold text-2xl">Active Transfer</h1>
                <p>Synchonzing across {receivers.length} active nodes </p>

                {/* Repeated Code */}
                <div className="flex flex-col items-center gap-4 my-4">
                  <div className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: 140,
                      height: 140,
                      background: `conic-gradient(#2563eb ${progress}%, #e5e7eb ${progress}%)`,
                    }}
                  >
                    <div className="absolute w-[110px] h-[110px] bg-white rounded-full flex flex-col items-center justify-center">
                      <p className="font-bold text-2xl text-blue-500">
                        {Math.floor(progress)}%
                      </p>
                      <p className="text-xs text-gray-500">SYNCING</p>
                    </div>
                  </div>
                  
                </div>

                <div className="text-center">
                  <p className="font-semibold text-lg"> {file.name} </p>
                  <p>
                    {fileSizer(file.size)} •{" "}
                    {fileSizer(file.size - (progress / 100) * file.size)} Remaining
                  </p>
                </div>

                <div className="flex gap-2 mt-4 justify-center p-2 rounded-full bg-slate-200/70">

                  {/* LEFT → START / RESUME */}
                  <button className="p-2 bg-white rounded-full" disabled={progress === 100}
                    onClick={() => {
                      setIsPaused(false);
                      sendChunks();
                    }} > &#9654; </button>

                  {/* CENTER → PAUSE */}
                  <button className="p-2 bg-white rounded-full bg-linear-to-r from-blue-600 to-sky-500"
                    disabled={progress === 100} onClick={() => setIsPaused(true)} >
                    &#10074; </button>

                  {/* RIGHT → STOP */}
                  <button className="p-2 bg-white rounded-full" onClick={stop} >
                    &#9632; </button>
                </div>
              </>
            )}

          </div>
        )}
        {/* end of session */}
      </div>
    </div>
  );
}