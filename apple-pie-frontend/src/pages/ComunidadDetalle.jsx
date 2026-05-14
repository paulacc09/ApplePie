import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/axios.js'
import { getErrorMessage } from '../lib/apiError.js'

export default function ComunidadDetalle() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data: res } = await api.get(`/api/comunidades/${id}`)
        const payload = res?.comunidad ?? res?.data ?? res
        if (!cancelled) setData(payload && typeof payload === 'object' ? payload : null)
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  const nombre = data?.nombre ?? data?.name ?? 'Comunidad'
  const materia = data?.materia ?? data?.subject ?? ''
  const desc = data?.descripcion ?? data?.description ?? ''

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/comunidades"
        className="inline-block text-sm font-medium text-[#6C63FF] underline-offset-2 hover:underline"
      >
        ← Volver a comunidades
      </Link>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white dark:bg-gray-900" aria-busy="true" />
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && data ? (
        <article className="rounded-3xl bg-white p-8 shadow-md dark:bg-gray-900">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{nombre}</h1>
          {materia ? <p className="mt-2 text-[#A8B5A2] dark:text-gray-400">{materia}</p> : null}
          {desc ? <p className="mt-6 text-gray-700 dark:text-gray-300">{desc}</p> : null}
        </article>
      ) : null}

      {!loading && !error && !data ? (
        <p className="text-gray-600 dark:text-gray-400">No se encontró la comunidad.</p>
      ) : null}
    </div>
  )
}
