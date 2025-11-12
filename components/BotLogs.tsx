'use client'

import { useState, useEffect } from 'react'
import { fetchLogs, fetchBotLogs } from '@/lib/api'
import styles from './BotLogs.module.css'

type TabType = 'profitLoss' | 'botLogs'

export default function BotLogs() {
  const [activeTab, setActiveTab] = useState<TabType>('profitLoss')
  const [profitLossLogs, setProfitLossLogs] = useState<any[]>([])
  const [profitLossCount, setProfitLossCount] = useState(0)
  const [botLogs, setBotLogs] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadProfitLossLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchLogs()
      if (response.success && Array.isArray(response.data)) {
        setProfitLossLogs(response.data)
        setProfitLossCount(response.count || response.data.length)
      } else {
        setError('Invalid response format from server')
        setProfitLossLogs([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profit/loss logs')
      setProfitLossLogs([])
    } finally {
      setLoading(false)
    }
  }

  const loadBotLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchBotLogs()
      let logText = ''
      
      // Handle different response formats and combine into single text
      if (typeof response === 'string') {
        logText = response
      } else if (Array.isArray(response)) {
        // If array, join all items with newlines
        logText = response.map(item => 
          typeof item === 'string' ? item : JSON.stringify(item, null, 2)
        ).join('\n')
      } else if (response.data && Array.isArray(response.data)) {
        logText = response.data.map(item => 
          typeof item === 'string' ? item : JSON.stringify(item, null, 2)
        ).join('\n')
      } else if (response.success && Array.isArray(response.data)) {
        logText = response.data.map(item => 
          typeof item === 'string' ? item : JSON.stringify(item, null, 2)
        ).join('\n')
      } else if (response.data && typeof response.data === 'string') {
        logText = response.data
      } else {
        logText = JSON.stringify(response, null, 2)
      }
      
      setBotLogs(logText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bot logs')
      setBotLogs('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'profitLoss') {
      loadProfitLossLogs()
    } else {
      loadBotLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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

  const renderProfitLossTable = () => {
    if (loading && profitLossLogs.length === 0) {
      return <div className={styles.loading}>Loading logs...</div>
    }
    if (profitLossLogs.length === 0) {
      return <div className={styles.empty}>No profit/loss logs available</div>
    }
    return (
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
          {profitLossLogs.map((log, index) => (
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
    )
  }

  const renderBotLogs = () => {
    if (loading && !botLogs) {
      return <div className={styles.loading}>Loading bot logs...</div>
    }
    if (!botLogs || botLogs.trim().length === 0) {
      return <div className={styles.empty}>No bot logs available</div>
    }
    return (
      <div className={styles.botLogsContainer}>
        <pre className={styles.botLogContent}>{botLogs}</pre>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Bot Logs</h2>
          {activeTab === 'profitLoss' && profitLossCount > 0 && (
            <div className={styles.logCount}>Total: {profitLossCount} entries</div>
          )}
          {activeTab === 'botLogs' && botLogs && (
            <div className={styles.logCount}>
              {botLogs.split('\n').filter(line => line.trim()).length} lines
            </div>
          )}
        </div>
        <button 
          onClick={() => activeTab === 'profitLoss' ? loadProfitLossLogs() : loadBotLogs()} 
          className={styles.refreshButton} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profitLoss' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profitLoss')}
        >
          Profit/Loss Logs
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'botLogs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('botLogs')}
        >
          Bot Logs
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        {activeTab === 'profitLoss' ? renderProfitLossTable() : renderBotLogs()}
      </div>
    </div>
  )
}

