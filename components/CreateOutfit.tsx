'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { ClothingPiece } from '@/types'

export default function CreateOutfit({ userId }: { userId: string }) {
  const [images, setImages] = useState<File[]>([])
  const [height, setHeight] = useState('')
  const [description, setDescription] = useState('')
  const [pieces, setPieces] = useState<Omit<ClothingPiece, 'id'>[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const addPiece = () => {
    setPieces([...pieces, { brand: '', product_name: '', size: '', category: '', description: '', purchase_link: '' }])
  }

  const updatePiece = (index: number, field: keyof Omit<ClothingPiece, 'id'>, value: string) => {
    const updated = [...pieces]
    updated[index] = { ...updated[index], [field]: value }
    setPieces(updated)
  }

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      alert('Veuillez ajouter au moins une image')
      return
    }
    
    if (pieces.length === 0) {
      alert('Veuillez ajouter au moins un article de vêtement')
      return
    }
    
    setLoading(true)
    try {
      console.log('Starting upload...')
      
      // Upload all images
      const uploadedUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileExt = image.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}-${i}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('infit')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('infit')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrl)
      }

      console.log('Uploaded URLs:', uploadedUrls)
      const mainImageUrl = uploadedUrls[0]

      // Create outfit
      const outfitData = {
        user_id: userId,
        image_url: mainImageUrl,
        publisher_height: parseInt(height),
        publisher_size: '', // Empty string as placeholder
        description
      }
      console.log('Creating outfit with data:', outfitData)
      
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert(outfitData)
        .select()
        .single()

      console.log('Outfit result:', { outfit, outfitError })
      if (outfitError) throw outfitError

      // Add additional images if any
      if (uploadedUrls.length > 1) {
        const additionalImages = uploadedUrls.slice(1).map((url, index) => ({
          outfit_id: outfit.id,
          image_url: url,
          display_order: index + 1
        }))
        
        const { error: imagesError } = await supabase
          .from('outfit_images')
          .insert(additionalImages)

        if (imagesError) throw imagesError
      }

      // Add clothing pieces
      if (pieces.length > 0) {
        const piecesData = pieces.map(p => ({
          outfit_id: outfit.id,
          ...p
        }))
        
        const { error: piecesError } = await supabase
          .from('clothing_pieces')
          .insert(piecesData)

        if (piecesError) throw piecesError
      }

      // Reset form and redirect to feed
      alert('Tenue créée avec succès !')
      window.location.href = '/feed'
    } catch (err: any) {
      console.error('Error creating outfit:', err)
      const errorMsg = err?.message || JSON.stringify(err)
      alert(`Échec de la création de la tenue : ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-6">Créer un Outfit</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Photos
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              required
              id="photo-upload"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-black">Charger des photos</p>
            </div>
          </div>
          {images.length > 0 && (
            <p className="text-sm text-black mt-2">
              {images.length} image{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Taille (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-black"
            rows={3}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-black">Articles de Vêtements</label>
            <button
              type="button"
              onClick={addPiece}
              className="text-sm bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300"
            >
              + Ajouter un Article
            </button>
          </div>

          {pieces.map((piece, index) => (
            <div key={index} className="border p-4 rounded-md mb-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Marque *"
                  value={piece.brand}
                  onChange={(e) => updatePiece(index, 'brand', e.target.value)}
                  className="px-3 py-2 border rounded-md text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Taille *"
                  value={piece.size}
                  onChange={(e) => updatePiece(index, 'size', e.target.value)}
                  className="px-3 py-2 border rounded-md text-black"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Catégorie"
                  value={piece.category}
                  onChange={(e) => updatePiece(index, 'category', e.target.value)}
                  className="px-3 py-2 border rounded-md text-black"
                />
                <input
                  type="text"
                  placeholder="Référence"
                  value={piece.product_name}
                  onChange={(e) => updatePiece(index, 'product_name', e.target.value)}
                  className="px-3 py-2 border rounded-md text-black"
                />
              </div>
              <input
                type="url"
                placeholder="Lien"
                value={piece.purchase_link}
                onChange={(e) => updatePiece(index, 'purchase_link', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black"
              />
              <textarea
                placeholder="Description"
                value={piece.description}
                onChange={(e) => updatePiece(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black"
                rows={2}
              />
              <button
                type="button"
                onClick={() => removePiece(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer la Tenue'}
        </button>
      </form>
    </div>
  )
}
