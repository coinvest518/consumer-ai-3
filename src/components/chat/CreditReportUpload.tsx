import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { trackFileUpload, checkStorageQuota } from '@/lib/storageUtils';
import { api } from '@/lib/api-client';

interface CreditReportUploadProps {
  onAnalysisComplete: (results: CreditReportAnalysis) => void;
  onUploadStart: () => void;
  onUploadComplete: () => void;
}

export interface CreditReportAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  analysis: {
    errors: CreditReportError[];
    summary: string;
    recommendations: string[];
    score?: number;
  };
}

export interface CreditReportError {
  type: 'accuracy' | 'identity' | 'legal' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  section?: string;
  recommendation?: string;
}

export function CreditReportUpload({ onAnalysisComplete, onUploadStart, onUploadComplete }: CreditReportUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload a PDF or image file (JPG, PNG)';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    // Check storage quota first
    const quota = await checkStorageQuota(user.id);
    if (quota.isExceeded) {
      throw new Error('Storage quota exceeded. Please upgrade your plan.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `credit-reports/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Track the upload in database
    const success = await trackFileUpload(
      user.id,
      filePath,
      file.name,
      file.size,
      file.type,
      'user-files'
    );

    if (!success) {
      // Clean up uploaded file if tracking failed
      await supabase.storage.from('user-files').remove([filePath]);
      throw new Error('Failed to track file upload');
    }

    return filePath;
  };

  const analyzeCreditReport = async (filePath: string): Promise<CreditReportAnalysis> => {
    if (!user?.id) throw new Error('User not authenticated');

    // Call the backend API for analysis
    const response = await api.sendMessage(
      `Please analyze this credit report file: ${filePath}`,
      `credit-analysis-${Date.now()}`,
      user.id
    );

    // For now, return mock analysis - this should be replaced with actual backend response
    return {
      id: `analysis-${Date.now()}`,
      fileName: selectedFile!.name,
      fileSize: selectedFile!.size,
      uploadDate: new Date().toISOString(),
      analysis: {
        errors: [
          {
            type: 'accuracy',
            description: 'Late payment reported incorrectly',
            severity: 'medium',
            section: 'Payment History',
            recommendation: 'Contact the credit bureau to dispute this error'
          }
        ],
        summary: 'Your credit report shows good overall health with some minor inaccuracies that should be addressed.',
        recommendations: [
          'Dispute any inaccurate information with the credit bureaus',
          'Monitor your credit report regularly',
          'Consider credit counseling if needed'
        ],
        score: 720
      }
    };
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;

    try {
      setIsUploading(true);
      setError(null);
      onUploadStart();

      // Upload file
      setUploadProgress(25);
      const filePath = await uploadFile(selectedFile);
      setUploadProgress(50);

      // Start analysis
      setIsAnalyzing(true);
      setUploadProgress(75);
      const analysis = await analyzeCreditReport(filePath);
      setUploadProgress(100);

      // Complete
      onAnalysisComplete(analysis);
      setSelectedFile(null);
      setUploadProgress(0);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      onUploadComplete();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <Image className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Upload Credit Report
          </div>
          <p className="text-gray-500 mb-4">
            Drag and drop your credit report PDF or image, or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports PDF, JPG, PNG • Max 10MB
          </p>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isUploading || isAnalyzing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          {(isUploading || isAnalyzing) && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isUploading ? 'Uploading...' : 'Analyzing credit report...'}
                </span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!isUploading && !isAnalyzing && (
            <Button
              onClick={handleUpload}
              className="w-full mt-4"
              disabled={!selectedFile}
            >
              Analyze Credit Report
            </Button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}