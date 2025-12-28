import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { characters } from '@/data/characters';
import { GameContext } from '@/contexts/gameContext';
import { toast } from 'sonner';

export default function CharacterSelect() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const { startNewGame, isCharacterUnlocked, unlockCharacter, gameState } = useContext(GameContext);
  const navigate = useNavigate();
  const [characterDetails, setCharacterDetails] = useState<{[key: string]: boolean}>({});

  // 获取初始解锁状态
  useEffect(() => {
    const unlockedStatus: {[key: string]: boolean} = {};
    characters.forEach(character => {
      unlockedStatus[character.id] = isCharacterUnlocked(character.id);
    });
    setCharacterDetails(unlockedStatus);
  }, [isCharacterUnlocked]);

  // 处理角色选择 - 导航到角色详情页面
  const handleCharacterSelect = (characterId: string) => {
    // 检查角色是否已解锁
    if (isCharacterUnlocked(characterId)) {
      setSelectedCharacter(characterId);
      navigate(`/character-detail/${characterId}`);
    } else {
      // 显示解锁提示
      const character = characters.find(char => char.id === characterId);
      if (character && character.unlockPoints) {
        showUnlockPrompt(character);
      }
    }
  };

  // 显示解锁提示
  const showUnlockPrompt = (character: any) => {
    // 创建一个模态框
    const isConfirmed = window.confirm(
      `是否花费 ${character.unlockPoints} 成就点解锁角色 ${character.name}？\n\n` +
      `角色特点：\n` +
      `魅力: ${character.charm}\n` +
      `悟性: ${character.comprehension}\n` +
      `体质: ${character.constitution}\n` +
      `家境: ${character.family}\n` +
      `气运: ${character.luck}`
    );
    
    if (isConfirmed) {
      const success = unlockCharacter(character.id);
      if (success) {
        // 更新解锁状态
        setCharacterDetails(prev => ({
          ...prev,
          [character.id]: true
        }));
        
        // 自动选择刚解锁的角色
        setSelectedCharacter(character.id);
        navigate(`/character-detail/${character.id}`);
      }
    }
  };

  // 开始游戏 - 直接从角色选择页面也可以开始游戏
  const handleStartGame = () => {
    if (selectedCharacter) {
      // 获取角色的初始属性
      const character = characters.find(char => char.id === selectedCharacter);
      if (character) {
        // 在启动游戏前将初始属性保存到角色状态中
        const initialAttributes = {
          charm: character.charm,
          comprehension: character.comprehension,
          constitution: character.constitution,
          family: character.family,
          luck: character.luck
        };
        
        // 启动游戏
        startNewGame(selectedCharacter);
        
        // 保存初始属性到localStorage，以便结局页面可以访问
        setTimeout(() => {
          try {
            const gameState = JSON.parse(localStorage.getItem('xiuxian_game_state') || '{}');
            if (gameState.currentCharacter) {
              gameState.currentCharacter.initialAttributes = initialAttributes;
              localStorage.setItem('xiuxian_game_state', JSON.stringify(gameState));
            }
          } catch (error) {
            console.error('保存初始属性失败:', error);
          }
        }, 100);
        
        navigate('/story-flow');
      }
    } else {
      toast.error('请先选择一个角色');
    }
  };

  // 返回主页
  const handleBack = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  // 卡片动画变体
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.03,
      boxShadow: '0 10px 30px rgba(147, 197, 253, 0.3)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-2 sm:p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* 背景图片 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20temple%20with%20spiritual%20energy%2C%20mountains%20in%20background%2C%20misty%20atmosphere&sign=7f3f0d812b43d9ab535562cf67de61ed')] bg-cover bg-center opacity-20"></div>
        
        {/* 动态光晕效果 */}
        <motion.div 
          className="absolute top-1/3 left-1/2 w-[600px] h-[600px] rounded-full bg-blue-700/20 blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
      </motion.div>

      {/* 返回按钮 */}
      <motion.button 
        onClick={handleBack} 
        className="absolute top-4 left-4 bg-blue-800 hover:bg-blue-700 p-2 rounded-full shadow-lg transition-all duration-300 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </motion.button>

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          选择你的角色
        </h1>
        <p className="text-blue-200">每个角色都有独特的属性和天赋，点击查看详情</p>
        
        {/* 显示当前成就点 */}
        <div className="mt-4 bg-green-900/30 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-green-800/50 shadow-lg">
          <p className="text-green-200 flex items-center">
            <i className="fa-solid fa-star mr-2 text-green-400"></i>
            成就点: {gameState.achievementPoints}
          </p>
        </div>
      </div>

     <div className="container mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character, index) => {
          const isUnlocked = isCharacterUnlocked(character.id);
          return (
            <motion.div
              key={character.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover="hover"
              onClick={() => handleCharacterSelect(character.id)}
              className={`relative overflow-hidden rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                selectedCharacter === character.id ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 
                isUnlocked ? 'border-transparent' : 'border-gray-700 opacity-70'
              }`}
            >
             {/* 角色图片 */}
            <div className={`h-48 flex items-center justify-center overflow-hidden bg-gray-900/50 ${!isUnlocked ? 'filter grayscale' : ''}`}>
              <img 
                src={character.imageUrl} 
                alt={character.name}
                className="h-full object-contain transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            
            {/* 角色信息覆盖层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{character.name}</h3>
                
                {/* 锁图标 - 未解锁角色显示 */}
                {!isUnlocked && character.unlockPoints !== undefined && (
                  <div className="bg-yellow-900/80 text-yellow-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <i className="fa-solid fa-lock"></i>
                    {character.unlockPoints}点
                  </div>
                )}
              </div>
              
              {/* 角色预告 */}
              <div className="bg-blue-900/50 rounded-lg p-1.5 mb-2 text-xs text-blue-200">
                {character.name === '韩立' && '想体验步步为营、稳健长生的终极智慧吗？'}
                {character.name === '白小纯' && '怕死、搞事、还能成仙？来体验不一样的修仙喜剧！'}
                {character.name === '李七夜' && '开局满级，无聊到只想找点乐子的无敌流。'}
                {character.name === '萧炎' && '拥有不屈之魂，经历三年之约，收集异火成就最强之路！'}
                {character.name === '王腾' && '豪门子弟，资源丰富，小心应对家族压力和外界觊觎。'}
                {character.name === '徐缺' && '机智幽默，善于化解危机，在社交场合如鱼得水。'}
              </div>
              
               {/* 简要属性信息 */}
               <div className="flex flex-wrap gap-1.5 mt-1">
                 <span className="text-xs bg-blue-900/50 px-1.5 py-0.5 rounded-full">
                   魅力: {character.charm}
                 </span>
                 <span className="text-xs bg-purple-900/50 px-1.5 py-0.5 rounded-full">
                   悟性: {character.comprehension}
                 </span>
                 <span className="text-xs bg-green-900/50 px-1.5 py-0.5 rounded-full">
                   体质: {character.constitution}
                 </span>
                 <span className="text-xs bg-yellow-900/50 px-1.5 py-0.5 rounded-full">
                   家境: {character.family}
                 </span>
                 <span className="text-xs bg-pink-900/50 px-1.5 py-0.5 rounded-full">
                   气运: {character.luck}
                 </span>
               </div>
              
              {/* 选中指示器 */}
              {selectedCharacter === character.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <i className="fa-solid fa-check text-white text-xs"></i>
                </div>
              )}
              
              {/* 查看详情提示 */}
              <div className="absolute top-2 left-2 bg-blue-900/70 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <i className="fa-solid fa-info-circle text-blue-300"></i>
                <span>{isUnlocked ? '点击查看详情' : '点击解锁'}</span>
              </div>
            </div>
           </motion.div>
          );
        })}
       </div>
       
       {/* 确认选择按钮 - 移到页面顶部 */}
       {selectedCharacter && (
         <motion.div
           className="mt-4 flex justify-center"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
         >
           <button 
             onClick={handleStartGame}
             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
           >
             确认选择，开始游戏
           </button>
         </motion.div>
       )}
    </div>
    </div>
  );
}