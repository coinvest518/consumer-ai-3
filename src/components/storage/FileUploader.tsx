import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { trackFileUpload } from '@/lib/storageUtils';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  bucket?: string;
  folder?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  onUploadComplete?: (files: { path: string; name: string; size: number; type: string }[]) => void;
  onError?: (error: string) => void;
}

export function FileUploader({
  bucket = 'documents',
  folder = 'uploads',
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  onUploadComplete,
  onError
}: FileUploaderProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check file types
    const invalidTypeFiles = selectedFiles.filter(file => 
      !acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.endsWith(type);
        } else if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        } else {
          return file.type === type;
        }
      })
    );
    
    if (invalidTypeFiles.length > 0) {
      setUploadError(`Invalid file type(s): ${invalidTypeFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    // Check file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setUploadError(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setFiles(selectedFiles);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        // Create a unique file path
        const timestamp = new Date().getTime();
        const filePath = `${folder}/${user.id}/${timestamp}_${file.name}`;
        
        // Check storage quota before uploading
        const canUpload = await trackFileUpload(
          user.id,
          filePath,
          file.name,
          file.size,
          file.type,
          bucket
        );
        
        if (!canUpload) {
          throw new Error('Storage quota exceeded. Please upgrade your plan.');
        }
        
        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);
        
        if (error) throw error;
        
        uploadedFiles.push({
          path: filePath,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
      setUploadSuccess(true);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      setUploadError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) {
    return <div className="p-4 text-center">Please log in to upload files</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Upload Files</h3>
        <p className="text-sm text-gray-500">
          Accepted formats: {acceptedTypes.join(', ')}
        </p>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          uploadError ? 'border-red-300 bg-red-50' : 
          uploadSuccess ? 'border-green-300 bg-green-50' : 
          'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={uploading}
        />
        
        {files.length === 0 ? (
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Click to select files</p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFiles(files.filter((_, i) => i !== index));
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={uploading}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
            
            <div className="flex justify-between mt-4">
              <button
                onClick={clearFiles}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={uploading}
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-start">
          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Files uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}