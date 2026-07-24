import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// HashRouter (URLs com "/#/") em vez de BrowserRouter: o GitHub Pages nao
// suporta rewrite de rotas no servidor, entao rotas como /#/pricing
// continuam funcionando em qualquer refresh de pagina sem configuracao extra.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
