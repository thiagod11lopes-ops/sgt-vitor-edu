import { useState } from 'react'
import { Plus, Trash2, Pencil, Package } from 'lucide-react'
import {
  getStoreProducts,
  addStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
} from '@/features/store/storeProductService'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/features/store/storeData'
import type { StoreCategory, StoreProduct } from '@/features/store/storeTypes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { resolveStoreImage } from '@/lib/storeAssets'

const emptyProduct = {
  name: '',
  description: '',
  category: 'armamentos' as StoreCategory,
  price: 0,
  brand: '',
  caliber: '',
  image: '/store/revolver.svg',
  inStock: true,
  badge: '',
}

export function StoreAdminProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>(() => getStoreProducts())
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refreshProducts = () => setProducts(getStoreProducts())

  const handleSaveProduct = async () => {
    if (!form.name.trim()) return
    const data = {
      ...form,
      price: Number(form.price),
      badge: form.badge || undefined,
      caliber: form.caliber || undefined,
    }
    if (editingId) await updateStoreProduct(editingId, data)
    else await addStoreProduct(data)
    setForm(emptyProduct)
    setEditingId(null)
    refreshProducts()
  }

  const startEdit = (p: StoreProduct) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      brand: p.brand,
      caliber: p.caliber ?? '',
      image: p.image,
      inStock: p.inStock,
      badge: p.badge ?? '',
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Package size={20} className="text-amber-400" />
        Produtos
      </h1>
      <p className="text-xs text-text-muted mb-4">Cadastro e edição de itens da loja</p>

      <div className="glass rounded-xl p-4 mb-6 border border-white/5 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Plus size={14} />
          {editingId ? 'Editar produto' : 'Novo produto'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nome"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="Marca"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="Preço (R$)"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as StoreCategory })}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="URL da foto (ex: /store/revolver.svg)"
            className="md:col-span-2 glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            value={form.caliber}
            onChange={(e) => setForm({ ...form, caliber: e.target.value })}
            placeholder="Calibre (opcional)"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="Badge (opcional)"
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição"
          rows={2}
          className="w-full glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
          />
          Em estoque
        </label>
        <div className="flex gap-2">
          <Button onClick={handleSaveProduct}>{editingId ? 'Salvar' : 'Adicionar'}</Button>
          {editingId && (
            <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyProduct) }}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-xl p-3 flex gap-3 border border-white/5">
            <img src={resolveStoreImage(p.image)} alt="" className="w-16 h-16 rounded-lg object-contain bg-black/40 p-1" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{p.name}</p>
              <p className="text-[10px] text-text-muted">R$ {p.price.toFixed(2)} · {p.brand}</p>
              <Badge variant="default" className="mt-1">{CATEGORY_ICONS[p.category]} {CATEGORY_LABELS[p.category]}</Badge>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-white/5"><Pencil size={14} /></button>
              <button onClick={() => { if (confirm('Remover?')) { void deleteStoreProduct(p.id).then(refreshProducts) } }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
