//import { NextUIProvider } from "@nextui-org/react"
//import React from "react"
//import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
//import ReactDOM from "react-dom/client"

//import "react-toastify/dist/ReactToastify.css"
//import "react-tooltip/dist/react-tooltip.css"

import App from "./App"
import "./main.css"
import "./main.scss"

/*const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  </React.StrictMode>,
)*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "./main.css"
import "./main.scss"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:category" element={<App />} />
        <Route path="/:category/:searchQuery" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

