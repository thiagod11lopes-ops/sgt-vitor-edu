import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import { getDefaultProfilePhoto, resolveProfilePhoto } from '@/lib/profileAssets'
import {
  getProfilePhotoObjectUrl,
  parseLocalProfilePhotoKey,
} from '@/features/profile/profilePhotoStorage'
import { cn } from '@/lib/utils'

interface ProfileAvatarEditorProps {
  photoURL?: string
  displayName?: string
  uploading?: boolean
  error?: string
  onSelectFile: (file: File) => void
  className?: string
}

export function ProfileAvatarEditor({
  photoURL,
  displayName,
  uploading = false,
  error,
  onSelectFile,
  className,
}: ProfileAvatarEditorProps) {
  const [previewSrc, setPreviewSrc] = useState(() => resolveProfilePhoto(photoURL))

  useEffect(() => {
    if (!photoURL?.trim()) {
      setPreviewSrc(getDefaultProfilePhoto())
      return
    }

    if (photoURL.startsWith('data:') || /^https?:/i.test(photoURL)) {
      setPreviewSrc(resolveProfilePhoto(photoURL))
      return
    }

    const localKey = parseLocalProfilePhotoKey(photoURL)
    if (!localKey) {
      setPreviewSrc(resolveProfilePhoto(photoURL))
      return
    }

    let active = true
    let objectUrl: string | null = null

    void getProfilePhotoObjectUrl(localKey).then((url) => {
      if (!active) return
      objectUrl = url
      setPreviewSrc(url ?? getDefaultProfilePhoto())
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoURL])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onSelectFile(file)
  }

  return (
    <div className={cn('relative w-20 h-20 mx-auto', className)}>
      <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-accent/40 ring-offset-2 ring-offset-bg-primary shadow-lg shadow-blue-500/20">
        <img
          src={previewSrc}
          alt={displayName ?? 'Foto de perfil'}
          className="w-full h-full object-cover object-[center_20%]"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[10px] text-white font-medium">Salvando…</span>
          </div>
        )}
      </div>

      <label
        className={cn(
          'absolute bottom-0 right-0 w-7 h-7 rounded-full gradient-accent flex items-center justify-center',
          'border-2 border-bg-primary shadow-md cursor-pointer',
          uploading && 'opacity-60 pointer-events-none',
        )}
        title="Alterar foto de perfil"
      >
        <Camera size={13} className="text-white" />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>

      {error && (
        <p className="absolute left-1/2 top-full mt-2 w-52 -translate-x-1/2 text-[10px] text-red-400 text-center leading-snug">
          {error}
        </p>
      )}
    </div>
  )
}
