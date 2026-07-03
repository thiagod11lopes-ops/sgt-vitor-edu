import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { firebaseConfig, isConfigured } from './config'

const ADMIN_APP_NAME = 'sgt-vitor-admin'

let adminApp: FirebaseApp | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

if (isConfigured) {
  adminApp = initializeApp(firebaseConfig, ADMIN_APP_NAME)
  adminAuth = initializeAuth(adminApp, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  })
  adminDb = getFirestore(adminApp)
}

export { adminApp, adminAuth, adminDb }

export const SYSTEM_ADMIN_EMAIL = 'system-admin@sgt-vitor-edu.app'
export const STORE_ADMIN_EMAIL = 'store-admin@sgt-vitor-edu.app'
