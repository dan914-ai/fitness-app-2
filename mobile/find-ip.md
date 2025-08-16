# How to Find Your Computer's IP Address and Update .env

## Method 1: Using Command Prompt (Easiest)

1. Open Command Prompt (cmd) on Windows
2. Type this command:
   ```
   ipconfig
   ```
3. Look for "IPv4 Address" under your Wi-Fi or Ethernet adapter
4. It will look something like: `192.168.1.100` or `10.0.0.5`

## Method 2: Using Windows Settings

1. Open Windows Settings (Win + I)
2. Go to "Network & Internet"
3. Click "Wi-Fi" or "Ethernet" (whichever you're using)
4. Click on your network name
5. Scroll down to find "IPv4 address"

## Method 3: Quick PowerShell Command

Open PowerShell and run:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Wi-Fi).IPAddress
```

If using Ethernet instead of Wi-Fi:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet).IPAddress
```

## Once You Have Your IP Address

1. Open the file: `C:\Users\danny\.vscode\new finess app\mobile\.env`

2. Update this line:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```
   
   To:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:3000/api
   ```

   For example, if your IP is 192.168.1.100:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

## Important Notes

- Make sure your phone and computer are on the **same Wi-Fi network**
- Your Windows Firewall might block the connection. You may need to:
  - Allow Node.js through Windows Firewall
  - Temporarily disable Windows Firewall for testing
- The IP address might change when you reconnect to Wi-Fi

## Testing the Connection

1. After updating .env, restart Expo:
   ```bash
   npx expo start -c
   ```

2. On your phone, scan the QR code with Expo Go app

3. The app should now be able to connect to your backend server

## Troubleshooting

If the app still can't connect:

1. **Check if backend is running**:
   - Make sure you ran `npm run dev` in the backend folder
   - Backend should show: "Server running on port 3000"

2. **Test the connection**:
   - On your phone's browser, try visiting: `http://YOUR_IP:3000/health`
   - You should see a JSON response

3. **Firewall Issues**:
   - Windows Defender might block the connection
   - Add an inbound rule for port 3000 in Windows Firewall

4. **Still not working?**
   - The app works in offline mode, so you can test without backend
   - Or use an Android emulator/iOS simulator instead