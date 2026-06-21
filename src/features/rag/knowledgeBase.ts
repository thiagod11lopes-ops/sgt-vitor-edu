import type { RAGChunk } from '@/types'
import { simpleEmbed } from './vectorStore'

const chunks: Omit<RAGChunk, 'embedding'>[] = [
  {
    id: 'cac-1',
    documentId: 'doc-cac',
    documentTitle: 'Lei 10.826/2003 — Estatuto do Desarmamento',
    content:
      'O registro de arma de fogo no sistema CAC (Colecionador, Atirador Desportivo e Caçador) é regulamentado pelo Decreto 9.847/2019. O requerente deve comprovar aptidão psicológica, comprovação de capacidade técnica e não possuir antecedentes criminais. O registro é feito junto ao Exército Brasileiro, por meio do SIGMA/SINARM.',
    page: 12,
    article: 'Art. 6º',
  },
  {
    id: 'cac-2',
    documentId: 'doc-cac',
    documentTitle: 'Lei 10.826/2003 — Estatuto do Desarmamento',
    content:
      'São três modalidades de CAC: Colecionador (armas históricas ou raras), Atirador Desportivo (prática esportiva em entidade credenciada) e Caçador (atividade de caça regulamentada). Cada modalidade possui requisitos específicos de documentação e limites de aquisição.',
    page: 15,
    article: 'Art. 6º, §1º',
  },
  {
    id: 'posse-1',
    documentId: 'doc-posse',
    documentTitle: 'Decreto 9.847/2019 — Regulamentação CAC',
    content:
      'Posse de arma de fogo é o direito de manter a arma em sua residência ou local de guarda autorizado. O porte é a autorização para transitar com a arma. Para CAC, a posse é permitida com registro válido; o porte de trânsito exige autorização específica conforme a modalidade.',
    page: 8,
    article: 'Art. 3º',
  },
  {
    id: 'posse-2',
    documentId: 'doc-posse',
    documentTitle: 'Decreto 9.847/2019 — Regulamentação CAC',
    content:
      'Existem dois tipos principais de posse: posse domiciliar (para defesa pessoal, com requisitos específicos) e posse vinculada ao CAC (colecionador, atirador ou caçador). A posse domiciliar foi ampliada por decisões recentes, mas permanece sujeita a requisitos do Exército e Polícia Federal.',
    page: 9,
    article: 'Art. 4º',
  },
  {
    id: 'porte-1',
    documentId: 'doc-porte',
    documentTitle: 'Portaria COLOG nº 118/2017',
    content:
      'O porte de trânsito para CAC permite o transporte da arma entre a residência e o local de prática (clube de tiro, área de caça). Deve ser solicitado junto ao Comando Militar. O porte para defesa pessoal é regulamentado separadamente e exige comprovação de risco à integridade física.',
    page: 22,
    article: 'Art. 12',
  },
  {
    id: 'transporte-1',
    documentId: 'doc-transporte',
    documentTitle: 'Manual de Segurança — Transporte de Armas',
    content:
      'No transporte de armas de fogo, a legislação exige: arma descarregada, municionamento separado, em estojo ou case rígido, acompanhada da documentação (CR, guia de trânsito quando aplicável). É proibido transportar arma municiada em veículo, salvo exceções legais específicas para agentes de segurança.',
    page: 5,
    article: 'Seção 3.2',
  },
  {
    id: 'seg-1',
    documentId: 'doc-seguranca',
    documentTitle: 'Normas de Segurança com Armas de Fogo',
    content:
      'As regras fundamentais de segurança: tratar toda arma como se estivesse carregada; nunca apontar para algo que não deseja destruir; manter o dedo fora do gatilho até decidir atirar; identificar o alvo e o que está além dele. Guarda segura exige cofre ou local trancado, fora do alcance de menores.',
    page: 1,
    article: 'Regra 1-4',
  },
  {
    id: 'leg-1',
    documentId: 'doc-legislacao',
    documentTitle: 'Lei 10.826/2003 — Disposições Gerais',
    content:
      'A Lei 10.826/2003 (Estatuto do Desarmamento) estabelece normas sobre registro, posse e comercialização de armas de fogo e munição no Brasil. Crimes relacionados incluem posse ou porte ilegal, com penas previstas nos Arts. 14 a 16. A lei foi alterada diversas vezes, incluindo por decretos presidenciais.',
    page: 1,
    article: 'Art. 1º',
  },
  {
    id: 'cal-1',
    documentId: 'doc-calibres',
    documentTitle: 'Regulamentação de Calibres — CAC',
    content:
      'Para atiradores desportivos, calibres permitidos incluem .22 LR, 9mm, .380, .40, .45 ACP e calibres de competição conforme tabela do Exército. Colecionadores podem registrar calibres históricos. Restrições se aplicam a calibres de uso restrito e armas automáticas.',
    page: 18,
    article: 'Anexo I',
  },
  {
    id: 'renov-1',
    documentId: 'doc-cac',
    documentTitle: 'Lei 10.826/2003 — Estatuto do Desarmamento',
    content:
      'A renovação do Certificado de Registro (CR) deve ser solicitada antes do vencimento, com atualização de documentos: certidões criminais, comprovante de filiação ao clube (atiradores), comprovante de frequência mínima em treinos. O não cumprimento pode resultar na suspensão ou cancelamento do registro.',
    page: 20,
    article: 'Art. 10',
  },
]

export const KNOWLEDGE_BASE: RAGChunk[] = chunks.map((chunk) => ({
  ...chunk,
  embedding: simpleEmbed(chunk.content),
}))
