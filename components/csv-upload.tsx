'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCheck, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { CsvPreviewData, CsvRow } from '@/types';

interface CsvUploadProps {
  onUpload: (rows: CsvRow[], file: File | null, preview: CsvPreviewData) => void;
  maxRows?: number;
}

const REQUIRED_COLUMNS = ['customerId', 'name', 'phone', 'email', 'age', 'city', 'country', 'occupation'];

export function CsvUpload({ onUpload, maxRows = 100 }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  type RawRow = Record<string, unknown>;

  const processFile = useCallback(
    async (uploadedFile: File) => {
      setIsProcessing(true);
      setError('');

      try {
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<RawRow>(worksheet);

            if (jsonData.length === 0) {
              setError('The CSV file is empty. Please upload a file with data.');
              setIsProcessing(false);
              return;
            }

            if (jsonData.length > maxRows) {
              setError(
                `The CSV file contains ${jsonData.length} rows, but the maximum allowed is ${maxRows}.`
              );
              setIsProcessing(false);
              return;
            }

            // Get column names (preserve original casing)
            const firstRow = jsonData[0] as RawRow;
            const columns = Object.keys(firstRow);
            const columnsLowerMap = new Map(columns.map(col => [col.toLowerCase().trim(), col]));

            // Check for required columns (case-insensitive)
            const missingColumns = REQUIRED_COLUMNS.filter(
              (reqCol) => !Array.from(columnsLowerMap.keys()).includes(reqCol.toLowerCase())
            );

            // Normalize data - map to standardized column names (preserve values, standardize keys)
            const normalizedData = jsonData.map((row: RawRow) => {
              const normalizedRow: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(row)) {
                const lowerKey = key.toLowerCase().trim();
                // Find the matching required column name
                const standardKey = REQUIRED_COLUMNS.find(reqCol => reqCol.toLowerCase() === lowerKey) || key;
                normalizedRow[standardKey] = value;
              }
              return normalizedRow as CsvRow;
            });

            // Generate preview data (use standardized column names)
            const standardizedColumns = columns.map(col => {
              const lowerKey = col.toLowerCase().trim();
              return REQUIRED_COLUMNS.find(reqCol => reqCol.toLowerCase() === lowerKey) || col;
            });

            const preview: CsvPreviewData = {
              columns: standardizedColumns,
              sampleRows: normalizedData.slice(0, 3),
              totalRows: normalizedData.length,
              missingColumns,
              hasAllRequired: missingColumns.length === 0,
            };

            // Set file even if missing columns (to show preview)
            setFile(uploadedFile);
            onUpload(normalizedData, uploadedFile, preview);
            setIsProcessing(false);
          } catch (err) {
            console.error('Error parsing file:', err);
            setError('Failed to parse the file. Please ensure it is a valid CSV or Excel file.');
            setIsProcessing(false);
          }
        };

        reader.onerror = () => {
          setError('Failed to read the file. Please try again.');
          setIsProcessing(false);
        };

        reader.readAsBinaryString(uploadedFile);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsProcessing(false);
      }
    },
    [maxRows, onUpload]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        processFile(uploadedFile);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleRemove = () => {
    setFile(null);
    setError('');
    const emptyPreview: CsvPreviewData = {
      columns: [],
      sampleRows: [],
      totalRows: 0,
      missingColumns: [],
      hasAllRequired: false,
    };
    onUpload([], null, emptyPreview);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
            </div>
            {isProcessing ? (
              <div>
                <p className="text-lg font-semibold mb-1">Processing file...</p>
                <p className="text-sm text-gray-700">
                  Please wait while we parse your data
                </p>
              </div>
            ) : isDragActive ? (
              <div>
                <p className="text-lg font-semibold mb-1">Drop your file here</p>
                <p className="text-sm text-gray-700">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold mb-1">
                  Drag & drop your CSV file here
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  or click to browse
                </p>
                <p className="text-xs text-gray-700">
                  Supports CSV, XLS, XLSX (max {maxRows} rows)
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{file.name}</p>
                <p className="text-sm text-green-700">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Upload Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
