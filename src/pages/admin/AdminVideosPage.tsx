import { useState } from 'react'
import { Plus, Trash2, Pencil, Play, ExternalLink } from 'lucide-react'
import {
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  parseYoutubeId,
  parseInstagramEmbedUrl,
  youtubeThumbnail,
} from '@/features/admin/contentService'
import { PLAYLIST_LABELS } from '@/features/videos/videoData'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Video } from '@/types'

const emptyForm = {
  title: '',
  description: '',
  youtubeLink: '',
  instagramUrl: '',
  playlist: 'legislacao' as Video['playlist'],
  isPremium: false,
  duration: '',
}

export function AdminVideosPage() {
  const [videos, setVideos] = useState(getVideos)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [linkError, setLinkError] = useState('')

  const refresh = () => setVideos(getVideos())

  const handleSave = async () => {
    if (!form.title.trim()) return

    const youtubeId = parseYoutubeId(form.youtubeLink)
    const instagramEmbed = parseInstagramEmbedUrl(form.instagramUrl)

    if (!youtubeId && !instagramEmbed) {
      setLinkError('Informe um link válido do YouTube ou do Instagram (reel, post ou IGTV).')
      return
    }

    setLinkError('')
    const thumbnail = youtubeId
      ? youtubeThumbnail(youtubeId)
      : 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg'

    const data = {
      title: form.title,
      description: form.description,
      thumbnail,
      youtubeId: youtubeId ?? undefined,
      instagramUrl: form.instagramUrl.trim() || undefined,
      playlist: form.playlist,
      isPremium: form.isPremium,
      duration: form.duration || undefined,
    }

    try {
      if (editingId) {
        await updateVideo(editingId, data)
      } else {
        await addVideo(data)
      }
      setForm(emptyForm)
      setEditingId(null)
      refresh()
    } catch {
      setLinkError('Erro ao salvar no Firebase. Faça login no admin e verifique Authentication.')
    }
  }

  const startEdit = (video: Video) => {
    setEditingId(video.id)
    setForm({
      title: video.title,
      description: video.description,
      youtubeLink: video.youtubeId ?? '',
      instagramUrl: video.instagramUrl ?? '',
      playlist: video.playlist,
      isPremium: video.isPremium,
      duration: video.duration ?? '',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este vídeo?')) {
      void deleteVideo(id).then(refresh)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Vídeos</h1>
      <p className="text-xs text-text-muted mb-6">Adicione links do YouTube e Instagram para a aba Vídeos</p>

      <div className="glass rounded-xl p-4 mb-6 border border-white/5 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Plus size={14} />
          {editingId ? 'Editar vídeo' : 'Novo vídeo'}
        </h2>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Título"
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição"
          rows={2}
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-text-muted flex items-center gap-1 mb-1">
              <Play size={10} /> Link ou ID do YouTube
            </label>
            <input
              value={form.youtubeLink}
              onChange={(e) => {
                setForm({ ...form, youtubeLink: e.target.value })
                setLinkError('')
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full glass rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-muted flex items-center gap-1 mb-1">
              <ExternalLink size={10} /> Link do Instagram (opcional)
            </label>
            <input
              value={form.instagramUrl}
              onChange={(e) => {
                setForm({ ...form, instagramUrl: e.target.value })
                setLinkError('')
              }}
              placeholder="https://instagram.com/reel/..."
              className="w-full glass rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
        {linkError && <p className="text-[10px] text-red-400">{linkError}</p>}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={form.playlist}
            onChange={(e) => setForm({ ...form, playlist: e.target.value as Video['playlist'] })}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          >
            {Object.entries(PLAYLIST_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="Duração (ex: 12:30)"
            className="glass rounded-xl px-3 py-2 text-sm outline-none w-32"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
            />
            Exclusivo Premium
          </label>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>{editingId ? 'Salvar' : 'Adicionar'}</Button>
          {editingId && (
            <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm) }}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {videos.map((v) => (
          <div key={v.id} className="glass rounded-xl p-3 flex items-start gap-3 border border-white/5">
            <img src={v.thumbnail} alt="" className="w-20 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{v.title}</p>
              <p className="text-[10px] text-text-muted">{PLAYLIST_LABELS[v.playlist]}</p>
              <div className="flex gap-1 mt-1">
                {v.youtubeId && <Badge variant="default">YouTube</Badge>}
                {v.instagramUrl && <Badge variant="accent">Instagram</Badge>}
                {v.isPremium && <Badge variant="premium">Premium</Badge>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(v)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
