import { Product } from "src/modules/product/entities/product.entity";

export interface DocumentItemsDto {
    products: DocumentItemDto[];
    totalTax: number;
    totalPriceAfterTax: number;
    totalAfterDiscount: number;
    totalPrecent: number;
    documentType: string;
    comment : string | null;
    base64Pdf: string | null;
    files: DocumentItemFileDto[];
    
}

export interface DocumentItemFileDto {
    name: string;
    base64: string;
}

export interface DocumentItemDto {
    sku: string;
    title: string;
    quantity: number;
    priceByOne: number;
    total: number;
    discount: number;
    comment : string | null;
    product: Product | null;
}