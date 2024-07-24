import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import ModalProvider from "./contexts/ModalProvider.tsx";
import ThemeProvider from "./contexts/ThemeProvider.tsx";

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start({ onUnhandledRequest: "bypass" });
  }
}

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            <App />
          </ModalProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
});
