import type { StoreCategory, StoreProduct } from './storeTypes'

export type { StoreCategory, StoreProduct }

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  armamentos: 'Armamentos',
  municoes: 'Munições',
  acessorios: 'Acessórios',
}

export const CATEGORY_ICONS: Record<StoreCategory, string> = {
  armamentos: '🔫',
  municoes: '🎯',
  acessorios: '🛠️',
}

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'p1',
    name: 'Revolver .357 Magnum',
    description: 'Revolver de aço inox, tambor 6 tiros, cano ventilado. Venda restrita a CAC e documentação válida.',
    category: 'armamentos',
    price: 4890.0,
    brand: 'Taurus',
    caliber: '.357 Magnum',
    image: '/store/revolver.png',
    inStock: true,
    badge: 'Mais vendido',
  },
  {
    id: 'p2',
    name: 'Pistola Glock 9mm',
    description: 'Pistola semiautomática 9mm, acabamento FDE, cano roscado e mira red dot. Ideal para tiro esportivo.',
    category: 'armamentos',
    price: 3200.0,
    brand: 'Glock',
    caliber: '9mm',
    image: '/store/glock.png',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Pistola Taurus G2c',
    description: 'Pistola compacta semiautomática, slide preto e frame FDE. Indicada para defesa e prática esportiva.',
    category: 'armamentos',
    price: 2100.0,
    brand: 'Taurus',
    caliber: '9mm',
    image: '/store/taurus-g2c.png',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Munição Ogival CBC — 10 un.',
    description: 'Cartuchos ogivais CBC para treino. Venda sujeita a comprovação de CR e limites legais.',
    category: 'municoes',
    price: 189.9,
    brand: 'CBC',
    caliber: 'Ogival',
    image: '/store/municao-cbc.png',
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Coldre Kydex + Porta Carregador',
    description: 'Kit coldre interno Kydex com clip para cinto e porta carregador combinado.',
    category: 'acessorios',
    price: 149.9,
    brand: 'Invictus',
    image: '/store/coldre.png',
    inStock: true,
  },
  {
    id: 'p9',
    name: 'Mira Red Dot Victoptics',
    description: 'Mira reflex red dot compacta para pistola, montagem em trilho Picatinny. Uso esportivo.',
    category: 'acessorios',
    price: 399.0,
    brand: 'Victoptics',
    image: '/store/mira-red-dot.png',
    inStock: true,
  },
]
