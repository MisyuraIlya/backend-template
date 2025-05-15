export class UpdateUserDto {
    id: number;
    extId?: string;
    email?: string;
    password?: string;
    phone?: string;
    name?: string;
    isAllowOrder?: boolean;
    isAllowAllClients?: boolean;
    isBlocked?: boolean;
    isRegistered?: boolean;
    role?: string;
}