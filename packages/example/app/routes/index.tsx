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
