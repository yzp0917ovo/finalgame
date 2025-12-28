import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { AudioContext } from '@/contexts/audioContext';

interface GameSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameSettingsPanel({ isOpen, onClose }: GameSettingsPanelProps) {
  const { gameState, toggleConditionDisplay, toggleAttributeChangesDisplay, toggleExperienceChangesDisplay, toggleHideHighRiskOptions, toggleAttributeBonusValuesDisplay, toggleGameMode } = useContext(GameContext);
  const { volume, setVolume, isPlaying, togglePlay } = useContext(AudioContext);
  
  // 点击外部关闭面板
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <motion.div 
            className="bg-gradient-to-b from-indigo-900/95 via-blue-900/95 to-indigo-900/95 rounded-2xl p-4 border border-indigo-500/30 shadow-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-indigo-600/50">
              <h2 className="text-xl font-bold">游戏设置</h2>
              <button 
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-full transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-3">
              {/* 显示条件设置 */}
              <div className="bg-indigo-900/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold">显示判定条件</h3>
                    <p className="text-blue-200 text-xs">开启后，所有选项的属性要求可见</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleConditionDisplay}
                    className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                      gameState.showCondition ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                  </motion.button>
                </div>
              </div>
              
              {/* 隐藏高危选项 */}
              <div className="bg-indigo-900/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold">隐藏高危选项</h3>
                    <p className="text-blue-200 text-xs">开启后，不满足条件的选项将不会显示</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleHideHighRiskOptions}
                    className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                      gameState.hideHighRiskOptions ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                  </motion.button>
                </div>
              </div>
              
              {/* 显示属性变化设置 */}
              <div className="bg-indigo-900/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold">选项属性变化</h3>
                    <p className="text-blue-200 text-xs">显示每个选项会带来的属性变化</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAttributeChangesDisplay}
                    className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                      gameState.showAttributeChanges ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                  </motion.button>
                </div>
              </div>
              
               {/* 显示经验值变化设置 */}
               <div className="bg-indigo-900/30 rounded-lg p-3">
                 <div className="flex justify-between items-center">
                   <div>
                     <h3 className="text-base font-bold">经验值变化显示</h3>
                     <p className="text-blue-200 text-xs">显示每个选项会带来的经验值变化</p>
                   </div>
                   <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={toggleExperienceChangesDisplay}
                     className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                       gameState.showExperienceChanges ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                     }`}
                   >
                     <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                   </motion.button>
                 </div>
               </div>
               
               {/* 属性加成数值显示开关 */}
                 <div className="bg-indigo-900/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">显示属性加成数值</h3>
                      <p className="text-blue-200 text-xs">显示生命值、经验值、悟性、体质、家境等属性带来的具体加成</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleAttributeBonusValuesDisplay}
                      className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                        gameState.showAttributeBonusValues ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                    </motion.button>
                  </div>
                </div>
               
                {/* 动态属性变化显示开关 */}
                <div className="bg-indigo-900/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">动态属性变化显示</h3>
                      <p className="text-blue-200 text-xs">启用后，属性变化时有动态提示效果</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        localStorage.setItem('showAttributeChangeAnimation', String(!JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true')));
                        window.dispatchEvent(new Event('attributeAnimationSettingChanged'));
                      }}
                      className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                        JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true') ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-all duration-300`}></div>
                    </motion.button>
                  </div>
              </div>
              
              {/* 音量调节 */}
              <div className="bg-indigo-900/30 rounded-lg p-3 mt-2">
                <h3 className="text-base font-bold mb-2">音量调节</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors duration-300"
                    title={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
                  >
                    {isPlaying ? (
                      <i className="fa-solid fa-pause text-white text-xs"></i>
                    ) : (
                      <i className="fa-solid fa-play text-white text-xs"></i>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-grow h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-sm font-semibold min-w-7 text-center">{volume}%</span>
                </div>
              </div>
              
              {/* 确认按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 mt-1"
              >
                确认
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}