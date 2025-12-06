'use client'

import { useState } from 'react'

interface BodyMeasurementsProps {
  measurements: {
    height?: number
    weight?: number
  }
  onSave: (measurements: any) => Promise<void>
  isEditing: boolean
  onToggleEdit: () => void
}

export default function BodyMeasurements({ 
  measurements, 
  onSave, 
  isEditing, 
  onToggleEdit 
}: BodyMeasurementsProps) {
  const [formData, setFormData] = useState(measurements)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData)
      onToggleEdit()
    } catch (error) {
      console.error('Error saving measurements:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? parseInt(value) : undefined
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Mes Informations</h2>
        {!isEditing ? (
          <button
            onClick={onToggleEdit}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData(measurements)
                onToggleEdit()
              }}
              className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Taille (cm)
          </label>
          <input
            type="number"
            value={formData.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 text-lg text-black"
            placeholder="Ex: 175"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Poids (kg)
          </label>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 text-lg text-black"
            placeholder="Ex: 70"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-black">
          💡 Ces informations permettront de vous recommander des articles
          adaptés et d'aider les autres utilisateurs à mieux comprendre comment
          les vêtements leur iront.
        </p>
      </div>
    </div>
  )
}
