# Nifty Frontend - Bot Manager

A modern TypeScript/Next.js frontend application for managing bots with login authentication, log viewing, and bot control features.

## Features

- **Login System**: Secure login with username and password (configured via environment variables)
- **Bot Logs**: View all bot logs retrieved from the backend API
- **Bot Control**: 
  - View and edit environment variables
  - Start/Stop bot functionality
  - Real-time status updates

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (you can use `env.example` as a template):

```env
# Authentication Credentials
NEXT_PUBLIC_LOGIN_USERNAME=admin
NEXT_PUBLIC_LOGIN_PASSWORD=admin123

# API Endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_LOGS_ENDPOINT=/api/logs
NEXT_PUBLIC_API_GET_ENV_ENDPOINT=/api/env
NEXT_PUBLIC_API_START_BOT_ENDPOINT=/api/bot/start
NEXT_PUBLIC_API_STOP_BOT_ENDPOINT=/api/bot/stop
NEXT_PUBLIC_API_BOT_STATUS_ENDPOINT=/api/bot/status
```

**Important**: 
- Replace the API endpoints with your actual backend endpoints
- Update the base URL if your backend runs on a different port
- Change the login credentials for security

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
nifty-frontend/
├── app/
│   ├── dashboard/        # Dashboard page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Login page (home)
│   └── globals.css       # Global styles
├── components/
│   ├── Login.tsx         # Login component
│   ├── Dashboard.tsx     # Main dashboard
│   ├── BotLogs.tsx       # Bot logs viewer
│   └── BotControl.tsx    # Bot control panel
├── lib/
│   └── api.ts            # API utility functions
└── env.example           # Environment variables template
```

## API Endpoints

The application expects the following backend endpoints:

### 1. GET /api/env
Returns: `KITE_REQUEST_TOKEN` and values from lines 4-5 of .env

**Response:**
```json
{
  "success": true,
  "data": {
    "KITE_REQUEST_TOKEN": "...",
    "TRADING_QUANTITY": "...",
    "OPTION_EXPIRY": "..."
  }
}
```

### 2. GET /api/logs
Returns: All rows from `trade_table` in PostgreSQL, ordered by `trade_id DESC`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": N
}
```

### 3. POST /api/bot/start
Body: JSON with environment variables to update

**Actions:**
- Checks if bot is already running → kills it first
- Updates .env file with new values
- Starts bot with: `nohup python3 -u main.py > trade.log 2>&1 &`
- Stores PID in `bot_pid.json`

**Response:**
```json
{
  "success": true,
  "message": "...",
  "pid": 12345
}
```

### 4. POST /api/bot/stop
Kills bot process using PID from `bot_pid.json` and removes PID file after killing.

**Response:**
```json
{
  "success": true,
  "message": "Bot stopped successfully"
}
```

### 5. GET /api/bot/status (Bonus)
Checks if bot is running.

**Response:**
```json
{
  "success": true,
  "running": true/false,
  "pid": 12345
}
```

All endpoints are configurable via environment variables.

## Usage

1. **Login**: Use the credentials configured in `.env.local`
2. **View Logs**: Navigate to "Bot Logs" to see all bot activity
3. **Control Bot**: 
   - Go to "Start/Stop Bot"
   - View/edit environment variables (KITE_REQUEST_TOKEN, TRADING_QUANTITY, OPTION_EXPIRY)
   - Bot status is displayed with PID when running
   - Use "Start Bot" or "Stop Bot" buttons to control the bot
   - Environment variables are updated automatically when starting the bot

## Technologies

- Next.js 14 (App Router)
- React 18
- TypeScript
- CSS Modules