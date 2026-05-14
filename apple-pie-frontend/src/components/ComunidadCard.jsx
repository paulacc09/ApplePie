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

export default function ComunidadCard({
  id,
  nombre,
  materia,
  descripcion,
  integrantes,
  semestre,
}) {
  const navigate = useNavigate()
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function handleJoin() {
    setJoinError('')
    setJoining(true)
    try {
      await api.post(`/api/comunidades/${id}/unirse`)
    } catch (e) {
      setJoinError(getErrorMessage(e))
    } finally {
      setJoining(false)
    }
  }

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {careerEmoji(materia)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{nombre}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{materia}</p>
          {descripcion ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{descripcion}</p>
          ) : null}
          <span className="mt-3 inline-block rounded-full bg-[#F9C5D1] px-3 py-1 text-xs font-medium text-[#6C63FF] dark:bg-gray-800 dark:text-[#a8a3ff]">
            Sem. {semestre}
          </span>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">👥 {integrantes} integrantes</p>
        </div>
      </div>

      {joinError ? (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
          {joinError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className="flex-1 rounded-xl bg-[#6C63FF] px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5855d6] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {joining ? 'Uniendo...' : 'Unirse'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/comunidades/${id}`)}
          className="flex-1 rounded-xl border border-[#A8B5A2] px-3 py-2 text-sm font-medium text-[#6C63FF] transition-all duration-200 hover:bg-[#FAF7F2] dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Ver grupo
        </button>
      </div>
    </article>
  )
}
