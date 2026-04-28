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
  const [showStart, setShowStart] = useState(true);

  const transferIdRef = useRef(null);
  const answerPollRef = useRef(null);
  const pollRef = useRef(null);

  const offsetRef = useRef(0);
  const progressRef = useRef(0);
  const fileHashRef = useRef(null);

  const pcRef = useRef(null);
  const dcRef = useRef(null);

  const isPausedRef = useRef(false);

  const fileSizer = (bytes) => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  };

  const generateHash = async (currentFile) => {
    const buffer = await currentFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (answerPollRef.current) clearInterval(answerPollRef.current);
      pcRef.current?.close();
      dcRef.current?.close();
    };
  }, []);


  const createSession = async () => {
    try {
      if (!file) {
        toast.error("Choose a file first");
        return;
      }

      const fileHash = await generateHash(file);
      fileHashRef.current = fileHash;

      const res = await sessionAPI.create({
        fileName: file.name,
        fileSize: file.size,
        fileHash,
      });

      const createdSession = res.data.data;
      setSession(createdSession);

      initWebRTC(createdSession.sessionCode);
      startPolling(createdSession.sessionCode);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create session");
    }
  };

  
  const startPolling = (code) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await sessionAPI.get(code);
        const recs = res.data.data?.receivers || [];
        setReceivers(recs);
      } catch {
        // ignore polling errors
      }
    }, 2000);
  };


  const initWebRTC = async (signalSessionId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    pcRef.current = pc;

    const dc = pc.createDataChannel("file");
    dc.binaryType = "arraybuffer";
    dcRef.current = dc;

    // Message Code
    dc.onopen = () => {
      toast.success("Receiver connected via WebRTC!");
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalAPI.sendCandidate({
          sessionId: signalSessionId,
          candidate: e.candidate,
          role: "sender",
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["connected", "completed", "failed", "disconnected", "closed"].includes(pc.connectionState)) {
        if (answerPollRef.current) clearInterval(answerPollRef.current);
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await signalAPI.sendOffer({ sessionId: signalSessionId, offer });

    const addedCandidates = new Set();
    const processedAnswers = new Set();

    answerPollRef.current = setInterval(async () => {
      try {
        if (["connected", "completed", "failed", "disconnected", "closed"].includes(pc.connectionState)) {
          clearInterval(answerPollRef.current);
          return;
        }

        const ansRes = await signalAPI.getAnswer(signalSessionId);
        const answers = ansRes.data.data || [];

        for (const answer of answers) {
          const answerKey = String(answer.from || "");
          if (processedAnswers.has(answerKey)) continue;

          await pc.setRemoteDescription(answer.data);
          processedAnswers.add(answerKey);
        }

        if (!pc.remoteDescription) return;

        const candsRes = await signalAPI.getCandidates(signalSessionId, "sender");
        const candidates = candsRes.data.data || [];

        for (const c of candidates) {
          const key = JSON.stringify(c.candidate);
          if (addedCandidates.has(key)) continue;

          addedCandidates.add(key);
          try {
            await pc.addIceCandidate(c.candidate);
          } catch {
            // ignore bad/late candidates
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);
  };


  const startSending = async () => {
    try {
      if (!session?._id) {
        toast.error("Session not ready");
        return;
      }

      if (!fileHashRef.current) {
        fileHashRef.current = await generateHash(file);
      }

      const receiversId = [];

      for (const rc of receivers) {
        receiversId.push(rc._id);
      }

      const res = await transferAPI.start({
        sessionId: session._id,
        receiversId,
        fileMeta: {
          fileName: file.name,
          fileSize: file.size,
          fileHash: fileHashRef.current,
        },
      });

      transferIdRef.current = res.data.data?._id || res.data.data?.id || null;
      setIsStarted(true);
      setShowStart(true);
      toast.success("Transfer session started");

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start transfer");
    }
  };


  const sendChunks = () => {
    if (!file || !dcRef.current) return;
    if (isPausedRef.current || dcRef.current.readyState !== "open") return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const chunk = e.target.result;
      if (!chunk) return;

      dcRef.current?.send(chunk);
      offsetRef.current += chunk.byteLength;

      const prog = (offsetRef.current / file.size) * 100;
      const safeProgress = Math.min(100, prog);

      setProgress(safeProgress);
      progressRef.current = safeProgress;

      if (transferIdRef.current) {
        await transferAPI.update({
          transferId: transferIdRef.current,
          progress: Math.floor(safeProgress),
        });
      }

      if (offsetRef.current < file.size) {
        sendChunks();
      } else {
        if (transferIdRef.current) {
          await transferAPI.complete({ transferId: transferIdRef.current });
        }

        if (session?._id) {
          await sessionAPI.delete(session._id);
        }

        toast.success("Completed");
      }
    };

    reader.readAsArrayBuffer(file.slice(offsetRef.current, offsetRef.current + 16000));
  };


  const start = () => {
    isPausedRef.current = false;
    setIsPaused(false);
    setShowStart(false);
    sendChunks();
  };


  const playPause = () => {
    if (!isPaused) {
      isPausedRef.current = true;
      setIsPaused(true);
    } else {
      isPausedRef.current = false;
      setIsPaused(false);
      sendChunks();
    }
  };


  const stop = async () => {
    const sessionId = session?._id;

    if (pollRef.current) clearInterval(pollRef.current);
    if (answerPollRef.current) clearInterval(answerPollRef.current);

    pcRef.current?.close();
    dcRef.current?.close();

    try {
      if (sessionId) {
        await sessionAPI.delete(sessionId);
      }
    } catch {
      // ignore if already deleted
    }

    try {
      if (transferIdRef.current) {
        await transferAPI.update({
          transferId: transferIdRef.current,
          progress: Math.floor(progressRef.current),
        });
      }
    } catch {
      // ignore update failure during stop
    }

    offsetRef.current = 0;
    progressRef.current = 0;
    isPausedRef.current = false;
    transferIdRef.current = null;
    fileHashRef.current = null;

    setSession(null);
    setFile(null);
    setProgress(0);
    setReceivers([]);
    setIsStarted(false);
    setIsPaused(false);
    setShowStart(true);
  };


  const copySessionCode = () => {
    navigator.clipboard.writeText(String(session?.sessionCode));
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col w-full py-10 px-14 items-center bg-linear-to-br from-blue-50 to-green-50">
        {!session ? (
          <div className="mb-14">
            <h1 className="text-2xl font-bold mb-1">Weightless sharing</h1>
            <p className="text-gray-500 mb-4">
              Drop your file into the field and watch them sync across the globe instantly.
            </p>

            <div className="bg-white rounded-2xl h-50 border-2 border-dashed border-blue-500 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <p className="rounded-full p-4 text-2xl bg-linear-to-r from-blue-600 to-sky-500/80">
                  {file ? "⬆️" : "📄"}
                </p>
                <label className={file ? "font-semibold text-xl" : "font-bold text-xl"}>
                  {file ? file.name : "Choose File"}
                </label>
                {file && <label>{fileSizer(file.size)}</label>}
              </div>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              disabled={!file}
              onClick={createSession}
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
                  <button
                    onClick={copySessionCode}
                    type="button"
                    className="text-blue-500 font-semibold hover:text-blue-400 transition"
                  >
                    📋 Copy Invite Code
                  </button>
                </div>
              </div>
            )}

            {!isStarted && (
              <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">
                      Waiting for peers
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-500">{receivers.length}/5</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((receivers.length / 5) * 100, 100)}%` }}
                  />
                </div>

                {receivers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {receivers.map((receiver, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 px-3 rounded-xl bg-slate-50">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {receiver.fullName?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-700">{receiver.fullName}</p>
                        <span className="ml-auto text-xs text-green-500 font-semibold">● Connected</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {receivers.length > 0 && !isStarted && (
              <button
                onClick={startSending}
                className="bg-linear-to-br from-blue-600 to-sky-500 text-white px-4 py-2 rounded-lg"
              >
                Start Sync Session 🚀
              </button>
            )}

            {isStarted && (
              <>
                <h1 className="font-bold text-2xl">Active Transfer</h1>
                <p>Synchronizing across {receivers.length} active nodes</p>

                <div className="flex flex-col items-center gap-4 my-4">
                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: 140,
                      height: 140,
                      background: `conic-gradient(#2563eb ${progress}%, #e5e7eb ${progress}%)`,
                    }}
                  >
                    <div className="absolute w-27.5 h-27.5 bg-white rounded-full flex flex-col items-center justify-center">
                      <p className="font-bold text-2xl text-blue-500">{Math.floor(progress)}%</p>
                      <p className="text-xs text-gray-500">SYNCING</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-semibold text-lg">{file?.name}</p>
                  <p>
                    {fileSizer(file?.size || 0)} •{" "}
                    {fileSizer((file?.size || 0) - (progress / 100) * (file?.size || 0))} Remaining
                  </p>
                </div>

                <div className="flex gap-4 mt-4 justify-center p-2 px-3 w-fit mx-auto rounded-full bg-slate-200/70">
                  {showStart && (
                    <button onClick={start} className="p-2 bg-white rounded-full text-black">
                      St.
                    </button>
                  )}

                  {!showStart && (
                    <button
                      className="p-2 px-4 bg-white rounded-full bg-linear-to-r from-blue-600 to-sky-500"
                      disabled={progress === 100}
                      onClick={playPause}
                    >
                      {isPaused ? "Pl." : "Ps."}
                    </button>
                  )}

                  <button className="p-2 px-3 bg-white rounded-full" onClick={stop}>
                    &#9632;
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}