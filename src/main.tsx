import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// O arquivo App.css foi removido, então a importação também é removida.

createRoot(document.getElementById("root")!).render(<App />);