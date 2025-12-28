import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueOption {
  id: number;
  text: string;
  effect: number; // 好感度影响，正数为增加，负数为减少
  isRomantic?: boolean; // 是否为浪漫选项
  requirement?: number; // 需要的好感度阈值
}

interface SoulmateDialogueGameProps {
  onComplete: (relationshipScore: number) => void;
}

export default function SoulmateDialogueGame({ onComplete }: SoulmateDialogueGameProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [relationshipScore, setRelationshipScore] = useState(50); // 初始好感度
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 对话场景配置
  const dialogueScenes = [
    {
      question: "苏慕/苏婉微笑着看着你：\"修炼这么辛苦，要不要一起去山下的小镇逛逛？那里的桃花开得正艳呢。\"",
      options: [
        { id: 1, text: "好啊，正想放松一下。", effect: 10, isRomantic: false },
        { id: 2, text: "修炼要紧，我想再修炼一会儿。", effect: -5 },
        { id: 3, text: "有你陪伴，哪里都是好风景。", effect: 15, isRomantic: true, requirement: 60 }
      ]
    },
    {
      question: "你们来到小镇，看到有卖糖葫芦的摊子。苏慕/苏婉眼神一亮：\"小时候我最喜欢吃糖葫芦了！\"",
      options: [
        { id: 1, text: "我去买两串，我们一起吃。", effect: 12, isRomantic: false },
        { id: 2, text: "修仙之人要少贪口腹之欲。", effect: -8 },
        { id: 3, text: "你的笑容比糖葫芦更甜。", effect: 18, isRomantic: true, requirement: 70 }
      ]
    },
    {
      question: "夕阳西下，你们坐在河边的石凳上。苏慕/苏婉轻声说：\"和你在一起的时光总是过得特别快...\"",
      options: [
        { id: 1, text: "我也是，和你在一起很开心。", effect: 15, isRomantic: false },
        { id: 2, text: "时间宝贵，我们该回去修炼了。", effect: -10 },
        { id: 3, text: "如果时间能停在这一刻该多好。", effect: 20, isRomantic: true, requirement: 80 }
      ]
    }
  ];
  
  // 场景结束后的处理
  useEffect(() => {
    if (currentScene >= dialogueScenes.length) {
      setShowResult(true);
      setIsProcessing(true);
      setTimeout(() => {
        onComplete(relationshipScore);
      }, 2000);
    }
  }, [currentScene, relationshipScore, onComplete]);
  
  // 处理选项选择
  const handleOptionSelect = (optionId: number) => {
    if (isProcessing || currentScene >= dialogueScenes.length) return;
    
    const currentOptions = dialogueScenes[currentScene].options;
    const selected = currentOptions.find(opt => opt.id === optionId);
    
    if (!selected) return;
    
    // 检查是否满足要求
    if (selected.requirement && relationshipScore < selected.requirement) {
      // 不满足要求，不允许选择
      // 可以添加提示
      return;
    }
    
    setSelectedOption(optionId);
    setIsProcessing(true);
    
    // 延迟后更新分数并进入下一场景
    setTimeout(() => {
      setRelationshipScore(prev => Math.max(0, Math.min(100, prev + selected.effect)));
      setCurrentScene(prev => prev + 1);
      setSelectedOption(null);
      setIsProcessing(false);
    }, 1500);
  };
  
  // 获取当前场景，并添加空值检查
  const currentDialogue = dialogueScenes[currentScene] || {
    question: "",
    options: []
  };
  
  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-pink-900/30 via-purple-900/30 to-blue-900/30 p-1 sm:p-2">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: relationshipScore > 70 ? '#f472b6' : '#8b5cf6',
              borderRadius: '50%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
      
      {/* 好感度显示 */}
      <motion.div 
        className="absolute top-4 right-4 bg-indigo-900/70 backdrop-blur-sm p-3 rounded-lg z-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-heart text-red-400"></i>
          <span className="font-bold">好感度: {relationshipScore}</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
          <motion.div 
            className={`h-full rounded-full transition-all duration-500 ${
              relationshipScore > 70 ? 'bg-red-500' : 
              relationshipScore > 40 ? 'bg-pink-500' : 'bg-purple-500'
            }`}
            style={{ width: `${relationshipScore}%` }}
          ></motion.div>
        </div>
      </motion.div>
      
      {/* 场景标题 */}
      <motion.h2 
        className="text-2xl font-bold mb-6 text-center text-white z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        与道侣的时光
      </motion.h2>
      
      {/* 当前场景 */}
      <div className="w-full max-w-md mb-8 z-10">
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30 shadow-lg mb-6"
          key={currentScene} // 场景切换时重新渲染
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg leading-relaxed text-white">
            {currentDialogue.question}
          </p>
          
          {/* 角色头像 */}
          <div className="mt-4 flex justify-center">
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-500/50"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20beauty%2C%20graceful%20appearance%2C%20smiling%20face%2C%20traditional%20clothing&sign=47abae71a6ffe832f4f7c7a88e07814c" 
                alt="Soulmate" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* 选项列表 */}
        <div className="space-y-3">
          {currentDialogue.options && currentDialogue.options.map((option) => {
            const canSelect = !option.requirement || relationshipScore >= option.requirement;
            
            return (
              <motion.button
                key={option.id}
                className={`w-full bg-indigo-800/50 backdrop-blur-sm p-4 rounded-lg text-left border transition-all duration-300 ${
                  selectedOption === option.id
                    ? 'border-green-500 bg-green-900/30'
                    : canSelect
                      ? 'border-indigo-500/50 hover:border-pink-500/50 hover:bg-indigo-700/50'
                      : 'border-gray-700 bg-gray-800/50 opacity-60 cursor-not-allowed'
                } ${option.isRomantic ? 'border-l-4 border-pink-500' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={!canSelect || isProcessing || currentScene >= dialogueScenes.length}
                whileHover={canSelect && !isProcessing && currentScene < dialogueScenes.length ? { x: 5 } : {}}
                whileTap={canSelect && !isProcessing && currentScene < dialogueScenes.length ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: option.id * 0.1, duration: 0.5 }}
              >
                <div className="flex justify-between items-start">
                  <span className={`${option.isRomantic ? 'text-pink-300 font-medium' : 'text-white'}`}>
                    {option.text}
                  </span>
                  {option.requirement && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      relationshipScore >= option.requirement ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'
                    }`}>
                      好感度≥{option.requirement}
                    </span>
                  )}
                </div>
                {selectedOption === option.id && (
                  <motion.div 
                    className="mt-2 text-sm text-green-400 flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <i className="fa-solid fa-check mr-1"></i>
                    选择已确认
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* 场景进度 */}
      <div className="flex items-center gap-2 mb-6 z-10">
        {Array.from({ length: dialogueScenes.length }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentScene 
                ? 'w-8 bg-green-500' 
                : i === currentScene 
                  ? 'w-4 bg-pink-500' 
                  : 'w-2 bg-gray-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: i < currentScene ? 32 : i === currentScene ? 16 : 8 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      
      {/* 结果显示 */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {relationshipScore > 80 ? '两心相悦' : relationshipScore > 50 ? '渐生情愫' : '友谊长存'}
            </h2>
            <p className="text-xl mb-6">最终好感度: {relationshipScore}</p>
            <p className="text-blue-300 mb-8 text-center max-w-md">
              {relationshipScore > 80 
                ? '通过这次相处，你们的感情更加深厚，成为了彼此修行路上最坚定的伴侣。' 
                : relationshipScore > 50 
                  ? '你们的关系有了进一步发展，相信在未来的日子里会更加亲密。' 
                  : '虽然没有更进一步，但你们建立了真挚的友谊，这也是修行路上的宝贵财富。'}
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
              {relationshipScore > 80 ? '💖' : relationshipScore > 50 ? '💕' : '👫'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}