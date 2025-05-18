import { CartItem } from "src/modules/history/dto/create-order.dto";
import { User } from "src/modules/user/entities/user.entity";

export class CartCheckDto {
    user: User
    cart: CartItem[]
}
