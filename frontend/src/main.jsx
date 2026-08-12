import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// HashRouter (URLs com "/#/") em vez de BrowserRouter: o GitHub Pages nao
// suporta rewrite de rotas no servidor, entao rotas como /#/pricing
// continuam funcionando em qualquer refresh de pagina sem configuracao extra.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Remove o splash estatico (definido em index.html) assim que o React
// termina de pintar a primeira tela. O duplo requestAnimationFrame garante
// que o commit do React ja foi ao ar antes de comecar o fade-out.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById("app-splash");
    if (!splash) return;
    splash.style.opacity = "0";
    splash.style.pointerEvents = "none";
    setTimeout(() => splash.remove(), 400);
  });
});
