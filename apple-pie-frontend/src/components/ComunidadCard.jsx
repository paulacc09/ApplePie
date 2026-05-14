import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

const EMOJIS = ['🔬', '📐', '💻', '📊']

function careerEmoji(materia) {
  if (!materia) return '💻'
  let h = 0
  for (let i = 0; i < materia.length; i += 1) {
    h = (h + materia.charCodeAt(i) * 13) % 997
  }
  return EMOJIS[h % EMOJIS.length]
}

export default function ComunidadCard({ id, nombre, materia, descripcion, integrantes, semestre, onJoined }) {
  const navigate = useNavigate()
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const cupos = Math.max(0, 8 - (Number(integrantes) % 6))

  async function handleJoin() {
    setJoinError('')
    setJoining(true)
    try {
      await api.post(`/api/comunidades/${id}/unirse`)
      await onJoined?.()
    } catch (e) {
      setJoinError(getErrorMessage(e))
    } finally {
      setJoining(false)
    }
  }

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-warm p-5 shadow-card transition-all duration-200 hover:border-rose hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl" aria-hidden="true">
          {careerEmoji(materia)}
        </span>
        <span className="rounded-full bg-rose-light px-2 py-0.5 text-xs font-medium text-rose-dark">
          Sem. {semestre}
        </span>
      </div>
      <h3 className="mt-3 text-base font-medium text-ink">{nombre}</h3>
      <p className="text-xs text-stone">Martes y Jueves 4pm</p>
      {descripcion ? (
        <p className="mt-2 line-clamp-2 text-xs text-stone">{descripcion}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-faded">
        <span>👥 {integrantes} integrantes</span>
        <span className="text-olive">{cupos} cupos disponibles</span>
      </div>

      {joinError ? (
        <p className="mt-2 text-xs text-rose-dark" role="alert">
          {joinError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="flex-1 rounded-xl bg-olive px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {joining ? 'Uniendo...' : 'Unirse'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/comunidades/${id}`)}
          className="flex-1 rounded-xl border border-rose bg-white px-4 py-2 text-sm font-medium text-rose-dark transition-all duration-200 hover:bg-rose-light"
        >
          Ver grupo
        </button>
      </div>
    </article>
  )
}
