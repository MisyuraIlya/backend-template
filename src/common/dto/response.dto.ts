export class ResponseDto<T> {
    data: T;
    status: boolean;
    message: string | null;
}