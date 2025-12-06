'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        })
        
        if (error) throw error
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
      }
      
      router.push('/feed')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        {isSignUp ? 'Inscription' : 'Connexion'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-black"
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-black"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-black"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-sm text-black hover:underline"
      >
        {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
      </button>
    </div>
  )
}
