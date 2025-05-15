export interface DocumentItemsDto {
    products: DocumentItemDto[];
    totalTax?: number | null;
    totalPriceAfterTax?: number | null;
    totalAfterDiscount?: number | null;
    totalPrecent?: number | null;
    documentType?: string | null;
    comment? : string | null;
    base64Pdf?: string | null;
    files: DocumentItemFileDto[];
    
}

export interface DocumentItemFileDto {
    name?: string;
    base64?: string;
}

export interface DocumentItemDto {
    sku?: string;
    title?: string;
    quantity?: number;
    priceByOne?: number;
    total?: number;
    discount?: number;
    comment? : string | null;
    product?: any[];
}