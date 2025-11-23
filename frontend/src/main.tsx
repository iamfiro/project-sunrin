import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { AuthProvider, MusicProvider } from "@/shared/providers";

import "@/shared/styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MusicProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MusicProvider>
  </React.StrictMode>,
);
