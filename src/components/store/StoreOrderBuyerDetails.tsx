import { useState } from 'react'
import { ChevronDown, ChevronUp, User } from 'lucide-react'
import type { StoreOrder } from '@/features/store/storeTypes'
import { CAC_ACTIVITY_LABELS } from '@/features/store/storeBuyerTypes'
import { formatDate } from '@/lib/utils'

interface StoreOrderBuyerDetailsProps {
  order: StoreOrder
  defaultOpen?: boolean
}

export function StoreOrderBuyerDetails({ order, defaultOpen = false }: StoreOrderBuyerDetailsProps) {
  const [open, setOpen] = useState(defaultOpen)
  const buyer = order.buyer

  if (!buyer) {
    return (
      <p className="text-[10px] text-text-muted mb-2">
        {order.userName} · {order.userEmail}
      </p>
    )
  }

  const rows = [
    ['Nome', buyer.fullName],
    ['CPF', buyer.cpf],
    ['RG', `${buyer.rg} — ${buyer.rgIssuer}/${buyer.rgState}`],
    ['Nascimento', formatDate(buyer.birthDate)],
    ['Profissão', buyer.profession],
    ['Telefone', buyer.phone],
    ['E-mail', buyer.email],
    [
      'Endereço',
      `${buyer.addressStreet}, ${buyer.addressNumber}${buyer.addressComplement ? ` — ${buyer.addressComplement}` : ''}`,
    ],
    ['Bairro / Cidade', `${buyer.addressNeighborhood} — ${buyer.addressCity}/${buyer.addressState}`],
    ['CEP', buyer.addressZip],
    ['Atividade CAC', CAC_ACTIVITY_LABELS[buyer.cacActivity]],
    ['CR (Sinarm)', buyer.crNumber],
    ['Validade CR', formatDate(buyer.crValidity)],
    ...(buyer.authorizedCaliber ? [['Calibre autorizado', buyer.authorizedCaliber] as const] : []),
    ...(buyer.weaponRegistryNumber
      ? [['Registro arma', buyer.weaponRegistryNumber] as const]
      : []),
  ]

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] text-accent hover:underline mb-2"
      >
        <User size={12} />
        Dados do comprador
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="glass rounded-xl p-3 border border-white/5 space-y-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="text-[10px]">
              <span className="text-text-muted">{label}: </span>
              <span className="text-text-secondary">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
