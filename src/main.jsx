import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Removing StrictMode to prevent double-mounting which can destabilize Three.js contexts
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
