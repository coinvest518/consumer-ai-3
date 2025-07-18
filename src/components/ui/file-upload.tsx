import { useState, useRef } from "react";
import { UploadCloud, X, FileText, File, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  onUpload: (files: File[]) => void;
  showPreview?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FileUploadZone({
  acceptedFileTypes = ["application/pdf", "image/*"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  showPreview = true,
  className,
  children
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxFileSize) {
      setError(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
      return false;
    }

    // Check file type
    const fileType = file.type;
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes("*")) {
        return fileType.startsWith(type.split("*")[0]);
      }
      return type === fileType;
    });

    if (!isValidType) {
      setError(`Invalid file type. Accepted types: ${acceptedFileTypes.join(", ")}`);
      return false;
    }

    return true;
  };

  const processFiles = (fileList: FileList) => {
    setError(null);
    const validFiles: File[] = [];

    Array.from(fileList).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onUpload(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label="Upload file"
      >
        {children || (
          <div className="text-center">
            <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Drag and drop files here</p>
            <p className="text-sm text-gray-500 mt-2">Or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">
              {acceptedFileTypes.join(", ")} · Max {maxFileSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInputChange}
          multiple
        />
      </div>

      {error && (
        <div className="text-sm text-red-500 mt-2">
          {error}
        </div>
      )}

      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded files</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}