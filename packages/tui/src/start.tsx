import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app";

const queryClient = new QueryClient();

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

export async function startTui() {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  createRoot(renderer).render(<Root />);
}
