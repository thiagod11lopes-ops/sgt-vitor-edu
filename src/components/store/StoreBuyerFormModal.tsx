import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Shield, ChevronRight, FileText } from 'lucide-react'
import type { StoreProduct } from '@/features/store/storeTypes'
import {
  BRAZILIAN_STATES,
  CAC_ACTIVITY_LABELS,
  createEmptyBuyerData,
  getExampleBuyerData,
  requiresAuthorizedCaliber,
  requiresWeaponRegistry,
  type CacActivity,
  type StoreBuyerData,
} from '@/features/store/storeBuyerTypes'
import { validateBuyerData } from '@/features/store/storeBuyerValidation'
import { Button } from '@/components/ui/Button'
import { cn, maskDateInput } from '@/lib/utils'

const inputClass =
  'w-full glass rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-text-muted border border-white/10'

interface StoreBuyerFormModalProps {
  product: StoreProduct
  defaultName?: string
  defaultEmail?: string
  onClose: () => void
  onSubmit: (buyer: StoreBuyerData) => void
}

export function StoreBuyerFormModal({
  product,
  defaultName = '',
  defaultEmail = '',
  onClose,
  onSubmit,
}: StoreBuyerFormModalProps) {
  const [form, setForm] = useState<StoreBuyerData>(() =>
    createEmptyBuyerData({
      fullName: defaultName,
      email: defaultEmail,
      authorizedCaliber: product.caliber ?? '',
    })
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof StoreBuyerData>(key: K, value: StoreBuyerData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const handleFillExample = () => {
    setForm(
      getExampleBuyerData({
        fullName: defaultName || undefined,
        email: defaultEmail || undefined,
        authorizedCaliber: product.caliber ?? undefined,
        weaponRegistryNumber: requiresWeaponRegistry(product.category) ? 'REG-987654' : '',
      })
    )
    setErrors({})
  }

  const setDate = (key: 'birthDate' | 'crValidity', value: string) => {
    set(key, maskDateInput(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validateBuyerData(form, product.category)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  const Field = ({
    label,
    name,
    required,
    children,
  }: {
    label: string
    name: string
    required?: boolean
    children: React.ReactNode
  }) => (
    <label className="block">
      <span className="text-[10px] text-text-muted mb-1 block">
        {label}
        {required && ' *'}
      </span>
      {children}
      {errors[name] && <p className="text-[10px] text-red-400 mt-1">{errors[name]}</p>}
    </label>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex flex-col safe-top"
    >
      <div className="glass-strong px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/10">
        <div className="min-w-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Shield size={16} className="text-accent shrink-0" />
            Dados do comprador
          </h2>
          <p className="text-[10px] text-text-muted truncate">{product.name}</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 shrink-0">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-4 pb-4">
          <div className="glass rounded-xl p-3 border border-amber-500/20">
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Conforme o Estatuto do Desarmamento (Lei nº 10.826/2003) e normas do Exército (Sinarm/CR),
              a loja precisa dos dados abaixo para registrar a solicitação de aquisição presencial.
            </p>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Identificação</h3>
              <Button type="button" variant="secondary" size="sm" onClick={handleFillExample}>
                <FileText size={14} />
                Preencher exemplo
              </Button>
            </div>
            <Field label="Nome completo" name="fullName" required>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className={inputClass}
                placeholder="Como consta no documento"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="CPF" name="cpf" required>
                <input
                  value={form.cpf}
                  onChange={(e) => set('cpf', e.target.value)}
                  className={inputClass}
                  placeholder="000.000.000-00"
                />
              </Field>
              <Field label="Data de nascimento" name="birthDate" required>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.birthDate}
                  onChange={(e) => setDate('birthDate', e.target.value)}
                  className={inputClass}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="RG" name="rg" required>
                <input
                  value={form.rg}
                  onChange={(e) => set('rg', e.target.value)}
                  className={inputClass}
                  placeholder="Número"
                />
              </Field>
              <Field label="Órgão emissor" name="rgIssuer" required>
                <input
                  value={form.rgIssuer}
                  onChange={(e) => set('rgIssuer', e.target.value)}
                  className={inputClass}
                  placeholder="Ex: SSP"
                />
              </Field>
              <Field label="UF" name="rgState" required>
                <select
                  value={form.rgState}
                  onChange={(e) => set('rgState', e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Profissão" name="profession" required>
              <input
                value={form.profession}
                onChange={(e) => set('profession', e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefone" name="phone" required>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputClass}
                  placeholder="(21) 99999-9999"
                />
              </Field>
              <Field label="E-mail" name="email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Endereço</h3>
            <Field label="Logradouro" name="addressStreet" required>
              <input
                value={form.addressStreet}
                onChange={(e) => set('addressStreet', e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Número" name="addressNumber" required>
                <input
                  value={form.addressNumber}
                  onChange={(e) => set('addressNumber', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Complemento" name="addressComplement">
                <input
                  value={form.addressComplement}
                  onChange={(e) => set('addressComplement', e.target.value)}
                  className={inputClass}
                  placeholder="Apto, bloco..."
                />
              </Field>
            </div>
            <Field label="Bairro" name="addressNeighborhood" required>
              <input
                value={form.addressNeighborhood}
                onChange={(e) => set('addressNeighborhood', e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Cidade" name="addressCity" required>
                <input
                  value={form.addressCity}
                  onChange={(e) => set('addressCity', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="UF" name="addressState" required>
                <select
                  value={form.addressState}
                  onChange={(e) => set('addressState', e.target.value)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </Field>
              <Field label="CEP" name="addressZip" required>
                <input
                  value={form.addressZip}
                  onChange={(e) => set('addressZip', e.target.value)}
                  className={inputClass}
                  placeholder="00000-000"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Registro CAC / Sinarm</h3>
            <Field label="Atividade CAC" name="cacActivity" required>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(CAC_ACTIVITY_LABELS) as [CacActivity, string][]).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set('cacActivity', id)}
                    className={cn(
                      'glass rounded-xl px-3 py-2.5 text-left text-sm transition-all border-2',
                      form.cacActivity === id
                        ? 'border-accent bg-accent/15'
                        : 'border-white/10 hover:border-white/25'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº do CR (Sinarm)" name="crNumber" required>
                <input
                  value={form.crNumber}
                  onChange={(e) => set('crNumber', e.target.value)}
                  className={inputClass}
                  placeholder="Certificado de Registro"
                />
              </Field>
              <Field label="Validade do CR" name="crValidity" required>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.crValidity}
                  onChange={(e) => setDate('crValidity', e.target.value)}
                  className={inputClass}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                />
              </Field>
            </div>
            {requiresAuthorizedCaliber(product.category) && (
              <Field label="Calibre autorizado no CR" name="authorizedCaliber" required>
                <input
                  value={form.authorizedCaliber}
                  onChange={(e) => set('authorizedCaliber', e.target.value)}
                  className={inputClass}
                  placeholder="Ex: .38 SPL, 9mm"
                />
              </Field>
            )}
            {requiresWeaponRegistry(product.category) && (
              <Field label="Nº registro da arma vinculada (Sinarm)" name="weaponRegistryNumber" required>
                <input
                  value={form.weaponRegistryNumber}
                  onChange={(e) => set('weaponRegistryNumber', e.target.value)}
                  className={inputClass}
                  placeholder="Obrigatório para munições"
                />
              </Field>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Declarações</h3>
            {(
              [
                {
                  key: 'declaresEligible' as const,
                  text: 'Declaro ser maior de 18 anos, possuir idoneidade, CR válido e autorização compatível com o produto solicitado.',
                },
                {
                  key: 'declaresTruth' as const,
                  text: 'Declaro que todas as informações prestadas são verdadeiras e correspondem aos meus documentos oficiais.',
                },
                {
                  key: 'declaresLegislation' as const,
                  text: 'Estou ciente de que a aquisição está sujeita à legislação brasileira, conferência documental na loja e retirada presencial.',
                },
              ] as const
            ).map(({ key, text }) => (
              <label
                key={key}
                className={cn(
                  'flex items-start gap-2 glass rounded-xl p-3 cursor-pointer border-2 transition-all',
                  form[key] ? 'border-accent bg-accent/10' : 'border-white/10',
                  errors[key] && 'border-red-500/40'
                )}
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-[11px] text-text-secondary leading-relaxed">{text}</span>
              </label>
            ))}
            {(errors.declaresEligible || errors.declaresTruth || errors.declaresLegislation) && (
              <p className="text-[10px] text-red-400">Marque todas as declarações obrigatórias.</p>
            )}
          </section>
        </div>

        <div className="shrink-0 px-4 pt-3 pb-6 glass-strong border-t border-white/10 safe-bottom">
          <Button type="submit" className="w-full">
            Confirmar solicitação
            <ChevronRight size={16} />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
