import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import PhaserGame from '../game/phaser/PhaserGame.jsx'

export default function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-neutral p-4">
      <Link to="/" className="btn btn-ghost self-start text-neutral-content">
        <ArrowLeft aria-hidden="true" /> Voltar
      </Link>
      <PhaserGame />
    </main>
  )
}
