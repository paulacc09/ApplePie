import { useId, useState } from 'react'

const inputBase =
  'w-full rounded-xl border border-rose bg-white px-4 py-3 text-ink placeholder:text-faded transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose'

function formatCardNumber(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 16)
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export default function ModalPago({ open, onClose, planNombre = 'Individual', planPrecio = '$35.000' }) {
  const cardId = useId()
  const expId = useId()
  const cvvId = useId()
  const emailId = useId()
  const nameId = useId()

  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [email, setEmail] = useState('')
  const [titular, setTitular] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  function handleExpChange(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2)}`
    setExp(v)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-line bg-warm p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-pago-titulo"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-faded transition-colors hover:text-rose-dark"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <h2 id="modal-pago-titulo" className="font-display text-lg text-ink">
          Procesar pago
        </h2>

        <div className="mt-4 rounded-xl bg-rose-light p-4">
          <p className="text-xs text-stone">Plan seleccionado</p>
          <p className="font-display text-base font-semibold text-ink">{planNombre}</p>
          <p className="text-lg font-semibold text-rose-dark">{planPrecio}</p>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor={cardId} className="mb-1 block text-sm font-medium text-ink">
              Número de tarjeta
            </label>
            <input
              id={cardId}
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={card}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              className={inputBase}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={expId} className="mb-1 block text-sm font-medium text-ink">
                Vencimiento
              </label>
              <input
                id={expId}
                placeholder="MM/AA"
                maxLength={5}
                value={exp}
                onChange={handleExpChange}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor={cvvId} className="mb-1 block text-sm font-medium text-ink">
                CVV
              </label>
              <input
                id={cvvId}
                type="password"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className={inputBase}
              />
            </div>
          </div>
          <div>
            <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor={nameId} className="mb-1 block text-sm font-medium text-ink">
              Nombre del titular
            </label>
            <input
              id={nameId}
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              className={inputBase}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-rose-dark py-3 font-medium text-white transition-all duration-200 hover:bg-[#A86870] disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
          <p className="text-center text-xs text-faded">🔒 Pago seguro</p>
        </form>
      </div>
    </div>
  )
}
