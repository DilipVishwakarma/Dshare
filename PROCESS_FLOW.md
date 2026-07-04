# Process Flow

## 1. Application Start

When the app starts:
- the backend server begins listening on the local machine
- the frontend UI becomes available in the browser
- the app exposes a local LAN address for access

## 2. Upload Flow

When the user uploads files:
1. The file is received by the backend
2. The backend stores it in a pending transfer area
3. The transfer is added to the history list
4. The file becomes available for the receiving side to review

## 3. Receive Flow

When another device sends a file:
1. The incoming file arrives at the local machine
2. It appears in the "Incoming transfers" section
3. The user can review the file
4. The user clicks "Accept" or "Reject"
5. Accepted files are saved locally and become downloadable
6. Rejected files are discarded

## 4. Pairing Flow

When a pairing request is made:
1. The device name is submitted to the backend
2. A pairing entry is added to the history
3. The app records the relationship for future transfers

## 5. History Flow

The app tracks:
- uploads
- incoming transfers
- rejected transfers
- accepted transfers

## 6. End Result

The application provides a simple local-network file transfer experience where users can securely send and receive files without relying on cloud services.
