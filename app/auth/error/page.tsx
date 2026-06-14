import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Authentication error</h1>
      <p className="text-muted-foreground">Something went wrong during sign in. Please try again.</p>
      <Button render={<Link href="/auth/login" />}>Back to login</Button>
    </div>
  )
}
