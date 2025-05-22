import { DocumentItemDto } from "src/erp/dto/documentItems.dto";
import { DocumentDto } from "src/erp/dto/documents.dto";

export class CreateOfflineDto {
    history: DocumentDto
    historyDetailed: DocumentItemDto
}
