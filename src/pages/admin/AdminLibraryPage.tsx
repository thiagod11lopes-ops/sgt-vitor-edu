import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/features/admin/contentService'
import {
  LOCAL_PDF_PREFIX,
  isLocalPdfUrl,
  parseLocalPdfKey,
  storePdfFile,
  deletePdfFile,
} from '@/features/admin/pdfStorageService'
import { CATEGORY_LABELS } from '@/features/library/libraryData'
import { PdfUploadField } from '@/components/admin/PdfUploadField'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Document, DocumentCategory } from '@/types'

const emptyForm = {
  title: '',
  description: '',
  category: 'legislacao' as DocumentCategory,
  pages: 1,
  url: '',
  isPremium: false,
}

function titleFromPdfName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim()
}

export function AdminLibraryPage() {
  const [docs, setDocs] = useState(getDocuments)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [hasExistingPdf, setHasExistingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = () => setDocs(getDocuments())

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setPdfFile(null)
    setHasExistingPdf(false)
    setPdfError('')
  }

  const handleSave = async () => {
    if (!form.title.trim()) return

    const externalUrl = form.url.trim()
    const hasExternalUrl = externalUrl.startsWith('http')
    const hasPdf = !!pdfFile || hasExistingPdf

    if (!hasPdf && !hasExternalUrl) {
      setPdfError('Selecione um PDF ou informe um link externo.')
      return
    }

    setSaving(true)
    setPdfError('')

    try {
      let url = externalUrl || '#'

      if (pdfFile) {
        if (editingId) {
          const existing = docs.find((d) => d.id === editingId)
          const oldKey = existing ? parseLocalPdfKey(existing.url) : null
          if (oldKey) await deletePdfFile(oldKey)
        }
        const key = await storePdfFile(pdfFile)
        url = `${LOCAL_PDF_PREFIX}${key}`
      } else if (hasExistingPdf && editingId) {
        const existing = docs.find((d) => d.id === editingId)
        url = existing?.url ?? url
      }

      const data = {
        ...form,
        url,
        updatedAt: new Date().toISOString().split('T')[0],
      }

      if (editingId) {
        await updateDocument(editingId, data)
      } else {
        await addDocument(data)
      }

      resetForm()
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (doc: Document) => {
    setEditingId(doc.id)
    setForm({
      title: doc.title,
      description: doc.description,
      category: doc.category,
      pages: doc.pages,
      url: isLocalPdfUrl(doc.url) ? '' : doc.url,
      isPremium: doc.isPremium,
    })
    setPdfFile(null)
    setHasExistingPdf(isLocalPdfUrl(doc.url))
    setPdfError('')
  }

  const handlePdfChange = (file: File | null) => {
    setPdfFile(file)
    setPdfError('')
    if (file && !form.title.trim()) {
      setForm((prev) => ({ ...prev, title: titleFromPdfName(file.name) }))
    }
    if (file) setHasExistingPdf(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este documento?')) {
      void deleteDocument(id).then(() => {
        if (editingId === id) resetForm()
        refresh()
      })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Biblioteca</h1>
      <p className="text-xs text-text-muted mb-6">
        Atualize legislação, segurança e normas exibidos na aba Biblioteca
      </p>

      <div className="glass rounded-xl p-4 mb-6 border border-white/5 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Plus size={14} />
          {editingId ? 'Editar documento' : 'Novo documento'}
        </h2>

        <PdfUploadField
          file={pdfFile}
          existingFileName={hasExistingPdf && !pdfFile ? 'PDF anexado à biblioteca' : undefined}
          onFileChange={handlePdfChange}
          error={pdfError}
        />

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Título do documento"
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição / resumo das alterações"
          rows={2}
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={form.pages}
            onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })}
            placeholder="Páginas"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
        </div>
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="Link externo do PDF (opcional se enviar arquivo acima)"
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none"
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.isPremium}
            onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
          />
          Conteúdo Premium
        </label>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="glass rounded-xl p-3 flex items-start justify-between gap-3 border border-white/5">
            <div className="min-w-0">
              <p className="text-xs font-semibold">{doc.title}</p>
              <p className="text-[10px] text-text-muted line-clamp-1">{doc.description}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                <Badge variant="accent">{CATEGORY_LABELS[doc.category]}</Badge>
                <Badge variant="default">{doc.pages} pág.</Badge>
                {isLocalPdfUrl(doc.url) && <Badge variant="default">PDF local</Badge>}
                {doc.isPremium && <Badge variant="premium">Premium</Badge>}
                <span className="text-[9px] text-text-muted">Atualizado: {formatDate(doc.updatedAt)}</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(doc)} className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
