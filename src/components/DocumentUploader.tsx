import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { fileStorage, type UploadedFile } from '../lib/fileStorage';

interface DocumentUploaderProps {
  documentName: string;
  category: string;
  onUpload: (file: UploadedFile) => void;
  onRemove: () => void;
  uploadedFile?: UploadedFile;
}

export function DocumentUploader({ 
  documentName, 
  category, 
  onUpload, 
  onRemove,
  uploadedFile 
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadedFile = await fileStorage.saveFile(file, category);
      onUpload(uploadedFile);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (uploadedFile) {
      fileStorage.deleteFile(uploadedFile.id).catch(console.error);
    }
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!uploadedFile ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={cn(
            "w-full p-4 border-2 border-dashed rounded-xl transition-all text-left",
            uploading ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              uploading ? "bg-indigo-100" : "bg-slate-100"
            )}>
              {uploading ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={18} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700">{documentName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {uploading ? 'Uploading...' : 'Click to mark as attached'}
              </p>
            </div>
          </div>
        </button>
      ) : (
        <div className="p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-900">{documentName}</p>
              <p className="text-xs text-emerald-600 mt-0.5 truncate">
                {uploadedFile.name} ({fileStorage.getFileSize(uploadedFile.size)})
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle size={14} className="text-rose-600 shrink-0" />
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );
}
