# Local File Transfer App

A local-first file transfer application for sharing files between a laptop and another device over the same Wi-Fi network. The app does not depend on cloud storage or internet access after setup.

## Features

- Upload files from the local machine
- Receive incoming file transfers from another device on the same LAN
- Approve or reject incoming transfers before saving
- View transfer history
- Generate a QR code for quick access to the app on the local network
- Simple local web interface for desktop and mobile browsers

## Tech Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Upload handling: Multer
- QR generation: qrcode

## Project Structure

- backend/ - Express server and file handling logic
- frontend/ - React frontend UI
- uploads/ - Accepted and pending transfer files

## Prerequisites

- Node.js 20 or later
- npm

## Installation

1. Clone the repository
2. Open the project folder
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open the frontend in your browser:

   - http://localhost:5176/

## How It Works

1. The backend runs on the local machine and listens on port 3000.
2. The frontend runs on a Vite dev server.
3. Files uploaded by the local user are stored in the app's upload folders.
4. Incoming files from another device appear as pending transfers.
5. The user can accept or reject each incoming transfer.
6. Accepted files are saved locally and become available for download.

## Environment Variables

You can optionally set:

- PORT
- DEVICE_NAME
- UPLOAD_DIRECTORY
- MAX_UPLOAD_SIZE

Example:

```env
PORT=3000
DEVICE_NAME=My Laptop
UPLOAD_DIRECTORY=./uploads
MAX_UPLOAD_SIZE=1073741824
```

## Notes

- This app is intended for local network use only.
- It is a starter project and can be expanded with real-time progress, device discovery, and stronger security features.

## License

This project is for educational and personal use.
