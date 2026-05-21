import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

function ToggleSwitch({ active, onToggle, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={label}
        onClick={onToggle}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          active ? 'bg-olive' : 'bg-faded'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            active ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function AccessibilityPanel() {
  const {
    isDark,
    toggleTheme,
    fontSize,
    setFontSize,
    invertColors,
    toggleInvertColors,
    tts,
    toggleTts,
  } = useTheme()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!tts) {
      window.speechSynthesis.cancel()
      return undefined
    }

    function handler(e) {
      const el = e.target
      if (!(el instanceof HTMLElement)) return
      const texto = el.textContent?.trim()
      if (!texto) return
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(texto))
    }

    document.addEventListener('click', handler)
    return () => {
      document.removeEventListener('click', handler)
      window.speechSynthesis.cancel()
    }
  }, [tts])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-olive text-white shadow-lg"
        aria-label="Panel de accesibilidad"
        aria-expanded={open}
      >
        ♿
      </button>

      {open ? (
        <div
          className="fixed bottom-32 right-4 z-50 w-64 rounded-2xl border border-line bg-warm p-4 shadow-xl"
          role="dialog"
          aria-label="Opciones de accesibilidad"
        >
          <p className="mb-3 font-display text-sm text-ink">Accesibilidad</p>

          <div className="space-y-4">
            <ToggleSwitch active={isDark} onToggle={toggleTheme} label="Modo oscuro" />

            <div>
              <p className="mb-2 text-sm text-ink">Tamaño de texto</p>
              <div className="flex gap-2">
                {[
                  { id: 'normal', label: 'A' },
                  { id: 'large', label: 'A+' },
                  { id: 'xlarge', label: 'A++' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFontSize(id)}
                    className={`flex-1 rounded-xl px-2 py-1.5 text-sm font-medium transition-colors ${
                      fontSize === id
                        ? 'bg-olive text-white'
                        : 'border border-rose text-rose-dark hover:bg-rose-light'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ToggleSwitch
              active={invertColors}
              onToggle={toggleInvertColors}
              label="Invertir colores"
            />

            <ToggleSwitch active={tts} onToggle={toggleTts} label="Lector de voz" />
          </div>
        </div>
      ) : null}
    </>
  )
}
