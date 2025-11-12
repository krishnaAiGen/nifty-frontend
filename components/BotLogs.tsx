'use client'

import { useState, useEffect } from 'react'
import { fetchLogs } from '@/lib/api'
import styles from './BotLogs.module.css'

export default function BotLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [logCount, setLogCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchLogs()
      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data)
        setLogCount(response.count || response.data.length)
      } else {
        setError('Invalid response format from server')
        setLogs([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatPrice = (price: string | number) => {
    if (!price) return '-'
    return typeof price === 'number' ? price.toFixed(2) : price
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Bot Logs</h2>
          {logCount > 0 && (
            <div className={styles.logCount}>Total: {logCount} entries</div>
          )}
        </div>
        <button onClick={loadLogs} className={styles.refreshButton} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading && logs.length === 0 ? (
          <div className={styles.loading}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className={styles.empty}>No logs available</div>
        ) : (
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Option Name</th>
                <th>Type</th>
                <th>Buy Nifty</th>
                <th>Buy Option</th>
                <th>Sell Nifty</th>
                <th>Sell Option</th>
                <th>Exit Reason</th>
                <th>Buy Time</th>
                <th>Sell Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.trade_id || index}>
                  <td className={styles.tradeId}>{log.trade_id || '-'}</td>
                  <td className={styles.optionName}>{log.option_name || '-'}</td>
                  <td>
                    <span className={`${styles.tradeType} ${log.trade_type === 'LONG' ? styles.long : styles.short}`}>
                      {log.trade_type || '-'}
                    </span>
                  </td>
                  <td>{formatPrice(log.buy_nifty_price)}</td>
                  <td>{formatPrice(log.buy_option_price)}</td>
                  <td>{formatPrice(log.sell_nifty_price)}</td>
                  <td>{formatPrice(log.sell_option_price)}</td>
                  <td>
                    <span className={`${styles.exitReason} ${
                      log.exit_reason === 'Take Profit' ? styles.profit :
                      log.exit_reason === 'Stop Loss' ? styles.loss : ''
                    }`}>
                      {log.exit_reason || '-'}
                    </span>
                  </td>
                  <td className={styles.timeCell}>{formatDate(log.buy_time)}</td>
                  <td className={styles.timeCell}>{formatDate(log.sell_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

