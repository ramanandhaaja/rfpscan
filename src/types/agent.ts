export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  output: string;
  questions: Array<{
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  // Category of upload in UI (rfp vs reference)
  type: 'rfp' | 'reference';
  uploaded: string;
  // Best-effort raw textual content (if available from client)
  content?: unknown;
  // MIME type of the file (e.g., application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  mime?: string;
  // Base64-encoded file bytes for server-side parsing if needed (e.g., DOCX/PDF)
  contentBase64?: string;
}

export type Company = 'orange' | 'kpn' | 'tmobile' | 'vodafone' | 'other' | 'eclatec';

// Collection of uploaded files grouped by category
export type UploadedFiles = {
  rfp: UploadedFile[];
  reference: UploadedFile[];
};
