import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartDemonGameProps {
  onComplete: (success: boolean) => void;
  moralStains: string[];
  demonVision: string;
  demonDifficulty: number;
}

export default function HeartDemonGame({ 
  onComplete, 
  moralStains, 
  demonVision,
  demonDifficulty 
}: HeartDemonGameProps) {
  // 游戏核心状态 - 重置为记忆剧情选项的模式
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showGameGuide, setShowGameGuide] = useState(true);
  const [questions, setQuestions] = useState<Array<{
    prompt: string;
    options: { text: string; isGood: boolean; explanation: string }[];
    correctOptionIndex: number;
    memoryChoiceIndex: number | null;
  }>>([]);
  
  // 配置常量 - 7道题，需要答对5道
  const TOTAL_QUESTIONS = 7;
  const REQUIRED_CORRECT = 5;
  
  // 定时器引用
  const timerRef = useRef<number | null>(null);
  const lastInteractionTimeRef = useRef(Date.now());
  
  // 初始化游戏 - 基于玩家曾经的选择生成问题
  useEffect(() => {
    // 生成与玩家历史选择相关的问题
    const generateQuestions = () => {
      // 从道德污点和心魔幻象中提取关键词，构建更具针对性的问题
      const keyThemes = [demonVision, ...moralStains].filter(Boolean);
      
      // 生成5个问题
      const newQuestions: Array<{
        prompt: string;
        options: { text: string; isGood: boolean; explanation: string }[];
        correctOptionIndex: number;
        memoryChoiceIndex: number | null;
      }> = [];
      
      // 问题模板 - 基于玩家曾经的选择
      const questionTemplates = [
        {
          promptTemplate: "心魔呈现了你曾经的选择：" + getMemoryChoice() + "，你是否还坚持当时的决定？",
          options: [
            { text: "初心未改", isGood: true, explanation: "你坚守着自己的道心，不为心魔所惑" },
            { text: "心生悔意", isGood: false, explanation: "心魔趁虚而入，动摇了你的信念" }
          ],
          correctOptionIndex: 0
        },
        {
          promptTemplate: "面对" + keyThemes[0] + "的诱惑，你会如何选择？",
          options: [
            { text: "不为所动", isGood: true, explanation: "你的道心坚定如铁，任何诱惑都无法动摇" },
            { text: "暂时妥协", isGood: false, explanation: "你为了短期利益，偏离了自己的正道" }
          ],
          correctOptionIndex: 0
        },
        {
          promptTemplate: "心魔让你回忆起" + getWeakMoment() + "，你是否认为那是正确的选择？",
          options: [
            { text: "虽有遗憾，并无后悔", isGood: true, explanation: "你接受过去的自己，更加坚定未来的方向" },
            { text: "如果重来，我会选择不同的路", isGood: false, explanation: "心魔利用你的悔恨，侵蚀着你的道心" }
          ],
          correctOptionIndex: 0
        },
        {
          promptTemplate: "当面对" + getMoralDilemma() + "时，你会坚持怎样的原则？",
          options: [
            { text: "坚守本心，无愧天地", isGood: true, explanation: "你遵循内心的正道，不为外界所扰" },
            { text: "灵活变通，以达成目的", isGood: false, explanation: "你开始为自己的妥协寻找理由" }
          ],
          correctOptionIndex: 0
        },
        {
          promptTemplate: "心魔问你：" + demonVision + "，你真的相信自己能够成仙吗？",
          options: [
            { text: "我心坚定，必定成功", isGood: true, explanation: "你的信念不可动摇，这正是修仙之道的真谛" },
            { text: "或许我真的不配", isGood: false, explanation: "心魔的质疑让你开始怀疑自己" }
          ],
          correctOptionIndex: 0
        }
      ];
      
      // 填充问题内容
      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const template = questionTemplates[i % questionTemplates.length];
        const prompt = template.promptTemplate;
        
        newQuestions.push({
          prompt,
          options: [...template.options],
          correctOptionIndex: template.correctOptionIndex,
          memoryChoiceIndex: null
        });
      }
      
      return newQuestions;
    };
    
    // 生成问题
    setQuestions(generateQuestions());
    
  }, [moralStains, demonVision]);
  
  // 获取玩家记忆中的选择
  const getMemoryChoice = () => {
    const memoryChoices = [
      "初次踏入仙门的决定",
      "选择功法时的犹豫",
      "面对诱惑时的抉择",
      "与人争斗时的立场",
      "面对生死时的态度"
    ];
    return memoryChoices[Math.floor(Math.random() * memoryChoices.length)];
  };
  
  // 获取玩家可能的软弱时刻
  const getWeakMoment = () => {
    const weakMoments = [
      "在危险面前的退缩",
      "面对强权时的妥协",
      "未能保护重要之人",
      "因为贪婪做出的错事",
      "因恐惧而逃避的责任"
    ];
    return weakMoments[Math.floor(Math.random() * weakMoments.length)];
  };
  
  // 获取道德困境场景
  const getMoralDilemma = () => {
    const dilemmas = [
      "拯救一人与拯救天下的抉择",
      "坚守正义与保护亲友的冲突",
      "追求力量与保持本心的平衡",
      "遵守规则与打破束缚的矛盾",
      "眼前利益与长远发展的权衡"
    ];
    return dilemmas[Math.floor(Math.random() * dilemmas.length)];
  };
  
   // 防卡死机制 - 增强版，确保游戏不会因为状态异常而卡住
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      // 如果超过5秒没有交互，重置游戏状态
      if (!isGameOver && !showGameGuide && 
          now - lastInteractionTimeRef.current > 5000) {
        console.warn('心魔劫游戏检测到可能的卡死状态，尝试自动恢复...');
        // 重置状态，强制将isProcessing设为false
        setIsProcessing(false);
        lastInteractionTimeRef.current = now;
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [isGameOver, showGameGuide]);
  
   // 处理选择 - 核心逻辑修改，确保游戏能正常结束并调用onComplete
  const handleChoice = useCallback((choiceIndex: number) => {
    // 安全检查：防止快速重复点击
    if (isProcessing && Date.now() - lastInteractionTimeRef.current < 1500) {
      return;
    }
    
    // 更新最后交互时间
    lastInteractionTimeRef.current = Date.now();
    
    // 标记为处理中
    setIsProcessing(true);
    
    // 判断是否选择正确
    const isCorrect = choiceIndex === questions[currentQuestionIndex].correctOptionIndex;
    
    // 更新分数
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // 保存答案数据以便在下一轮使用
    const tempScore = isCorrect ? score + 1 : score;
    
    // 显示选择结果
    const resultTimer = setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      
      if (nextQuestionIndex >= TOTAL_QUESTIONS) {
        // 游戏结束
        setIsGameOver(true);
        
        // 确保游戏能正常结束并调用onComplete
        const finalSuccess = tempScore >= REQUIRED_CORRECT;
        
        // 立即设置显示结果
        setShowResult(true);
        
        // 重置isProcessing状态，确保结果页面的按钮可点击
        setIsProcessing(false);
        
        // 确保onComplete被调用
        const finalTimer = setTimeout(() => {
          try {
            onComplete(finalSuccess);
          } catch (error) {
            console.error('完成心魔劫游戏时出错:', error);
            // 即使出错也强制调用onComplete
            setTimeout(() => {
              onComplete(finalSuccess);
            }, 500);
          }
        }, 2000);
        
        // 在useEffect清理函数中清除此定时器，而不是在这里返回
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        // 进入下一题
        setCurrentQuestionIndex(nextQuestionIndex);
        
        // 立即重置isProcessing状态，确保下一题选项可点击
        setIsProcessing(false);
      }
    }, 1000);
    
    // 保存定时器引用，以便在组件卸载时清除
    timerRef.current = resultTimer as unknown as number;
  }, [currentQuestionIndex, questions, score, onComplete]);
  
  // 获取背景颜色
  const getBackgroundColor = () => {
    const colors = [
      'bg-gradient-to-b from-purple-900/80 via-indigo-900/80 to-blue-900/80',
      'bg-gradient-to-b from-red-900/80 via-purple-900/80 to-black/80',
      'bg-gradient-to-b from-black/80 via-purple-900/80 to-red-900/80',
    ];
    return colors[currentQuestionIndex % colors.length];
  };
  
  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const questionVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };
  
  const choiceVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        delay: i * 0.2
      }
    })
  };
  
  const resultVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8 }
    }
  };
  
  // 游戏引导面板
  const renderGameGuide = () => {
    return (
      <AnimatePresence>
        {showGameGuide && (
          <motion.div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">心魔劫指南</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <i className="fa-solid fa-bullseye text-yellow-400 mr-2"></i>
                    游戏目标
                  </h3>
                  <p className="text-blue-100">面对心魔呈现的过去选择，坚守本心，证明你的道心坚定。</p>
                </div>
                
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <i className="fa-solid fa-list-check text-yellow-400 mr-2"></i>
                    游戏规则
                  </h3>
                  <ul className="list-disc pl-5 text-blue-100 space-y-2">
                    <li>游戏共 {TOTAL_QUESTIONS} 道题目，回顾你曾经的选择</li>
                    <li>答对 {REQUIRED_CORRECT} 道题及以上即可成功通过心魔劫</li>
                    <li>每道题都考验你对自己道心的坚持程度</li>
                  </ul>
                </div>
                
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 flex items-center">
                    <i className="fa-solid fa-exclamation-triangle text-yellow-400 mr-2"></i>
                    注意事项
                  </h3>
                  <p className="text-blue-100">你的道德污点会影响心魔的强度，但真正的考验是你对自己道心的坚持。</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // 更新最后交互时间
                  lastInteractionTimeRef.current = Date.now();
                  setShowGameGuide(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                开始面对心魔
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  // 游戏结束前的清理
  useEffect(() => {
    return () => {
      // 清除所有定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className={`w-full h-full min-h-[600px] min-w-[320px] relative flex flex-col items-center justify-center overflow-hidden ${getBackgroundColor()} p-1 sm:p-2`}>
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? '#a78bfa' : '#c084fc',
              borderRadius: '50%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -Math.random() * 50 - 20],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
      
      {/* 游戏引导 */}
      {renderGameGuide()}
      
      {/* 游戏信息 */}
      {!showGameGuide && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            第 {currentQuestionIndex + 1}/{TOTAL_QUESTIONS} 题
          </div>
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            当前得分: {score}
          </div>
        </div>
      )}
      
      {/* 问题区域 */}
      {!showGameGuide && questions.length > 0 && (
        <motion.div 
          className="text-center mb-10 max-w-md px-4"
          key={currentQuestionIndex}
          initial="hidden"
          animate="visible"
          variants={questionVariants}
        >
          <h2 className="text-2xl font-bold mb-2">心魔劫</h2>
          <p className="text-xl leading-relaxed">
            {questions[currentQuestionIndex].prompt}
          </p>
        </motion.div>
      )}
      
      {/* 选项区域 */}
      {!showGameGuide && !isGameOver && questions.length > 0 && (
         <div className="flex flex-col gap-4 max-w-md w-full px-4">
          {questions[currentQuestionIndex].options.map((option, index) => (
            <motion.button
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={choiceVariants}
              whileHover={!isProcessing ? { scale: 1.05 } : {}}
              whileTap={!isProcessing ? { scale: 0.95 } : {}}
              onClick={() => {
                // 确保点击事件总是能够触发，即使isProcessing为true
                // 这是一个额外的保障措施
                handleChoice(index);
              }}
              disabled={isProcessing}
              className={`bg-gradient-to-r ${option.isGood ? 'from-green-600 to-emerald-600' : 'from-red-600 to-pink-600'} text-white text-lg sm:text-xl py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold shadow-lg hover:shadow-${option.isGood ? 'green' : 'red'}-500/30 transition-all duration-300 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} min-w-[280px]`}
            >
              <div className="flex items-center justify-center">
                <i className={`fa-solid mr-2 ${option.isGood ? 'fa-shield-alt' : 'fa-heart-broken'}`}></i>
                {option.text}
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {/* 道德污点显示 */}
      {!showGameGuide && moralStains.length > 0 && (
        <motion.div 
          className="mt-8 flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {moralStains.map((stain, index) => (
            <span 
              key={index} 
              className="bg-red-900/50 text-red-200 text-xs px-2 py-1 rounded-full flex items-center"
              title="这些记忆会被心魔利用"
            >
              <i className="fa-solid fa-exclamation-circle mr-1 text-red-400"></i>
              {stain}
            </span>
          ))}
        </motion.div>
      )}
      
  {/* 游戏结果 */}
  <AnimatePresence>
    {showResult && (
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4"
        initial="hidden"
        animate="visible"
        variants={resultVariants}
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${score >= REQUIRED_CORRECT ? 'bg-green-600' : 'bg-red-600'}`}>
          <i className={`fa-solid text-4xl ${score >= REQUIRED_CORRECT ? 'fa-check text-white' : 'fa-times text-white'}`}></i>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {score >= REQUIRED_CORRECT ? '心魔劫成功！' : '心魔劫失败！'}
        </h2>
        <p className="text-xl mb-6">得分: {score}/{TOTAL_QUESTIONS}</p>
        
        <div className="w-40 h-2 bg-gray-700 rounded-full mb-6">
          <div 
            className={`h-2 rounded-full ${score >= REQUIRED_CORRECT ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${(score / TOTAL_QUESTIONS) * 100}%` }}
          ></div>
        </div>
        
        <p className="text-blue-300 mb-8 text-center max-w-md">
          {score >= REQUIRED_CORRECT 
            ? '你成功战胜了心魔，道心更加坚定。元婴已成，你的修仙之路更进一步！' 
            : '心魔侵蚀了你的道心，元婴溃散。你需要重新凝结元婴，但这次的失败将成为你宝贵的经验。'}
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // 重置游戏状态，重新开始
              setCurrentQuestionIndex(0);
              setScore(0);
              setIsGameOver(false);
              setShowResult(false);
              setShowGameGuide(true);
              setIsProcessing(false);
              
              // 清除所有定时器
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              // 重新生成问题
              const newQuestions = () => {
                // 从道德污点和心魔幻象中提取关键词，构建更具针对性的问题
                const keyThemes = [demonVision, ...moralStains].filter(Boolean);
                
                // 生成7个问题
                const newQuestions: Array<{
                  prompt: string;
                  options: { text: string; isGood: boolean; explanation: string }[];
                  correctOptionIndex: number;
                  memoryChoiceIndex: number | null;
                }> = [];
                
                // 问题模板 - 基于玩家曾经的选择
                const questionTemplates = [
                  {
                    promptTemplate: "心魔呈现了你曾经的选择：" + getMemoryChoice() + "，你是否还坚持当时的决定？",
                    options: [
                      { text: "初心未改", isGood: true, explanation: "你坚守着自己的道心，不为心魔所惑" },
                      { text: "心生悔意", isGood: false, explanation: "心魔趁虚而入，动摇了你的信念" }
                    ],
                    correctOptionIndex: 0
                  },
                  {
                    promptTemplate: "面对" + keyThemes[0] + "的诱惑，你会如何选择？",
                    options: [
                      { text: "不为所动", isGood: true, explanation: "你的道心坚定如铁，任何诱惑都无法动摇" },
                      { text: "暂时妥协", isGood: false, explanation: "你为了短期利益，偏离了自己的正道" }
                    ],
                    correctOptionIndex: 0
                  },
                  {
                    promptTemplate: "心魔让你回忆起" + getWeakMoment() + "，你是否认为那是正确的选择？",
                    options: [
                      { text: "虽有遗憾，并无后悔", isGood: true, explanation: "你接受过去的自己，更加坚定未来的方向" },
                      { text: "如果重来，我会选择不同的路", isGood: false, explanation: "心魔利用你的悔恨，侵蚀着你的道心" }
                    ],
                    correctOptionIndex: 0
                  },
                  {
                    promptTemplate: "当面对" + getMoralDilemma() + "时，你会坚持怎样的原则？",
                    options: [
                      { text: "坚守本心，无愧天地", isGood: true, explanation: "你遵循内心的正道，不为外界所扰" },
                      { text: "灵活变通，以达成目的", isGood: false, explanation: "你开始为自己的妥协寻找理由" }
                    ],
                    correctOptionIndex: 0
                  },
                  {
                    promptTemplate: "心魔问你：" + demonVision + "，你真的相信自己能够成仙吗？",
                    options: [
                      { text: "我心坚定，必定成功", isGood: true, explanation: "你的信念不可动摇，这正是修仙之道的真谛" },
                      { text: "或许我真的不配", isGood: false, explanation: "心魔的质疑让你开始怀疑自己" }
                    ],
                    correctOptionIndex: 0
                  }
                ];
                
                // 填充问题内容
                for (let i = 0; i < TOTAL_QUESTIONS; i++) {
                  const template = questionTemplates[i % questionTemplates.length];
                  const prompt = template.promptTemplate;
                  
                  newQuestions.push({
                    prompt,
                    options: [...template.options],
                    correctOptionIndex: template.correctOptionIndex,
                    memoryChoiceIndex: null
                  });
                }
                
                return newQuestions;
              };
              setQuestions(newQuestions());
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
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                
                // 调用onComplete并传入一个默认值
                onComplete(false);
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
        
        <div className="text-sm text-gray-400">
          5秒后自动继续...
        </div>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  );
}