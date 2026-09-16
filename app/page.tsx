import { SplitWords } from '@/components/motion/SplitWords'

// Ruling 6: the <main id="main"> wrapper that used to live here now lives once, in
// app/layout.tsx, wrapping every page's {children} — this component renders only its own
// content.
export default function HomePage() {
  return (
    <SplitWords
      as="h1"
      className="font-display-expanded text-display-xl"
      text="Redefining Real Estate Excellence"
    />
  )
}
