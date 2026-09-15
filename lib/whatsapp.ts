// Builds a wa.me deep link: strip everything but digits (wa.me rejects spaces/plus/punctuation)
// and URL-encode the prefilled message.
export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
