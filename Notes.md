file select

setLoading

generateHash

=> file Details to store

fileMeta to create session

set Session.

------------------

set Up Web RTC

pc => connection
channel = connection

onOpen => sendFile() => sendNextChunk();

onMessage => sendNextChunk();

file || isPaused

if file completed return


chunk => file.slice (0, 16000)
convert to arraybuffer
send data

update offset

setProgress(file/file.size * 100);



1. Create Session
- select file
- calculate hash
- call api

2. Receiver Joins
- through code
- Multi receiver

3. WebRTC Connection Establishment
- create peer connection

4. Chunk-Based File Transfer
- chunk size
- chunk sent sequentially

5. Receiver Logic
- store chunks
- download link created

6. Progress Tracking
- byte / total * 100
- progress show

7. Pause Resume
- offset value
- use isPaused

8. File integrity Verification 
/reciever file decryption
- senderHash === receiverHash
- status = failed then resend

9. Chunk Acknowledgement
- use WebRTC Reliable Channel

10. Multi Receiver support
- server validation receiver
- same chunk broadcast to all receivers

11. Transfer History
/save-transfer
{
    fileName,
    size,
    senderId,
    receiverId,
    status,
    date
}

/auth/login
/auth/register
/auth/forget-password
/auth/me

## Session Routes

POST   /api/session/create
GET    /api/session/:sessionId
POST   /api/session/join
DELETE /api/session/:sessionId

## Web RTC Signaling

POST   /api/signal/offer
POST   /api/signal/answer
POST   /api/signal/candidate

## File MetaData Routes

POST   /api/files/init
GET    /api/files/:fileId


## Transfer Tracking Routes

POST   /api/transfer/start
POST   /api/transfer/update
POST   /api/transfer/complete
GET    /api/transfer/history


## Setting

GET    /api/user/settings
PATCH  /api/user/settings


```
                ┌───────────────────────┐
                │        CLIENT A       │
                │   (Sender - Browser)  │
                └──────────┬────────────┘
                           │
                           │ 1. AUTH
                           ▼
                  POST /api/auth/login
                           │
                           ▼
                  GET /api/auth/me
                           │
                           │
                           │ 2. CREATE SESSION
                           ▼
             POST /api/session/create
                           │
                           ▼
                  (sessionId generated)
                           │
                           │
===========================│==================================
                           │
                           ▼
                ┌───────────────────────┐
                │        BACKEND        │
                │  (API + WebSocket)    │
                └──────────┬────────────┘
                           │
===========================│==================================
                           │
                           ▼
                ┌───────────────────────┐
                │        CLIENT B       │
                │  (Receiver - Browser) │
                └──────────┬────────────┘
                           │
                           │ 3. JOIN SESSION
                           ▼
              POST /api/session/join
                           │
                           ▼
                   (connected to room)
                           │
                           │
==================== 🔗 SIGNALING (WebSocket) ====================
                           │
Client A                     │                     Client B
────────                     │                     ────────
createOffer()                │
emit "offer"  ──────────────▶│──────────────▶  receive offer
                           │                     setRemoteDesc
                           │                     createAnswer()
                           │
receive answer ◀────────────│◀────────────── emit "answer"
setRemoteDesc               │
                           │
ICE candidates exchange (both sides)
                           │
==================== 🔗 P2P CONNECTION ESTABLISHED ====================
                           │
                           │
                 4. FILE METADATA
                           │
                           ▼
             POST /api/files/init
                           │
                           ▼
                 (fileId + hash stored)
                           │
                           │
==================== 📦 DIRECT P2P TRANSFER ====================
                           │
Client A                                       Client B
────────                                       ────────
Hash file (SHA-256)                             │
Chunk file (16KB)                               │
send via DataChannel ─────────────────────────▶ receive chunks
                                                merge chunks
                                                verify hash
                           │
                           │
==================== 📊 TRACKING ====================
                           │
                           ▼
        POST /api/transfer/start
        POST /api/transfer/update
        POST /api/transfer/complete
                           │
                           ▼
        GET /api/transfer/history
                           │
                           ▼
                    ✅ DONE
```