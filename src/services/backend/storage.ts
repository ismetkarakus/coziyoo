// Mock Storage Adapter
import { apiClient } from '@/src/api/apiClient';

const isRemoteApiMode = (): boolean => {
  const mode = String(process.env.EXPO_PUBLIC_API_MODE || '').trim().toLowerCase();
  if (mode === 'remote') return true;
  return Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);
};

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
  if (isRemoteApiMode()) {
    try {
      const response = await apiClient.post<{ publicUrl?: string }>('/media/register', {
        objectKey: ref.path,
        prefix: ref.path?.split('/')?.[0] || 'media',
      });
      if ((response.status === 200 || response.status === 201) && response.data?.publicUrl) {
        return response.data.publicUrl;
      }
    } catch (error) {
      console.error('Remote media register failed, fallback to mock URL:', error);
    }
  }

  console.log(`[MockStorage] Get download URL for ${ref.path}`);
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
