export interface DocumentDto {
  id?: string;
  documentNumber?: string;
  documentType: string;
  userName?: string;
  userExId?: string;
  agentExId?: string;
  agentName?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  dueDateAt?: Date;
  total?: number;
  user?: any; 
  error?: string | null;
}

export interface DocumentsDto {
  documents: DocumentDto[];
  totalRecords?: number | null;
  totalPages?: number | null;
  currentPage?: number | null;
  pageSize?: number | null;
}