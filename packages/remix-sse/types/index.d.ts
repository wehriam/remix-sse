export declare function useSse<T>(name: string, url: string, options?: EventSourceInit): T | undefined;
export declare class SseResponse extends Response {
    private writer;
    signal: AbortSignal;
    constructor(request: Request, options?: ResponseInit);
    send(name: string, data: unknown): Promise<void>;
}
