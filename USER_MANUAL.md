# User Manual

## Overview

This application lets you transfer files between your laptop and another device on the same local Wi-Fi network.

## Getting Started

### 1. Open the project folder
Open the project in your terminal or command prompt.

### 2. Install dependencies
Run:

```bash
npm install
```

### 3. Start the server and app
Run the following command:

```bash
npm run dev
```

This starts two services:
- the backend server on http://localhost:3000
- the frontend app on http://localhost:5176/

### 4. Open the app
Open your browser and go to:

- http://localhost:5176/

### 5. Open it from another device on the same network
If you want to use the app from your phone or another laptop:

1. Make sure both devices are connected to the same Wi-Fi network.
2. Find the local IP address of the laptop running the app.
3. Open that IP address in the browser, for example:

   ```text
   http://192.168.0.108:5176/
   ```

> Replace the IP address with the actual address shown on your machine.

## Sending Files

1. Open the app in the browser.
2. Click the upload area.
3. Choose one or more files.
4. The files will be processed and appear in the transfer flow.

## Using the App from Another Device

1. Keep the laptop running the app open.
2. On your phone or another laptop, connect to the same Wi-Fi network.
3. Open the laptop's local IP address followed by the frontend port:

   ```text
   http://<laptop-ip>:5176/
   ```

4. The second device can then use the same dashboard.

## Receiving Files

1. Make sure the sender and receiver are connected to the same local network.
2. When another device sends a file to your laptop, it will appear under "Incoming transfers".
3. Click "Accept" to save the file locally.
4. Click "Reject" to discard it.

## Pairing a Device

1. Enter a device name in the pairing field.
2. Click "Pair device".
3. This creates a pairing entry in the transfer history.

## View Transfer History

The history section shows:

- file name
- sender and receiver
- transfer status

## Clearing History

Use the "Clear history" button to remove the current transfer records and files from the local queue.

## Troubleshooting

### App does not open
- Make sure the app has been started with `npm run dev`.
- Check that the terminal is still running.
- Open http://localhost:5176/ in the browser.

### Other device cannot open the app
- Confirm both devices are on the same local network.
- Check the laptop's IP address.
- Make sure the frontend port 5176 is not blocked by a firewall.

### Server not responding
- Run `npm run dev` again.
- Check if the backend is running on http://localhost:3000.

## Tips

- Use the same Wi-Fi network for both devices.
- Keep the app running while transferring files.
- For large files, ensure enough storage space is available.
