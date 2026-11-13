import { ChefHat } from 'lucide-react'
import { Link } from 'react-router'

export default function HomePage() {
  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <ChefHat className="mx-auto size-16 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-5xl font-bold text-primary">Kitchen Dash</h1>
          <p className="py-6">Colete, prepare e entregue os pedidos antes que os clientes percam a paciência.</p>
          <Link to="/jogar" className="btn btn-primary btn-lg">
            Jogar
          </Link>
        </div>
      </div>
    </main>
  )
}
