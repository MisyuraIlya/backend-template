import { AttributeMain } from "src/modules/attribute-main/entities/attribute-main.entity";
import { Product } from "../entities/product.entity";

export class SubAttributeFilterDto {
  constructor(
    public id: number,
    public title: string,
    public productCount: number,
    public isPublished: boolean,
    public orden: number,
  ) {}
}



export interface CatalogResponse {
  data: Product[];
  size: number;
  total: number;
  page: number;
  pageCount: number;
  filters: AttributeMain[];
}