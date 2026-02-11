// Mock Storage Adapter

export const getStorage = () => ({});

export const ref = (storage: any, path: string) => {
  return { path };
};

export const uploadBytes = async (ref: any, blob: any) => {
  console.log(`[MockStorage] Uploaded bytes to ${ref.path}`);
  return {
    ref,
    metadata: {
      fullPath: ref.path,
    }
  };
};

export const uploadBytesResumable = (ref: any, blob: any) => {
  console.log(`[MockStorage] Uploaded bytes resumable to ${ref.path}`);
  // Return a dummy task object
  const task: any = Promise.resolve({
    ref,
    metadata: { fullPath: ref.path }
  });
  
  task.on = (event: any, progress: any, error: any, complete: any) => {
      if (complete) complete();
      else if (progress) progress({ bytesTransferred: 100, totalBytes: 100 });
  };
  
  return task;
};

export const getDownloadURL = async (ref: any) => {
  console.log(`[MockStorage] Get download URL for ${ref.path}`);
  // Return a placeholder image
  return `https://placehold.co/300x300?text=${encodeURIComponent(ref.path)}`;
};

export const deleteObject = async (ref: any) => {
  console.log(`[MockStorage] Deleted object ${ref.path}`);
  return Promise.resolve();
};

export const getMetadata = async (ref: any) => {
    return {
        contentType: 'image/jpeg',
        size: 1024,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
};
