import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { toast } from 'sonner';
import { AudioContext } from '../contexts/audioContext';

export default function Home() {
  const navigate = useNavigate();
  const { loadFromSaveCode, gameState } = useContext(GameContext);
  const { playTrack, isPlaying, togglePlay } = useContext(AudioContext); // 获取音频上下文
  const [showLoadGame, setShowLoadGame] = useState(false);
  const [saveCode, setSaveCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 检查是否有保存的游戏状态
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // 检查是否有保存的游戏
  useState(() => {
    try {
      const savedState = localStorage.getItem('xiuxian_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // 检查是否有角色数据和当前节点
        if (parsedState.currentCharacter && parsedState.currentNode) {
          // 排除结局节点，因为结局节点应该显示结局页面而不是继续游戏
          if (parsedState.currentNode !== 'ending_calculation_display') {
            setHasSavedGame(true);
          }
        }
      }
    } catch (error) {
      console.error('检查保存游戏时出错:', error);
    }
  }, []);

  // 导航到各个页面
  const handleStartGame = () => {
    // 为了让新用户能体验完整剧情，清除可能的旧存档
    localStorage.removeItem('xiuxian_game_state');
    navigate('/character-select');
  };

  // 继续游戏
  const handleContinueGame = () => {
    try {
      const savedState = localStorage.getItem('xiuxian_game_state');
      if (savedState) {
        navigate('/story-flow');
      }
    } catch (error) {
      console.error('继续游戏时出错:', error);
      toast.error('继续游戏失败，请尝试加载存档');
    }
  };

  // 播放/暂停背景音乐
  const toggleBGM = () => {
    try {
      if (togglePlay) {
        togglePlay();
      } else if (!isPlaying && playTrack) {
        playTrack('peacefulTheme'); // 确保回到主菜单时播放开头音乐
      }
    } catch (error) {
      console.error('控制背景音乐时出错:', error);
      toast.error('无法控制背景音乐，请稍后再试');
    }
  };

  const handleGameIntro = () => {
    navigate('/game-intro');
  };

  const handleGameSettings = () => {
    navigate('/game-settings');
  };

  const handleAchievements = () => {
    navigate('/achievements');
  };
  
  // 剧情回顾
  const handleStoryRecap = () => {
    navigate('/story-recap');
  };
  // 退出游戏
  const handleExit = () => {
    // 在web应用中，退出可以理解为返回上一页或者刷新页面
    if (window.confirm('确定要退出游戏吗？')) {
      // 使用更安全的方式处理
      try {
        // 检查是否有历史记录可返回
        if (window.history.length > 1) {
          window.history.back();
        } else {
           // 如果没有历史记录，刷新页面
            window.location.href = '/';
          }
        } catch (error) {
          // 发生错误时刷新页面作为后备方案
          window.location.href = '/';
        }
    }
  };

  // 显示加载游戏弹窗
  const handleShowLoadGame = () => {
    setShowLoadGame(true);
  };

  // 关闭加载游戏弹窗
  const handleCloseLoadGame = () => {
    setShowLoadGame(false);
    setSaveCode('');
  };

  // 加载存档
  const handleLoadGame = () => {
    if (!saveCode.trim()) {
      toast.error('请输入存档码');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟加载延迟
    setTimeout(() => {
      const success = loadFromSaveCode(saveCode);
      setIsLoading(false);
      
      if (success) {
        toast.success('存档加载成功！');
        setShowLoadGame(false);
        navigate('/story-flow');
      } else {
        toast.error('存档加载失败，请检查存档码是否正确');
      }
    }, 800);
  };

  // 按钮动画变体
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0 8px 25px rgba(147, 197, 253, 0.5)',
      transition: { duration: 0.2 }
    }
  };

  // 标题动画变体
  const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.2 }
    }
  };

  // 背景动画变体
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.5 }
    }
  };

  // 弹窗动画变体
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-2 sm:p-4 relative overflow-hidden">
        {/* 背景装饰 */}
        <motion.div 
          className="absolute inset-0 z-0 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={backgroundVariants}
        >
          {/* 背景图片 */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=chinese%20traditional%20immortal%20mountain%20background%2C%20clouds%20and%20mist%2C%20stars%20twinkling%2C%20mystical%20atmosphere&sign=bdc7da2654ca26df96c1ef7a43c1ae46')] bg-cover bg-center opacity-20"></div>
          
          {/* 动态光晕效果 */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-700/20 blur-[150px]"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px]"
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          ></motion.div>
          
          {/* 装饰性的星星效果 */}
          {Array.from({ length: 80 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 2
              }}
            ></motion.div>
          ))}
        </motion.div>

         {/* 主要内容 */}
        <div className="relative z-10 w-full max-w-md px-4">
          {/* 游戏标题 */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={titleVariants}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.5)]">
              修仙传奇
            </h1>
              <p className="text-xl text-blue-200 italic">
                 踏上属于你的修仙之路，体验因果循环的奇妙旅程
              </p>

          </motion.div>

          {/* 游戏选项 */}
          <div className="grid grid-cols-1 gap-4">
             {/* 继续游戏按钮 - 只在有保存游戏时显示 */}
            {hasSavedGame && (
              <motion.button
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={handleContinueGame}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-redo"></i>
                继续游戏
              </motion.button>
            )}
            
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play"></i>
              {hasSavedGame ? '新的游戏' : '开始游戏'}
            </motion.button>
            
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              whileHover="hover"
              onClick={handleShowLoadGame}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              读取存档
            </motion.button>
            
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              whileHover="hover"
              onClick={handleGameIntro}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-book-open"></i>
              游戏介绍
            </motion.button>
            
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              whileHover="hover"
              onClick={handleGameSettings}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-gear"></i>
              游戏设置
            </motion.button>
             
  <motion.button
  variants={buttonVariants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 0.3 }}
  whileHover="hover"
  onClick={handleStoryRecap}
  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
>
  <i className="fa-solid fa-history"></i>
  剧情回顾
</motion.button>

   <motion.button
    variants={buttonVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 0.4 }}
    whileHover="hover"
    onClick={handleAchievements}
    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
   >
    <i className="fa-solid fa-trophy"></i>
    成就画廊
   </motion.button>
            
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              whileHover="hover"
              onClick={handleExit}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xl py-4 px-6 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
              退出
            </motion.button>
          </div>

          {/* 页脚信息 */}
          <motion.div 
            className="mt-12 text-center text-blue-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <p>© 2025 修仙传奇 - 文字剧情冒险游戏</p>
          </motion.div>
        </div>

        {/* 加载游戏弹窗 */}
        <AnimatePresence>
          {showLoadGame && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              onClick={handleCloseLoadGame}
            >
              <motion.div 
                className="bg-gradient-to-b from-indigo-900 to-blue-900 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
              >
                <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                  读取存档
                </h2>
                
                <div className="mb-4">
                  <label htmlFor="saveCode" className="block text-sm font-medium text-blue-200 mb-2">
                    请输入存档码
                  </label>
                  <input
                    id="saveCode"
                    type="text"
                    value={saveCode}
                    onChange={(e) => setSaveCode(e.target.value)}
                    placeholder="输入存档编码..."
                    className="w-full p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-indigo-900/50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-200 mb-1">如何获取存档码？</h4>
                  <p className="text-sm text-blue-300">
                    在游戏过程中，点击顶部的"保存"按钮，系统会生成存档码，请妥善保管该编码。
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseLoadGame}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleLoadGame}
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        加载中...
                      </div>
                    ) : (
                      '读取存档'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 星星闪烁动画 */}
        <style jsx>{`
          @keyframes twinkle {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
      {/* 版本号显示 */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-blue-300 text-xs opacity-50 z-10">
        版本: 1.0.0
      </div>
    </div>
  );
}