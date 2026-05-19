export function generarMeetLink() {
  const segment = (n) =>
    Array.from({ length: n }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 26)),
    ).join('')

  return `https://meet.google.com/${segment(3)}-${segment(4)}-${segment(3)}`
}
