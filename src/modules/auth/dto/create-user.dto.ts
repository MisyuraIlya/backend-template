export class CreateUserDto {
    email: string;
    password: string;
    phone: string;
    fullName: string;
    hp?: string;
    company?: string;
    town?: string;
    address?: string;
}