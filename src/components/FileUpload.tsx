import React, { useRef } from 'react';
import { UploadedFile } from '@/types/agent';

interface FileUploadProps {
  selectedUploadType: 'rfp' | 'reference';
  uploadedFiles: {
    rfp: UploadedFile[];
    reference: UploadedFile[];
  };
  onUploadTypeChange: (type: 'rfp' | 'reference') => void;
  onFilesUpload: (files: UploadedFile[], type: 'rfp' | 'reference') => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

export default function FileUpload({
  selectedUploadType,
  uploadedFiles,
  onUploadTypeChange,
  onFilesUpload,
  onStartAnalysis,
  isAnalyzing
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // Helpers to read file content
  const readFileAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result ?? '');
        // res like: data:<mime>;base64,<data>
        const idx = res.indexOf(',');
        resolve(idx >= 0 ? res.slice(idx + 1) : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const buildUploadedFile = async (file: File, category: 'rfp' | 'reference'): Promise<UploadedFile> => {
    const mime = file.type;
    const isTextLike = mime.startsWith('text/') || mime === 'application/json' || /\.(txt|md|csv|json)$/i.test(file.name);
    const uploadedAt = new Date().toISOString();
    const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;

    if (isTextLike) {
      const text = await readFileAsText(file);
      return {
        id,
        name: file.name,
        size: file.size,
        type: category,
        uploaded: uploadedAt,
        content: text,
        mime,
      };
    }

    const base64 = await readFileAsBase64(file);
    return {
      id,
      name: file.name,
      size: file.size,
      type: category,
      uploaded: uploadedAt,
      content: undefined,
      mime,
      contentBase64: base64,
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = [];
    for (const f of files) {
      try {
        newFiles.push(await buildUploadedFile(f, selectedUploadType));
      } catch (err) {
        console.error('Failed to read file', f.name, err);
      }
    }

    if (newFiles.length) onFilesUpload(newFiles, selectedUploadType);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles: UploadedFile[] = [];
      for (const f of files) {
        try {
          newFiles.push(await buildUploadedFile(f, selectedUploadType));
        } catch (err) {
          console.error('Failed to read file', f.name, err);
        }
      }
      if (newFiles.length) onFilesUpload(newFiles, selectedUploadType);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
        
        {/* Upload Type Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => onUploadTypeChange('rfp')}
            className={`px-4 py-2 font-medium ${
              selectedUploadType === 'rfp'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            RFP Documents
          </button>
          <button
            onClick={() => onUploadTypeChange('reference')}
            className={`px-4 py-2 font-medium ${
              selectedUploadType === 'reference'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reference Materials
          </button>
        </div>

        {/* Upload Area */}
        <div
          ref={uploadAreaRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="text-4xl mb-2">📄</div>
          <p className="font-medium text-gray-700 mb-1">
            {selectedUploadType === 'rfp' 
              ? 'Upload RFP documents' 
              : 'Upload reference materials'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag & drop files here or click to browse
          </p>
          <p className="text-xs text-gray-400">
            {selectedUploadType === 'rfp' 
              ? 'PDF, DOCX, PPTX, XLSX (max 10MB)'
              : 'PDF, DOCX, XLSX, TXT (max 10MB)'}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept={selectedUploadType === 'rfp' 
              ? '.pdf,.docx,.pptx,.xlsx'
              : '.pdf,.docx,.xlsx,.txt'}
          />
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles[selectedUploadType].length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {selectedUploadType === 'rfp' ? 'RFP Documents' : 'Reference Materials'} ({uploadedFiles[selectedUploadType].length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedFiles[selectedUploadType].map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">📄</span>
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Analysis Button */}
        {uploadedFiles.rfp.length > 0 && (
          <button
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className={`mt-6 w-full py-3 px-4 rounded-xl font-medium text-white ${
              isAnalyzing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
        )}
      </div>
    </div>
  );
}
