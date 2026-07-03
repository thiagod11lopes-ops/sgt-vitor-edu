function currentHostname(): string | null {
  if (typeof window === 'undefined') return null
  return window.location.hostname
}

export function unauthorizedDomainMessage(hostname = currentHostname()): string {
  const host = hostname ?? 'seu-dominio.github.io'
  return (
    `Domínio não autorizado no Firebase (${host}). ` +
    `No Firebase Console → Authentication → Settings → Authorized domains, ` +
    `clique em "Add domain" e adicione: ${host}`
  )
}

export function firebaseAuthErrorMessage(code?: string): string | null {
  if (!code) return null
  if (code === 'auth/unauthorized-domain') return unauthorizedDomainMessage()
  if (code === 'auth/operation-not-allowed') {
    return 'Ative "Google" e "E-mail/senha" em Firebase → Authentication → Sign-in method.'
  }
  if (code === 'auth/popup-blocked') {
    return 'Pop-up bloqueado. Permita pop-ups para este site e tente novamente.'
  }
  if (code === 'auth/popup-closed-by-user') return null
  if (code === 'auth/missing-initial-state') {
    return 'O Safari bloqueou o retorno do Google. Toque em Entrar com Google novamente.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  return `Firebase: ${code.replace('auth/', '')}`
}
