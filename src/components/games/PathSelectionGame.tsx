import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttributeAllocation {
  charm: number;
  comprehension: number;
  constitution: number;
  family: number;
  luck: number;
}

interface PathOption {
  id: string;
  name: string;
  description: string;
  recommendedStats: Partial<AttributeAllocation>;
  imageUrl: string;
}

interface PathSelectionGameProps {
  onComplete: (selectedPath: string, allocatedStats: AttributeAllocation) => void;
  initialStats: AttributeAllocation;
}

export default function PathSelectionGame({ onComplete, initialStats }: PathSelectionGameProps) {
  const [availablePoints, setAvailablePoints] = useState(10);
  const [allocatedStats, setAllocatedStats] = useState<AttributeAllocation>({...initialStats});
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 道路选项配置
  const pathOptions: PathOption[] = [
    {
      id: 'pursue_power',
      name: '追求力量之路',
      description: '专注于提升自身实力，追求无敌的战斗力和破坏力。适合喜欢战斗和挑战的修士。',
      recommendedStats: { constitution: 3, luck: 1 },
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=powerful%20cultivator%20training%20in%20thunderstorm%2C%20determined%20expression%2C%20powerful%20aura&sign=ab14dc176f70d706c01ced7523d1ba30'
    },
    {
      id: 'guardian_path',
      name: '守护之道',
      description: '以保护弱小为己任，行侠仗义，获得他人的尊敬和爱戴。需要良好的社交能力。',
      recommendedStats: { charm: 3, comprehension: 1 },
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=hero%20helping%20villagers%2C%20grateful%20expressions%2C%20warm%20sunlight&sign=fb90218d281f9ca1ff848d28121b2fc8'
    },
    {
      id: 'enlightenment_path',
      name: '求道之路',
      description: '探索修仙的本质和宇宙的真理，追求更高层次的理解和顿悟。适合喜欢思考和研究的修士。',
      recommendedStats: { comprehension: 3, luck: 2 },
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=philosopher%20meditating%20on%20a%20mountain%20peak%2C%20contemplative%20expression%2C%20misty%20atmosphere&sign=e5f632735f9c2bd646e15e083cb0f9a3'
    },
    {
      id: 'seclusion_path',
      name: '隐世修行',
      description: '远离尘世的喧嚣，专注于自身的修炼，追求内心的平静和突破。',
      recommendedStats: { comprehension: 2, constitution: 2 },
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=hermit%20cottage%20in%20mountains%2C%20misty%20atmosphere%2C%20peaceful%20environment%2C%20chinese%20fantasy&sign=5d0e4957c19c87d890f3d8d2f66aff91'
    },
    {
      id: 'legacy_path',
      name: '传承之路',
      description: '创建自己的门派或家族，将自己的道统传承下去，影响一代又一代的修士。',
      recommendedStats: { charm: 2, family: 3 },
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=grand%20ancient%20chinese%20temple%2C%20mountain%20top%2C%20many%20disciples%2C%20majestic%20atmosphere&sign=43b78cc068d9f64020fd174a1cea2400'
    }
  ];
  
  // 处理属性分配
  const handleAttributeChange = (attribute: keyof AttributeAllocation, increase: boolean) => {
    if (isProcessing) return;
    
    setAllocatedStats(prev => {
      const currentValue = prev[attribute];
      
      if (increase) {
        if (availablePoints > 0) {
          setAvailablePoints(prevPoints => prevPoints - 1);
          return { ...prev, [attribute]: currentValue + 1 };
        }
      } else {
        if (currentValue > initialStats[attribute]) {
          setAvailablePoints(prevPoints => prevPoints + 1);
          return { ...prev, [attribute]: currentValue - 1 };
        }
      }
      
      return prev;
    });
  };
  
  // 处理道路选择
  const handlePathSelect = (pathId: string) => {
    if (isProcessing) return;
    
    setSelectedPath(pathId);
    setIsProcessing(true);
    
    // 延迟后显示结果并完成游戏
    setTimeout(() => {
      setShowResult(true);
      setTimeout(() => {
        onComplete(pathId, allocatedStats);
      }, 2000);
    }, 1000);
  };
  
  // 获取道路推荐属性的匹配度
  const getPathMatchScore = (path: PathOption) => {
    let score = 0;
    Object.entries(path.recommendedStats).forEach(([stat, recommended]) => {
      const current = allocatedStats[stat as keyof AttributeAllocation];
      score += Math.min(current, recommended as number);
    });
    return score;
  };
  
  // 按匹配度排序道路选项
  const sortedPathOptions = [...pathOptions].sort((a, b) => getPathMatchScore(b) - getPathMatchScore(a));
  
  return (
    <div className="w-full h-full min-h-[700px] relative flex flex-col items-center justify-start overflow-hidden bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 p-2 sm:p-4">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-500/20"
            style={{
              width: `${Math.random() * 5 + 1}px`,
              height: `${Math.random() * 5 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: '50%',
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [0, -Math.random() * 50 - 20],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
      
      {/* 游戏标题 */}
      <motion.h2 
        className="text-2xl font-bold mb-2 text-center text-white z-10 mt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        选择你的修仙之路
      </motion.h2>
      
      <motion.p 
        className="text-center text-blue-200 mb-6 text-sm max-w-md z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        你已达到修仙的关键阶段，现在需要决定未来的修炼方向。分配属性点来增强你的优势，然后选择最适合你的道路。
      </motion.p>
      
      {/* 属性分配区域 */}
      <motion.div 
        className="w-full max-w-md bg-indigo-900/30 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-indigo-500/30 shadow-lg mb-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-4 text-center">属性分配</h3>
        
        <div className="mb-4 text-center">
          <p className="text-blue-200">可用点数: <span className="font-bold text-yellow-300">{availablePoints}</span></p>
        </div>
        
        <div className="space-y-4">
          {Object.entries(allocatedStats).map(([key, value]) => {
            const attributeNames: Record<string, string> = {
              charm: '魅力',
              comprehension: '悟性',
              constitution: '体质',
              family: '家境',
              luck: '气运'
            };
            
            const attributeIcons: Record<string, string> = {
              charm: 'heart',
              comprehension: 'brain',
              constitution: 'shield-alt',
              family: 'coins',
              luck: 'star'
            };
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className={`fa-solid fa-${attributeIcons[key]} text-blue-300`}></i>
                  <span className="text-white">{attributeNames[key]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAttributeChange(key as keyof AttributeAllocation, false)}
                    disabled={value <= initialStats[key as keyof AttributeAllocation] || availablePoints >= 10 || isProcessing}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      value <= initialStats[key as keyof AttributeAllocation] || isProcessing
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-800 hover:bg-indigo-700'
                    } transition-colors duration-200`}
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  
                  <div className="w-12 text-center font-bold">
                    {value}
                  </div>
                  
                  <button
                    onClick={() => handleAttributeChange(key as keyof AttributeAllocation, true)}
                    disabled={availablePoints <= 0 || isProcessing}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      availablePoints <= 0 || isProcessing
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-800 hover:bg-indigo-700'
                    } transition-colors duration-200`}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {/* 道路选择区域 - 优化响应式布局 */}
      <motion.div 
        className="w-full max-w-4xl flex-grow overflow-y-auto mb-4 z-10 min-h-[300px] px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-4 text-center text-white">选择你的道路</h3>
        
        {/* 优化道路选择区域的布局 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPathOptions.map((path, index) => {
            const matchScore = getPathMatchScore(path);
            const matchPercentage = Math.floor((matchScore / Object.values(path.recommendedStats).reduce((a, b) => a + b, 0)) * 100);
            
            return (
              <motion.div
                key={path.id}
                className={`bg-indigo-900/30 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer h-full flex flex-col ${
                  selectedPath === path.id
                    ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                    : 'border-indigo-500/50 hover:border-blue-500/50 hover:shadow-lg'
                }`}
                onClick={() => handlePathSelect(path.id)}
                whileHover={!selectedPath ? { y: -5 } : {}}
                whileTap={!selectedPath ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                {/* 道路图片 */}
                <div className="h-40 sm:h-48 overflow-hidden relative">
                  <img 
                    src={path.imageUrl} 
                    alt={path.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="p-3 sm:p-4 w-full">
                      <h4 className="text-xl font-bold">{path.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-blue-200">
                          匹配度: {matchPercentage}%
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: Math.min(5, Math.floor(matchPercentage / 20)) }).map((_, i) => (
                            <i key={i} className="fa-solid fa-star text-yellow-400 text-xs"></i>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 道路描述 - 确保在小屏幕上也能完整显示 */}
                <div className="p-3 sm:p-4 flex-grow flex flex-col">
                  <p className="text-sm text-gray-300 mb-3 sm:mb-4">{path.description}</p>
                  
                  {/* 推荐属性 */}
                  <div className="mt-auto">
                    <p className="text-xs text-blue-300 mb-2">推荐属性:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(path.recommendedStats).map(([stat, value]) => {
                        const attributeNames: Record<string, string> = {
                          charm: '魅力',
                          comprehension: '悟性',
                          constitution: '体质',
                          family: '家境',
                          luck: '气运'
                        };
                        
                        return (
                          <span 
                            key={stat} 
                            className="text-xs bg-blue-900/70 py-1 px-2 rounded-full"
                          >
                            {attributeNames[stat]} +{value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      {/* 结果显示 */}
      <AnimatePresence>
        {showResult && selectedPath && (
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              const path = pathOptions.find(p => p.id === selectedPath);
              if (!path) return null;
              
              return (
                <>
                  <motion.h2 
                    className="text-3xl font-bold mb-6 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    你选择了{path.name}
                  </motion.h2>
                  
                  <motion.div 
                    className="max-w-md bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-lg mb-8 mx-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <p className="text-lg mb-4">{path.description}</p>
                    
                    <h4 className="font-bold mb-2">你的属性配置:</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(allocatedStats).map(([key, value]) => {
                        const attributeNames: Record<string, string> = {
                          charm: '魅力',
                          comprehension: '悟性',
                          constitution: '体质',
                          family: '家境',
                          luck: '气运'
                        };
                        
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <span>{attributeNames[key]}</span>
                            <span className="font-bold">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-blue-300 mb-6 text-center max-w-md px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    这将是你修仙之路上最重要的决定之一，你的选择将影响你的未来发展和最终结局。
                  </motion.p>
                  
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    🚀
                  </motion.div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}