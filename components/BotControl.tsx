'use client'

import { useState, useEffect } from 'react'
import { fetchEnv, startBot, stopBot, getBotStatus } from '@/lib/api'
import styles from './BotControl.module.css'

interface EnvData extends Record<string, string> {
  KITE_REQUEST_TOKEN: string
  TRADING_QUANTITY: string
  OPTION_EXPIRY: string
}

export default function BotControl() {
  const [envData, setEnvData] = useState<EnvData>({
    KITE_REQUEST_TOKEN: '',
    TRADING_QUANTITY: '',
    OPTION_EXPIRY: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [botRunning, setBotRunning] = useState(false)
  const [botPid, setBotPid] = useState<number | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  useEffect(() => {
    loadEnv()
    checkBotStatus()
    // Poll bot status every 5 seconds
    const interval = setInterval(checkBotStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkBotStatus = async () => {
    try {
      const status = await getBotStatus()
      setBotRunning(status.running)
      setBotPid(status.pid || null)
    } catch (err) {
      // Silently fail status check to avoid spamming errors
      console.error('Failed to check bot status:', err)
    }
  }

  const loadEnv = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchEnv()
      if (response.success && response.data) {
        setEnvData(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environment variables')
    } finally {
      setLoading(false)
    }
  }

  const handleStartBot = async () => {
    setIsStarting(true)
    setError('')
    setSuccess('')
    try {
      const response = await startBot(envData)
      if (response.success) {
        setBotRunning(true)
        setBotPid(response.pid)
        setSuccess(`Bot started successfully! PID: ${response.pid}`)
        // Refresh status after a short delay
        setTimeout(checkBotStatus, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot')
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopBot = async () => {
    setIsStopping(true)
    setError('')
    setSuccess('')
    try {
      const response = await stopBot()
      if (response.success) {
        setBotRunning(false)
        setBotPid(null)
        setSuccess('Bot stopped successfully!')
        // Refresh status after a short delay
        setTimeout(checkBotStatus, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop bot')
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Bot Control</h2>
          {botRunning && botPid && (
            <div className={styles.botStatus}>
              <span className={styles.statusIndicator}></span>
              Bot Running (PID: {botPid})
            </div>
          )}
          {!botRunning && (
            <div className={styles.botStatus}>
              <span className={`${styles.statusIndicator} ${styles.statusStopped}`}></span>
              Bot Stopped
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <button
            onClick={loadEnv}
            className={styles.secondaryButton}
            disabled={loading || isStarting || isStopping}
          >
            Reload Env
          </button>
          <button
            onClick={handleStartBot}
            className={styles.startButton}
            disabled={loading || isStarting || isStopping || botRunning}
          >
            {isStarting ? 'Starting...' : 'Start Bot'}
          </button>
          <button
            onClick={handleStopBot}
            className={styles.stopButton}
            disabled={loading || isStarting || isStopping || !botRunning}
          >
            {isStopping ? 'Stopping...' : 'Stop Bot'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          {success}
        </div>
      )}

      <div className={styles.kiteLinkSection}>
        <div className={styles.kiteLinkBox}>
          <h3>Kite Login</h3>
          <p>Click the link below to authenticate with Zerodha Kite and get your request token:</p>
          <a
            href={`https://kite.zerodha.com/connect/login?v=3&api_key=${process.env.NEXT_PUBLIC_KITE_API_KEY || 'q8honpauyce77qm9'}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.kiteLink}
          >
            🔗 Connect to Kite Zerodha
          </a>
          <p className={styles.kiteNote}>
            After authentication, copy the request token and paste it in the KITE_REQUEST_TOKEN field below.
          </p>
        </div>
      </div>

      <div className={styles.envSection}>
        <div className={styles.envHeader}>
          <h3>Environment Variables</h3>
          <button
            onClick={checkBotStatus}
            className={styles.secondaryButton}
            disabled={loading || isStarting || isStopping}
          >
            Refresh Status
          </button>
        </div>
        <div className={styles.envForm}>
          <div className={styles.envField}>
            <label htmlFor="kite_token">KITE_REQUEST_TOKEN</label>
            <input
              id="kite_token"
              type="text"
              value={envData.KITE_REQUEST_TOKEN}
              onChange={(e) => setEnvData({ ...envData, KITE_REQUEST_TOKEN: e.target.value })}
              className={styles.envInput}
              disabled={loading}
              placeholder="Enter KITE_REQUEST_TOKEN"
            />
          </div>
          <div className={styles.envField}>
            <label htmlFor="trading_quantity">TRADING_QUANTITY</label>
            <input
              id="trading_quantity"
              type="text"
              value={envData.TRADING_QUANTITY}
              onChange={(e) => setEnvData({ ...envData, TRADING_QUANTITY: e.target.value })}
              className={styles.envInput}
              disabled={loading}
              placeholder="Enter TRADING_QUANTITY"
            />
          </div>
          <div className={styles.envField}>
            <label htmlFor="option_expiry">OPTION_EXPIRY</label>
            <input
              id="option_expiry"
              type="text"
              value={envData.OPTION_EXPIRY}
              onChange={(e) => setEnvData({ ...envData, OPTION_EXPIRY: e.target.value })}
              className={styles.envInput}
              disabled={loading}
              placeholder="Enter OPTION_EXPIRY"
            />
          </div>
        </div>
        <div className={styles.envNote}>
          <p>Note: Environment variables will be updated when you click "Start Bot". The bot will be restarted if it's already running.</p>
        </div>
      </div>
    </div>
  )
}

