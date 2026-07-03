import { useState } from 'react'
import { SurfaceLink } from '@/components/routing/SurfaceLink'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, X, AlertTriangle, Package, ChevronRight, ClipboardList } from 'lucide-react'
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type StoreCategory,
  type StoreProduct,
} from '@/features/store/storeData'
import { useStoreProducts } from '@/hooks/useStoreProducts'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  createOrder,
  getActiveUserOrder,
} from '@/features/store/storeOrderService'
import { StoreOrderPanel } from '@/components/store/StoreOrderPanel'
import { StoreBuyerFormModal } from '@/components/store/StoreBuyerFormModal'
import type { StoreBuyerData } from '@/features/store/storeBuyerTypes'
import { resolveStoreImage } from '@/lib/storeAssets'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type CategoryFilter = StoreCategory | 'all'

export function StorePage() {
  const { user } = useAuthContext()
  const uid = user?.uid ?? 'demo-user'
  const userName = user?.displayName ?? 'Visitante'
  const userEmail = user?.email ?? ''

  const products = useStoreProducts()
  const userOrders = useUserOrders(uid)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<StoreProduct | null>(null)
  const [showOrders, setShowOrders] = useState(false)
  const [showBuyerForm, setShowBuyerForm] = useState(false)
  const [, setTick] = useState(0)

  const refresh = () => setTick((t) => t + 1)

  const categories: CategoryFilter[] = ['all', 'armamentos', 'municoes', 'acessorios']

  const filtered = products.filter((p) => {
    if (!p.image) return false
    const matchCat = category === 'all' || p.category === category
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.caliber?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchCat && matchSearch
  })

  const activeOrders = userOrders.filter((o) => !['completed', 'cancelled'].includes(o.status))

  const handlePlaceOrder = () => {
    if (!selected?.inStock) return
    const existing = getActiveUserOrder(uid, selected.id)
    if (existing) {
      setShowOrders(true)
      return
    }
    setShowBuyerForm(true)
  }

  const handleBuyerSubmit = async (buyer: StoreBuyerData) => {
    if (!selected) return
    await createOrder(uid, userName, userEmail, selected, buyer)
    setShowBuyerForm(false)
    refresh()
    setShowOrders(true)
  }

  const selectedOrder = selected ? getActiveUserOrder(uid, selected.id) : null

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar pb-8">
      <header className="glass-strong safe-top px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} className="text-accent" />
            Loja
          </h1>
          <div className="flex items-center gap-2">
            {activeOrders.length > 0 && (
              <button
                onClick={() => setShowOrders(true)}
                className="relative p-2 rounded-lg glass hover:bg-white/5"
              >
                <ClipboardList size={18} className="text-accent" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[9px] font-bold flex items-center justify-center text-white">
                  {activeOrders.length}
                </span>
              </button>
            )}
            <Badge variant="default">CAC</Badge>
          </div>
        </div>

        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'glass text-text-secondary'
              }`}
            >
              {cat === 'all' ? 'Todos' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-2">
        <div className="glass rounded-xl p-3 flex items-start gap-2 border border-amber-500/20 mb-4">
          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Vendas sujeitas à legislação brasileira. Retirada presencial na loja. Pagamento em até 24h após separação.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product, i) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(product)}
              className="glass rounded-2xl overflow-hidden text-left hover:bg-white/6 transition-colors"
            >
              <div className="aspect-square bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center relative overflow-hidden">
                <img
                  src={resolveStoreImage(product.image)}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 drop-shadow-lg"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2">
                    <Badge variant="accent">{product.badge}</Badge>
                  </span>
                )}
                {!product.inStock && (
                  <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="warning">Esgotado</Badge>
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] text-text-muted">{product.brand}</p>
                <h3 className="text-xs font-semibold line-clamp-2 mt-0.5">{product.name}</h3>
                {product.caliber && (
                  <p className="text-[10px] text-accent mt-1">{product.caliber}</p>
                )}
                <p className="text-sm font-bold text-accent mt-2">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center mt-6 pb-2">
          <SurfaceLink
            surface="store-admin"
            path="/loja-admin/login"
            className="text-[10px] text-text-muted hover:text-text-secondary"
          >
            Área da loja (equipe)
          </SurfaceLink>
        </p>
      </div>

      {/* Product detail + order */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col safe-top"
          >
            <div className="glass-strong px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold truncate pr-4">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div
              className={`flex-1 overflow-y-auto hide-scrollbar px-4 py-4 min-h-0 ${
                selectedOrder ? 'pb-28' : 'pb-4'
              }`}
            >
              <div className="aspect-video glass rounded-2xl flex items-center justify-center mb-4 overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                <img
                  src={resolveStoreImage(selected.image)}
                  alt={selected.name}
                  className="w-full h-full object-contain p-6 drop-shadow-xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="default">{selected.brand}</Badge>
                <Badge variant="accent">{CATEGORY_LABELS[selected.category]}</Badge>
                {selected.caliber && <Badge variant="default">{selected.caliber}</Badge>}
              </div>

              <p className="text-2xl font-bold text-accent mb-3">
                R$ {selected.price.toFixed(2).replace('.', ',')}
              </p>

              <p className="text-sm text-text-secondary leading-relaxed mb-4">{selected.description}</p>

              {selectedOrder ? (
                <StoreOrderPanel order={selectedOrder} onUpdate={refresh} />
              ) : (
                <div className="glass rounded-xl p-3 flex items-start gap-2">
                  <Package size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-[11px] text-text-muted">
                    Após solicitar, a loja confirma o pedido, separa o produto e você tem 24h para pagar.
                    Retirada presencial com QR code.
                  </p>
                </div>
              )}
            </div>

            {!selectedOrder && (
              <div className="shrink-0 px-4 pt-3 pb-6 glass-strong border-t border-white/10 safe-bottom">
                <Button className="w-full" disabled={!selected.inStock} onClick={handlePlaceOrder}>
                  {selected.inStock ? 'Solicitar compra' : 'Indisponível'}
                  {selected.inStock && <ChevronRight size={16} />}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buyer data form */}
      <AnimatePresence>
        {showBuyerForm && selected && (
          <StoreBuyerFormModal
            product={selected}
            defaultName={userName !== 'Visitante' ? userName : ''}
            defaultEmail={userEmail}
            onClose={() => setShowBuyerForm(false)}
            onSubmit={handleBuyerSubmit}
          />
        )}
      </AnimatePresence>

      {/* My orders sheet */}
      <AnimatePresence>
        {showOrders && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col safe-top"
            onClick={() => setShowOrders(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="mt-auto glass-strong rounded-t-3xl max-h-[85dvh] flex flex-col border-t border-white/10"
            >
              <div className="px-4 py-4 flex items-center justify-between border-b border-white/5">
                <h2 className="text-sm font-bold">Meus pedidos</h2>
                <button onClick={() => setShowOrders(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-28 space-y-4">
                {userOrders.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-8">Nenhum pedido ainda.</p>
                ) : (
                  userOrders.map((order) => (
                    <StoreOrderPanel key={order.id} order={order} onUpdate={refresh} />
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
