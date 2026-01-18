export const FIREBASE_PROJECT_ID = 'energycalc-c8f85'
export const FIRESTORE_API_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`

export function getAccessToken(): string | null {
  return localStorage.getItem('firebase_access_token')
}

export function setAccessToken(token: string): void {
  localStorage.setItem('firebase_access_token', token)
}

export function clearAccessToken(): void {
  localStorage.removeItem('firebase_access_token')
}

