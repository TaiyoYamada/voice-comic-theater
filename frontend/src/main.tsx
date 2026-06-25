import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './state'
import { App } from './App'
import { AdminPanel } from './admin/AdminPanel'
import { Privacy } from './Privacy'
import { HowToPlay } from './HowToPlay'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/how-to" element={<HowToPlay />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
)
