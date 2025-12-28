import React, { useContext, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { storyNodes } from '@/data/storyNodes';
import { nodeMapping } from '@/data/nodeMapping';
import { toast } from 'sonner';
import { cultivationLevels, cultivationStages } from '@/data/characters';

interface StoryRecapProps {
  isOpen: boolean;
  onClose: () => void;
}

// 定义节点类型
interface StoryNode {
  id: string;
  text: string;
  description?: string;
  chapter?: number;
  section?: number;
  imageUrl?: string;
  choices: any[];
}

export default function StoryRecap({ isOpen, onClose }: StoryRecapProps) {
  const { gameState } = useContext(GameContext);
  const [activeNode, setActiveNode] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [allPossibleNodes, setAllPossibleNodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByChapter, setFilterByChapter] = useState<number | 'all'>(1);
  const [viewMode, setViewMode] = useState<'tree' | 'timeline'>('tree');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  
  // 滚动动画效果
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.1], [20, 0]);

  // 初始化扩展节点和访问节点集合
  useEffect(() => {
    if (isOpen && gameState.currentCharacter) {
      // 确保使用转换后的节点ID
      let currentNodeId = gameState.currentNode;
      
      // 如果当前节点不存在于storyNodes中，尝试通过映射表转换
      if (currentNodeId && !storyNodes[currentNodeId]) {
        const mappedNodeId = nodeMapping[currentNodeId as keyof typeof nodeMapping];
        if (mappedNodeId) {
          currentNodeId = mappedNodeId;
        }
      }
      
      // 展开玩家当前所在的节点路径
      const path = findPathToNode(currentNodeId);
      setExpandedNodes(new Set(path));
      setActiveNode(currentNodeId);
      
      // 标记所有已访问的节点
      const visited = new Set<string>();
      path.forEach(nodeId => visited.add(nodeId));
      setVisitedNodes(visited);
      
      // 生成完整剧情树节点列表
      generateAllPossibleNodes();
      
      // 重置筛选条件
      setSearchTerm('');
      setFilterByChapter('all');
      setShowOnlyUnlocked(false);
    }
  }, [isOpen, gameState.currentNode, gameState.currentCharacter]);

  // 查找从起始节点到目标节点的路径
  const findPathToNode = (targetNodeId: string): string[] => {
    if (!gameState.currentCharacter) return [];
    
    const path: string[] = [targetNodeId];
    let currentNodeId = targetNodeId;
    
    // 反向查找路径
    while (currentNodeId !== 'birth_scene' && currentNodeId !== 'game_start' && path.length < 30) { // 防止无限循环，从birth_scene或game_start开始
      // 查找哪个节点的选择可以到达当前节点
      let found = false;
      for (const nodeId in storyNodes) {
        const node = storyNodes[nodeId];
        for (const choice of node.choices) {
          let nextNodeId = '';
          if (typeof choice.nextNode === 'function') {
            try {
              nextNodeId = choice.nextNode(gameState.currentCharacter) as string;
            } catch (e) {
              continue;
            }
          } else {
            nextNodeId = choice.nextNode as string;
          }
          
          // 检查原始节点ID或映射后的节点ID是否匹配
          const nextNodeIdMapped = nodeMapping[nextNodeId as keyof typeof nodeMapping] || nextNodeId;
          const currentNodeIdMapped = nodeMapping[currentNodeId as keyof typeof nodeMapping] || currentNodeId;
          
          if (nextNodeIdMapped === currentNodeIdMapped) {
            path.unshift(nodeId);
            currentNodeId = nodeId;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) break;
    }
    
    return path;
  };

  // 生成所有可能的节点（包括未访问的）
  const generateAllPossibleNodes = () => {
    const allNodes = new Set<string>();
    const traverseTree = (nodeId: string) => {
      if (allNodes.has(nodeId) || !storyNodes[nodeId]) return;
      
      allNodes.add(nodeId);
      const children = getChildNodes(nodeId);
      children.forEach(childId => traverseTree(childId));
    };
    
    // 从游戏开始节点开始遍历
    traverseTree('game_start');
    setAllPossibleNodes(Array.from(allNodes));
  };

  // 检查节点是否已解锁（即玩家是否访问过）
  const isNodeUnlocked = (nodeId: string): boolean => {
    if (!gameState.currentCharacter) return false;
    
    // 检查当前节点是否在访问路径中
    const path = findPathToNode(gameState.currentNode);
    return path.includes(nodeId) || visitedNodes.has(nodeId);
  };

  // 切换节点展开/折叠状态
  const toggleNode = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // 获取节点的子节点 - 增强版，添加更全面的节点关系处理
  const getChildNodes = (nodeId: string): string[] => {
    const node = storyNodes[nodeId];
    if (!node) return [];
    
    const childNodes: string[] = [];
    
    // 为每个选择处理下一个节点
    for (const choice of node.choices) {
      try {
        let nextNodeId = '';
        if (typeof choice.nextNode === 'function') {
          // 尝试使用模拟状态来获取下一个节点
          const mockState = {
            charm: 5,
            comprehension: 5,
            constitution: 5,
            family: 5,
            luck: 5,
            resources: { spiritStone: 100, pills: 5, treasures: [] },
            cultivation: { level: 0, stage: 0, experience: 0 },
            choices: [],
            statusEffects: [],
            health: 100,
            age: 16
          };
          
          try {
            nextNodeId = choice.nextNode(mockState) as string;
          } catch (e) {
            // 处理特殊情况的节点映射
            if (nodeId === 'mid_game') {
              // 中期游戏节点的固定分支
              if (choice.id === 'pursue_power') nextNodeId = 'power_cultivation';
              else if (choice.id === 'protect_people') nextNodeId = 'righteous_path';
              else if (choice.id === 'seek_immortality') nextNodeId = 'immortality_seeking';
              else if (choice.id === 'find_sect_conflict') nextNodeId = 'sect_conflict';
              else if (choice.id === 'explore_dungeon') nextNodeId = 'ancient_dungeon';
              else nextNodeId = 'late_game'; // 默认到后期游戏
            } else if (nodeId === 'late_game') {
              // 后期游戏节点的固定分支
              if (choice.id === 'ascend_heaven') nextNodeId = 'nine_heavens_tribulation';
              else if (choice.id === 'guard_world') nextNodeId = 'ending_calculation_display';
              else if (choice.id === 'karma_check') nextNodeId = 'karma_cycle';
              else if (choice.id === 'eternal_seclusion') nextNodeId = 'seclusion_life';
              else if (choice.id === 'face_crisis') nextNodeId = 'cultivation_crisis';
              else if (choice.id === 'establish_great_clan') nextNodeId = 'create_great_clan';
              else if (choice.id === 'start_new_cycle') nextNodeId = 'ending_calculation_display';
              else nextNodeId = 'ending_calculation_display'; // 默认到结局计算
            } else {
              // 其他节点的默认处理
              nextNodeId = 'mid_game';
            }
          }
        } else {
          // 直接使用固定的下一个节点
          nextNodeId = choice.nextNode as string;
        }
        
        // 确保节点ID有效且不重复
        if (nextNodeId && nextNodeId !== nodeId && !childNodes.includes(nextNodeId) && storyNodes[nextNodeId]) {
          childNodes.push(nextNodeId);
        }
      } catch (e) {
        console.error(`处理节点 ${nodeId} 的选择时出错:`, e);
      }
    }
    
    // 补充特殊节点关系 - 增强版
    const specialNodeRelations: Record<string, string[]> = {
      'birth_scene': ['childhood_memories'],
      'childhood_memories': ['early_encounter'],
      'early_encounter': ['start'],
      'start': ['sect_selection', 'world_travel', 'hermit_encounter'],
      'sect_selection': ['inner_discipleship', 'outer_discipleship', 'sect_rejection'],
      'mid_game': ['power_cultivation', 'righteous_path', 'immortality_seeking', 'sect_conflict', 'ancient_dungeon'],
      'late_game': ['nine_heavens_tribulation', 'cultivation_crisis', 'ending_calculation_display'],
      '节点2-8-结果': ['节点3-1'],
      '节点3-1': ['节点3-2'],
      '节点3-2': ['节点3-3'],
      '节点3-3': ['节点3-4'],
      '节点3-4': ['节点3-5'],
      '节点3-5': ['节点3-6'],
      '节点3-6': ['节点3-7'],
      '节点3-7': ['节点3-8'],
      '节点3-8': ['节点4-1'],
      'chapter1_1': ['inner_disciple_path', 'outer_disciple_path'],
      'inner_disciple_path': ['chapter1_2'],
      'outer_disciple_path': ['chapter1_2'],
      'chapter1_2': ['chapter1_3'],
      'chapter1_3': ['chapter1_4'],
      'chapter1_4': ['chapter1_battle_round2'],
      'chapter1_battle_round2': ['chapter2_1'],
      'chapter2_1': ['chapter2_2'],
      'chapter2_2': ['chapter2_3'],
      'chapter2_3': ['chapter2_4'],
      'chapter2_4': ['chapter2_5'],
      'chapter2_5': ['chapter3_1'],
      'chapter3_1': ['chapter3_2'],
      'chapter3_2': ['chapter3_3'],
      'chapter3_3': ['chapter3_4'],
      'chapter3_4': ['chapter4_1'],
      'chapter4_1': ['chapter4_2'],
      'chapter4_2': ['chapter4_3'],
      'chapter4_3': ['ending_ascension', 'ending_unification', 'ending_protector'],
      'ending_ascension': ['game_start'],
      'ending_unification': ['game_start'],
      'ending_protector': ['game_start']
    };
    
    // 应用特殊节点关系
    if (specialNodeRelations[nodeId] && childNodes.length === 0) {
      return specialNodeRelations[nodeId].filter(childId => storyNodes[childId]);
    }
    
    return childNodes;
  };

  // 根据节点类型设置不同的图标 - 增强版，增加更多节点类型图标
  const getNodeIcon = (nodeId: string, isUnlocked: boolean) => {
    if (!isUnlocked) return "❓";
    
    // 基础节点类型
    if (nodeId === 'birth_scene') return "👶";
    if (nodeId === 'childhood_memories') return "🧒";
    if (nodeId === 'early_encounter') return "👵";
    if (nodeId === 'start' || nodeId === 'game_start') return "🏮";
    if (nodeId.includes('sect')) return "🏯";
    if (nodeId.includes('travel') || nodeId.includes('explore')) return "🗺️";
    if (nodeId.includes('battle') || nodeId.includes('combat') || nodeId.includes('fight')) return "⚔️";
    if (nodeId.includes('treasure') || nodeId.includes('reward')) return "💰";
    if (nodeId.includes('meditate') || nodeId.includes('enlightenment')) return "🧘";
    if (nodeId.includes('trial')) return "🏆";
    if (nodeId.includes('love') || nodeId.includes('soulmate')) return "💑";
    if (nodeId.includes('beast')) return "🐉";
    if (nodeId.includes('dungeon')) return "⛰️";
    if (nodeId.includes('late') || nodeId.includes('end')) return "🌅";
    
    // 新添加的后期剧情节点图标
    if (nodeId.includes('robbery')) return "👥";
    if (nodeId.includes('murder')) return "🔪";
    if (nodeId.includes('abduction')) return "🚨";
    if (nodeId.includes('betrayal')) return "🔄";
    if (nodeId.includes('crisis')) return "⚠️";
    if (nodeId.includes('域外')) return "🌌";
    
    // 特殊剧情节点
    if (nodeId.includes('karma')) return "🔁";
    if (nodeId.includes('nine_heavens_tribulation')) return "⚡";
    
    // 章节节点图标
    if (nodeId.includes('chapter1')) return "📚";
    if (nodeId.includes('chapter2')) return "📜";
    if (nodeId.includes('chapter3')) return "🗡️";
    if (nodeId.includes('chapter4')) return "⚔️";
    if (nodeId.includes('chapter5')) return "👑";
    
    // 结局节点
    if (nodeId.includes('ending')) return "🌟";
    
    // 默认图标
    return "📜";
  };

  // 渲染剧情树节点 - 增强版，添加更多动画和交互效果
  const renderStoryNode = (nodeId: string, depth: number = 0) => {
    const node = storyNodes[nodeId];
    if (!node) return null;
    
    const isUnlocked = isNodeUnlocked(nodeId);
    const isExpanded = expandedNodes.has(nodeId);
    const childNodes = getChildNodes(nodeId);
    const hasChildren = childNodes.length > 0;
    
    // 检查节点是否符合筛选条件
    const matchesSearch = !searchTerm || 
      node.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      nodeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChapter = filterByChapter === 'all' || node.chapter === filterByChapter;
    
    const matchesUnlocked = !showOnlyUnlocked || isUnlocked;
    
    if (!matchesSearch || !matchesChapter || !matchesUnlocked) return null;
    
    // 基础样式
    const baseClasses = "flex items-center p-2 rounded-lg cursor-pointer transition-all duration-300 relative";
    
    // 未解锁节点的黑雾效果样式
    const fogEffect = isUnlocked ? "" : "bg-gradient-to-r from-black/80 to-black/60 filter blur-[1px]";
    
    // 节点背景色
    const backgroundColor = activeNode === nodeId 
      ? 'bg-blue-600 text-white' 
      : isUnlocked 
        ? 'bg-blue-900/50 hover:bg-blue-800/50' 
        : 'bg-gray-900/50';
    
    // 章节特定背景色
    let chapterBackground = '';
    if (node.chapter === 1) chapterBackground = 'border-l-4 border-green-500';
    else if (node.chapter === 2) chapterBackground = 'border-l-4 border-blue-500';
    else if (node.chapter === 3) chapterBackground = 'border-l-4 border-purple-500';
    else if (node.chapter === 4) chapterBackground = 'border-l-4 border-yellow-500';
    else if (node.chapter === 5) chapterBackground = 'border-l-4 border-red-500';
    
    return (
      <div key={nodeId} className="mb-1">
        <motion.div
          className={`${baseClasses} ${backgroundColor} ${fogEffect} ${isUnlocked ? chapterBackground : ''}`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => {
            if (isUnlocked) {
              setActiveNode(nodeId);
              if (hasChildren) toggleNode(nodeId);
            } else {
              toast.info('继续你的修仙之旅来解锁这段剧情');
            }
          }}
          whileHover={isUnlocked ? { x: 4 } : { scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* 连接线 */}
          {depth > 0 && (
            <div className="absolute left-0 w-12 h-px bg-blue-700/50" style={{ marginLeft: `${depth * 24 - 12}px` }}></div>
          )}
          
          {hasChildren && (
            <motion.div
              className="relative z-10 mr-2"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <i className={`fa-solid fa-chevron-right text-xs transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}></i>
            </motion.div>
          )}
          
          {/* 节点图标 */}
          <span className={`text-xl mr-2 ${!isUnlocked ? 'opacity-80' : ''}`}>
            {getNodeIcon(nodeId, isUnlocked)}
          </span>
          
           {/* 节点文本 - 缩写显示 */}
           <div className="flex-grow">
             {isUnlocked ? (
               <div>
                 <span className="font-medium truncate">{node.text.length > 40 ? `${node.text.substring(0, 40)}...` : node.text}</span>
                 {node.chapter && node.section && (
                   <span className="ml-2 text-xs text-blue-300">
                     第{node.chapter}章第{node.section}节
                   </span>
                 )}
               </div>
             ) : (
               <div className="relative overflow-hidden">
                 <span className="font-medium text-center opacity-70">未知剧情</span>
                 {/* 额外的黑雾装饰效果 */}
                 <motion.div 
                   className="absolute inset-0 bg-black/70 blur-[2px]"
                   animate={{ 
                     opacity: [0.4, 0.6, 0.4],
                     x: [-10, 10, -10],
                   }}
                   transition={{ 
                     duration: 4,
                     repeat: Infinity,
                     repeatType: "reverse"
                   }}
                 />
               </div>
             )}
           </div>
          
          {/* 当前活动节点标记 */}
          {isUnlocked && activeNode === nodeId && (
            <motion.i
              className="fa-solid fa-check-circle ml-2 text-green-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            ></motion.i>
          )}
          
          {/* 已访问节点标记 */}
          {isUnlocked && activeNode !== nodeId && (
            <i className="fa-solid fa-circle-check ml-2 text-blue-300"></i>
          )}
        </motion.div>
        
        {/* 子节点动画 */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-1">
                {childNodes.map(childNodeId => (
                  <React.Fragment key={childNodeId}>
                    {/* 垂直连接线 */}
                    {depth > 0 && (
                      <div className="absolute h-full w-px bg-blue-700/50" style={{ marginLeft: `${depth * 24 - 6}px`, marginTop: '-4px' }}></div>
                    )}
                    {renderStoryNode(childNodeId, depth + 1)}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // 创建时间线节点列表
  const timelineNodes = useMemo(() => {
    if (!gameState.currentCharacter) return [];
    
    // 过滤出已解锁的节点
    const unlockedNodes = Object.keys(storyNodes)
      .filter(nodeId => isNodeUnlocked(nodeId) && storyNodes[nodeId])
      .map(nodeId => ({
        id: nodeId,
        node: storyNodes[nodeId],
        // 尝试根据节点ID和章节信息计算时间顺序
        order: getNodeOrder(nodeId)
      }))
      .sort((a, b) => a.order - b.order);
    
    return unlockedNodes;
  }, [gameState.currentCharacter]);
  
  // 渲染时间线视图
  const renderTimeline = () => {
    return (
      <div className="relative">
        {/* 时间线中心线 */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-700/50"></div>
        
        {/* 时间线节点 */}
        <div className="space-y-6 pl-10">
          {timelineNodes.map(({ id, node }, index) => {
            const isCurrent = id === activeNode;
            
            return (
              <motion.div 
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* 时间点 */}
                <div className="absolute w-8 h-8 rounded-full bg-blue-900 border-4 border-blue-600 left-0 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
                
                {/* 节点内容 */}
                <div 
                  className={`p-4 rounded-xl ${isCurrent ? 'bg-blue-600' : 'bg-blue-900/50'} cursor-pointer`}
                  onClick={() => setActiveNode(id)}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{getNodeIcon(id, true)}</span>
                    <h4 className="text-lg font-bold">{node.chapter && node.section ? `第${node.chapter}章第${node.section}节` : '剧情节点'}</h4>
                  </div>
                  <p className="text-sm mb-2 line-clamp-2">{node.text}</p>
                  {node.chapter && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-700">
                      第{node.chapter}章
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {timelineNodes.length === 0 && (
            <div className="text-center py-8 text-blue-300">
              <p>还没有解锁任何剧情节点</p>
              <p className="text-sm mt-2">继续你的修仙之旅来解锁更多剧情</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 获取节点顺序
  const getNodeOrder = (nodeId: string): number => {
    const node = storyNodes[nodeId];
    if (!node) return 9999;
    
    // 优先使用章节和节信息排序
    if (node.chapter && node.section) {
      return node.chapter * 100 + node.section;
    }
    
    // 对于没有章节信息的节点，使用ID转换后的数字排序
    const numericId = parseInt(nodeId.replace(/[^0-9]/g, '')) || 9999;
    return numericId;
  };

  // 渲染完整的剧情树
  const renderFullStoryTree = () => {
    if (viewMode === 'timeline') {
      return renderTimeline();
    }
    
    // 从游戏开始节点开始渲染
    return (
      <div className="space-y-1">
        {renderStoryNode('game_start')}
      </div>
    );
  };

  // 获取当前选中节点的详情 - 增强版，添加更多详情信息
  const getCurrentNodeDetails = () => {
    const node = storyNodes[activeNode];
    if (!node) return null;
    
    const isUnlocked = isNodeUnlocked(activeNode);
    
    // 计算探索时间
    const exploreTime = node.exploreTime || 30;
    
    // 获取节点类型
    const nodeType = getNodeType(activeNode);
    
    return (
      <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/30 shadow-lg h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">剧情详情</h3>
          {isUnlocked && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getTypeColorClass(nodeType)}`}>
              {nodeType}
            </span>
          )}
        </div>
        
        {isUnlocked ? (
          <>
            {/* 章节信息 */}
            {node.chapter && node.section && (
              <div className="bg-blue-900/30 rounded-lg p-2 mb-4 inline-block">
                <span className="font-semibold">第{node.chapter}章第{node.section}节</span>
              </div>
            )}
            
            {/* 节点内容 */}
            <div className="mb-6">
              <motion.p 
                className="text-lg leading-relaxed whitespace-pre-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {node.text}
              </motion.p>
              
              {/* 探索时间 */}
              <div className="mt-4 flex items-center text-sm text-blue-300">
                <i className="fa-solid fa-clock mr-2"></i>
                <span>探索时间: {exploreTime}分钟</span>
              </div>
            </div>
            
            {/* 图片展示 */}
            {node.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={node.imageUrl} 
                  alt={`${node.chapter ? `第${node.chapter}章` : '剧情'}场景`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            
            {gameState.currentCharacter && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <i className="fa-solid fa-branch mr-2 text-green-400"></i>
                  你的选择：
                </h4>
                <div className="space-y-3">
                  {node.choices.map((choice) => {
                    // 检查是否满足条件并已选择
                    const meetsCondition = !choice.condition || choice.condition(gameState.currentCharacter);
                    const isChosen = gameState.currentCharacter.choices.includes(choice.text);
                    
                    return (
                      <div
                        key={choice.id}
                        className={`p-3 rounded-lg transition-all duration-300 ${
                          isChosen 
                            ? 'bg-green-900/50 border-l-4 border-green-500' 
                            : meetsCondition
                              ? 'bg-blue-900/30 hover:bg-blue-800/30'
                              : 'bg-gray-900/30 opacity-60'
                        }`}
                      >
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-medium">{choice.text}</span>
                          {choice.conditionText && (
                            <span className={`ml-2 text-sm ${
                              meetsCondition ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                            } px-2 py-0.5 rounded-full`}>
                              {choice.conditionText}
                            </span>
                          )}
                          {isChosen && (
                            <motion.span 
                              className="ml-2 text-green-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <i className="fa-solid fa-check"></i> 已选择
                            </motion.span>
                          )}
                        </div>
                        
                        {choice.attributeChanges && Object.keys(choice.attributeChanges).length > 0 && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(choice.attributeChanges).map(([attr, value]) => {
                              if (value === 0) return null;
                              const attrMap: Record<string, { name: string, icon: string, color: string }> = {
                                charm: { name: '魅力', icon: 'heart', color: 'text-red-400' },
                                comprehension: { name: '悟性', icon: 'brain', color: 'text-purple-400' },
                                constitution: { name: '体质', icon: 'shield-alt', color: 'text-green-400' },
                                family: { name: '家境', icon: 'coins', color: 'text-yellow-400' },
                                luck: { name: '气运', icon: 'star', color: 'text-pink-400' },
                                spiritStone: { name: '灵石', icon: 'gem', color: 'text-cyan-400' },
                                pills: { name: '丹药', icon: 'pill', color: 'text-green-400' },
                                cultivationLevel: { name: '境界', icon: 'crown', color: 'text-yellow-500' },
                                cultivationStage: { name: '阶段', icon: 'level-up', color: 'text-blue-400' },
                                health: { name: '生命', icon: 'heartbeat', color: 'text-red-500' },
                                experience: { name: '经验', icon: 'star', color: 'text-yellow-400' },
                              };
                              const attrInfo = attrMap[attr];
                              if (!attrInfo) return null;
                              return (
                                <motion.div
                                  key={attr}
                                  className={`flex items-center text-sm ${value > 0 ? 'text-green-300' : 'text-red-300'} p-1.5 rounded-lg bg-black/20`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <i className={`fa-solid fa-${attrInfo.icon} mr-1.5 ${attrInfo.color}`}></i>
                                  {attrInfo.name}: {value > 0 ? '+' : ''}{value}
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* 显示选择可能触发的小游戏 */}
                        {(choice.miniGame || choice['小游戏']) && (
                          <div className="mt-3 flex items-center text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded-lg">
                            <i className="fa-solid fa-gamepad mr-2"></i>
                            <span>触发小游戏: {choice.miniGame || choice['小游戏']}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div 
              className="relative w-24 h-24 mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.9, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <div className="absolute inset-0 rounded-full bg-black/40 blur-xl animate-pulse"></div>
              <i className="fa-solid fa-lock text-4xl text-gray-400 absolute inset-0 flex items-center justify-center"></i>
            </motion.div>
            <p className="text-gray-400 text-center">该剧情节点尚未解锁<br />继续你的修仙之旅来探索这段故事</p>
          </div>
        )}
      </div>
    );
  };
  
  // 获取节点类型
  const getNodeType = (nodeId: string): string => {
    if (nodeId.includes('battle') || nodeId.includes('combat') || nodeId.includes('fight')) return '战斗';
    if (nodeId.includes('treasure') || nodeId.includes('reward')) return '宝物';
    if (nodeId.includes('meditate') || nodeId.includes('enlightenment')) return '修炼';
    if (nodeId.includes('trial')) return '试炼';
    if (nodeId.includes('love') || nodeId.includes('soulmate')) return '情感';
    if (nodeId.includes('beast')) return '妖兽';
    if (nodeId.includes('dungeon')) return '探索';
    if (nodeId.includes('ending')) return '结局';
    if (nodeId.includes('chapter')) return '主线';
    return '剧情';
  };
  
  // 获取节点类型对应的颜色类
  const getTypeColorClass = (type: string): string => {
    const colorMap: Record<string, string> = {
      '战斗': 'bg-red-700',
      '宝物': 'bg-yellow-700',
      '修炼': 'bg-green-700',
      '试炼': 'bg-purple-700',
      '情感': 'bg-pink-700',
      '妖兽': 'bg-blue-700',
      '探索': 'bg-cyan-700',
      '结局': 'bg-amber-700',
      '主线': 'bg-indigo-700',
      '剧情': 'bg-gray-700'
    };
    return colorMap[type] || 'bg-gray-700';
  };
  
  // 获取所有章节
  const getAllChapters = () => {
    const chapters = new Set<number>();
    Object.values(storyNodes).forEach(node => {
      if (node.chapter) {
        chapters.add(node.chapter);
      }
    });
    return Array.from(chapters).sort((a, b) => a - b);
  };
  
  // 计算章节统计信息
  const getChapterStats = () => {
    const stats: Record<number, { total: number, unlocked: number }> = {};
    
    // 初始化所有章节的统计
    getAllChapters().forEach(chapter => {
      stats[chapter] = { total: 0, unlocked: 0 };
    });
    
    // 统计每个章节的选项数和已选择选项数
    Object.entries(storyNodes).forEach(([nodeId, node]) => {
      if (node.chapter) {
        // 统计该节点的所有选项
        const totalChoices = node.choices.length;
        stats[node.chapter].total += totalChoices;
        
        // 统计该节点已选择的选项数
        const chosenChoices = node.choices.filter((choice) => {
          return gameState.currentCharacter?.choices?.includes(choice.text);
        }).length;
        
        stats[node.chapter].unlocked += chosenChoices;
      }
    });
    
    return stats;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-900 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-indigo-600/50">
              <h2 className="text-2xl font-bold text-center flex-grow">剧情回顾</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    // 滚动到页面顶部，确保玩家能看到完整的游戏界面
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full transition-colors"
                  aria-label="返回游戏"
                >
                  <i className="fa-solid fa-gamepad"></i>
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                  aria-label="关闭剧情回顾"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
            
            {/* 筛选和视图控制 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 搜索框 */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">搜索剧情</label>
                <div className="relative">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="输入关键词搜索剧情..."
                    className="w-full bg-blue-900/50 border border-blue-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* 章节筛选 */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">选择章节</label>
                <select
                  value={filterByChapter}
                  onChange={(e) => setFilterByChapter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full bg-blue-900/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部章节</option>
                  {getAllChapters().map(chapter => (
                    <option key={chapter} value={chapter}>
                      第{chapter}章
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 视图模式切换 */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">视图模式</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'tree' ? 'bg-blue-600' : 'bg-blue-900/50'
                    }`}
                  >
                    <i className="fa-solid fa-tree mr-1"></i> 剧情树
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'timeline' ? 'bg-blue-600' : 'bg-blue-900/50'
                    }`}
                  >
                    <i className="fa-solid fa-clock mr-1"></i> 时间线
                  </button>
                </div>
              </div>
            </div>
            
            {/* 剧情树和详情 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-13rem)] overflow-hidden">
              {/* 剧情树 */}
              <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-indigo-800/30 shadow-lg overflow-y-auto relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center">
                    <i className={`fa-solid ${viewMode === 'tree' ? 'fa-tree' : 'fa-clock'} text-blue-300 mr-2`}></i>
                    {viewMode === 'tree' ? '剧情树' : '剧情时间线'}
                  </h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showOnlyUnlocked"
                      checked={showOnlyUnlocked}
                      onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
                      className="mr-2 accent-blue-500"
                    />
                    <label htmlFor="showOnlyUnlocked" className="text-sm">只看已解锁</label>
                  </div>
                </div>
                
                {/* 图例说明 */}
                {viewMode === 'tree' && (
                  <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span>当前节点</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                      <span>已访问</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gray-500 relative">
                        <div className="absolute inset-0 bg-black/40 blur-[1px] rounded-full"></div>
                      </div>
                      <span>未探索</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>第1章</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>第2章</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>第3章</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>第4章</span>
                    </div>
                  </div>
                )}
                
                {/* 完整剧情树 */}
                {renderFullStoryTree()}
              </div>

              {/* 剧情详情 */}
              <motion.div 
                className="overflow-y-auto"
                style={{ opacity, y }}
              >
                {getCurrentNodeDetails()}
              </motion.div>
            </div>

            {/* 统计信息 */}
            {gameState.currentCharacter && (
              <motion.div
                className="mt-6 bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-indigo-800/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <i className="fa-solid fa-chart-simple text-blue-300 mr-2"></i>
                  探索进度
                </h3>
                
                {/* 总体统计 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-200">总节点数</p>
                   <p className="text-2xl font-bold text-purple-400">
                      {gameState.currentCharacter.cultivation 
                        ? `${cultivationLevels[gameState.currentCharacter.cultivation.level]}${cultivationStages[gameState.currentCharacter.cultivation.stage]}` 
                        : '凡人'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-200">已探索节点</p>
                    <p className="text-2xl font-bold text-green-400">
                      {gameState.currentCharacter.choices.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-200">关键抉择</p>
                    <p className="text-2xl font-bold">
                      {gameState.currentCharacter.choices.filter((choice: string) => 
                        choice.includes('突破至') || choice.includes('击败') || choice.includes('获得') || choice.includes('成为') || choice.includes('选择') || choice.includes('决定')
                      ).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-200">年龄</p>
                    <p className="text-2xl font-bold text-amber-300 truncate">
                      {gameState.currentCharacter.age}岁
                    </p>
                  </div>
                </div>
                
                {/* 章节统计 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAllChapters().map(chapter => {
                    const stats = getChapterStats()[chapter];
                    const progress = stats ? (stats.unlocked / stats.total) * 100 : 0;
                    
                    return (
                      <div key={chapter} className="bg-blue-900/30 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">第{chapter}章</h4>
                          <span className="text-sm bg-blue-500/50 px-2 py-1 rounded-full">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                          ></motion.div>
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {stats?.unlocked || 0}/{stats?.total || 0}个节点
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}