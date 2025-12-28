import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import App from "./App";
import "./index.css";
import { AudioProvider } from "./contexts/audioContext";
import AudioControl from "./components/AudioControl";
import { LanguageProvider } from "./contexts/LanguageContext";
// 导入并运行迁移脚本
import { migrateOldSaves } from './data/migrationScript.js'

// 在应用启动时运行迁移脚本
migrateOldSaves()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AudioProvider>
          <App />
          <AudioControl />
          <Toaster />
        </AudioProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);
