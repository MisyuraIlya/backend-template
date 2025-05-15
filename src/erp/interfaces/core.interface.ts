export interface CoreInterface {
    GetRequest(query?: string): Promise<any>;
    PostRequest(object: any, table: string): Promise<any>;
    PatchRequest(object: any, table: string): Promise<any>;
}