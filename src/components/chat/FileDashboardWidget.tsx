import { useState, useEffect } from 'react';
import { FileText, Upload, Eye, Trash2, Download, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  bucket: string;
  uploadedAt: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  maxStorage: number;
  maxFiles: number;
  usagePercentage: number;
}

interface FileDashboardWidgetProps {
  onFileSelect?: (file: UserFile) => void;
  onAnalyzeFile?: (file: UserFile) => void;
}

export default function FileDashboardWidget({ onFileSelect, onAnalyzeFile }: FileDashboardWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserFiles();
    }
  }, [user?.id]);

  const loadUserFiles = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserFiles(user.id);
      setFiles(response.files || []);
      setStats(response.stats || null);
    } catch (err) {
      console.error('Error loading user files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const handleAnalyzeFile = async (file: UserFile) => {
    if (onAnalyzeFile) {
      onAnalyzeFile(file);
    } else {
      // Default behavior: send analysis request to chat
      const agentMessage = `[Agent Request: report] Please analyze this file: ${file.path}. The file "${file.name}" has been uploaded and is ready for analysis.`;
      // This would need to be handled by the parent component
      toast({
        title: "Analysis Started",
        description: `Analyzing ${file.name}...`,
      });
    }
  };

  const handleDownloadFile = async (file: UserFile) => {
    // In dev mode with mock files, show a message instead of trying to download
    if (import.meta.env.DEV && user?.id === 'dev-user' && file.id.startsWith('mock-')) {
      toast({
        title: "Mock File",
        description: `This is a mock file for development. Real file: ${file.name}`,
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from(file.bucket)
        .download(file.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${file.name}...`,
      });
    } catch (err) {
      console.error('Error downloading file:', err);
      toast({
        title: "Download Failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={loadUserFiles} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Files
          {stats && (
            <Badge variant="outline" className="ml-auto">
              {stats.totalFiles}/{stats.maxFiles} files
            </Badge>
          )}
        </CardTitle>
        {stats && (
          <div className="text-sm text-gray-600">
            {formatFileSize(stats.totalSize)} of {formatFileSize(stats.maxStorage)} used
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No files uploaded yet</p>
            <p className="text-sm">Upload credit reports or documents to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusBadge(file.analysisStatus)}`}>
                    {getStatusIcon(file.analysisStatus)}
                    <span className="ml-1 capitalize">{file.analysisStatus}</span>
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyzeFile(file)}
                      className="h-8 w-8 p-0"
                      title="Analyze this file"
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(file)}
                      className="h-8 w-8 p-0"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {files.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => {/* TODO: Show all files */}}>
                  View all {files.length} files
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}