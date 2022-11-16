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
