import { Product } from "src/modules/product/entities/product.entity";
import { User } from "src/modules/user/entities/user.entity";

export interface OrderRequest {
  cart: CartItem[];
  total: number;
  comment: string;
  user: User;
  documentType: string;
  deliveryPrice: number;
  agent: User;
  discountUser: number;
  isSendToErp: boolean;
  deliveryDate: string;
  address: string;
  city: string;
}

export interface CartItem {
  sku: string;
  quantity: number;
  product: Product;
  stock: number;
  price: number;
  discount: number;
  comment: string;
  total: number;
  isBonus: boolean;
  choosedPackQuantity: number;
}

