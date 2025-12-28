import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { nodeMapping } from '@/data/nodeMapping';

// 定义节点类型
interface StoryNode {
  id: string;
  text: string;
  choices: {
    id: string;
    text: string;
    condition?: (state: any) => boolean;
    conditionText?: string;
    consequence?: (state: any) => void;
    nextNode: string | ((state: any) => string);
  }[];
}

export default function PureStoryText() {
  const { gameState, makeChoice } = useContext(GameContext);
  const navigate = useNavigate();
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [loading, setLoading] = useState(true);

  // 如果没有角色数据，重定向到角色选择
  useEffect(() => {
    if (!gameState.currentCharacter) {
      navigate('/character-select');
    } else {
      // 模拟加载剧情节点数据
      setTimeout(() => {
        // 在实际应用中，这里应该从API或本地数据获取节点内容
        setCurrentNode({
          id: 'story_intro',
          text: '欢迎来到修仙传奇的世界！在这里，你将扮演一位普通少年，踏上修仙之路，历经各种磨难，最终成为一代宗师。\n\n在这个充满奇幻色彩的世界里，你需要做出各种选择，提升自己的实力，结交志同道合的朋友，挑战强大的敌人，最终探寻修仙的真谛。\n\n准备好了吗？你的修仙之旅即将开始！',
          choices: [
            {
              id: 'start_journey',
              text: '开始修仙之旅',
              consequence: (state) => {
                state.age = 16;
                state.resources = {
                  spiritStone: 100,
                  pills: 3,
                  treasures: []
                };
                state.cultivation = {
                  level: 0,
                  stage: 0,
                  experience: 0
                };
              },
              nextNode: 'chapter1_1'
            },
            {
              id: 'learn_more',
              text: '了解更多游戏背景',
              nextNode: 'game_lore'
            },
            {
              id: 'return_to_home',
              text: '返回首页',
              nextNode: 'start'
            }
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [gameState.currentCharacter, navigate]);

   // 处理选择
  const handleChoice = (choiceId: string) => {
    if (!currentNode) return;
    
    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    try {
      makeChoice(choiceId);
    } catch (error) {
      console.error('选择处理失败:', error);
      toast.error('处理选择时发生错误，请稍后再试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl">正在加载剧情...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4 sm:p-6 md:p-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-[url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20scroll%20with%20mystical%20writing%2C%20mountains%20in%20background%2C%20spiritual%20atmosphere&sign=ee3eca06c9233b085e8ac8cf0a28eee3')] bg-cover bg-center"></div>
      </div>
      
      {/* 导航按钮 */}
      <motion.button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 bg-blue-800/70 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fa-solid fa-arrow-left"></i>
      </motion.button>
      
      {/* 角色信息 */}
      {gameState.currentCharacter && (
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-indigo-800/30 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-blue-200">角色</h3>
              <p className="text-xl font-bold">{gameState.currentCharacter.name}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm text-blue-200">年龄</h3>
              <p className="text-xl font-bold">{gameState.currentCharacter.age || 16}岁</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 剧情文本 */}
      <motion.div 
        className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-800/30 shadow-lg min-h-[40vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-lg leading-relaxed whitespace-pre-line">
          {currentNode?.text || '正在加载剧情内容...'}
        </div>
      </motion.div>
      
      {/* 选择项 */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {currentNode?.choices.map((choice, index) => {
          // 检查是否满足条件
          const meetsCondition = !choice.condition || choice.condition(gameState.currentCharacter);
          
          return (
            <motion.button
              key={choice.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChoice(choice.id)}
              className={`w-full text-left p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
                meetsCondition 
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white'
                  : 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-white opacity-70 cursor-not-allowed'
              }`}
              disabled={!meetsCondition}
            >
              <div className="flex items-start">
                <span className={`inline-block w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold ${
                  meetsCondition ? 'bg-blue-500' : 'bg-red-500'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <div className="font-medium">
                    {choice.text}
                    {choice.conditionText && (
                      <span className={`ml-2 text-sm ${
                        meetsCondition ? 'text-green-300' : 'text-red-300'
                      }`}>
                        [{choice.conditionText}]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
      
      {/* 底部信息 */}
      <motion.div 
        className="mt-8 text-center text-blue-200 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <p>修仙传奇 - 踏上属于你的修仙之路</p>
      </motion.div>
    </div>
  );
}