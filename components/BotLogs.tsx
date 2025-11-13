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
        logText = response.map((item: any) => 
          typeof item === 'string' ? item : JSON.stringify(item, null, 2)
        ).join('\n')
      } else if (response.data && Array.isArray(response.data)) {
        logText = response.data.map((item: any) => 
          typeof item === 'string' ? item : JSON.stringify(item, null, 2)
        ).join('\n')
      } else if (response.success && Array.isArray(response.data)) {
        logText = response.data.map((item: any) => 
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

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-'
    
    // Format dates
    if (key.includes('time') || key.includes('_at') || key.includes('created') || key.includes('updated')) {
      return formatDate(value)
    }
    
    // Format prices
    if (key.includes('price') || key.includes('quantity') || key.includes('amount')) {
      return formatPrice(value)
    }
    
    // Return as string
    return String(value)
  }

  const getColumnHeaders = () => {
    if (profitLossLogs.length === 0) return []
    
    // Predefined column order
    const preferredOrder = [
      'trade_id',
      'trade_type',
      'option_name',
      'exit_reason',
      'buy_time',
      'buy_nifty_price',
      'buy_option_price',
      'buy_order_id',
      'sell_time',
      'sell_nifty_price',
      'sell_option_price',
      'sell_order_id',
      'stop_loss_nifty',
      'take_profit_nifty',
      'profit_or_loss',
      'profit_or_loss_points_nifty',
      'profit_or_loss_points_option',
      'profit_or_loss_balance',
      'balance_before',
      'balance_after',
      'total_balance',
      'created_at',
      'updated_at'
    ]
    
    // Get all unique keys from all log entries
    const allKeys = new Set<string>()
    profitLossLogs.forEach(log => {
      Object.keys(log).forEach(key => allKeys.add(key))
    })
    
    // Order columns: preferred order first, then any additional columns
    const result: string[] = []
    
    // Add columns in preferred order if they exist
    preferredOrder.forEach(key => {
      if (allKeys.has(key)) {
        result.push(key)
        allKeys.delete(key)
      }
    })
    
    // Add any remaining columns that weren't in the preferred order
    allKeys.forEach(key => {
      result.push(key)
    })
    
    return result
  }

  const formatColumnName = (key: string) => {
    // Convert snake_case to Title Case
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const renderCell = (key: string, value: any, log: any) => {
    // Special formatting for specific fields
    if (key === 'trade_id') {
      return <td key={key} className={styles.tradeId}>{value || '-'}</td>
    }
    
    if (key === 'option_name') {
      return <td key={key} className={styles.optionName}>{value || '-'}</td>
    }
    
    if (key === 'trade_type') {
      return (
        <td key={key}>
          <span className={`${styles.tradeType} ${value === 'LONG' ? styles.long : value === 'SHORT' ? styles.short : ''}`}>
            {value || '-'}
          </span>
        </td>
      )
    }
    
    if (key === 'exit_reason') {
      return (
        <td key={key}>
          <span className={`${styles.exitReason} ${
            value === 'Take Profit' ? styles.profit :
            value === 'Stop Loss' ? styles.loss : ''
          }`}>
            {value || '-'}
          </span>
        </td>
      )
    }
    
    // Profit Or Loss Balance column - color code based on value
    if (key === 'profit_or_loss_balance') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      const isPositive = numValue > 0
      const isNegative = numValue < 0
      return (
        <td key={key}>
          <span className={`${styles.profitOrLoss} ${
            isPositive ? styles.profitValue :
            isNegative ? styles.lossValue : ''
          }`}>
            {formatValue(key, value)}
          </span>
        </td>
      )
    }
    
    // Date fields
    if (key.includes('time') || key.includes('_at') || key.includes('created') || key.includes('updated')) {
      return <td key={key} className={styles.timeCell}>{formatValue(key, value)}</td>
    }
    
    // Default cell
    return <td key={key}>{formatValue(key, value)}</td>
  }

  const renderProfitLossTable = () => {
    if (loading && profitLossLogs.length === 0) {
      return <div className={styles.loading}>Loading logs...</div>
    }
    if (profitLossLogs.length === 0) {
      return <div className={styles.empty}>No profit/loss logs available</div>
    }
    
    const columns = getColumnHeaders()
    
    return (
      <table className={styles.logsTable}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column}>{formatColumnName(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profitLossLogs.map((log, index) => (
            <tr key={log.trade_id || index}>
              {columns.map(column => renderCell(column, log[column], log))}
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

