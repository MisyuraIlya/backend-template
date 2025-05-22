import { User } from "src/modules/user/entities/user.entity";

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
  deliveryAt?: Date;
  total?: number;
  user?: User; 
  error?: string | null;
  tax?: number;
  orderComment?: string
}

export interface DocumentsDto {
  documents: DocumentDto[];
  total: number;
  pageCount: number;
  page: number;
  size: number;
}


