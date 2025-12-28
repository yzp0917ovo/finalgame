import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CraftingGameProps {
  onComplete: (success: boolean, score: number) => void;
  type: 'fire_control' | 'timing' | 'material_blending';
  characterStats: {
    constitution: number;
    comprehension: number;
    luck: number;
  };
}

export default function CraftingGame({ onComplete, type, characterStats }: CraftingGameProps) {
  const [gameProgress, setGameProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fireLevel, setFireLevel] = useState(50);
  const [targetZone, setTargetZone] = useState({ min: 40, max: 60 });
  const [timingCircleSize, setTimingCircleSize] = useState(50);
  const [targetSize, setTargetSize] = useState(30);
  const [materials, setMaterials] = useState([
    { id: 1, name: '星尘砂', status: 'waiting' },
    { id: 2, name: '青莲地心火', status: 'waiting' },
  ]);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [blendProgress, setBlendProgress] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0); // 记录尝试次数
  const [maxAttempts, setMaxAttempts] = useState(5); // 总共5次判定
  const animationFrameRef = useRef<number>();
  
  const gameDuration = 10000; // 10秒游戏时间
  
  // 初始化游戏参数
  useEffect(() => {
    if (type === 'fire_control') {
      // 火候控制游戏参数
      setTargetZone({ min: 40, max: 60 });
      setMaxAttempts(5); // 5次判定
    } else if (type === 'timing') {
      // 时机把握游戏参数
      setTargetSize(25 + characterStats.luck); // 运气越好，目标越大
      setMaxAttempts(5); // 5次判定
    } else if (type === 'material_blending') {
      // 材料融合游戏参数
      setMaterials([
        { id: 1, name: '星尘砂', status: 'waiting' },
        { id: 2, name: '青莲地心火', status: 'waiting' },
      ]);
      setMaxAttempts(2); // 材料融合只有2个材料
    }
    
    // 开始游戏计时器
    const startTime = Date.now();
    const gameLoop = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = (elapsedTime / gameDuration) * 100;
      setGameProgress(progress);
      
      // 更新游戏状态
      if (type === 'fire_control') {
        // 火候控制：火焰自动波动
        setFireLevel(prev => {
          const fluctuation = (Math.sin(Date.now() * 0.005) * 20) + 50;
          return fluctuation;
        });
      } else if (type === 'timing') {
        // 时机把握：圆环大小变化
        setTimingCircleSize(prev => {
          const pulse = 50 + Math.sin(Date.now() * 0.01) * 25;
          return pulse;
        });
      }
      
      // 检查游戏是否结束
      if (elapsedTime >= gameDuration) {
        setGameOver(true);
        setIsProcessing(true);
        
        setTimeout(() => {
          // 判断游戏结果
          const success = score >= 60;
          onComplete(success, score);
        }, 1000);
        
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, gameDuration, score, characterStats.luck, onComplete]);
  
  // 处理火候控制
  const handleFireControl = () => {
    if (isProcessing || gameOver || type !== 'fire_control' || attemptCount >= maxAttempts) return;
    
    // 检查是否在目标区域内
    const inTargetZone = fireLevel >= targetZone.min && fireLevel <= targetZone.max;
    const points = inTargetZone ? 20 : 0; // 成功加20分，失败不扣分
    
    setScore(prev => Math.max(0, prev + points));
    setAttemptCount(prev => prev + 1);
    
    // 随机调整目标区域
    const newMin = Math.max(10, targetZone.min + (Math.random() * 10 - 5));
    const newMax = Math.min(90, targetZone.max + (Math.random() * 10 - 5));
    setTargetZone({ min: newMin, max: newMax });
    
    // 检查是否完成5次判定
    if (attemptCount + 1 >= maxAttempts) {
      setGameOver(true);
      setIsProcessing(true);
      
      setTimeout(() => {
        const finalScore = score + points;
        const success = finalScore >= 60;
        onComplete(success, finalScore);
      }, 1000);
    }
  };
  
  // 处理时机把握
  const handleTiming = () => {
    if (isProcessing || gameOver || type !== 'timing' || attemptCount >= maxAttempts) return;
    
    // 检查圆环大小是否接近目标大小
    const sizeDifference = Math.abs(timingCircleSize - targetSize);
    const inTargetRange = sizeDifference <= 10; // 在目标范围内
    const points = inTargetRange ? 20 : 0; // 成功加20分
    
    setScore(prev => Math.max(0, prev + points));
    setAttemptCount(prev => prev + 1);
    
    // 随机调整目标大小
    setTargetSize(25 + Math.random() * 20 + characterStats.luck);
    
    // 检查是否完成5次判定
    if (attemptCount + 1 >= maxAttempts) {
      setGameOver(true);
      setIsProcessing(true);
      
      setTimeout(() => {
        const finalScore = score + points;
        const success = finalScore >= 60;
        onComplete(success, finalScore);
      }, 1000);
    }
  };
  
  // 处理材料融合
  const handleMaterialBlend = () => {
    if (isProcessing || gameOver || type !== 'material_blending') return;
    
    // 获取当前材料
    const currentMaterial = materials[currentMaterialIndex];
    
    if (currentMaterial.status === 'waiting') {
      // 开始融合当前材料
      const updatedMaterials = [...materials];
      updatedMaterials[currentMaterialIndex].status = 'blending';
      setMaterials(updatedMaterials);
      
      // 开始融合进度
      const blendInterval = setInterval(() => {
        setBlendProgress(prev => {
          if (prev >= 100) {
            clearInterval(blendInterval);
            
            // 融合完成
            const finalMaterials = [...materials];
            finalMaterials[currentMaterialIndex].status = 'blended';
            setMaterials(finalMaterials);
            
            // 增加分数 - 每个材料50分
            const points = 50;
            setScore(prev => prev + points);
            
            // 移动到下一个材料或结束游戏
            if (currentMaterialIndex < materials.length - 1) {
              setTimeout(() => {
                setCurrentMaterialIndex(prev => prev + 1);
                setBlendProgress(0);
              }, 500);
            } else {
              // 所有材料融合完成，提前结束游戏
              setGameOver(true);
              setIsProcessing(true);
              
              setTimeout(() => {
                const success = score + points >= 60;
                onComplete(success, score + points);
              }, 1000);
            }
            
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
  };
  
  // 游戏标题和详细玩法说明
  const getGameTitleAndInstructions = () => {
    switch (type) {
      case 'fire_control':
        return {
          title: '火候控制',
          instructions: `炼丹过程中，火候控制至关重要。当火焰指示器进入绿色目标区域时，迅速点击屏幕来稳定火势。每次成功控制火候可获得20分，总共需要判定5次，满分100分。当前已完成${attemptCount}/${maxAttempts}次判定，得分：${score}。`
        };
      case 'timing':
        return {
          title: '时机把握',
          instructions: `炼丹需要精准的时机把控。观察屏幕中央的圆环，当它的大小接近中心的绿色靶心时（误差在10以内），点击屏幕进行操作。每次成功把握时机可获得20分，总共需要判定5次，满分100分。当前已完成${attemptCount}/${maxAttempts}次判定，得分：${score}。`
        };
      case 'material_blending':
        return {
          title: '材料融合',
          instructions: `炼丹的关键步骤是材料融合。游戏会依次显示需要融合的材料，当材料显示"等待"状态时，点击屏幕开始融合。融合过程中需要耐心等待进度条填满，每个材料融合完成获得50分。当前进度：${currentMaterialIndex + 1}/${materials.length}，得分：${score}。`
        };
      default:
        return {
          title: '炼丹小游戏',
          instructions: '这是修仙过程中的重要环节，通过不同的小游戏考验你的炼丹技艺。'
        };
    }
  };
  
  const { title, instructions } = getGameTitleAndInstructions();
  
  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-indigo-950 to-black p-1 sm:p-2">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
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
        className="text-2xl font-bold mb-2 text-center text-white z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        炼丹小游戏 - {title}
      </motion.h2>
      
      {/* 游戏说明 */}
      <motion.p 
        className="text-sm text-blue-200 mb-6 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {instructions}
      </motion.p>
      
      {/* 游戏计时器 */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-blue-200 text-sm">时间</span>
          <span className="text-blue-200 text-sm">{Math.ceil((gameDuration - (gameProgress / 100) * gameDuration) / 1000)}秒</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${100 - gameProgress}%` }}
            animate={{ width: `${100 - gameProgress}%` }}
            transition={{ duration: 0.1 }}
          ></motion.div>
        </div>
      </div>
      
      {/* 游戏分数 */}
      <motion.div 
        className="mb-6 text-xl font-bold text-center text-yellow-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        分数: {score}/100
      </motion.div>
      
      {/* 游戏内容区域 */}
      <motion.div 
        className="w-full max-w-md h-40 bg-black/30 border border-blue-500/50 rounded-xl mb-6 flex items-center justify-center cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={type === 'fire_control' ? handleFireControl : type === 'timing' ? handleTiming : handleMaterialBlend}
      >
        {type === 'fire_control' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full h-20 relative mb-4">
              {/* 温度条背景 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-green-900 to-red-900 rounded-lg"></div>
              
              {/* 目标区域 */}
              <div 
                className="absolute inset-y-0 bg-green-500/50 z-10"
                style={{ 
                  left: `${targetZone.min}%`, 
                  width: `${targetZone.max - targetZone.min}%` 
                }}
              ></div>
              
              {/* 火焰指示器 */}
              <motion.div 
                className="absolute inset-y-0 w-1 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)] z-20"
                style={{ left: `${fireLevel}%` }}
                animate={{ left: `${fireLevel}%` }}
                transition={{ duration: 0.1 }}
              ></motion.div>
            </div>
            <p className="text-center text-sm">点击屏幕控制火候</p>
          </div>
        )}
        
        {type === 'timing' && (
          <div className="relative">
            {/* 固定靶心 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-12 h-12 border-4 border-green-500 rounded-full"
                style={{ width: `${targetSize}px`, height: `${targetSize}px` }}
              ></div>
            </div>
            
            {/* 脉冲圆环 */}
            <motion.div 
              className="w-24 h-24 border-4 border-blue-500 rounded-full"
              style={{ width: `${timingCircleSize}px`, height: `${timingCircleSize}px` }}
              animate={{ 
                width: `${timingCircleSize}px`, 
                height: `${timingCircleSize}px` 
              }}
              transition={{ duration: 0.1 }}
            ></motion.div>
            
            <p className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 text-sm">
              当圆环接近靶心时点击
            </p>
          </div>
        )}
        
        {type === 'material_blending' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="text-4xl mb-4">⚗️</div>
            
            <div className="space-y-2 w-full">
              {materials.map((material, index) => (
                <div key={material.id} className="flex items-center w-full">
                  <div className="w-24 text-left">{material.name}</div>
                  <div className="flex-grow mx-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      {material.status === 'blending' && (
                        <motion.div 
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${blendProgress}%` }}
                          animate={{ width: `${blendProgress}%` }}
                          transition={{ duration: 0.1 }}
                        ></motion.div>
                      )}
                      {material.status === 'blended' && (
                        <div className="h-full rounded-full bg-green-500"></div>
                      )}
                    </div>
                  </div>
                  <div className="w-12 text-center">
                    {material.status === 'waiting' && '等待'}
                    {material.status === 'blending' && '融合中'}
                    {material.status === 'blended' && '完成'}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="mt-4 text-center text-sm">
              {materials[currentMaterialIndex].status === 'waiting' 
                ? '点击屏幕开始融合材料' 
                : materials[currentMaterialIndex].status === 'blending'
                  ? '融合中...'
                  : '材料融合完成'}
            </p>
          </div>
        )}
      </motion.div>
      
      {/* 游戏结束覆盖层 */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {score >= 90 ? '完美炼制！' : score >= 70 ? '优质炼制！' : score >= 50 ? '成功炼制！' : '炼制失败！'}
            </h2>
            <p className="text-xl mb-6">最终分数: {score}/100</p>
            <div className="text-blue-300 mb-8 text-center max-w-md">
              {score >= 90 
                ? '你炼制出了完美品质的丹药，效果极佳！' 
                : score >= 70 
                ? '你炼制出了优质品质的丹药，效果很好！'
                : score >= 50 
                ? '你成功炼制了丹药，效果良好。'
                : '炼制失败，材料受损，但你获得了宝贵的经验。'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}