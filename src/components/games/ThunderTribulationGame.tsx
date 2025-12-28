import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThunderTribulationGameProps {
  onComplete: (success: boolean, score: number) => void;
}

export default function ThunderTribulationGame({ onComplete }: ThunderTribulationGameProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [health, setHealth] = useState(100);
  const [lightningBolts, setLightningBolts] = useState<Array<{ id: number; x: number; speed: number; size: number; color: string; active: boolean }>>([]);
  const [lastBoltTime, setLastBoltTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  
  // 雷劫总共有9道天雷
  const totalStages = 9;
  const stageDurations = [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 15000];
  const stageDifficulties = [3, 5, 7, 9, 12, 15, 18, 22, 28];
  
  // 添加阶段开始时间状态
  const [stageStartTime, setStageStartTime] = useState(Date.now());

  // 游戏循环
  useEffect(() => {
    if (gameOver) return;
    
    gameLoopRef.current = setInterval(() => {
      const currentTime = Date.now();
      
     // 生成新的闪电
     if (currentTime - lastBoltTime > 1000 / stageDifficulties[currentStage] && lightningBolts.length < 5) {
       // 从localStorage获取游戏状态以获取雷劫类型和强度
       const gameStateString = localStorage.getItem('xiuxian_game_state');
       let tribulationType = 'normal';
       let intensityMultiplier = 1;
       
       if (gameStateString) {
         try {
           const gameState = JSON.parse(gameStateString);
           tribulationType = gameState.currentCharacter?.tribulationType || 'normal';
           // 应用强度系数
           if (tribulationType === '业火雷劫') {
             intensityMultiplier = 2.0;
           } else if (tribulationType === '功德雷劫') {
             intensityMultiplier = 0.8;
           }
           // 域外天魔事件影响
           if (gameState.currentCharacter?.eventResult === '成功') {
             intensityMultiplier *= 0.7;
           } else if (gameState.currentCharacter?.eventResult === '失败') {
             intensityMultiplier *= 1.3;
           }
         } catch (error) {
           console.error('获取雷劫难度时出错:', error);
         }
       }
       
       const newBolt = {
         id: Date.now(),
         x: Math.random() * 80 + 10, // 10-90%的水平位置
         y: 0, // 初始化y坐标
         speed: 1 + Math.random() * 2 * intensityMultiplier, // 速度随难度增加
         size: 10 + Math.random() * 15,
         color: tribulationType === '业火雷劫' ? ['#FF6B6B', '#FF3366', '#C41E3A', '#8B0000', '#650014'][Math.floor(Math.random() * 5)] : 
                tribulationType === '功德雷劫' ? ['#4ECDC4', '#45B7D1', '#2CB3C9', '#289FED', '#2185C5'][Math.floor(Math.random() * 5)] :
                ['#8ECAE6', '#219EBC', '#023047', '#FFB703', '#FB8500'][Math.floor(Math.random() * 5)],
         active: true
       };
       setLightningBolts(prev => [...prev, newBolt]);
       setLastBoltTime(currentTime);
     }
      
      // 更新闪电位置
      setLightningBolts(prev => {
        const updated = prev.map(bolt => ({
          ...bolt,
          y: bolt.y + bolt.speed
        })).filter(bolt => {
          if (bolt.y > 100 && bolt.active) {
            // 闪电到达底部，扣除生命值
            setHealth(prevHealth => Math.max(0, prevHealth - 10));
            setCombo(0);
            return false;
          }
          return bolt.y <= 100 && bolt.active; // 移除非活动的闪电
        });
        
        return updated;
      });
      
      // 检查生命值
      if (health <= 0) {
        setGameOver(true);
        setIsProcessing(true);
        setTimeout(() => {
          onComplete(false, score);
        }, 1000);
      }
      
    }, 16); // 约60fps
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [lightningBolts, lastBoltTime, currentStage, gameOver, health, score, onComplete]);
  
  // 阶段切换
  useEffect(() => {
    if (gameOver) return;
    
    // 记录当前阶段开始时间
    setStageStartTime(Date.now());
    
    const timer = setTimeout(() => {
      if (currentStage < totalStages - 1) {
        setCurrentStage(prev => prev + 1);
        setHealth(prev => Math.min(100, prev + 20)); // 阶段间恢复一些生命值
      } else {
        setGameOver(true);
        setIsProcessing(true);
        setTimeout(() => {
          onComplete(true, score);
        }, 1000);
      }
    }, stageDurations[currentStage]);
    
    return () => clearTimeout(timer);
  }, [currentStage, gameOver, onComplete]);
  
  // 处理闪电点击
  const handleBoltClick = useCallback((boltId: number) => {
    if (gameOver || isProcessing) return;
    
    setLightningBolts(prev => prev.map(bolt => 
      bolt.id === boltId ? { ...bolt, active: false } : bolt
    ));
    
    // 计算得分
    const newCombo = combo + 1;
    const baseScore = 10;
    const comboMultiplier = 1 + (newCombo - 1) * 0.1; // 10%的连击加成
    const stageMultiplier = 1 + currentStage * 0.1; // 10%的阶段加成
    
    const points = Math.floor(baseScore * comboMultiplier * stageMultiplier);
    setScore(prev => prev + points);
    setCombo(newCombo);
    
    // 显示点击效果
    // 这里可以添加粒子效果或动画
  }, [combo, currentStage, gameOver, isProcessing]);
  
  // 渲染闪电
  const renderLightningBolts = () => {
    return lightningBolts.map(bolt => (
      <motion.div
        key={bolt.id}
        className={`absolute cursor-pointer rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 z-10`}
        style={{
          left: `${bolt.x}%`,
          top: `${bolt.y || 0}%`,
          width: `${bolt.size}px`,
          height: `${bolt.size * 3}px`,
          backgroundColor: bolt.color,
          boxShadow: `0 0 ${bolt.size * 2}px ${bolt.color}`
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0, 1, 0.8, 1],
          scale: [0.5, 1, 0.9, 1]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        onClick={() => handleBoltClick(bolt.id)}
      />
    ));
  };
  
  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 p-1 sm:p-2">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-400 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      {/* 游戏标题 */}
      <motion.h2 
        className="text-2xl font-bold mb-4 text-center text-white z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        第{currentStage + 1}道天雷 - {Math.max(0, Math.floor((stageDurations[currentStage] - (Date.now() - stageStartTime)) / 1000))}秒
      </motion.h2>
      
      {/* 游戏区域 */}
      <div className="relative w-full max-w-md h-[400px] sm:h-[450px] bg-black/30 border-2 border-blue-500/50 rounded-xl overflow-hidden mb-4">
        {/* 乌云 */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-900 to-transparent"></div>
        
        {/* 闪电 */}
        {renderLightningBolts()}
        
        {/* 角色 */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-6xl z-10"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity
          }}
        >
          ⚡
        </motion.div>
        
        {/* 地面 */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-gray-800 to-transparent"></div>
      </div>
      
      {/* 状态信息 */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {/* 生命值 */}
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-blue-200">生命值</span>
            <span className="text-blue-200">{health}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full transition-all duration-300 ${
                health > 70 ? 'bg-green-500' : 
                health > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${health}%` }}
            ></motion.div>
          </div>
        </div>
        
        {/* 得分和连击 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-900/50 backdrop-blur-sm p-2 rounded-lg text-center">
            <p className="text-blue-200 text-sm">得分</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
          <div className="bg-purple-900/50 backdrop-blur-sm p-2 rounded-lg text-center">
            <p className="text-blue-200 text-sm">连击</p>
            <p className="text-xl font-bold">{combo}x</p>
          </div>
        </div>
      </div>
      
      {/* 操作提示 */}
      <motion.p 
        className="mt-4 text-blue-200 text-sm text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        点击降落的闪电来抵御雷劫！保持连击可以获得更高分数！
      </motion.p>
      
  {/* 游戏结束覆盖层 */}
  <AnimatePresence>
    {gameOver && (
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          {health > 0 ? '雷劫成功！' : '雷劫失败！'}
        </h2>
        <p className="text-xl mb-6">最终得分: {score}</p>
        <p className="text-blue-300 mb-8 max-w-md text-center">
          {health > 0 
            ? '你成功抵御了九道天雷，修为大进！' 
            : '你未能承受住雷劫的威力，需要重新准备...'}
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 重置游戏状态，重新开始
              setCurrentStage(0);
              setScore(0);
              setCombo(0);
              setGameOver(false);
              setHealth(100);
              setLightningBolts([]);
              setLastBoltTime(0);
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
                if (gameLoopRef.current) {
                  clearInterval(gameLoopRef.current);
                  gameLoopRef.current = null;
                }
                
                // 调用onComplete并传入一个默认值
                onComplete(false, score);
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