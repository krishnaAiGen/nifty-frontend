'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Dashboard.module.css'
import BotLogs from './BotLogs'
import BotControl from './BotControl'

type View = 'home' | 'logs' | 'control'

export default function Dashboard() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('home')

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <h1 className={styles.logo}>Bot Manager</h1>
          <div className={styles.navLinks}>
            <button
              className={`${styles.navButton} ${currentView === 'home' ? styles.active : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button
              className={`${styles.navButton} ${currentView === 'logs' ? styles.active : ''}`}
              onClick={() => setCurrentView('logs')}
            >
              Bot Logs
            </button>
            <button
              className={`${styles.navButton} ${currentView === 'control' ? styles.active : ''}`}
              onClick={() => setCurrentView('control')}
            >
              Start/Stop Bot
            </button>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {currentView === 'home' && (
          <div className={styles.homeView}>
            <h2>Welcome to Bot Manager</h2>
            <p>Select an option from the navigation menu to get started.</p>
            <div className={styles.optionsGrid}>
              <div className={styles.optionCard} onClick={() => setCurrentView('logs')}>
                <h3>Bot Logs</h3>
                <p>View all bot logs and activity</p>
              </div>
              <div className={styles.optionCard} onClick={() => setCurrentView('control')}>
                <h3>Start/Stop Bot</h3>
                <p>Manage bot configuration and control</p>
              </div>
            </div>
          </div>
        )}
        {currentView === 'logs' && <BotLogs />}
        {currentView === 'control' && <BotControl />}
      </main>
    </div>
  )
}

