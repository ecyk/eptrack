import "./index.css";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import toast from "react-hot-toast";

import App from "./App.tsx";
import { StorageServiceProvider } from "./contexts/StorageServiceContext.tsx";
import { ModalProvider } from "./contexts/ModalContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <StorageServiceProvider>
          <QueryClientProvider client={queryClient}>
            <ModalProvider>
              <App />
            </ModalProvider>
          </QueryClientProvider>
        </StorageServiceProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
