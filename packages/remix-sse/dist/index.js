"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseResponse = exports.useSse = void 0;
const react_1 = require("react");
function useSse(name, url, options = { withCredentials: false }) {
    const [data, setData] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        let previousDataString = undefined;
        function handleMessageEvent(messageEvent) {
            const { data: dataString } = messageEvent;
            if (dataString === previousDataString) {
                return;
            }
            setData(JSON.parse(dataString));
            previousDataString = dataString;
        }
        const eventSource = new EventSource(url, options);
        eventSource.addEventListener(name, handleMessageEvent);
        return () => {
            eventSource.removeEventListener(name, handleMessageEvent);
            eventSource.close();
        };
    }, [name, url, options.withCredentials]); // eslint-disable-line react-hooks/exhaustive-deps
    return data;
}
exports.useSse = useSse;
class SseResponse extends Response {
    writer;
    signal;
    constructor(request, options) {
        const signal = request.signal;
        const textencoder = new TextEncoder();
        const { readable, writable } = new TransformStream({
            start(controller) {
                const handleAbort = () => {
                    signal.removeEventListener("abort", handleAbort);
                    controller.terminate();
                };
                if (signal.aborted) {
                    handleAbort();
                }
                else {
                    signal.addEventListener("abort", handleAbort);
                }
            },
            transform(chunk, controller) {
                controller.enqueue(textencoder.encode(chunk));
            },
        });
        const mergedHeaders = Object.assign({}, options ? options.headers : {}, {
            "Content-Type": "text/event-stream",
        });
        const mergedOptions = Object.assign({}, options, {
            headers: mergedHeaders,
        });
        super(readable, mergedOptions);
        this.signal = signal;
        this.writer = writable.getWriter();
    }
    async send(name, data) {
        await this.writer.ready;
        return this.writer.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
    }
}
exports.SseResponse = SseResponse;
//# sourceMappingURL=index.js.map