export interface DocumentDto {
  id?: string;
  documentNumber?: string;
  documentType: string;
  userName?: string;
  userExId?: string;
  agentExId?: string;
  agentName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDateAt?: Date;
  total?: number;
  user?: any; 
  error?: string | null;
}

export interface DocumentsDto {
  documents: DocumentDto[];
  total: number;
  pageCount: number;
  page: number;
  size: number;
}


