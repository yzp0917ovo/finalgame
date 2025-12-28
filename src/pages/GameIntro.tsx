import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cultivationLevels, getLevelDescription, getMaxAgeForCultivation } from '@/data/characters';
import StoryRecap from '@/components/StoryRecap';
import { treasures } from '@/data/treasures';

export default function GameIntro() {
  const navigate = useNavigate();
  const [showStoryRecap, setShowStoryRecap] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

    // 返回主页
  const handleBack = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };
  
  // 前往角色选择
  const navigateToCharacterSelect = () => {
    // 为了让新用户能体验完整剧情，清除可能的旧存档
    localStorage.removeItem('xiuxian_game_state');
    navigate('/character-select');
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7 }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  // 显示炼丹系统指南
  const handleShowAlchemyGuide = () => {
    try {
      // 导航到游戏说明页面
      navigate('/game-intro');
      // 显示提示信息
      setTimeout(() => {
        toast.info('炼丹系统是游戏中的重要玩法，可以帮助你提升修为和属性！', {
          duration: 6000,
          position: 'top-center',
          style: {
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
          }
        });
      }, 500);
    } catch (error) {
      console.error('Navigation error:', error);
      // 显示备用提示
      toast.info('炼丹系统是游戏中的重要玩法，可以帮助你提升修为和属性！', {
        duration: 6000,
        position: 'top-center',
        style: {
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-1 sm:p-2 md:p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 背景图片 */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20scroll%20with%20mystical%20writing%2C%20mountains%20in%20background%2C%20spiritual%20atmosphere&sign=ee3eca06c9233b085e8ac8cf0a28eee3')] bg-cover bg-center opacity-15"></div>
        
        {/* 动态光晕效果 */}
        <motion.div 
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[80px]"
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

      <motion.div 
        className="flex-grow flex flex-col items-center justify-center max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 标题 */}
        <motion.div 
          className="text-center mb-12"
          variants={titleVariants}
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            修仙传奇
          </h1>
          <p className="text-xl text-blue-200">游戏介绍</p>
        </motion.div>

        {/* 游戏概述 */}
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-book-open text-blue-300"></i>
            游戏概述
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            《修仙传奇》是一款基于选项的交互式文字剧情游戏，融合了角色养成、属性判定与分支叙事元素。玩家将扮演一位踏上修仙之路的少年，通过各种选择和修炼，最终成为一代宗师或羽化登仙。
          </p>
          <p className="text-lg leading-relaxed">
            游戏的核心是玩家的选择与角色的初始属性共同决定剧情走向、修炼速度和最终结局。每个选择都可能影响你的修仙之路，甚至改变你的命运。
          </p>
        </motion.div>

        {/* 角色系统 */}
        <motion.div 
          className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-blue-300"></i>
            角色系统
          </h2>
          <p className="text-lg leading-relaxed mb-4">
            游戏提供了6位具有不同背景和天赋的角色供玩家选择，每位角色都有独特的初始属性和专属天赋：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-1">萧炎</h3>
              <p className="text-sm text-blue-200">逆袭爆发流：出自《斗破苍穹》，拥有成为斗帝的潜力，与神秘的药老有着不解之缘</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-1">韩立</h3>
              <p className="text-sm text-blue-200">稳健发育流：出自《凡人修仙传》，性格谨慎、坚韧，一步步从凡人修炼至仙尊</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-1">王腾</h3>
              <p className="text-sm text-blue-200">资源反噬流：出自《完美世界》，号称"古帝之都"的年轻至尊，自负而强大</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-1">白小纯</h3>
              <p className="text-sm text-blue-200">诡道破局流：出自《一念永恒》，表面胆小怕死，实则聪明机智，擅长炼丹与保命</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-1">徐缺</h3>
              <p className="text-sm text-blue-200">装逼打脸流：出自《最强反套路系统》，喜欢装逼，擅长吟诗作词，以打脸反派为乐</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">李七夜</h3>
               <p className="text-sm text-blue-200">满级大佬流：出自《帝霸》，被称为"万古第一帝"，拥有无数身份与强大的背景</p>
            </div>
          </div>
        </motion.div>

         {/* 属性系统 */}
         <motion.div 
           className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
           variants={itemVariants}
         >
           <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
             <i className="fa-solid fa-chart-line text-blue-300"></i>
             属性系统
           </h2>
           <p className="text-lg leading-relaxed mb-4">
             游戏中的角色拥有五种核心属性，这些属性会影响你的修炼之路和剧情发展：
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">魅力</h3>
               <p className="text-sm text-blue-200">影响社交、招募道侣、获取他人帮助的难度</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">悟性</h3>
               <p className="text-sm text-blue-200">影响修炼速度、功法领悟成功率、自创功法的能力</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">体质</h3>
               <p className="text-sm text-blue-200">影响生命值、物理攻击防御力、对毒素与疾病的抗性</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">家境</h3>
               <p className="text-sm text-blue-200">影响初始资源、获取灵石与法宝的难度、宗门背景</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">生命值</h3>
               <p className="text-sm text-blue-200">角色当前的健康状态，生命值归零会导致游戏结束。体质越高，生命值上限越高</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4">
               <h3 className="font-bold mb-1">阶段</h3>
               <p className="text-sm text-blue-200">每个境界内的细分层次，分为初期、中期、后期、大圆满四个阶段，影响实力强弱和突破难度</p>
             </div>
             <div className="bg-blue-900/30 rounded-lg p-4 col-span-1 sm:col-span-2">
               <h3 className="font-bold mb-1">气运</h3>
               <p className="text-sm text-blue-200">影响触发隐藏剧情的概率、绝境逢生的可能性、奇遇频率</p>
             </div>
           </div>
         </motion.div>

            {/* 修为境界 */}
            <motion.div 
              className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-indigo-800/30 shadow-lg"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-crown text-blue-300"></i>
                修为境界
              </h2>
              <p className="text-lg leading-relaxed mb-4">
                修仙之路分为十大境界，每个境界又分为初、中、后、大圆满四个阶段：
              </p>
              {/* 基础境界（凡人到化神） */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-center">基础境界</h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {cultivationLevels.slice(0, 6).map((level, index) => {
                    const ageLimits = [
                      100,  // 凡人
                      200,  // 练气
                      500,  // 筑基
                      1000, // 结丹
                      2000, // 金丹
                      5000  // 元婴
                    ];
                    return (
                    <span 
                      key={index} 
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        index < 3 
                          ? 'bg-blue-800/50 text-blue-100' 
                          : 'bg-purple-800/50 text-purple-100' 
                      }`}
                      title={`${getLevelDescription(index)} (寿元上限: ${ageLimits[index]}年)`}
                    >
                      {level}
                    </span>
                  );})}
                </div>
              </div>
              
              {/* 高级境界（化神到大乘） */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-center">高级境界</h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {cultivationLevels.slice(5, 10).map((level, index) => {
                    const ageLimits = [
                      5000,  // 元婴
                      10000, // 炼虚
                      20000, // 合体
                      50000, // 渡劫
                      100000 // 大乘
                    ];
                    return (
                    <span 
                      key={index + 5} 
                      className={`px-3 py-2 rounded-lg text-sm font-medium bg-indigo-800/50 text-indigo-100`}
                      title={`${getLevelDescription(index + 5)} (寿元上限: ${ageLimits[index]}年)`}
                    >
                      {level}
                    </span>
                  );})}
                </div>
              </div>
              
              {/* 终极境界 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-center">终极境界</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {['金仙', '道祖', '概念存在'].map((level, index) => (
                    <span 
                      key={`ultimate-${index}`} 
                      className="bg-yellow-800/50 text-yellow-100 px-3 py-2 rounded-lg text-sm font-medium"
                      title={`超越大乘的传说境界，寿元无尽`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 境界阶段 */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['初期', '中期', '后期', '大圆满'].map((stage, index) => (
                  <span 
                    key={index} 
                    className="bg-yellow-800/50 text-yellow-100 px-3 py-1 rounded-full text-sm"
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </motion.div>

        {/* 开始游戏按钮 */}
        <motion.button
        variants={itemVariants}
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 25px rgba(147, 197, 253, 0.5)',
        }}
        onClick={() => navigate('/character-select')}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
      >
        开始游戏
      </motion.button>
       </motion.div>

        {/* 剧情回顾按钮 */}
     <motion.button
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 8px 25px rgba(167, 139, 250, 0.5)',
          }}
           onClick={() => {
            navigate('/story-recap');
            setTimeout(() => {
              toast.info('请点击"导出JSON"按钮获取标准化第一章模块');
            }, 500);
          }}
          className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          data-story-recap-trigger
         >
           剧情回顾与JSON导出
         </motion.button>

      {/* 攻略选项 */}
      <motion.div 
        className="mt-8 text-center"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        <button
          onClick={() => navigate('/achievements')}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
        >
          查看成就攻略
        </button>
        <p className="mt-2 text-sm text-blue-200">了解如何解锁所有成就和触发隐藏剧情</p>
       </motion.div>

       {/* 开发者名单 */}
      <motion.div 
        className="mt-12 bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/30 shadow-lg max-w-md mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <h3 className="text-xl font-bold mb-4">制作团队</h3>
        <div className="space-y-2 text-sm">
          <p>po＋sm：RES23018陈佳瑶</p>
          <p>开发：ACH22031殷展鹏，CST22057高歌</p>
          <p>设计：SWE23018林博航，SWE23039杨亿福</p>
          <p>市场文案广告：SWE23023黄嘉定</p>
        </div>
      </motion.div>

       {/* 从StoryFlow页面触发剧情回顾和图鉴的事件监听 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // 剧情回顾触发
          window.addEventListener('showStoryRecap', () => {
            try {
              // 使用try-catch确保即使出错也不会中断其他操作
              window.location.href = '/story-recap';
            } catch (error) {
              console.log('导航到剧情回顾页面失败，尝试备用方案');
              // 备用方案：显示一个提示让用户手动点击
              alert('请点击"剧情回顾"按钮查看完整剧情');
            }
          });
          
          // 游戏图鉴触发
          window.addEventListener('showGameCompendium', () => {
            try {
              const triggerButton = document.querySelector('[data-compendium-trigger]');
              if (triggerButton) {
                triggerButton.click();
              } else {
                // 如果按钮不存在，显示一个提示
                alert('请点击"查看游戏图鉴"按钮查看游戏内容');
              }
            } catch (error) {
              console.log('打开游戏图鉴失败');
            }
          });
        `
      }} />
      
        {/* 炼丹系统指南按钮 */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <button
          onClick={() => {
            // 直接在当前页面显示炼丹系统指南
            toast.info(
              "炼丹系统玩法指南",
              {
                description: "点击游戏界面中的'炼丹系统'按钮开始。\n1. 火候控制：当火焰指示器进入绿色区域时点击屏幕。\n2. 时机把握：当圆环大小接近靶心时点击屏幕。\n3. 材料融合：按顺序融合材料完成进度。\n获得60分以上即可成功炼制丹药！",
                duration: 10000,
                position: "top-center",
                style: {
                  backgroundColor: 'rgba(52, 211, 153, 0.9)',
                  whiteSpace: 'pre-line'
                }
              }
            );
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-6 rounded-lg font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-300"
        >
          了解炼丹系统玩法
        </button>
      </motion.div>

      {/* 游戏图鉴按钮 */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <button
          onClick={() => setShowCompendium(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          data-compendium-trigger
        >
          查看游戏图鉴 - 收集这些宝物可以在主线剧情中使用
        </button>
      </motion.div>
      
      {/* 游戏图鉴弹窗 */}
      <AnimatePresence>
        {showCompendium && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompendium(false)}
          >
            <motion.div 
              className="bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-900 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-indigo-600/50">
                <h2 className="text-2xl font-bold">游戏图鉴</h2>
                <button 
                  onClick={() => setShowCompendium(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              {/* 分类选择 */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('全部')}
                  className={`px-3 py-1 rounded-full text-sm ${selectedCategory === '全部' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  全部
                </button>
                {['攻击', '防御', '辅助', '特殊', '资源'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* 宝物列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {treasures
                 .filter(treasure => selectedCategory === '全部' || treasure.category === selectedCategory)
                 .map((treasure, index) => (
                 <motion.div
                   key={treasure.id}
                   className="bg-blue-900/30 rounded-lg p-4 border border-blue-800/50 hover:bg-blue-800/30 transition-colors"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <div className="flex items-start">
                     <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden mr-4">
                       <img 
                         src={treasure.imageUrl} 
                         alt={treasure.name}
                         className="w-full h-full object-cover"
                       />
                     </div>
                     <div className="flex-1">
                       <h3 className="text-lg font-bold mb-1">{treasure.name}</h3>
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-xs px-2 py-0.5 bg-blue-800 rounded-full">{treasure.category}</span>
                         <span className={`text-xs px-2 py-0.5 rounded-full ${
                           treasure.rarity === '普通' ? 'bg-gray-600' :
                           treasure.rarity === '稀有' ? 'bg-blue-600' :
                           treasure.rarity === '传说' ? 'bg-purple-600' : 'bg-yellow-600'
                         }`}>{treasure.rarity}</span>
                       </div>
                       <div className="mb-2">
                         <h4 className="text-xs font-semibold text-blue-300 mb-1">注释:</h4>
                         <p className="text-sm text-blue-200">{treasure.description}</p>
                       </div>
                       <div>
                         <h4 className="text-xs font-semibold text-green-300 mb-1">效果:</h4>
                         <p className="text-sm text-green-300">{treasure.effect}</p>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}