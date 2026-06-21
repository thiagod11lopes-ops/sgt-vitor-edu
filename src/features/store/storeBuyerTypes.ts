import type { StoreCategory } from './storeTypes'

export type CacActivity = 'colecionador' | 'atirador' | 'cacador'

export interface StoreBuyerData {
  fullName: string
  cpf: string
  rg: string
  rgIssuer: string
  rgState: string
  birthDate: string
  profession: string
  phone: string
  email: string
  addressStreet: string
  addressNumber: string
  addressComplement: string
  addressNeighborhood: string
  addressCity: string
  addressState: string
  addressZip: string
  cacActivity: CacActivity
  crNumber: string
  crValidity: string
  authorizedCaliber: string
  weaponRegistryNumber: string
  declaresEligible: boolean
  declaresTruth: boolean
  declaresLegislation: boolean
}

export const CAC_ACTIVITY_LABELS: Record<CacActivity, string> = {
  colecionador: 'Colecionador',
  atirador: 'Atirador desportivo',
  cacador: 'Caçador',
}

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function createEmptyBuyerData(defaults?: Partial<StoreBuyerData>): StoreBuyerData {
  return {
    fullName: '',
    cpf: '',
    rg: '',
    rgIssuer: '',
    rgState: '',
    birthDate: '',
    profession: '',
    phone: '',
    email: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    cacActivity: 'atirador',
    crNumber: '',
    crValidity: '',
    authorizedCaliber: '',
    weaponRegistryNumber: '',
    declaresEligible: false,
    declaresTruth: false,
    declaresLegislation: false,
    ...defaults,
  }
}

export function requiresWeaponRegistry(category: StoreCategory): boolean {
  return category === 'municoes'
}

export function requiresAuthorizedCaliber(category: StoreCategory): boolean {
  return category === 'armamentos' || category === 'municoes'
}

/** Dados fictícios para demonstração — não substituem documentos reais. */
export function getExampleBuyerData(
  defaults?: Partial<StoreBuyerData>
): StoreBuyerData {
  return createEmptyBuyerData({
    fullName: 'João Silva Santos',
    cpf: '529.982.247-25',
    rg: '12.345.678-9',
    rgIssuer: 'SSP',
    rgState: 'RJ',
    birthDate: '15/03/1985',
    profession: 'Engenheiro Civil',
    phone: '(21) 98765-4321',
    email: 'joao.silva@email.com',
    addressStreet: 'Rua das Flores',
    addressNumber: '123',
    addressComplement: 'Apto 201',
    addressNeighborhood: 'Centro',
    addressCity: 'Rio de Janeiro',
    addressState: 'RJ',
    addressZip: '20040-020',
    cacActivity: 'atirador',
    crNumber: 'CR-123456',
    crValidity: '31/12/2028',
    authorizedCaliber: '.38 SPL',
    weaponRegistryNumber: 'REG-987654',
    declaresEligible: true,
    declaresTruth: true,
    declaresLegislation: true,
    ...defaults,
  })
}
