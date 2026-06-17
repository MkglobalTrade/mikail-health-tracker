import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href="/">
            <Button className="gap-2"><Home className="w-4 h-4" /> Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
