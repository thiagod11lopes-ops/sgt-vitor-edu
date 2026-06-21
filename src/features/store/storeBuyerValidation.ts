import type { StoreCategory } from './storeTypes'
import type { StoreBuyerData } from './storeBuyerTypes'
import { isValidDateBR, parseDateBR } from '@/lib/utils'
import { requiresAuthorizedCaliber, requiresWeaponRegistry } from './storeBuyerTypes'

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  const d = digitsOnly(cpf)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i)
  let check = (sum * 10) % 11
  if (check === 10) check = 0
  if (check !== Number(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i)
  check = (sum * 10) % 11
  if (check === 10) check = 0
  return check === Number(d[10])
}

function isAdult(birthDate: string): boolean {
  const birth = parseDateBR(birthDate)
  if (!birth) return false
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age >= 18
}

function isCrValid(crValidity: string): boolean {
  const validity = parseDateBR(crValidity)
  if (!validity) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  validity.setHours(0, 0, 0, 0)
  return validity >= today
}

export function validateBuyerData(
  data: StoreBuyerData,
  productCategory: StoreCategory
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.fullName.trim()) errors.fullName = 'Informe o nome completo.'
  if (!isValidCpf(data.cpf)) errors.cpf = 'CPF inválido.'
  if (!data.rg.trim()) errors.rg = 'Informe o RG.'
  if (!data.rgIssuer.trim()) errors.rgIssuer = 'Informe o órgão emissor.'
  if (!data.rgState.trim()) errors.rgState = 'Informe a UF do RG.'
  if (!data.birthDate.trim()) errors.birthDate = 'Informe a data de nascimento.'
  else if (!isValidDateBR(data.birthDate)) errors.birthDate = 'Use o formato dd/mm/aaaa.'
  else if (!isAdult(data.birthDate)) errors.birthDate = 'É necessário ser maior de 18 anos.'
  if (!data.profession.trim()) errors.profession = 'Informe a profissão.'
  if (digitsOnly(data.phone).length < 10) errors.phone = 'Telefone inválido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'E-mail inválido.'
  if (!data.addressStreet.trim()) errors.addressStreet = 'Informe o logradouro.'
  if (!data.addressNumber.trim()) errors.addressNumber = 'Informe o número.'
  if (!data.addressNeighborhood.trim()) errors.addressNeighborhood = 'Informe o bairro.'
  if (!data.addressCity.trim()) errors.addressCity = 'Informe a cidade.'
  if (!data.addressState.trim()) errors.addressState = 'Informe a UF.'
  if (digitsOnly(data.addressZip).length !== 8) errors.addressZip = 'CEP inválido.'
  if (!data.crNumber.trim()) errors.crNumber = 'Informe o número do CR (Sinarm).'
  if (!data.crValidity.trim()) errors.crValidity = 'Informe a validade do CR.'
  else if (!isValidDateBR(data.crValidity)) errors.crValidity = 'Use o formato dd/mm/aaaa.'
  else if (!isCrValid(data.crValidity)) errors.crValidity = 'CR vencido.'

  if (requiresAuthorizedCaliber(productCategory) && !data.authorizedCaliber.trim()) {
    errors.authorizedCaliber = 'Informe o calibre autorizado no CR.'
  }

  if (requiresWeaponRegistry(productCategory) && !data.weaponRegistryNumber.trim()) {
    errors.weaponRegistryNumber = 'Informe o nº de registro da arma vinculada (Sinarm).'
  }

  if (!data.declaresEligible) {
    errors.declaresEligible = 'Confirme idoneidade, maioridade e CR válido.'
  }
  if (!data.declaresTruth) errors.declaresTruth = 'Confirme a veracidade dos dados.'
  if (!data.declaresLegislation) {
    errors.declaresLegislation = 'Confirme ciência da legislação aplicável.'
  }

  return errors
}
