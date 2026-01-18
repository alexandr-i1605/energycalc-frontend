import { getAccessToken } from '../firebase_config'
import { 
  FirestoreDocument, 
  FirestoreListResponse,
  fromFirestoreDocument,
  fromFirestoreList,
  toFirestoreDocument 
} from '../utils/firestore'

class FirestoreClient {
  private baseUrl: string

  constructor(projectId?: string) {
    const project = projectId || 'energycalc-c8f85'
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async getCollection(collection: string): Promise<any[]> {
    const url = `${this.baseUrl}/${collection}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Firestore API error: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const data: FirestoreListResponse = await response.json()
      return fromFirestoreList(data)
    } catch (error) {
      console.error(`Error fetching collection ${collection}:`, error)
      throw error
    }
  }

  async getDocument(collection: string, documentId: string): Promise<any> {
    const url = `${this.baseUrl}/${collection}/${documentId}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Firestore API error: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const data: FirestoreDocument = await response.json()
      return fromFirestoreDocument(data)
    } catch (error) {
      console.error(`Error fetching document ${collection}/${documentId}:`, error)
      throw error
    }
  }

  async createDocument(collection: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/${collection}`
    const body = toFirestoreDocument(data)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Firestore API error: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const result: FirestoreDocument = await response.json()
      return fromFirestoreDocument(result)
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error)
      throw error
    }
  }

  async updateDocument(collection: string, documentId: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/${collection}/${documentId}`
    const body = toFirestoreDocument(data)
    
    const fieldPaths = Object.keys(data).filter(key => key !== 'id' && !key.startsWith('_'))
    const urlParams = new URLSearchParams()
    fieldPaths.forEach(field => {
      urlParams.append('updateMask.fieldPaths', field)
    })
    const urlWithMask = `${url}?${urlParams.toString()}`
    
    try {
      const response = await fetch(urlWithMask, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Firestore API error: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const result: FirestoreDocument = await response.json()
      return fromFirestoreDocument(result)
    } catch (error) {
      console.error(`Error updating document ${collection}/${documentId}:`, error)
      throw error
    }
  }

  async deleteDocument(collection: string, documentId: string): Promise<void> {
    const url = `${this.baseUrl}/${collection}/${documentId}`
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Firestore API error: ${response.status} ${response.statusText}. ${errorText}`)
      }
    } catch (error) {
      console.error(`Error deleting document ${collection}/${documentId}:`, error)
      throw error
    }
  }

  async queryCollection(collection: string, field: string, operator: string, value: any): Promise<any[]> {
    const allDocs = await this.getCollection(collection)
    
    return allDocs.filter((doc: any) => {
      const fieldValue = doc[field]
      switch (operator) {
        case '==':
          return fieldValue === value
        case '!=':
          return fieldValue !== value
        case '>':
          return fieldValue > value
        case '<':
          return fieldValue < value
        case '>=':
          return fieldValue >= value
        case '<=':
          return fieldValue <= value
        case 'contains':
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(String(value).toLowerCase())
          }
          return false
        default:
          return true
      }
    })
  }
}

export const firestoreClient = new FirestoreClient()

