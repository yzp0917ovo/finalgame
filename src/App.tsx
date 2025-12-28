import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import Home from "@/pages/Home";
import CharacterSelect from "@/pages/CharacterSelect";
import CharacterDetail from "@/pages/CharacterDetail";
import StoryFlow from "@/pages/StoryFlow";
import EndingCalculation from "@/pages/EndingCalculation";
import GameIntro from "@/pages/GameIntro";
import GameSettings from "@/pages/GameSettings";
import Achievements from "@/pages/Achievements";
import StoryRecapPage from "@/pages/StoryRecapPage";
import { GameProvider } from "@/contexts/gameContext";
import { cultivationLevels, cultivationExperienceRequirements } from "@/data/characters";
export { cultivationExperienceRequirements };

// 获取境界描述
export const getLevelDescription = (index: number): string => {
  const descriptions = [
    "普通人类，未踏入修仙之路",
    "感应天地灵气，开始修炼",
    "稳固根基，寿命延长",
    "凝结丹道，实力大增",
    "金丹大成，寿元可达千年",
    "修炼出元神，可御空飞行",
    "炼虚化神，掌握空间法则",
    "身心合一，拥有移山填海之力",
    "历经雷劫，准备飞升",
    "大乘圆满，可突破界面限制"
  ];
  return descriptions[index] || "未知境界";
};

// 页面切换动画组件
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full"
      >
          <Routes location={location} key={location.key}>
            <Route path="/" element={<Home />} />
            <Route path="/runtime" element={<Home />} />
            <Route path="/character-select" element={<CharacterSelect />} />
            <Route path="/runtime/character-select" element={<CharacterSelect />} />
            <Route path="/character-detail/:characterId" element={<CharacterDetail />} />
            <Route path="/runtime/character-detail/:characterId" element={<CharacterDetail />} />
            <Route path="/story-flow" element={<StoryFlow />} />
            <Route path="/runtime/story-flow" element={<StoryFlow />} />
            <Route path="/ending-calculation" element={<EndingCalculation />} />
            <Route path="/runtime/ending-calculation" element={<EndingCalculation />} />
            <Route path="/game-intro" element={<GameIntro />} />
            <Route path="/runtime/game-intro" element={<GameIntro />} />
            <Route path="/game-settings" element={<GameSettings />} />
            <Route path="/runtime/game-settings" element={<GameSettings />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/runtime/achievements" element={<Achievements />} />
            <Route path="/story-recap" element={<StoryRecapPage />} />
            <Route path="/runtime/story-recap" element={<StoryRecapPage />} />
          </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AnimatedRoutes />
    </GameProvider>
  );
}
