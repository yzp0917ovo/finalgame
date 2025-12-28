import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { LanguageContext } from '@/contexts/LanguageContext';
import { AudioContext } from '@/contexts/audioContext';

export default function GameSettings() {
  const { gameState, toggleConditionDisplay, toggleHideHighRiskOptions, toggleExperienceChangesDisplay, toggleAttributeChangesDisplay, loadFromSaveCode, toggleAttributeBonusValuesDisplay, toggleGameMode } = useContext(GameContext);
  const { currentLanguage, setLanguage, t } = useContext(LanguageContext);
  const { volume, setVolume, isPlaying, setIsPlaying } = useContext(AudioContext);
  const [saveCodeInput, setSaveCodeInput] = useState('');
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const navigate = useNavigate();

  // 从localStorage加载设置
  useEffect(() => {
    const savedBrightness = localStorage.getItem('xiuxian_brightness');
    if (savedBrightness) setBrightness(parseInt(savedBrightness));
  }, []);

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('xiuxian_brightness', brightness.toString());
    document.documentElement.style.filter = `brightness(${brightness / 100})`;
  }, [brightness, currentLanguage]);

  // 返回主页
  const handleBack = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  // 加载存档
  const handleLoadSave = () => {
    if (!saveCodeInput.trim()) {
      alert('请输入存档码');
      return;
    }
    
    setIsLoadingSave(true);
    setTimeout(() => {
      const success = loadFromSaveCode(saveCodeInput);
      if (success) {
        alert('存档加载成功');
        navigate('/story-flow');
      } else {
        alert('存档加载失败，请检查存档码是否正确');
      }
      setIsLoadingSave(false);
    }, 500);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const toggleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-3 relative overflow-hidden">
      {/* 背景装饰 */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 背景图片 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20study%20with%20scrolls%20and%20magical%20symbols%2C%20mystical%20atmosphere&sign=3f537030df3f2ddb3a1be6858ebf42c6')] bg-cover bg-center opacity-15"></div>
        
        {/* 动态光晕效果 */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[80px]"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
      </motion.div>

      {/* 返回按钮 */}
      <motion.button 
        onClick={handleBack} 
        className="absolute top-3 left-3 bg-blue-800 hover:bg-blue-700 p-1.5 rounded-full shadow-lg transition-all duration-300 z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fa-solid fa-arrow-left text-sm"></i>
      </motion.button>

      <motion.div 
        className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto pt-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 标题 */}
        <motion.div 
          className="text-center mb-6"
          variants={itemVariants}
        >
  <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
    {t('game.settings')}
  </h1>
        </motion.div>

        {/* 游戏选项 */}
        <div className="w-full space-y-4">
           {/* 显示判定条件 */}
           <motion.div 
             className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
             variants={itemVariants}
           >
             <div className="flex justify-between items-center">
               <div>
  <h2 className="text-lg font-bold mb-1">{t('settings.show.conditions')}</h2>
  <p className="text-blue-200 text-xs">开启后，所有选项的属性要求可见</p>
               </div>
               <motion.button
                 variants={toggleVariants}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleConditionDisplay}
                 className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                   gameState.showCondition ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                 }`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
               </motion.button>
             </div>
           </motion.div>
           
           {/* 隐藏高危选项 */}
           <motion.div 
             className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
             variants={itemVariants}
           >
             <div className="flex justify-between items-center">
               <div>
  <h2 className="text-lg font-bold mb-1">{t('settings.hide.risky')}</h2>
  <p className="text-blue-200 text-xs">开启后，不满足条件的选项将不会显示</p>
               </div>
               <motion.button
                 variants={toggleVariants}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleHideHighRiskOptions}
                 className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                   gameState.hideHighRiskOptions ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                 }`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
               </motion.button>
             </div>
           </motion.div>
           
              {/* 显示属性变化 */}
              <motion.div 
                className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center">
                  <div>
       <h2 className="text-lg font-bold mb-1">选项属性变化</h2>
       <p className="text-blue-200 text-xs">显示每个选项会带来的属性变化</p>
                  </div>
                  <motion.button
                    variants={toggleVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAttributeChangesDisplay}
                    className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                      gameState.showAttributeChanges ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
                  </motion.button>
                </div>
              </motion.div>

               {/* 显示经验值变化 */}
               <motion.div 
                 className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
                 variants={itemVariants}
               >
                 <div className="flex justify-between items-center">
                   <div>
        <h2 className="text-lg font-bold mb-1">经验值变化显示</h2>
        <p className="text-blue-200 text-xs">显示每个选项会带来的经验值变化</p>
                   </div>
                   <motion.button
                     variants={toggleVariants}
                     whileTap={{ scale: 0.95 }}
                     onClick={toggleExperienceChangesDisplay}
                     className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                       gameState.showExperienceChanges ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                     }`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
                   </motion.button>
              </div>
            </motion.div>
            
            {/* 属性加成数值显示开关 */}
            <motion.div 
              className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center">
                <div>
         <h2 className="text-lg font-bold mb-1">显示属性加成数值</h2>
         <p className="text-blue-200 text-xs">显示悟性、体质、家境等属性带来的具体加成</p>
                </div>
                <motion.button
                  variants={toggleVariants}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAttributeBonusValuesDisplay}
                  className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                    gameState.showAttributeBonusValues ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
                </motion.button>
              </div>
            </motion.div>
            
                {/* 动态属性变化显示开关 */}
                <motion.div 
                  className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-center">
                    <div>
         <h2 className="text-lg font-bold mb-1">动态属性变化显示</h2>
         <p className="text-blue-200 text-xs">启用后，属性变化时有动态提示效果</p>
                    </div>
                    <motion.button
                      variants={toggleVariants}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        localStorage.setItem('showAttributeChangeAnimation', String(!JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true')));
                        window.dispatchEvent(new Event('attributeAnimationSettingChanged'));
                      }}
                      className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                        JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true') ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
                    </motion.button>
                  </div>
                </motion.div>
                
                {/* 游戏模式切换 */}
                <motion.div 
                  className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-center">
                    <div>
         <h2 className="text-lg font-bold mb-1">速通模式</h2>
         <p className="text-blue-200 text-xs">开启后，文本将简化，游戏进程加快</p>
                    </div>
                    <motion.button
                      variants={toggleVariants}
                      whileTap={{ scale: 0.95 }}
                       onClick={toggleGameMode}
                       className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 ${
                         gameState.gameMode && gameState.gameMode.isQuickMode ? 'bg-green-500 justify-end' : 'bg-gray-700 justify-start'
                       }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300`}></div>
                    </motion.button>
                  </div>
                </motion.div>
              
           {/* 音量调节 */}
           <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
            variants={itemVariants}
          >
  <h2 className="text-lg font-bold mb-2">{t('settings.volume')}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
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
          </motion.div>

          {/* 亮度调节 */}
          <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
            variants={itemVariants}
          >
  <h2 className="text-lg font-bold mb-2">{t('settings.brightness')}</h2>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-moon text-blue-300"></i>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="flex-grow h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <i className="fa-solid fa-sun text-blue-300"></i>
              <span className="text-sm font-semibold min-w-7 text-center">{brightness}%</span>
            </div>
          </motion.div>

           {/* 语言选择 */}
          <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
            variants={itemVariants}
          >
  <h2 className="text-lg font-bold mb-2">{t('settings.language')}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${currentLanguage === 'zh' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('zh_tw')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  currentLanguage === 'zh_tw' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                }`}
              >
                繁體中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  currentLanguage === 'en' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                }`}
              >
                English
              </button>
            </div>
          </motion.div>

           {/* 存档加载 */}
           <motion.div 
             className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4 border border-indigo-800/30 shadow-lg"
             variants={itemVariants}
           >
  <h2 className="text-lg font-bold mb-3 flex items-center">
    {t('settings.load.save')}
               <i className="fa-solid fa-floppy-disk mr-2 text-blue-300 text-sm"></i>
               读档功能
             </h2>
             <div className="space-y-3">
               <div>
                 <label htmlFor="saveCode" className="block text-xs font-medium text-blue-200 mb-1">
                   请输入存档码
                 </label>
                 <input
                   id="saveCode"
                   type="text"
                   value={saveCodeInput}
                   onChange={(e) => setSaveCodeInput(e.target.value)}
                   placeholder="输入存档编码..."
                   className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                 />
               </div>
               <button
                 onClick={handleLoadSave}
                 disabled={isLoadingSave}
                 className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 ${
                   isLoadingSave ? 'opacity-70 cursor-not-allowed' : ''
                 }`}
               >
                 {isLoadingSave ? (
                   <div className="flex items-center justify-center gap-2">
                     <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                     加载中...
                   </div>
                 ) : (
                   '读取存档'
                 )}
               </button>
               <div className="bg-blue-900/30 rounded-lg p-3">
                 <h4 className="font-medium text-blue-200 mb-1 text-sm">如何获取存档码？</h4>
                 <p className="text-xs text-blue-300">
                   在游戏过程中，点击顶部的"保存"按钮，系统会生成存档码，请妥善保管该编码，用于下次读取游戏进度。
                 </p>
               </div>
             </div>
           </motion.div>

          {/* 重置游戏 */}
          <motion.button
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            }}
             onClick={() => {
                if (window.confirm('确定要重置游戏吗？这将清除所有游戏数据。')) {
                  localStorage.clear();
                  try {
                    navigate('/');
                  } catch (error) {
                    window.location.reload();
                  }
                }
              }}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-base py-2.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-red-500/30 transition-all duration-300"
          >
  {t('settings.reset.game')}
          </motion.button>
        </div>
      </motion.div>
      
      {/* 页脚信息 */}
      <div className="mt-4 text-center text-blue-200 text-xs pb-4">
        <p>修仙传奇 - 踏上属于你的修仙之路</p>
      </div>
    </div>
  );
}