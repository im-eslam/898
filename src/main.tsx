import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/cairo";
import "./index.css";
import { api } from "@/shared/api";
import App from "./App.tsx";

void api("GET /api/health").catch(() => {});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
