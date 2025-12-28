import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DungeonPuzzleGameProps {
  onComplete: (success: boolean, time: number) => void;
}

export default function DungeonPuzzleGame({ onComplete }: DungeonPuzzleGameProps) {
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [timer, setTimer] = useState(120); // 2分钟时间限制
  const [isProcessing, setIsProcessing] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  
  // 存储当前URL，用于强制刷新
  const currentUrl = window.location.href;
  
  // 迷题结构：3x3网格，需要激活正确的顺序
  const correctSequence = [0, 4, 8, 2, 6]; // 外圈顺时针激活中间十字
  const totalTiles = 9;
  
  // 游戏计时器 - 增强版，确保超时后能正确进入下一个节点
  useEffect(() => {
     if (gameOver || puzzleCompleted) return;
     
     timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setIsProcessing(true);
          
          // 使用多重保险机制确保游戏能继续
          const handleGameOver = () => {
            try {
              console.log('符文谜题超时，调用onComplete(false)');
              // 直接调用onComplete
              onComplete(false, timer);
              
              // 额外保障：即使onComplete调用成功，也添加一个强制刷新的后备方案
              setTimeout(() => {
                console.log('符文谜题超时，触发强制刷新后备方案');
                // 添加随机参数强制刷新到特定节点
                window.location.href = `${window.location.pathname}?node=chapter3_2_dungeon_failure&refresh=true&t=${Date.now()}`;
              }, 1000);
            } catch (error) {
              console.error('符文谜题超时完成时出错:', error);
              // 如果出错，立即使用强制刷新作为最后的备选方案
              window.location.href = `${window.location.pathname}?node=chapter3_2_dungeon_failure&refresh=true&t=${Date.now()}`;
            }
          };
          
          // 立即尝试完成游戏
          setTimeout(handleGameOver, 500);
          return 0;
        }
        return prev - 1;
      });
     }, 1000);
     
     return () => {
       if (timerIntervalRef.current) {
         clearInterval(timerIntervalRef.current);
         timerIntervalRef.current = null;
       }
     };
   }, [gameOver, puzzleCompleted, timer, onComplete]);
   
   // 处理砖块点击 - 增强版，确保完成后能正确进入下一个节点
  const handleTileClick = (index: number) => {
    if (gameOver || puzzleCompleted || isProcessing) return;
    
    const newSelectedTiles = [...selectedTiles, index];
    
    // 检查是否符合正确序列
    const isCorrectSoFar = newSelectedTiles.every((tile, i) => tile === correctSequence[i]);
    const isComplete = newSelectedTiles.length === correctSequence.length && isCorrectSoFar;
    
    if (!isCorrectSoFar) {
      // 序列错误，重置选择
      setSelectedTiles([]);
      // 可以添加错误反馈
      return;
    }
    
    setSelectedTiles(newSelectedTiles);
    
    if (isComplete) {
      setPuzzleCompleted(true);
      setIsProcessing(true);
      
      // 多重保险机制，确保游戏能继续
      const handlePuzzleComplete = () => {
        try {
          console.log('符文谜题完成，调用onComplete(true)');
          // 直接调用onComplete
          onComplete(true, timer);
          
          // 额外保障：即使onComplete调用成功，也添加一个强制刷新的后备方案
          setTimeout(() => {
            console.log('符文谜题完成，触发强制刷新后备方案');
            // 添加随机参数强制刷新到特定节点
            window.location.href = `${window.location.pathname}?node=chapter3_2_dungeon_success&refresh=true&t=${Date.now()}`;
          }, 1000);
        } catch (error) {
          console.error('完成符文谜题时出错:', error);
          // 如果出错，立即使用强制刷新作为最后的备选方案
          window.location.href = `${window.location.pathname}?node=chapter3_2_dungeon_success&refresh=true&t=${Date.now()}`;
        }
      };
      
      // 立即尝试完成游戏
      setTimeout(handlePuzzleComplete, 1000);
      
      // 添加额外的安全保障，确保即使前面的逻辑出错，游戏也能继续
      setTimeout(() => {
        if (!puzzleCompleted) {
          console.warn('检测到可能的完成处理失败，尝试备用方案...');
          handlePuzzleComplete();
        }
      }, 2000);
      
      // 添加最终的强制刷新保障
      setTimeout(() => {
        console.warn('最终强制刷新保障触发');
        if (puzzleCompleted) {
          window.location.href = `${window.location.pathname}?node=chapter3_2_dungeon_success&refresh=true&t=${Date.now()}`;
        }
      }, 3000);
    }
  };
  
  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-indigo-950 to-black p-4 relative">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-indigo-500/30"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: '50%',
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      {/* 游戏标题 */}
      <motion.h2 
        className="text-2xl font-bold mb-6 text-center text-white z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        古代符文谜题
      </motion.h2>
      
      {/* 计时器 */}
      <motion.div 
        className="mb-6 text-lg font-mono text-blue-300 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        剩余时间: {formatTime(timer)}
      </motion.div>
      
      {/* 谜题说明 */}
      <motion.p className="text-center text-blue-200 mb-6 max-w-md text-sm z-10 px-4 sm:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        古老的符文在等待有缘人激活。观察墙壁上的壁画提示，按照正确的顺序触摸符文以解开秘境之门。
      </motion.p>
      
      {/* 谜题网格 - 优化响应式布局 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-[300px] w-full mx-auto z-10">
        {Array.from({ length: totalTiles }).map((_, index) => {
          const isSelected = selectedTiles.includes(index);
          const isCorrect = selectedTiles.includes(index) && correctSequence.includes(index);
          
          return (
            <motion.div
              key={index}
              className={`aspect-square rounded-lg cursor-pointer flex items-center justify-center font-bold text-xl transition-all duration-300 ${
                isSelected 
                  ? isCorrect 
                    ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                    : 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => handleTileClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              style={{ 
                // 确保在小屏幕上也有足够的尺寸
                minHeight: '60px' 
              }}
            >
              <div className={`w-3/4 h-3/4 rounded-full flex items-center justify-center border-2 ${
                isSelected ? 'border-white' : 'border-gray-600'
              }`}>
                <span className="text-2xl">
                  {index === 0 ? '☯' : index === 1 ? '☰' : index === 2 ? '☷' : 
                   index === 3 ? '☳' : index === 4 ? '✦' : index === 5 ? '☴' :index === 6 ? '☶' : index === 7 ? '☵' : '☲'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* 选择序列显示 - 优化响应式布局 */}
      <div className="flex items-center gap-2 mb-6 z-10 flex-wrap justify-center px-4">
        <span className="text-blue-200 whitespace-nowrap">已选择序列:</span>
        <div className="flex gap-2 flex-wrap justify-center">
          {selectedTiles.map((tile, index) => (
            <motion.div
              key={index}
              className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-medium"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {index + 1}
            </motion.div>
          ))}
        </div>
      </div>
      
  {/* 游戏结束覆盖层 */}
  <AnimatePresence>
    {(gameOver || puzzleCompleted) && (
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          {puzzleCompleted ? '谜题解开！' : '时间到！'}
        </h2>
        {puzzleCompleted ? (
          <motion.div 
            className="text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-xl mb-6">你成功激活了所有符文！</p>
            <p className="text-blue-300 mb-8 max-w-md mx-auto">
              秘境之门缓缓打开，里面散发出古老而强大的灵气...
            </p>
            <motion.div 
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              🌟
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-xl mb-6">时间耗尽...</p>
            <p className="text-blue-300 mb-8 max-w-md mx-auto">
              古老的符文重新陷入沉寂，你需要重新寻找线索...
            </p>
          </motion.div>
        )}
        
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 重置游戏状态，重新开始
              setPuzzleCompleted(false);
              setGameOver(false);
              setSelectedTiles([]);
              setTimer(120);
              setIsProcessing(false);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <i className="fa-solid fa-redo mr-2"></i>
            再开始
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 退出游戏，返回剧情
              try {
                // 清除所有定时器
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                  timerIntervalRef.current = null;
                }
                
                // 调用onComplete并传入一个默认值
                onComplete(false, timer);
              } catch (error) {
                console.error('退出游戏时出错:', error);
                // 如果出错，强制刷新页面作为后备方案
                window.location.reload();
              }
            }}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-lg py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-red-500/30 transition-all duration-300"
          >
            <i className="fa-solid fa-sign-out-alt mr-2"></i>
            退出游戏
          </motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  );
}