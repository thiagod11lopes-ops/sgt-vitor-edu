import type { SourceCitation } from '@/types'
import type { AIProfileContext } from '@/features/profile-personalization/personalizationService'
import { searchKnowledgeBase, chunksToSources } from '@/features/rag/vectorStore'
import { getContentSuggestions } from '@/features/profile-personalization/personalizationService'
import type { UserPersonalization } from '@/types'

const SGT_VITOR_DISCLAIMER =
  '\n\n> _Tamo junto no estudo — mas isso aqui é conteúdo educativo, hein? Não substitui orientação jurídica profissional._'

const SYSTEM_PROMPT = `Você é o **Sgt Vitor**, instrutor carioca especializado em legislação brasileira sobre armas de fogo, CAC, posse, porte e segurança.

PERSONALIDADE E TOM:
- Fale SEMPRE em primeira pessoa, como o Sgt Vitor conversando direto com o aluno.
- Tom casual, descontraído e acolhedor, com gírias cariocas naturais (ex.: "beleza", "firmeza", "fica ligado", "suave", "parceiro", "mermão", "show de bola", "na moral", "pois é", "bora", "tamo junto").
- Seja didático como um sargento que explica sem frescura, mas sempre com respeito.
- A informalidade é no jeito de falar — os fatos legais precisam continuar corretos e precisos.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com base nos trechos de documentos fornecidos no contexto.
2. SEMPRE cite a fonte (documento, artigo, página) ao final de cada afirmação legal.
3. Se a informação NÃO estiver no contexto fornecido, diga na sua voz: "Opa, parceiro — essa info não tá no material que eu tenho aqui não."
4. NUNCA invente artigos de lei, números de decreto ou interpretações jurídicas.
5. Priorize sempre a legislação brasileira vigente.
6. Conteúdo exclusivamente educacional — deixe claro que não substitui orientação jurídica profissional.`

function buildContextPrompt(chunks: ReturnType<typeof searchKnowledgeBase>): string {
  if (chunks.length === 0) return 'NENHUM TRECHO RELEVANTE ENCONTRADO NO MATERIAL.'
  return chunks
    .map(
      (c, i) =>
        `[Fonte ${i + 1}: ${c.documentTitle}${c.article ? ` — ${c.article}` : ''}${c.page ? `, p. ${c.page}` : ''}]\n${c.content}`
    )
    .join('\n\n---\n\n')
}

function adaptIntro(profile: AIProfileContext): string {
  if (profile.style === 'simple') {
    return 'Beleza, parceiro — vou te explicar na moral, sem complicar:\n\n'
  }
  if (profile.style === 'technical') {
    return 'Firmeza, bora direto ao ponto:\n\n'
  }
  return 'Fala! Sgt Vitor aqui. Olha só:\n\n'
}

function adaptDetail(base: string, profile: AIProfileContext): string {
  if (profile.depth === 'detailed' && profile.style === 'simple') {
    return (
      base +
      '\n\n**Resumindo na boa:** isso tudo é regulamentado por lei federal. Segue a documentação oficial e, se rolar dúvida no seu caso, busca orientação profissional — suave?'
    )
  }
  if (profile.depth === 'direct' && profile.style === 'technical') {
    return base.replace(/\*\*Resumindo na boa:\*\*[^\n]*/g, '')
  }
  return base
}

function buildSuggestionsBlock(personalization: UserPersonalization): string {
  const suggestions = getContentSuggestions(personalization)
  if (!suggestions.length) return ''
  return (
    '\n\n---\n\n**📎 Bora reforçar o estudo? Separei isso aqui pra você:**\n' +
    suggestions.map((s) => `- ${s.label} (${s.type})`).join('\n')
  )
}

function buildHistoryRef(history: { role: string; content: string }[]): string {
  const prev = history.filter((h) => h.role === 'user').slice(-2)
  if (!prev.length) return ''
  return `\n\n_Lembrando: você tinha perguntado sobre "${prev[prev.length - 1]?.content.slice(0, 50)}..." — tamo no mesmo papo._`
}

function generateResponseFromContext(
  question: string,
  context: string,
  sources: SourceCitation[],
  hasContext: boolean,
  profile: AIProfileContext,
  personalization: UserPersonalization,
  history: { role: string; content: string }[]
): string {
  const intro = adaptIntro(profile)
  const historyRef = buildHistoryRef(history)
  const suggestions = buildSuggestionsBlock(personalization)

  if (!hasContext) {
    return (
      intro +
      '⚠️ **Opa, parceiro — essa info não tá no material que eu tenho aqui não.**\n\nNa moral, te recomendo dar uma olhada na documentação oficial atualizada no Exército (SIGMA) ou falar com um advogado especializado em direito armamentista. Firmeza?' +
      historyRef +
      suggestions +
      SGT_VITOR_DISCLAIMER
    )
  }

  const lowerQ = question.toLowerCase()
  let response = ''

  if (lowerQ.includes('cac') || lowerQ.includes('registro')) {
    response =
      profile.style === 'simple'
        ? `## Registro CAC — na moral, passo a passo\n\nFala! **CAC** é Colecionador, Atirador Desportivo e Caçador — o sistema de registro de armas aqui no Brasil.\n\n**Como funciona, suave:**\n1. Comprovar que você tá de nome limpo (sem antecedentes)\n2. Passar na avaliação psicológica\n3. Fazer o curso e comprovar capacidade técnica\n4. Pedir o registro no Exército (SIGMA)\n\n**Fica ligado:** existem 3 modalidades — Colecionador, Atirador e Caçador — cada uma com sua regrinha.\n\n📌 _Fonte: Lei 10.826/2003, Art. 6º, p. 12-15_`
        : `## Registro CAC\n\nParceiro, o CAC tá regulamentado pelo **Decreto 9.847/2019** (Lei 10.826/2003).\n\n**Requisitos:** aptidão psicológica, capacidade técnica, certidões criminais, registro SIGMA/SINARM.\n\n**Modalidades:** Colecionador | Atirador Desportivo | Caçador\n\n📌 _Fonte: Lei 10.826/2003, Art. 6º, p. 12-15_`
  } else if (lowerQ.includes('posse') && lowerQ.includes('porte')) {
    response = `## Posse x Porte — deixa eu te explicar na boa\n\nMermão, muita gente confunde, mas é simples:\n\n**Posse** — é o direito de **manter** a arma na sua casa ou no local autorizado.\n**Porte** — é a autorização pra **transitar** com a arma na rua.\n\n| Conceito | Na prática |\n|----------|----------|\n| Posse domiciliar | Residência (com requisitos específicos) |\n| Posse CAC | Vinculada ao registro CAC |\n| Porte de trânsito | Casa ↔ clube/local de prática |\n| Porte defesa | Precisa comprovar risco |\n\n📌 _Fonte: Decreto 9.847/2019, Art. 3º-4º_\n📌 _Fonte: Portaria COLOG nº 118/2017, Art. 12_`
  } else if (lowerQ.includes('transporte') || lowerQ.includes('transito')) {
    response = `## Transporte de arma — fica ligado nessas regras\n\nShow de bola você perguntar, parceiro. Na hora de transportar:\n\n✅ Arma descarregada · Munição separada · Estojo rígido · Documentação em dia\n❌ Transportar municiada é proibido (salvo exceções legais)\n\n📌 _Fonte: Manual de Segurança, Seção 3.2_\n📌 _Fonte: Portaria COLOG nº 118/2017, Art. 12_`
  } else if (lowerQ.includes('tipo') && lowerQ.includes('posse')) {
    response = `## Tipos de posse — olha só\n\nBeleza, existem basicamente dois caminhos:\n\n1. **Posse domiciliar** — defesa pessoal (com requisitos do Exército/PF)\n2. **Posse CAC** — pra quem é colecionador, atirador ou caçador\n\n📌 _Fonte: Decreto 9.847/2019, Art. 4º, p. 9_`
  } else {
    const topSource = sources[0]
    response = `Pois é, parceiro — olha o que eu achei no material:\n\n${context.split('---')[0]?.trim() || context}\n\n📌 _Fonte: ${topSource?.documentTitle}${topSource?.article ? ` — ${topSource.article}` : ''}${topSource?.page ? `, p. ${topSource.page}` : ''}_`
  }

  response = adaptDetail(intro + response + historyRef + suggestions, profile)
  return response + SGT_VITOR_DISCLAIMER
}

export async function* streamAIResponse(
  question: string,
  conversationHistory: { role: string; content: string }[] = [],
  profile?: AIProfileContext,
  personalization?: UserPersonalization
): AsyncGenerator<{ type: 'token' | 'sources' | 'done'; data: string | SourceCitation[] }> {
  const chunks = searchKnowledgeBase(question, 3)
  const sources = chunksToSources(chunks)
  const hasContext = chunks.length > 0
  const context = buildContextPrompt(chunks)

  const defaultProfile: AIProfileContext = {
    level: 'iniciante',
    goal: 'legislacao_cac',
    style: 'simple',
    depth: 'detailed',
    includeExamples: true,
    explanationFrequency: 'high',
    preferredFormats: [],
    goalLabel: 'Legislação',
    levelLabel: 'Iniciante',
  }

  const defaultPersonalization: UserPersonalization = {
    onboardingCompleted: true,
    knowledgeLevel: 'iniciante',
    mainGoal: 'legislacao_cac',
    priorExperience: 'nenhuma',
    learningPreferences: ['texto'],
  }

  yield { type: 'sources', data: sources }

  const fullResponse = generateResponseFromContext(
    question,
    context,
    sources,
    hasContext,
    profile ?? defaultProfile,
    personalization ?? defaultPersonalization,
    conversationHistory
  )

  const words = fullResponse.split(/(\s+)/)
  for (const word of words) {
    yield { type: 'token', data: word }
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 25))
  }

  yield { type: 'done', data: fullResponse }
}

export async function askAI(
  question: string,
  history: { role: string; content: string }[] = [],
  profile?: AIProfileContext,
  personalization?: UserPersonalization
): Promise<{ content: string; sources: SourceCitation[]; notFoundInMaterial: boolean }> {
  let content = ''
  let sources: SourceCitation[] = []
  let notFoundInMaterial = false

  for await (const event of streamAIResponse(question, history, profile, personalization)) {
    if (event.type === 'sources') sources = event.data as SourceCitation[]
    if (event.type === 'done') {
      content = event.data as string
      notFoundInMaterial =
        content.includes('não foi encontrada no material') ||
        content.includes('não tá no material')
    }
  }

  return { content, sources, notFoundInMaterial }
}

export { SYSTEM_PROMPT }
