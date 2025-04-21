import { useState, useEffect } from "react";

const eventSourceMap = new Map<string, [EventSource, number]>();

export function useSse<T>(
  name: string,
  url: string,
  options: EventSourceInit = { withCredentials: false }
) {
  const [data, setData] = useState<T>();
  const eventSourceKey = `${name}:${url}:${options.withCredentials ? "true" : "false"}`;
  useEffect(() => {
    let previousDataString: string | void = undefined;
    function handleMessageEvent(messageEvent: MessageEvent) {
      const { data: dataString } = messageEvent;
      if (dataString === previousDataString) {
        return;
      }
      setData(JSON.parse(dataString));
      previousDataString = dataString;
    }
    const eventSourceMapValue = eventSourceMap.get(eventSourceKey) || [new EventSource(url, options), 0];
    eventSourceMapValue[1] = eventSourceMapValue[1] + 1;
    eventSourceMap.set(eventSourceKey, eventSourceMapValue);
    eventSourceMapValue[0].addEventListener(name, handleMessageEvent);
    return () => {
      eventSourceMapValue[0].removeEventListener(name, handleMessageEvent);
      eventSourceMapValue[1] = eventSourceMapValue[1] - 1;
      if (eventSourceMapValue[1] <= 0) {
        eventSourceMapValue[0].close();
        eventSourceMap.delete(eventSourceKey);
      }
    };
  }, [eventSourceKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return data;
}

export class SseResponse extends Response {
  private writer: WritableStreamDefaultWriter;

  signal: AbortSignal;

  constructor(request: Request, options?: ResponseInit) {

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
        } else {
          signal.addEventListener("abort", handleAbort);
        }
      },
      transform(chunk, controller) {
        controller.enqueue(textencoder.encode(chunk));
      }
    });

    const mergedHeaders = Object.assign({}, options ? options.headers : {}, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no"
    });

    const mergedOptions = Object.assign({}, options, {
      headers: mergedHeaders,
    });

    super(readable, mergedOptions);

    this.signal = signal;
    this.writer = writable.getWriter();
    
  }

  async send(name: string, data: unknown) {
    await this.writer.ready;
    return this.writer.write(
      `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`
    );
  }
}
