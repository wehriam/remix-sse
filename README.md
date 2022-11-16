# RemixJS SSE Response and hook

In `/apps/routes/counter.ts`:

```typescript
import { SseResponse } from "@wehriam/remix-sse";

export let loader = ({ request }) => {
  const response = new SseResponse(request);

  let count = 0;

  const interval = setInterval(() => {
    response.send("counter", { count });
    count += 1;
  }, 1000);

  function handleAbort() {
    clearInterval(interval);
  }

  response.signal.addEventListener("abort", handleAbort);

  return response;
};

```

In `/apps/routes/index.tsx`:

```typescript
import { useSse } from "@wehriam/remix-sse";

export default function Index() {
  const data = useSse<{ count: number }>("counter", "/counter");
  return (
    <div>
      <h1>SSE Counter Example</h1>
      <h2>Count: {data ? data.count : "Unknown"}</h2>
    </div>
  );
}
```