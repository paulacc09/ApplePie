export function getErrorMessage(error) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message)
  }
  if (data?.error) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  }
  return error?.message || 'Ocurrió un error. Intenta de nuevo.'
}
