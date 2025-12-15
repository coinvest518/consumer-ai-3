import { useState, useEffect } from 'react';
import socket from '@/lib/socket';

export interface UploadProgressData {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  userId: string;
}

export interface AnalysisData {
  message: string;
  fileName: string;
  userId: string;
  analysis?: any;
}

// Hook for upload progress tracking via Socket.IO
export function useUploadProgress() {
  const [uploadStatus, setUploadStatus] = useState<{
    registered?: UploadProgressData;
    analysisStarted?: AnalysisData;
    analysisComplete?: AnalysisData;
    analysisError?: { error: string; userId: string };
  }>({});

  useEffect(() => {
    const handleUploadRegistered = (data: UploadProgressData) => {
      console.log('[useUploadProgress] File registered:', data);
      setUploadStatus(prev => ({ ...prev, registered: data }));
    };

    const handleAnalysisStarted = (data: AnalysisData) => {
      console.log('[useUploadProgress] Analysis started:', data);
      setUploadStatus(prev => ({ ...prev, analysisStarted: data }));
    };

    const handleAnalysisComplete = (data: AnalysisData) => {
      console.log('[useUploadProgress] Analysis complete:', data);
      setUploadStatus(prev => ({ ...prev, analysisComplete: data }));
    };

    const handleAnalysisError = (data: { error: string; userId: string }) => {
      console.error('[useUploadProgress] Analysis error:', data);
      setUploadStatus(prev => ({ ...prev, analysisError: data }));
    };

    socket.on('upload-registered', handleUploadRegistered);
    socket.on('analysis-started', handleAnalysisStarted);
    socket.on('analysis-complete', handleAnalysisComplete);
    socket.on('analysis-error', handleAnalysisError);

    return () => {
      socket.off('upload-registered', handleUploadRegistered);
      socket.off('analysis-started', handleAnalysisStarted);
      socket.off('analysis-complete', handleAnalysisComplete);
      socket.off('analysis-error', handleAnalysisError);
    };
  }, []);

  const clearStatus = () => {
    setUploadStatus({});
  };

  return {
    uploadStatus,
    clearStatus
  };
}