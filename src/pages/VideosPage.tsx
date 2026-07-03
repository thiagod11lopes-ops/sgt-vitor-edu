import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Lock, Clock, Sparkles } from 'lucide-react'
import { PLAYLIST_LABELS, PLAYLIST_ICONS } from '@/features/videos/videoData'
import { getVideoEmbedUrl } from '@/features/admin/contentService'
import { useVideos } from '@/hooks/useVideos'
import { Badge } from '@/components/ui/Badge'
import { useSubscription } from '@/hooks/useSubscription'
import type { Video } from '@/types'

type Playlist = 'all' | 'seguranca' | 'legislacao' | 'treinamento'

type ActivePlayer = {
  provider: 'youtube' | 'instagram'
  embedUrl: string
  title: string
}

export function VideosPage() {
  const [playlist, setPlaylist] = useState<Playlist>('all')
  const [activePlayer, setActivePlayer] = useState<ActivePlayer | null>(null)
  const { isPremium, isPremiumPlus } = useSubscription()
  const { videos, loading } = useVideos()

  const filtered = videos.filter(
    (v) => playlist === 'all' || v.playlist === playlist
  )

  const playlists: Playlist[] = ['all', 'seguranca', 'legislacao', 'treinamento']

  const openVideo = (video: Video) => {
    const embed = getVideoEmbedUrl(video)
    if (!embed) return
    setActivePlayer({ ...embed, title: video.title })
  }

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar">
      <header className="relative safe-top px-4 pt-4 pb-5 sticky top-0 z-10 overflow-hidden">
        <div className="absolute inset-0 gradient-videos-soft pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl gradient-videos flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Play size={14} className="text-white ml-0.5" fill="white" />
            </div>
            <Sparkles size={14} className="text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Vídeos
          </h1>
          <p className="text-[11px] text-text-muted mt-0.5">Conteúdo educacional em vídeo</p>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-4">
            {playlists.map((pl) => (
              <button
                key={pl}
                onClick={() => setPlaylist(pl)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  playlist === pl
                    ? 'gradient-videos text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'glass text-text-secondary hover:border-blue-500/20 border border-transparent'
                }`}
              >
                {pl === 'all' ? 'Todos' : `${PLAYLIST_ICONS[pl]} ${PLAYLIST_LABELS[pl]}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activePlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black flex flex-col safe-top"
        >
          <div className="px-4 py-3 glass-strong border-b border-white/10 shrink-0">
            <p className="text-sm font-bold truncate">{activePlayer.title}</p>
            <p className="text-[10px] text-text-muted">
              {activePlayer.provider === 'youtube' ? 'YouTube' : 'Instagram'}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-4 min-h-0">
            {activePlayer.provider === 'youtube' ? (
              <iframe
                title={activePlayer.title}
                src={activePlayer.embedUrl}
                className="w-full aspect-video max-h-[70dvh] rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <iframe
                title={activePlayer.title}
                src={activePlayer.embedUrl}
                className="w-full max-w-md aspect-[9/16] max-h-[70dvh] rounded-xl border-0 bg-black"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                scrolling="no"
              />
            )}
          </div>

          <button
            onClick={() => setActivePlayer(null)}
            className="gradient-videos py-4 text-center text-sm font-semibold text-white safe-bottom shrink-0"
          >
            Fechar vídeo
          </button>
        </motion.div>
      )}

      <div className="px-4 py-3 space-y-4">
        {loading && (
          <p className="text-xs text-text-muted text-center py-8">Carregando vídeos…</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-xs text-text-muted text-center py-8">
            {playlist === 'all'
              ? 'Nenhum vídeo cadastrado ainda.'
              : 'Nenhum vídeo nesta categoria.'}
          </p>
        )}

        {filtered.map((video, i) => {
          const locked = video.isPremium && !isPremium && !isPremiumPlus
          const canPlay = !locked && !!getVideoEmbedUrl(video)
          return (
            <motion.button
              key={video.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={canPlay ? { scale: 0.98 } : undefined}
              onClick={() => {
                if (locked || !canPlay) return
                openVideo(video)
              }}
              className={`w-full text-left group ${locked ? 'opacity-60' : ''}`}
            >
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500/50 via-cyan-500/30 to-transparent">
                <div className="relative rounded-[15px] overflow-hidden aspect-video bg-bg-tertiary">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-blue-900/10 flex items-center justify-center">
                    {locked ? (
                      <Lock size={32} className="text-white/80" />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white/20 ${
                          video.instagramUrl && !video.youtubeId
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'gradient-videos shadow-blue-500/40'
                        }`}
                      >
                        <Play size={24} className="text-white ml-1" fill="white" />
                      </div>
                    )}
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                      <Clock size={10} /> {video.duration}
                    </span>
                  )}
                  {video.isPremium && (
                    <span className="absolute top-2 left-2">
                      <Badge variant="premium">Exclusivo</Badge>
                    </span>
                  )}
                  {video.instagramUrl && !video.youtubeId && (
                    <span className="absolute top-2 right-2">
                      <Badge variant="accent">Instagram</Badge>
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-semibold mt-2 group-hover:text-blue-300 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{video.description}</p>
              <span className="text-[10px] mt-1 inline-block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                {PLAYLIST_ICONS[video.playlist]} {PLAYLIST_LABELS[video.playlist]}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
