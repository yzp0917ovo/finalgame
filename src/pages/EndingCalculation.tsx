import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '@/contexts/gameContext';
import { cultivationLevels, cultivationStages } from '@/data/characters';
import { toast } from 'sonner';
import { nodeMapping } from '@/data/nodeMapping';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EndingCalculation() {
  const { gameState, resetGame } = useContext(GameContext);
  const navigate = useNavigate();
  const [finalScore, setFinalScore] = useState(0);
  const [achievementRate, setAchievementRate] = useState(0);
  const [levelData, setLevelData] = useState<{name: string, value: number}[]>([]);
  const [isDeathEnding, setIsDeathEnding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 添加加载状态标志

  useEffect(() => {
    // 监听游戏结束事件
    const handleGameEnded = () => {
      // 当接收到游戏结束事件时，强制重新加载数据
      if (gameState.currentCharacter) {
        calculateFinalScore();
        calculateAchievementRate();
        prepareChartData();
        setIsLoaded(true);
      }
    };
    
    // 立即检查并加载数据
    const loadData = () => {
      if (!gameState.currentCharacter) {
        // 角色数据不存在，显示加载状态并等待
        setIsLoaded(false);
        return;
      }

      // 检查是否为死亡结局
      if (gameState.currentCharacter.isDeathEnding) {
        setIsDeathEnding(true);
      }

      // 计算最终得分
      calculateFinalScore();
      
      // 计算成就完成率
      calculateAchievementRate();
      
      // 准备图表数据
      prepareChartData();
      
      // 标记页面已加载
      setIsLoaded(true);
    };

    // 立即调用一次加载数据
    loadData();
    
    // 添加事件监听器
    window.addEventListener('gameEnded', handleGameEnded);
    
    // 添加一个定时器，定期检查游戏状态是否更新
    const checkInterval = setInterval(() => {
      if (gameState.currentCharacter && !isLoaded) {
        loadData();
      }
    }, 500);
    
    return () => {
      window.removeEventListener('gameEnded', handleGameEnded);
      clearInterval(checkInterval);
    };
  }, [gameState, isLoaded, navigate]);

  // 计算最终得分
  const calculateFinalScore = () => {
    if (!gameState.currentCharacter) return;
    
    const character = gameState.currentCharacter;
    
    // 基础分数计算
    let score = 0;
    
    // 修为等级分数 (每级100分)
    score += (character.cultivation.level * 100);
    
    // 阶段加成 (每阶段20分)
    score += (character.cultivation.stage * 20);
    
    // 属性分数 (每个属性最高10分)
    const attributeScore = Math.floor(
      (character.charm + 
       character.comprehension + 
       character.constitution + 
       character.family + 
       character.luck) / 5
    );
    score += attributeScore;
    
    // 年龄分数 (活得越久分数越高)
    score += Math.floor(character.age / 10);
    
    // 资源分数 (每100灵石1分)
    score += Math.floor((character.resources?.spiritStone || 0) / 100);
    
    // 宝物加成 (每个宝物5分)
    score += (character.resources?.treasures?.length || 0) * 5;
    
    // 成就加成 (每个成就20分)
    score += (gameState.unlockedAchievements?.length || 0) * 20;
    
    // 选择次数加成 (每个重要选择1分)
    score += (character.choices?.length || 0);
    
    setFinalScore(score);
  };

  // 计算成就完成率
  const calculateAchievementRate = () => {
    // 这里简化处理，实际项目中应该根据实际成就数量计算
    const totalAchievements = 50; // 假设总共有50个成就
    const unlockedAchievements = gameState.unlockedAchievements?.length || 0;
    const rate = Math.min(100, Math.round((unlockedAchievements / totalAchievements) * 100));
    setAchievementRate(rate);
  };

  // 准备图表数据
  const prepareChartData = () => {
    if (!gameState.currentCharacter) return;
    
    const character = gameState.currentCharacter;
    
    const data = [
      { name: '魅力', value: character.charm },
      { name: '悟性', value: character.comprehension },
      { name: '体质', value: character.constitution },
      { name: '家境', value: character.family },
      { name: '气运', value: character.luck }
    ];
    
    setLevelData(data);
  };

  // 获取角色的主要成就
  const getMajorAchievements = () => {
    if (!gameState.currentCharacter) return [];
    
    const character = gameState.currentCharacter;
    const achievements: {title: string, description: string, icon: string}[] = [];
    
    // 根据修为等级添加成就
    if (character.cultivation.level >= 5) {
      achievements.push({
        title: '元婴真君',
        description: '成功突破至元婴境界，成为一方强者',
        icon: 'fa-user-graduate'
      });
    }
    
    if (character.cultivation.level >= 9) {
      achievements.push({
        title: '大乘期',
        description: '达到修仙界金字塔顶端，俯瞰芸芸众生',
        icon: 'fa-crown'
      });
    }
    
    // 根据特殊标签添加成就
    if (character.tags?.includes('无瑕元婴')) {
      achievements.push({
        title: '道心无暇',
        description: '保持纯净的心性，不受心魔侵扰',
        icon: 'fa-heart'
      });
    }
    
    if (character.tags?.includes('天命之子')) {
      achievements.push({
        title: '天命所归',
        description: '气运加身，福缘深厚',
        icon: 'fa-star'
      });
    }
    
    // 根据选择添加成就
    if (character.choices?.includes('击败碧磷蟒')) {
      achievements.push({
        title: '秘境勇士',
        description: '在血色禁地中击败强大的碧磷蟒',
        icon: 'fa-dragon'
      });
    }
    
    return achievements.slice(0, 5); // 只显示前5个主要成就
  };

  // 获取角色的修仙之路总结
  const getJourneySummary = () => {
    if (!gameState.currentCharacter) return '';
    
    const character = gameState.currentCharacter;
    let summary = '';
    
    // 根据不同的结局类型生成不同的总结
    if (isDeathEnding) {
      return `虽然你的修仙之路在此终止，但你的故事将被后世铭记。你享年${character.age}岁，达到了${cultivationLevels[character.cultivation.level]}${cultivationStages[character.cultivation.stage]}的境界。你的名字将成为后来者的警示或激励。`;
    }
    
    // 正常结局总结
    summary = `${character.name}，你从一名普通少年开始，历经无数磨难，最终达到了${cultivationLevels[character.cultivation.level]}${cultivationStages[character.cultivation.stage]}的境界。`;
    
    if (character.cultivation.level >= 5) {
      summary += ' 你的元神已成，可遨游天地，翻山倒海。';
    }
    
    if (character.cultivation.level >= 9) {
      summary += ' 你已站在修仙界的巅峰，距离飞升仙界仅有一步之遥。';
    }
    
        summary += ` 在你的修仙之路上，你做出了${character.choices?.length || 0}个重要选择，获得了${character.resources?.treasures?.length || 0}件宝物，结交了许多朋友，也树立了一些敌人。`;
      
        // 添加突破大境界的信息
        if (character.choices && character.choices.length > 0) {
          const breakthroughs = character.choices.filter((choice: string) => choice.includes('突破至'));
          if (breakthroughs.length > 0) {
            summary += `\n\n你的突破历程：`;
            breakthroughs.forEach((breakthrough: string) => {
              summary += `\n• ${breakthrough}`;
            });
          }
        }
        
        // 添加关键抉择信息
        if (character.choices && character.choices.length > 0) {
          const keyChoices = character.choices.filter((choice: string) => 
            choice.includes('选择') || choice.includes('决定') || choice.includes('击败') || choice.includes('获得')
          ).slice(-5); // 只显示最近5个
          
          if (keyChoices.length > 0) {
            summary += `\n\n你的关键抉择：`;
            keyChoices.forEach((choice: string) => {
              summary += `\n• ${choice}`;
            });
          }
        }
     
       summary += `\n\n你享年${character.age}岁，在修仙界留下了属于自己的传奇。`;
    
    return summary;
  };

  // 重新开始游戏
  const handleRestart = () => {
    resetGame();
    navigate('/character-select');
  };

  // 返回首页
  const handleReturnHome = () => {
    navigate('/');
  };

  // 显示加载状态
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">结算中...</h1>
        <p className="text-blue-300">正在为您生成修仙总结</p>
      </div>
    );
  }

  // 确保角色数据存在
  if (!gameState.currentCharacter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">数据加载失败</h1>
        <button 
          onClick={() => navigate('/character-select')}
          className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-lg transition-colors"
        >
          返回角色选择
        </button>
      </div>
    );
  }

  const character = gameState.currentCharacter;
  const majorAchievements = getMajorAchievements();
  const journeySummary = getJourneySummary();

   // 确定结局标题和描述
  let endingTitle = '';
  let endingDescription = '';
  let endingImageUrl = '';

  if (isDeathEnding) {
    endingTitle = '壮志未酬';
    endingDescription = '虽然未能达成最终目标，但你的修仙之路充满传奇色彩。后世修士将你的故事作为激励，你的名字永载史册。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=fallen%20hero%2C%20comet%20falling%2C%20sky%20weeping%2C%20mourning%20atmosphere&sign=bc8b19b05581c9633ed71edda90c67ca';
  } else if (character.tags?.includes('追求仙道') || character.choices?.includes('选择飞升') || character.choices?.includes('ending_ascension') || character.tags?.includes('独自飞升')) {
    endingTitle = '白日飞升';
    endingDescription = '你成功渡过了天劫，破碎虚空，飞升仙界。你的名字将永远铭刻在修仙界的历史长河中，成为无数修士向往的传说。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ascending%20to%20heaven%2C%20celestial%20light%2C%20wings%20of%20light%2C%20heavenly%20palace%20in%20distance&sign=3564c97335e45d5158daf32754bfd247';
  } else if (character.tags?.includes('统治者') || character.choices?.includes('建立新秩序') || character.choices?.includes('ending_unification') || character.tags?.includes('功德无量')) {
    endingTitle = '一代至尊';
    endingDescription = '你统合了修仙界的所有势力，建立了自己的秩序。千年后，你的雕像屹立在各大宗门，被尊为"混元天尊"，受万人敬仰。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=emperor%20of%20cultivators%2C%20throne%20of%20power%2C%20subjects%20bowing%2C%20divine%20aura&sign=4cd9a5830255db6b4d7772ca0f36516b';
  } else if (character.tags?.includes('守护者') || character.choices?.includes('封印飞升台') || character.choices?.includes('ending_protector') || character.tags?.includes('人间守护')) {
    endingTitle = '永恒守护';
    endingDescription = '你牺牲了自己的飞升机会，选择永远守护这个世界。你的精神与天地融为一体，成为了不朽的传说。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=hero%20sealing%20evil%2C%20temple%20with%20incense%2C%20people%20worshipping%2C%20eternal%20guardian&sign=2e5796cb27e36cdaaf337687e9c6e320';
  } else if (character.tags?.includes('散仙之路') || character.choices?.includes('ending_reincarnation') || character.tags?.includes('前世散仙')) {
    endingTitle = '转世重修';
    endingDescription = '你选择了转修散仙之路，虽未能立即飞升，但保留了记忆与希望。在未来的岁月里，你将以新的身份继续你的修仙之旅。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=soul%20reincarnation%2C%20new%20beginning%2C%20spiritual%20cycle%2C%20hope%20for%20future&sign=9cf12e3a8b4f2ca378426103540b4587';
  } else {
    endingTitle = '江湖传说';
    endingDescription = '虽然未能达成最终目标，但你的修仙之路充满传奇色彩。后世修士将你的故事作为激励，你的名字永载史册。';
    endingImageUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=legendary%20hero%20story%2C%20ancient%20scrolls%2C%20hero%20tale%2C%20legacy&sign=c9a0f822f499df22ec549f47b0ad93cc';
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4 sm:p-6">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${endingImageUrl})` }}
        ></div>
      </div>

      {/* 标题 */}
      <motion.div 
        className="text-center my-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          修仙传奇
        </h1>
        <p className="text-xl text-blue-200">结局结算</p>
      </motion.div>

      <div className="container mx-auto max-w-5xl">
        {/* 最终结局 */}
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4">{endingTitle}</h2>
          <p className="text-lg text-blue-200 leading-relaxed mb-6">
            {endingDescription}
          </p>
          
          {/* 角色信息卡片 */}
          <div className="bg-blue-900/30 rounded-lg p-5 border border-blue-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold mb-2">{character.name}</h3>
                <p className="text-blue-200 mb-4">{journeySummary}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-300 mb-1">修为境界</p>
                    <p className="text-lg font-bold">{cultivationLevels[character.cultivation.level]}{cultivationStages[character.cultivation.stage]}</p>
                  </div>
                  <div className="bg-blue-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-300 mb-1">享年</p>
                    <p className="text-lg font-bold">{character.age}岁</p>
                  </div>
                  <div className="bg-blue-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-300 mb-1">灵石</p>
                    <p className="text-lg font-bold">{character.resources?.spiritStone || 0}</p>
                  </div>
                  <div className="bg-blue-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-300 mb-1">宝物</p>
                    <p className="text-lg font-bold">{character.resources?.treasures?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center">
                <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full w-32 h-32 flex items-center justify-center mb-4 shadow-lg shadow-yellow-600/20">
                  <p className="text-4xl font-bold">{finalScore}</p>
                </div>
                <p className="text-center text-lg font-medium">最终得分</p>
                <p className="text-center text-sm text-blue-300">综合评分</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 成就与属性 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 达成的成就 */}
          <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/30 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">达成的成就</h2>
              <div className="bg-yellow-800/50 text-yellow-100 px-3 py-1 rounded-full text-sm">
                {achievementRate}% 完成
              </div>
            </div>
            
            <div className="space-y-3">
              {majorAchievements.length > 0 ? (
                majorAchievements.map((achievement, index) => (
                  <motion.div 
                    key={index}
                    className="bg-blue-900/30 rounded-lg p-3 flex items-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="bg-yellow-700/50 p-2 rounded-full mr-3 flex-shrink-0">
                      <i className={`fa-solid ${achievement.icon} text-yellow-300`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold">{achievement.title}</h3>
                      <p className="text-sm text-blue-200">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-6">暂无达成的成就</p>
              )}
            </div>
            
            {gameState.unlockedAchievements && gameState.unlockedAchievements.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-300">
                  共解锁 {gameState.unlockedAchievements.length} 个成就
                </p>
              </div>
            )}
          </motion.div>

          {/* 属性图表 */}
          <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/30 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6">属性成长</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData}>
                  <XAxis dataKey="name" stroke="#93c5fd" />
                  <YAxis stroke="#93c5fd" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderColor: '#4f46e5',
                      borderRadius: '0.5rem',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 初始vs最终属性对比 */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">属性对比</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>魅力</span>
                    <span>{character.initialAttributes?.charm || 5} → {character.charm}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-500" 
                      style={{ width: `${(character.charm / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>悟性</span>
                    <span>{character.initialAttributes?.comprehension || 5} → {character.comprehension}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500" 
                      style={{ width: `${(character.comprehension / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>体质</span>
                    <span>{character.initialAttributes?.constitution || 5} → {character.constitution}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500" 
                      style={{ width: `${(character.constitution / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 修仙生涯 */}
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6">修仙生涯</h2>
          
          <div className="space-y-6">
            {/* 重要里程碑 */}
            <div>
              <h3 className="text-lg font-bold mb-3">重要里程碑</h3>
              <div className="relative">
                {/* 连接线 */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-700/50"></div>
                
                {/* 里程碑事件 */}
                {character.choices && character.choices.length > 0 ? (
                  character.choices
                    .filter((choice: string) => choice.includes('突破至') || choice.includes('击败') || choice.includes('获得') || choice.includes('成为'))
                    .slice(-8)
                    .map((choice, index) => (
                      <motion.div 
                        key={index} 
                        className="flex mb-4 relative"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center z-10 mt-1"></div>
                        <div className="ml-6 bg-blue-900/30 rounded-lg p-3 flex-grow">
                          <p>{choice}</p>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <p className="text-center text-gray-400 py-6">暂无重要里程碑</p>
                )}
              </div>
            </div>
            
            {/* 宝物展示 */}
            {character.resources?.treasures && character.resources.treasures.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">获得的宝物</h3>
                <div className="flex flex-wrap gap-3">
                  {character.resources.treasures.slice(-8).map((treasure, index) => (
                    <motion.div 
                      key={index}
                      className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50 flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                    >
                      <div className="flex items-center">
                        <i className="fa-solid fa-gem text-yellow-400 mr-2"></i>
                        <span>{treasure}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(147, 197, 253, 0.5)',
            }}
            onClick={handleRestart}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex-1 sm:flex-none"
          >
            重新开始
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 25px rgba(167, 139, 250, 0.5)',
            }}
            onClick={handleReturnHome}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex-1 sm:flex-none"
          >
            返回首页
          </motion.button>
        </motion.div>
      </div>

      {/* 页脚 */}
      <motion.div 
        className="mt-12 text-center text-blue-300 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <p>修仙传奇 - 踏上属于你的修仙之路</p>
      </motion.div>
    </div>
  );
}