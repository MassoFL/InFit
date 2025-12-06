import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateOutfit from '@/components/CreateOutfit'
import NavMenu from '@/components/NavMenu'
import Link from 'next/link'

export default async function CreatePage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold text-black">
            InFit
          </Link>
          <NavMenu />
        </div>
      </nav>
      
      <div className="container mx-auto px-4">
        <CreateOutfit userId={session.user.id} />
      </div>
    </main>
  )
}
