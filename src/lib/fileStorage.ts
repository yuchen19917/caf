/**
 * 文件存储管理
 * New uploads are stored by the CAF API; IndexedDB remains readable for older records.
 */

const DB_NAME = 'CAF_FILE_STORAGE';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded
  uploadDate: string;
  cafId?: string;
  category: string;
}

class FileStorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('cafId', 'cafId', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('uploadDate', 'uploadDate', { unique: false });
        }
      };
    });
  }

  async saveFile(file: File, category: string, cafId?: string): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const uploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadDate: new Date().toISOString(),
          cafId,
          category,
        };

        try {
          const response = await fetch('/api/files', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uploadedFile),
          });
          if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'Unable to store attachment.');
          resolve(await response.json() as UploadedFile);
        } catch (error) { reject(error); }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFile(id: string): Promise<UploadedFile | null> {
    if (/^FILE-[a-f0-9-]{36}$/i.test(id)) {
      const response = await fetch(`/api/files/${encodeURIComponent(id)}`);
      if (response.ok) return response.json() as Promise<UploadedFile>;
      if (response.status !== 404) throw new Error('Unable to load attachment.');
    }
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByCAF(cafId: string): Promise<UploadedFile[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('cafId');
      const request = index.getAll(cafId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFiles(): Promise<UploadedFile[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (/^FILE-[a-f0-9-]{36}$/i.test(id)) {
      const response = await fetch(`/api/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to remove attachment.');
      return;
    }
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  downloadFile(file: UploadedFile): void {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

export const fileStorage = new FileStorageManager();
