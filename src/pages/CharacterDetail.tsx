import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { characters } from '@/data/characters';
import { GameContext } from '@/contexts/gameContext';
import { toast } from 'sonner';

export default function CharacterDetail() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { startNewGame } = useContext(GameContext);
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载角色数据
  useEffect(() => {
    if (characterId) {
      const selectedCharacter = characters.find(char => char.id === characterId);
      if (selectedCharacter) {
        setCharacter(selectedCharacter);
      } else {
        toast.error('角色不存在');
        navigate('/character-select');
      }
    }
    setIsLoading(false);
  }, [characterId, navigate]);

  // 开始游戏
  const handleStartGame = () => {
    if (character) {
      // 获取角色的初始属性
      const initialAttributes = {
        charm: character.charm,
        comprehension: character.comprehension,
        constitution: character.constitution,
        family: character.family,
        luck: character.luck
      };
      
      // 启动游戏
      startNewGame(character.id);
      
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
  };

  // 返回首页
  const handleBack = () => {
    try {
      navigate('/');
    } catch (error) {
      window.location.href = '/';
    }
  };

  // 准备雷达图数据
  const getRadarData = (character: typeof characters[0]) => {
    return [
      { subject: '魅力', A: character.charm, fullMark: 10 },
      { subject: '悟性', A: character.comprehension, fullMark: 10 },
      { subject: '体质', A: character.constitution, fullMark: 10 },
      { subject: '家境', A: character.family, fullMark: 10 },
      { subject: '气运', A: character.luck, fullMark: 10 },
    ];
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

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-xl">加载角色信息...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white">
        <p className="text-xl">角色不存在</p>
        <button 
          onClick={handleBack} 
          className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
        >
          返回角色选择
        </button>
      </div>
    );
  }

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
      <div className="text-center my-8">
        <motion.h1 
          className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          角色详情
        </motion.h1>
        <p className="text-blue-200">深入了解角色的属性和特点</p>
      </div>

      <div className="container mx-auto px-2 sm:px-4">
        <motion.div 
          className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/50 shadow-xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="text-center mb-6"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              {character.name}
            </h2>
            
             {/* 角色图片 */}
            <div className="w-48 h-48 mx-auto my-6 flex items-center justify-center overflow-hidden rounded-xl border-4 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <img 
                src={character.imageUrl} 
                alt={character.name}
                className="h-full object-contain transform transition-transform duration-700 hover:scale-110"
              />
            </div>
          </motion.div>
          
          {/* 雷达图 */}
          <motion.div 
            className="h-64 mb-8"
            variants={itemVariants}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={getRadarData(character)}>
                <PolarGrid stroke="#8884d8" />
                <PolarAngleAxis dataKey="subject" stroke="#a5b4fc" />
                <PolarRadiusAxis stroke="#a5b4fc" />
                <Radar
                  name={character.name}
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* 角色特点 */}
          <motion.div 
            className="bg-blue-900/30 rounded-lg p-4 mb-8"
            variants={itemVariants}
          >
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-star text-yellow-400"></i>
              角色特点
            </h4>
              <p className="text-blue-100">
                {character.name === '萧炎' && '拥有不屈之魂，会触发遇到药老的专属剧情。当生命值低于一定比例时，触发"不屈之魂"，下回合所有属性判定成功率大幅提升。你将经历"三年之约"的重要剧情。'}
                {character.name === '韩立' && '想体验步步为营、稳健长生的终极智慧吗？稳健行事，注重基础，善于把握机遇，气运=10必定触发"意外发现隐秘药园"的专属事件。'}
                {character.name === '王腾' && '出身豪门，资源丰富，但需要小心应对家族压力和外界觊觎。可选择"亮出家族令牌，威慑其他寻宝者"，家境=10效果最佳。'}
                {character.name === '白小纯' && '怕死、搞事、还能成仙？来体验不一样的修仙喜剧！可选择"在入口处大量布置自爆陷阱"，后续剧情可利用陷阱制造混乱。'}
                {character.name === '徐缺' && '机智幽默，善于化解危机，在社交场合如鱼得水。'}
                {character.name === '李七夜' && '开局满级，无聊到只想找点乐子的无敌流。神秘强大，似乎隐藏着不为人知的过去，对修仙之道有深刻理解。'}
              </p>
          </motion.div>
          
          {/* 属性详情 */}
          <motion.div 
            className="grid grid-cols-1 gap-3 mb-8"
            variants={itemVariants}
          >
            <div className="bg-indigo-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200 flex items-center">
                  <i className="fa-solid fa-heart mr-2 text-red-400"></i>
                  魅力
                </span>
                <span className="font-bold bg-blue-900/50 px-2 py-1 rounded-full">{character.charm}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${character.charm * 10}%` }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">影响社交、招募道侣、获取他人帮助的难度</p>
            </div>
            
            <div className="bg-indigo-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200 flex items-center">
                  <i className="fa-solid fa-brain mr-2 text-purple-400"></i>
                  悟性
                </span>
                <span className="font-bold bg-purple-900/50 px-2 py-1 rounded-full">{character.comprehension}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${character.comprehension * 10}%` }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">影响修炼速度、功法领悟成功率、自创功法的能力</p>
            </div>
            
            <div className="bg-indigo-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200 flex items-center">
                  <i className="fa-solid fa-shield-alt mr-2 text-green-400"></i>
                  体质
                </span>
                <span className="font-bold bg-green-900/50 px-2 py-1 rounded-full">{character.constitution}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${character.constitution * 10}%` }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">影响生命值、物理攻击防御力、对毒素与疾病的抗性</p>
            </div>
            
            <div className="bg-indigo-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200 flex items-center">
                  <i className="fa-solid fa-coins mr-2 text-yellow-400"></i>
                  家境
                </span>
                <span className="font-bold bg-yellow-900/50 px-2 py-1 rounded-full">{character.family}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${character.family * 10}%` }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">影响初始资源、获取灵石与法宝的难度、宗门背景，每回合获得的灵石也会增加</p>
            </div>
            
            <div className="bg-indigo-800/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-200 flex items-center">
                  <i className="fa-solid fa-star mr-2 text-pink-400"></i>
                  气运
                </span>
                <span className="font-bold bg-pink-900/50 px-2 py-1 rounded-full">{character.luck}/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${character.luck * 10}%` }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">影响触发隐藏剧情的概率、绝境逢生的可能性、奇遇频率</p>
            </div>
          </motion.div>
          
          {/* 开始游戏按钮 */}
          <motion.button 
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            确认选择，开始游戏
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}