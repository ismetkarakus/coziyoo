// Mock Firestore Adapter

interface MockDoc {
  id: string;
  [key: string]: any;
}

const mockDbData: { [collection: string]: { [id: string]: MockDoc } } = {
  users: {},
  foods: {},
  orders: {},
  chats: {},
  reviews: {},
  messages: {}
};

export const collection = (db: any, path: string) => {
  return { type: 'collection', path };
};

export const doc = (arg1: any, arg2?: string, arg3?: string) => {
  // Case 1: doc(collectionRef) -> auto-id
  if (arg1 && arg1.type === 'collection' && !arg2) {
      return { type: 'doc', path: arg1.path, id: `mock_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  }
  // Case 2: doc(collectionRef, id)
  if (arg1 && arg1.type === 'collection' && arg2) {
      return { type: 'doc', path: arg1.path, id: arg2 };
  }
  // Case 3: doc(db, path) -> path includes id
  if (arg2 && arg2.includes('/')) {
      const parts = arg2.split('/');
      return { type: 'doc', path: parts[0], id: parts[1] };
  }
  // Case 4: doc(db, collectionPath, id)
  if (arg2 && arg3) {
      return { type: 'doc', path: arg2, id: arg3 };
  }
  
  // Fallback
  return { type: 'doc', path: arg2 || 'unknown', id: arg3 || 'unknown' };
};

export const addDoc = async (collectionRef: any, data: any) => {
  const id = `mock_id_${Date.now()}`;
  const docRef = { type: 'doc', path: collectionRef.path, id };
  
  if (!mockDbData[collectionRef.path]) {
    mockDbData[collectionRef.path] = {};
  }
  mockDbData[collectionRef.path][id] = { id, ...data };
  
  console.log(`[MockDB] Added doc to ${collectionRef.path}: ${id}`);
  return docRef;
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  if (!mockDbData[docRef.path]) {
    mockDbData[docRef.path] = {};
  }
  
  const existing = mockDbData[docRef.path][docRef.id] || {};
  if (options?.merge) {
    mockDbData[docRef.path][docRef.id] = { ...existing, ...data, id: docRef.id };
  } else {
    mockDbData[docRef.path][docRef.id] = { ...data, id: docRef.id };
  }
  
  console.log(`[MockDB] Set doc ${docRef.path}/${docRef.id}`);
  return Promise.resolve();
};

export const getDoc = async (docRef: any) => {
  const data = mockDbData[docRef.path]?.[docRef.id];
  console.log(`[MockDB] Get doc ${docRef.path}/${docRef.id} -> ${!!data}`);
  return {
    exists: () => !!data,
    data: () => data || undefined,
    id: docRef.id
  };
};

export const updateDoc = async (docRef: any, data: any) => {
  if (!mockDbData[docRef.path]?.[docRef.id]) {
      console.warn(`[MockDB] Update failed: doc ${docRef.path}/${docRef.id} not found`);
    // In real firestore this throws, but we'll just log
    return Promise.resolve();
  }
  
  mockDbData[docRef.path][docRef.id] = { ...mockDbData[docRef.path][docRef.id], ...data };
  console.log(`[MockDB] Updated doc ${docRef.path}/${docRef.id}`);
  return Promise.resolve();
};

export const deleteDoc = async (docRef: any) => {
  if (mockDbData[docRef.path]) {
    delete mockDbData[docRef.path][docRef.id];
  }
  console.log(`[MockDB] Deleted doc ${docRef.path}/${docRef.id}`);
  return Promise.resolve();
};

export const getDocs = async (queryRef: any) => {
  // naive implementation: return all in collection
  // if queryRef has constraints, we should filter (not implemented for now)
  const collectionPath = queryRef.path;
  const docs = Object.values(mockDbData[collectionPath] || {});
  
  console.log(`[MockDB] Get docs from ${collectionPath}: ${docs.length} found`);
  
  return {
    docs: docs.map(d => ({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { type: 'doc', path: collectionPath, id: d.id }
    })),
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: any) => {
        docs.forEach(d => callback({
            id: d.id,
            data: () => d,
            exists: () => true,
            ref: { type: 'doc', path: collectionPath, id: d.id }
        }));
    }
  };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  return {
    ...collectionRef,
    constraints // just pass them along, we might use them later if we get fancy
  };
};

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, direction?: string) => ({ type: 'orderBy', field, direction });
export const limit = (n: number) => ({ type: 'limit', n });
export const startAfter = (doc: any) => ({ type: 'startAfter', doc });
export const startAt = (val: any) => ({ type: 'startAt', val });
export const endAt = (val: any) => ({ type: 'endAt', val });

export const onSnapshot = (queryRef: any, callback: any) => {
  // Immediately call with current state
  getDocs(queryRef).then(snapshot => {
      callback(snapshot);
  });
  
  // Return dummy unsubscribe
  return () => {};
};

export const Timestamp = {
  now: () => {
      const d = new Date();
      return { 
          toDate: () => d,
          seconds: Math.floor(d.getTime() / 1000),
          nanoseconds: (d.getTime() % 1000) * 1000000
      };
  },
  fromDate: (date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000
  })
};

export const serverTimestamp = () => new Date();
export const increment = (n: number) => n; // This is a simplification, assumes caller handles it or it's just a value
export const enableNetwork = async () => {};
export const disableNetwork = async () => {};
export const getFirestore = () => ({});
export const runTransaction = async (db: any, updateFunction: (transaction: any) => Promise<any>) => {
  const transaction = {
      get: (docRef: any) => getDoc(docRef),
      update: (docRef: any, data: any) => updateDoc(docRef, data),
      set: (docRef: any, data: any) => setDoc(docRef, data),
      delete: (docRef: any) => deleteDoc(docRef)
  };
  return updateFunction(transaction);
};
