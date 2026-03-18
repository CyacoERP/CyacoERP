import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { QuoteProvider } from "./context/QuoteContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <RouterProvider router={router} />
      </QuoteProvider>
    </AuthProvider>
  );
}
