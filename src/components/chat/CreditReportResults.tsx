import React from 'react';
import { AlertTriangle, CheckCircle, Info, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditReportAnalysis, CreditReportError } from './CreditReportUpload';

interface CreditReportResultsProps {
  analysis: CreditReportAnalysis;
}

export function CreditReportResults({ analysis }: CreditReportResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Credit Report Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">File Name</p>
              <p className="font-medium">{analysis.fileName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">File Size</p>
              <p className="font-medium">{formatFileSize(analysis.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Analysis Date</p>
              <p className="font-medium">{formatDate(analysis.uploadDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Score */}
      {analysis.analysis.score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Credit Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {analysis.analysis.score}
              </div>
              <p className="text-gray-600">
                {analysis.analysis.score >= 740 ? 'Excellent' :
                 analysis.analysis.score >= 670 ? 'Good' :
                 analysis.analysis.score >= 580 ? 'Fair' : 'Poor'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{analysis.analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Errors Found */}
      {analysis.analysis.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Issues Found ({analysis.analysis.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.errors.map((error, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(error.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(error.severity)}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{error.type}</Badge>
                        {error.section && (
                          <Badge variant="outline">{error.section}</Badge>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-2">
                        {error.description}
                      </p>
                      {error.recommendation && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Recommendation:</strong> {error.recommendation}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-700">
              Based on this analysis, here are the recommended next steps:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Review each issue carefully and gather supporting documentation</li>
              <li>Contact the credit bureaus to dispute any errors found</li>
              <li>Keep records of all correspondence and dispute submissions</li>
              <li>Monitor your credit report regularly for future changes</li>
              <li>Consider consulting a credit counseling service if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}