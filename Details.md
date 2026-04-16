
---

# P2P File Sharing System (Mini Project)

A **session-based peer-to-peer file transfer system** that allows a sender to securely share files with multiple receivers using **WebRTC DataChannels**.

Files are transferred **directly between browsers** without passing through the server.

tim howard
timhoward01@gmail.com
timhoward123
---

session create + wait

user join and receives

# 1. Project Features

## Core Features (Mini-Project Friendly)

| Feature                | Description                             |
| ---------------------- | --------------------------------------- |
| WebRTC P2P Transfer    | Direct browser-to-browser file transfer |
| Chunk-Based Transfer   | Large files split into smaller chunks   |
| Session Code           | 6-digit code used to join transfer      |
| Multi Receiver         | Up to **5 receivers** per session       |
| Progress Tracking      | Shows upload/download progress          |
| Pause / Resume         | Resume transfer from last offset        |
| File Hash Verification | Ensures file integrity                  |
| Transfer History       | Stores transfer details                 |

---

# 2. High Level Architecture

```
React Client
     ↓
Socket.io (Signaling)
     ↓
Node.js + Express Server
     ↓
MongoDB Database
     ↓
WebRTC DataChannel
     ↓
Direct P2P File Transfer
```

### Roles

**React Client**

* UI
* File reading
* Chunk sending
* Progress display

**Node.js Server**

* Authentication
* Session creation
* Signaling server for WebRTC
* Transfer history storage

**MongoDB**

* Users
* Sessions
* Transfer records

---

# 3. Core Technologies

### Frontend

* React
* WebRTC
* Socket.io
* Crypto API (SHA-256)

### Backend

* Node.js
* Express
* Socket.io
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt password hashing

---

# 4. Network Layers Used

Your application uses the **TCP/IP networking model**.

| Layer             | Usage                                 |
| ----------------- | ------------------------------------- |
| Application Layer | React UI, Node APIs, WebRTC signaling |
| Transport Layer   | TCP / UDP communication               |
| Internet Layer    | IP routing                            |
| Network Access    | WiFi / Ethernet                       |

### Transport Protocols

| Protocol | Purpose                         |
| -------- | ------------------------------- |
| TCP      | Login APIs and session creation |
| UDP      | WebRTC file transfer            |

WebRTC uses **UDP** because it provides:

* lower latency
* faster transfer
* real-time communication

---

# 5. Security & Encryption

WebRTC automatically encrypts communication.

### WebRTC Security Stack

| Layer       | Encryption  |
| ----------- | ----------- |
| Signaling   | HTTPS / TLS |
| DataChannel | DTLS        |
| Media/Data  | SRTP        |

For file transfer:

**DTLS (Datagram Transport Layer Security)** handles encryption and decryption automatically.

---

# 6. Authentication Flow

1. User registers or logs in.
2. Server validates credentials.
3. Server returns **JWT token**.
4. Client stores token for authenticated requests.

Endpoints:

```
POST /register
POST /login
```

---

# 7. Session Creation (Sender)

### Sender Workflow

1. Sender selects file
2. React reads:

```
file.name
file.size
```

3. Calculate file hash

```
SHA-256
```

4. Call API

```
POST /create-session
```

### Server Stores

```
Session
- senderId
- sessionCode
- receivers[]
- fileMeta
```

Server returns **6-digit session code**.

Example

```
829341
```

Sender shares this code with receivers.

---

# 8. Receiver Join Flow

Receiver steps:

1. Open join page
2. Enter session code

```
483921
```

3. Client emits socket event

```
socket.emit("join-session", code)
```

Server checks:

* session exists
* receivers < 5

Then server adds receiver and notifies sender.

---

# 9. WebRTC Connection Establishment

After receiver joins, WebRTC handshake begins.

### Step 1: Sender creates peer connection

```javascript
const peer = new RTCPeerConnection()
const dataChannel = peer.createDataChannel("file")
```

### Step 2: Sender creates offer

```javascript
const offer = await peer.createOffer()
await peer.setLocalDescription(offer)
```

### Step 3: Offer sent through Socket.io

```
socket.emit("offer", offer)
```

### Step 4: Receiver responds with answer

```javascript
peer.setRemoteDescription(offer)

const answer = await peer.createAnswer()
await peer.setLocalDescription(answer)

socket.emit("answer", answer)
```

### Step 5: Sender receives answer

```javascript
peer.setRemoteDescription(answer)
```

Connection established.

---

# 10. Chunk-Based File Transfer

Large files are split into chunks to avoid memory crashes.

### Chunk Size

```javascript
const chunkSize = 64 * 1024 // 64 KB
```

### Sender Logic

```javascript
let offset = 0

const slice = file.slice(offset, offset + chunkSize)
```

Chunks are sent sequentially.

---

# 11. Receiver Logic

Receiver stores chunks.

```javascript
let receivedChunks = []
```

On receiving data:

```javascript
dataChannel.onmessage = (event) => {
  receivedChunks.push(event.data)
}
```

After completion:

```javascript
const blob = new Blob(receivedChunks)
const url = URL.createObjectURL(blob)
```

Download link is created.

---

# 12. Progress Tracking

Progress is calculated as:

```
progress = (bytesTransferred / totalBytes) * 100
```

React component:

```html
<progress value={progress} max="100"></progress>
```

Optional analytics:

* transfer speed
* estimated time remaining

---

# 13. Pause / Resume Logic

Maintain offset value.

```javascript
let offset = 0
let isPaused = false
```

Pause:

```
isPaused = true
```

Resume:

```
isPaused = false
sendChunk()
```

Transfer continues from stored offset.

---

# 14. File Integrity Verification

Before transfer:

Sender calculates hash.

```javascript
SHA256(file)
```

Receiver calculates hash after download.

Comparison:

```
senderHash === receiverHash
```

If mismatch:

```
status = failed
```

User can resend file.

---

# 15. Chunk Acknowledgement

Two possible approaches.

### Option 1 (Simpler)

Use WebRTC reliable channel.

```javascript
peer.createDataChannel("file", {
  ordered: true
})
```

Delivery and order are guaranteed automatically.

### Option 2 (Manual ACK)

Sender sends:

```
{
  type: "chunk",
  index: 15,
  data: chunk
}
```

Receiver responds:

```
{
  type: "ack",
  index: 15
}
```

Sender sends next chunk only after ACK.

---

# 16. Multi Receiver Support

Maximum **5 receivers** per session.

Server validation:

```
if(receivers.length >= 5)
   reject
```

Sender creates separate peer connections.

```
peerConnections = {
 receiver1,
 receiver2,
 receiver3
}
```

When sending chunk:

```javascript
Object.values(peerConnections).forEach(peer => {
   peer.dataChannel.send(chunk)
})
```

Same chunk is broadcast to all receivers.

---

# 17. Transfer History

After transfer completes, sender stores record.

API:

```
POST /save-transfer
```

Example record:

```
{
  fileName: "movie.mp4",
  size: 734003200,
  senderId: "user123",
  receiverId: "user456",
  status: "completed",
  date: "2026-03-13"
}
```

---

# 18. Database Schema

## User

```
_id
username
email
password (hashed)
createdAt
```

## Session

```
_id
sessionCode
senderId
receivers[]
fileMeta
   fileName
   size
   hash
status
createdAt
```

## Transfer

```
_id
senderId
receiverId
fileName
size
hash
status
transferredAt
```

---

# 19. UI Components

Frontend components:

* FileDropZone
* ProgressBar
* ConnectedDevicesList
* TransferAnalytics
* SessionCodeDisplay
* HistoryTable

Example history table:

```
File Name     Size     Receiver     Status     Date
---------------------------------------------------
video.mp4     700MB    Rahul        Success    13 Mar
photo.zip     2MB      Amit         Failed     10 Mar
doc.pdf       500KB    Sara         Success    8 Mar
```

---

# 20. Complete Workflow

1. User logs in.
2. Sender clicks **Create Session**.
3. Sender selects file.
4. App calculates file hash.
5. Server generates session code.
6. Receiver enters code.
7. WebRTC connection established.
8. File split into chunks.
9. Chunks sent directly browser-to-browser.
10. Progress bar updates.
11. Receiver verifies file hash.
12. Transfer history saved.
13. Session closes.

---

If you want, I can also make a **visual system design diagram + folder structure + API list** for this project. That would make it **perfect for a hackathon or project presentation.**
