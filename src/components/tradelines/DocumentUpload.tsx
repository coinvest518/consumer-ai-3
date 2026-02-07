import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileCheck, AlertCircle, Trash2, Eye } from 'lucide-react';

export interface UploadedDocument {
  id: string;
  type: 'au_drivers_license' | 'au_ssn_card' | 'billing_drivers_license';
  file: File;
  preview?: string;
  uploadedAt: Date;
}

interface RequiredDocument {
  type: 'au_drivers_license' | 'au_ssn_card' | 'billing_drivers_license';
  label: string;
  description: string;
}

interface DocumentUploadProps {
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  documents: UploadedDocument[];
  requiredDocuments: RequiredDocument[];
  isDisabled?: boolean;
}

export default function DocumentUpload({
  onDocumentsChange,
  documents,
  requiredDocuments,
  isDisabled
}: DocumentUploadProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'au_drivers_license' | 'au_ssn_card' | 'billing_drivers_license'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const newErrors = { ...errors };
    delete newErrors[docType];

    if (!ALLOWED_TYPES.includes(file.type)) {
      newErrors[docType] = 'Only JPG, PNG, or PDF files are allowed';
      setErrors(newErrors);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      newErrors[docType] = 'File size must be less than 5MB';
      setErrors(newErrors);
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        preview = event.target?.result as string;
        addDocument(file, docType, preview);
      };
      reader.readAsDataURL(file);
    } else {
      addDocument(file, docType);
    }
  };

  const addDocument = (
    file: File,
    docType: 'au_drivers_license' | 'au_ssn_card' | 'billing_drivers_license',
    preview?: string
  ) => {
    const newDoc: UploadedDocument = {
      id: `${docType}-${Date.now()}`,
      type: docType,
      file,
      preview,
      uploadedAt: new Date()
    };

    // Remove existing document of same type
    const filtered = documents.filter((doc) => doc.type !== docType);
    const updated = [...filtered, newDoc];
    onDocumentsChange(updated);
  };

  const removeDocument = (id: string) => {
    const updated = documents.filter((doc) => doc.id !== id);
    onDocumentsChange(updated);
  };

  const getDocumentLabel = (type: string): string => {
    return requiredDocuments.find((doc) => doc.type === type)?.label || type;
  };

  const uploadedTypes = new Set(documents.map((doc) => doc.type));
  const missingRequired = requiredDocuments.filter(
    (doc) => doc.type !== 'billing_drivers_license' && !uploadedTypes.has(doc.type)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload documents for verification. Payment method is Electronic Check (no credit cards).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {missingRequired.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Missing {missingRequired.length} required document(s)
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {requiredDocuments.map((reqDoc) => {
              const uploadedDoc = documents.find(
                (doc) => doc.type === reqDoc.type
              );
              const isRequired =
                reqDoc.type !== 'billing_drivers_license';

              return (
                <div
                  key={reqDoc.type}
                  className={`border rounded-lg p-4 ${
                    uploadedDoc ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{reqDoc.label}</h3>
                        {isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {uploadedDoc && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-800 border-green-300"
                          >
                            <FileCheck className="w-3 h-3 mr-1" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {reqDoc.description}
                      </p>

                      {uploadedDoc ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            {uploadedDoc.file.name}
                          </p>
                          <div className="flex gap-2">
                            {uploadedDoc.preview && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPreviewDoc(uploadedDoc)
                                }
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeDocument(uploadedDoc.id)
                              }
                              disabled={isDisabled}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600 font-medium">
                            Click to upload
                          </span>
                          <input
                            type="file"
                            hidden
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) =>
                              handleFileSelect(e, reqDoc.type)
                            }
                            disabled={isDisabled}
                          />
                        </label>
                      )}

                      {errors[reqDoc.type] && (
                        <p className="text-sm text-red-600 mt-2">
                          {errors[reqDoc.type]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-blue-900">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Images must be clear and readable</li>
              <li>• All documents must be current and valid</li>
              <li>• Maximum file size: 5MB per document</li>
              <li>• Accepted formats: JPG, PNG, PDF</li>
              <li>• We do not sell tradelines in Georgia</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewDoc(null)}
        >
          <Card className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Document Preview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewDoc(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              {previewDoc.preview ? (
                <img
                  src={previewDoc.preview}
                  alt="Document preview"
                  className="w-full h-auto"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  PDF preview not available. Please download the file to view.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
