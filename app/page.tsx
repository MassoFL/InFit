import AuthForm from '@/components/AuthForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">InFit</h1>
          <p className="text-black">Partagez votre style, inspirez les autres</p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
