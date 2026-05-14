import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.textContent = 'Error: no existe el elemento #root en index.html.'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    console.error(err)
    rootEl.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.style.cssText =
      'box-sizing:border-box;max-width:32rem;margin:2rem auto;padding:1.5rem;font-family:system-ui,sans-serif;color:#3d2e2e'
    const title = document.createElement('p')
    title.style.fontWeight = '600'
    title.textContent = 'No se pudo iniciar la app (error de JavaScript).'
    const pre = document.createElement('pre')
    pre.style.cssText =
      'margin-top:1rem;padding:1rem;background:#fde8ec;border:1px solid #e8b4bc;border-radius:12px;white-space:pre-wrap;word-break:break-word;font-size:12px'
    pre.textContent = err instanceof Error ? err.message : String(err)
    wrap.appendChild(title)
    wrap.appendChild(pre)
    rootEl.appendChild(wrap)
  }
}
