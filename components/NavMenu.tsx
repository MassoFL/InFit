'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'

export default function NavMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 text-black hover:text-gray-600"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 text-black hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Mon Profil
          </Link>
          <Link
            href="/create"
            className="block px-4 py-2 text-black hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Créer une Tenue
          </Link>
          <hr className="my-2 border-gray-200" />
          <button
            onClick={() => {
              setIsOpen(false)
              handleSignOut()
            }}
            className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
