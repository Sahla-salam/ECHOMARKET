import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    // Get user info from localStorage (from main app)
    const storedUsername = localStorage.getItem('username')
    const storedUserId = localStorage.getItem('userId')
    
    if (!storedUsername || !storedUserId) {
      // Redirect to login if not authenticated
      window.location.href = '../index.html'
      return
    }
    
    setUsername(storedUsername)
    setUserId(storedUserId)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Join Community - EchoMarket</h1>
        <p>Welcome, {username}!</p>
        <button onClick={() => window.location.href = '../search.html'}>
          ← Back to Dashboard
        </button>
      </header>

      <main className="app-main">
        <h2>🎉 This is where your teammate's React code will go!</h2>
        <p>Replace this App.jsx file with your teammate's component.</p>
        
        <div className="info-box">
          <h3>Integration Points:</h3>
          <ul>
            <li>✅ User authentication shared via localStorage</li>
            <li>✅ API proxy configured (use /api/ for backend calls)</li>
            <li>✅ Navigation back to main app works</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App

