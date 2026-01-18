export interface FirestoreValue {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  nullValue?: null
  timestampValue?: string
  mapValue?: FirestoreDocument
  arrayValue?: { values: FirestoreValue[] }
}

export interface FirestoreDocument {
  name?: string
  fields: { [key: string]: FirestoreValue }
  createTime?: string
  updateTime?: string
}

export interface FirestoreListResponse {
  documents?: FirestoreDocument[]
}

export function toFirestoreValue(value: any): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null }
  }
  
  if (typeof value === 'string') {
    return { stringValue: value }
  }
  
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() }
    }
    return { doubleValue: value }
  }
  
  if (typeof value === 'boolean') {
    return { booleanValue: value }
  }
  
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() }
  }
  
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(item => toFirestoreValue(item))
      }
    }
  }
  
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.entries(value).reduce((acc, [key, val]) => {
          acc[key] = toFirestoreValue(val)
          return acc
        }, {} as { [key: string]: FirestoreValue })
      }
    }
  }
  
  return { stringValue: String(value) }
}

export function fromFirestoreValue(firestoreValue: FirestoreValue): any {
  if (firestoreValue.nullValue !== undefined) {
    return null
  }
  
  if (firestoreValue.stringValue !== undefined) {
    return firestoreValue.stringValue
  }
  
  if (firestoreValue.integerValue !== undefined) {
    return parseInt(firestoreValue.integerValue, 10)
  }
  
  if (firestoreValue.doubleValue !== undefined) {
    return firestoreValue.doubleValue
  }
  
  if (firestoreValue.booleanValue !== undefined) {
    return firestoreValue.booleanValue
  }
  
  if (firestoreValue.timestampValue !== undefined) {
    return new Date(firestoreValue.timestampValue)
  }
  
  if (firestoreValue.arrayValue) {
    return firestoreValue.arrayValue.values.map(fromFirestoreValue)
  }
  
  if (firestoreValue.mapValue) {
    return fromFirestoreDocument(firestoreValue.mapValue)
  }
  
  return null
}

export function fromFirestoreDocument(doc: FirestoreDocument): any {
  const result: any = {}
  
  if (doc.name) {
    const parts = doc.name.split('/')
    if (parts.length > 0) {
      result._firestore_id = parts[parts.length - 1] 
    }
  }
  
  Object.entries(doc.fields || {}).forEach(([key, value]) => {
    result[key] = fromFirestoreValue(value)
  })
  
  if (doc.createTime) {
    result._createTime = doc.createTime
  }
  if (doc.updateTime) {
    result._updateTime = doc.updateTime
  }
  
  return result
}

export function toFirestoreDocument(data: any): { fields: { [key: string]: FirestoreValue } } {
  const fields: { [key: string]: FirestoreValue } = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('_')) {
      return
    }
    
    fields[key] = toFirestoreValue(value)
  })
  
  return { fields }
}

export function fromFirestoreList(response: FirestoreListResponse): any[] {
  if (!response.documents || !Array.isArray(response.documents)) {
    return []
  }
  
  return response.documents.map(fromFirestoreDocument)
}