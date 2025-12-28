import { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '@/contexts/gameContext';
import { characters, cultivationLevels, cultivationStages } from '@/data/characters';
import { storyNodes } from '@/data/storyNodes';
import { toast } from 'sonner';
import { nodeMapping } from '@/data/nodeMapping';
import { getMaxAgeForCultivation } from '@/data/characters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StoryRecapPage() {
  const { gameState } = useContext(GameContext);
  const navigate = useNavigate();
  const [jsonExport, setJsonExport] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0表示全部章节
  const [chapterProgress, setChapterProgress] = useState<Record<number, number>>({});
  const [exportFormat, setExportFormat] = useState<'complete' | 'simplified'>('complete');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'progress' | 'overview' | 'details'>('progress');

  useEffect(() => {
    // 生成完整的剧情JSON结构
    generateFullStoryJson();
    // 计算各章节进度
    calculateChapterProgress();
  }, [exportFormat, searchTerm]);

   // 计算章节进度
  const calculateChapterProgress = () => {
    const progress: Record<number, number> = {};
    
    // 获取所有章节
    const chapters = new Set(Object.values(storyNodes).map(node => node.chapter).filter(ch => ch !== undefined));
    
    chapters.forEach(chapter => {
      if (!chapter) return;
      
      const chapterNodes = Object.values(storyNodes).filter(node => node.chapter === chapter);
      // 如果有游戏状态，计算已访问节点比例
      if (gameState.currentCharacter && gameState.currentCharacter.visitedNodes) {
        const visitedCount = chapterNodes.filter(node => 
          gameState.currentCharacter.visitedNodes.includes(node.id)
        ).length;
        progress[chapter] = chapterNodes.length > 0 ? Math.round(Math.min(100, (visitedCount / chapterNodes.length) * 100)) : 0;
      } else {
        progress[chapter] = 0;
      }
    });
    
    setChapterProgress(progress);
  };

  // 生成完整的剧情JSON结构
  const generateFullStoryJson = () => {
    try {
      let chaptersToExport: any[] = [];
      
      // 创建章节配置
      const chapterConfig = [
        { id: 1, name: "初入仙门", exitNode: "节点2-1" },
        { id: 2, name: "丹器风云", exitNode: "节点3-1" },
        { id: 3, name: "砺剑红尘", exitNode: "节点4-1" },
        { id: 4, name: "天地决战", exitNode: "ending_calculation_display" },
        { id: 5, name: "执掌天纲", exitNode: "ending_calculation_display" }
      ];
      
      // 根据选择的章节生成导出内容
      if (selectedChapter === 0) {
        // 导出所有章节
        chaptersToExport = chapterConfig.map(chapter => ({
          chapter_name: chapter.name,
          nodes: extractNodesByChapter(chapter.id),
          chapter_exit_node: chapter.exitNode
        }));
      } else {
        // 导出指定章节
        const chapter = chapterConfig.find(c => c.id === selectedChapter) || {
          id: selectedChapter,
          name: `第${selectedChapter}章`,
          exitNode: ""
        };
        
        chaptersToExport = [
          {
            chapter_name: chapter.name,
            nodes: extractNodesByChapter(chapter.id),
            chapter_exit_node: chapter.exitNode
          }
        ];
      }
      
      // 创建标准化的故事结构
      const fullStory = {
        story_version: "1.0.1",
        export_date: new Date().toISOString(),
        chapters: chaptersToExport
      };

      // 转换为格式化的JSON字符串
      const formattedJson = JSON.stringify(fullStory, null, 2);
      setJsonExport(formattedJson);
    } catch (error) {
      console.error('生成剧情JSON失败:', error);
      toast.error('生成剧情JSON失败，请稍后再试');
    }
  };

  // 根据章节提取节点
  const extractNodesByChapter = (chapterNumber: number) => {
    const chapterNodes: any[] = [];
    
    // 遍历所有节点，筛选出指定章节的节点
    Object.values(storyNodes).forEach(node => {
      // 应用搜索过滤
      if (searchTerm && !node.text?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !node.id?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !node.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      
      // 根据章节和导出格式筛选节点
      if (node.chapter === chapterNumber) {
        let formattedNode: any = {
          id: node.id,
          name: node.name,
          description: node.text,
          requires: node.requires ? extractNodeRequirements(node.requires) : {},
          imageUrl: node.imageUrl,
          chapter: node.chapter,
          section: node.section,
          isChapterStart: node.isChapterStart
        };
        
        // 根据导出格式决定包含的内容
        if (exportFormat === 'complete' || exportFormat === 'simplified') {
          // 处理旧格式的options和新格式的choices
          const options = node.choices || node.options || [];
          
          // 始终包含选项
          formattedNode.options = options.map((choice: any) => ({
            text: choice.text,
            requires: extractRequirements(choice),
            next_node_id: extractNextNode(choice),
            effects: extractEffects(choice),
            小游戏: extractMiniGame(choice)
          }));
          
          // 完整格式额外包含更多详细信息
          if (exportFormat === 'complete') {
            formattedNode.exploreTime = node.exploreTime;
            formattedNode.description = node.text;
            
            // 为每个选项添加详细描述
            formattedNode.options = formattedNode.options.map((option: any, index: number) => {
              const originalChoice = options[index];
              if (originalChoice && originalChoice.description) {
                option.description = originalChoice.description;
              }
              return option;
            });
          }
        }
        
        chapterNodes.push(formattedNode);
      }
    });
    
    // 补充一些特殊节点，确保完整性
    if (chapterNumber === 1) {
      // 确保第一章的特殊节点都包含在内
      const specialNodes = ['内门弟子', '外门弟子', '小比第二回合', '小比胜利', '小比失败', '最终失败'];
      specialNodes.forEach(nodeId => addSpecialNodeIfMissing(chapterNodes, nodeId));
    } else if (chapterNumber === 2) {
      // 确保第二章的特殊节点都包含在内
      const specialNodes = ['节点2-3-战斗', '节点2-3-智取', '节点2-3-诡计', '节点2-3-失败', '节点2-4-艰难', '节点2-8-结果'];
      specialNodes.forEach(nodeId => addSpecialNodeIfMissing(chapterNodes, nodeId));
    } else if (chapterNumber === 3) {
       // 确保第三章的特殊节点都包含在内
       const specialNodes = [
         '节点3-1', '节点3-2', '节点3-3', '节点3-4', '节点3-5', '节点3-6', '节点3-7', '节点3-8',
         '结局_飞升', '结局_至尊', '结局_守护', '结局_传奇', 
         '结局_陨落', '结局_取巧', '结局_反噬', '结局_救世', '结局_支配', '结局_平衡'
       ];
      specialNodes.forEach(nodeId => addSpecialNodeIfMissing(chapterNodes, nodeId));
    }
  
    return chapterNodes;
  };
  
  // 如果节点在章节中不存在，则添加它
  const addSpecialNodeIfMissing = (nodes: any[], nodeId: string) => {
    // 检查节点是否已经存在
    if (nodes.some(node => node.id === nodeId)) {
      return;
    }
    
    // 尝试从storyNodes中获取节点
    const node = storyNodes[nodeId];if (node) {
      let formattedNode: any = {
        id: node.id,
        name: node.name,
        description: node.text,
        requires: node.requires ? extractNodeRequirements(node.requires) : {},
        imageUrl: node.imageUrl,
        chapter: node.chapter,
        section: node.section
      };
      
      // 根据导出格式决定包含的内容
      if (exportFormat === 'complete' || exportFormat === 'simplified') {
        formattedNode.options = node.choices ? node.choices.map((choice: any) => ({
          text: choice.text,
          requires: extractRequirements(choice),
          next_node_id: extractNextNode(choice),
          effects: extractEffects(choice),
          小游戏: extractMiniGame(choice)
        })) : [];
        
        if (exportFormat === 'complete') {
          formattedNode.exploreTime = node.exploreTime;
          formattedNode.description = node.text;
        }
      }
      
      nodes.push(formattedNode);
    }
  };

  // 提取选择的条件
  const extractRequirements = (choice: any) => {
    // 首先检查是否有内置的requires结构，如果有则直接使用
    if (choice.requires) {
      return choice.requires;
    }
    
    if (!choice.condition) return {};
    
    // 简化处理：根据条件文本提取需求
    if (choice.conditionText) {
      let requirements: any = {};
    
      // 检查是否包含角色专属需求
      if (choice.conditionText && choice.conditionText.includes('[') && choice.conditionText.includes('专属]')) {
        // 从条件文本中提取
        const match = choice.conditionText.match(/\[(\w+)\s*专属\]/);
        if (match) {
          requirements['角色'] = match[1];
        }
      }
    
      // 检查是否包含魅力需求
      if (choice.conditionText.includes('魅力')) {
        const match = choice.conditionText.match(/魅力(\D+)(\d+)/);
        if (match) {
          requirements['魅力'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含悟性需求
      if (choice.conditionText.includes('悟性')) {
        const match = choice.conditionText.match(/悟性(\D+)(\d+)/);
        if (match) {
          requirements['悟性'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含体质需求
      if (choice.conditionText.includes('体质')) {
        const match = choice.conditionText.match(/体质(\D+)(\d+)/);
        if (match) {
          requirements['体质'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含气运需求
      if (choice.conditionText.includes('气运')) {
        const match = choice.conditionText.match(/气运(\D+)(\d+)/);
        if (match) {
          requirements['气运'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含灵石需求
      if (choice.conditionText.includes('灵石')) {
        const match = choice.conditionText.match(/灵石(\D+)(\d+)/);
        if (match) {
          requirements['灵石'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含丹药需求
      if (choice.conditionText.includes('丹药')) {
        const match = choice.conditionText.match(/丹药(\D+)(\d+)/);
        if (match) {
          requirements['丹药'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含声望需求
      if (choice.conditionText.includes('声望')) {
        const match = choice.conditionText.match(/声望(\D+)(\d+)/);
        if (match) {
          requirements['声望'] = { [match[1].trim()]: parseInt(match[2]) };
        }
      }
      
      // 检查是否包含拥有物品需求
      if (choice.conditionText.includes('拥有')) {
        const match = choice.conditionText.match(/拥有"(.+?)"/);
        if (match) {
          requirements['拥有物品'] = match[1];
        }
      }
      
      // 检查是否包含标签需求
      if (choice.conditionText.includes('标签')) {
        const match = choice.conditionText.match(/"(.+?)"/);
        if (match) {
          requirements['标签包含'] = match[1];
        }
      }
      
      // 特殊处理"或"条件 - 从条件文本中提取
      if (choice.conditionText?.includes('或')) {
        // 检查是否是悟性或标签的组合条件
        if (choice.conditionText.includes('悟性') && choice.conditionText.includes('标签')) {
          const comprehensionMatch = choice.conditionText.match(/悟性(\D+)(\d+)/);
          const tagMatch = choice.conditionText.match(/"(.+?)"/);
          
          if (comprehensionMatch && tagMatch) {
            requirements['条件类型'] = '或';
            requirements['条件列表'] = [
              { '悟性': { [comprehensionMatch[1].trim()]: parseInt(comprehensionMatch[2]) } },
              { '标签包含': tagMatch[1] }
            ];
          }
        }
      }
      
      return requirements;
    }
    
    return {};
  };

  // 提取节点的条件
  const extractNodeRequirements = (requires: any) => {
    if (requires.cultivation) {
      if (typeof requires.cultivation === 'number') {
        // 简单的修为等级需求
        return { '修为': cultivationLevels[requires.cultivation] };
      } else if (requires.cultivation.level !== undefined) {
        // 复杂的修为阶段需求
        return { 
          '修为': `${cultivationLevels[requires.cultivation.level]}${cultivationStages[requires.cultivation.stage]}` 
        };
      }
    }
    
    return {};
  };

  // 提取下一个节点
  const extractNextNode = (choice: any) => {
    // 优先检查是否有内置的next_node_id
    if (choice.next_node_id) {
      return choice.next_node_id;
    }
    
    if (typeof choice.nextNode === 'function') {
      // 对于函数类型的nextNode，我们无法直接转换，返回一个默认值
      return 'node_to_be_determined';
    }
    return choice.nextNode || '';
  };

  // 提取效果
  const extractEffects = (choice: any) => {
    // 优先检查是否有内置的effects结构，如果有则直接使用
    if (choice.effects) {
      return choice.effects;
    }
    
    const effects: any = {
      '属性变更': {},
      '添加标签': [],
      '添加物品': [],
      '移除物品': []
    };
    
    // 处理attributeChanges
    if (choice.attributeChanges) {
      const attributeMap: Record<string, string> = {
        'charm': '魅力',
        'comprehension': '悟性',
        'constitution': '体质',
        'family': '家境',
        'luck': '气运',
        'spiritStone': '灵石',
        'pills': '丹药',
        'health': '生命值',
        'experience': '经验值',
        'reputation': '声望'
      };
      
      Object.entries(choice.attributeChanges).forEach(([key, value]) => {
        const attributeName = attributeMap[key] || key;
        effects['属性变更'][attributeName] = value;
      });
    }
    
    // 处理标签
    if (choice.tags && choice.tags.length > 0) {
      effects['添加标签'] = choice.tags;
    }
    
    // 处理物品（根据consequence函数内容推断）
    if (choice.consequence && typeof choice.consequence === 'function') {
      const funcStr = choice.consequence.toString();
      
      // 特殊处理"静观其变，后发制人"选项的条件逻辑
      if (choice.text === '静观其变，后发制人') {
        // 清空默认添加的物品
        effects['添加物品'] = [];
        // 添加条件效果
        effects['条件效果'] = {
          '如果气运≥6': { '添加物品': ['神秘铁片（真）'] },
          '否则': { '添加物品': ['神秘铁片（假）'] }
        };
      } else {
        // 普通处理逻辑
        // 查找添加物品的代码
        const addItemMatch = funcStr.match(/\.treasures\.push\(['"](.+?)['"]\)/g);
        if (addItemMatch) {
          addItemMatch.forEach(match => {
            const itemMatch = match.match(/push\(['"](.+?)['"]\)/);
            if (itemMatch) {
              effects['添加物品'].push(itemMatch[1]);
            }
          });
        }
        
        // 查找移除物品的代码
        const removeItemMatch = funcStr.match(/\.treasures\s*=\s*.*filter\(.*?['"](.+?)['"]/g);
        if (removeItemMatch) {
          removeItemMatch.forEach(match => {
            const itemMatch = match.match(/['"](.+?)['"]/);
            if (itemMatch) {
              effects['移除物品'].push(itemMatch[1]);
            }
          });
        }
      }
    }
    
    return effects;
  };

  // 提取小游戏信息
  const extractMiniGame = (choice: any) => {
    // 优先检查是否有内置的小游戏标记
    if (choice['小游戏']) {
      return choice['小游戏'];
    }
    
    if (choice.miniGame) {
      const miniGameMap: Record<string, string> = {
        'battle': '三回合战斗',
        'fire_control': '火候控制',
        'timing': '时机把握',
        'material_blending': '材料融合',
        'heart_demon': '心魔考验'
      };
      
      return miniGameMap[choice.miniGame] || choice.miniGame;
    }
    
    // 根据节点ID推断小游戏
    const nodeId = choice.nextNode || choice.next_node_id;
    if (nodeId === '节点2-3-战斗') {
      return '三回合战斗';
    }
    
    return undefined;
  };

  // 复制JSON到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonExport).then(() => {
      toast.success('JSON已复制到剪贴板');
      setShowExportModal(false);
    }).catch(err => {
      console.error('复制失败:', err);
      toast.error('复制失败，请手动选择并复制');
    });
  };

  // 下载JSON文件
  const downloadJson = () => {
    const blob = new Blob([jsonExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 根据选择的章节生成文件名
    let fileName = 'xiuxian_story_';
    if (selectedChapter === 0) {
      fileName += 'all_chapters';
    } else {
      fileName += `chapter_${selectedChapter}`;
    }
    
    fileName += `_${new Date().toISOString().slice(0, 10)}.json`;
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`JSON文件已下载: ${fileName}`);
    setShowExportModal(false);
  };
  
// 查找从起始节点到目标节点的路径（用于获取已解锁节点）
  const findPathToNode = (targetNodeId: string): string[] => {
    if (!gameState.currentCharacter) return [];
    
    const path: string[] = [targetNodeId];
    let currentNodeId = targetNodeId;
    
    // 反向查找路径
    while (currentNodeId !== 'birth_scene' && currentNodeId !== 'game_start' && path.length < 30) {
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
          
          if (nextNodeId === currentNodeId) {
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
  
   // 获取章节统计数据
  const getChapterStats = useMemo(() => {
    const stats: Record<number, { total: number, unlocked: number }> = {};
    
    // 初始化所有章节的统计
    const chapters = new Set(Object.values(storyNodes).map(node => node.chapter).filter(ch => ch !== undefined));
    chapters.forEach(chapter => {
      if (typeof chapter === 'number') {
        stats[chapter] = { total: 0, unlocked: 0 };
      }
    });
    
    // 统计每个章节的节点数和已解锁节点数
    Object.entries(storyNodes).forEach(([nodeId, node]) => {
      if (node.chapter && typeof node.chapter === 'number') {
        stats[node.chapter].total++;
        
        // 检查节点是否已访问（通过检查visitedNodes数组中是否包含该节点ID）
        if (gameState.currentCharacter && gameState.currentCharacter.visitedNodes) {
          const hasVisited = gameState.currentCharacter.visitedNodes.includes(nodeId);
          if (hasVisited) {
            stats[node.chapter].unlocked++;
          }
        }
      }
    });
    
    // 确保所有章节都有数据
    for (let i = 1; i <= 5; i++) {
      if (!stats[i]) {
        stats[i] = { total: 0, unlocked: 0 };
      }
    }
    
    return stats;
  }, [gameState.currentCharacter, gameState.currentNode]);
  

  
  // 图表数据
   const barChartData = Object.entries(getChapterStats).map(([chapter, stats]) => ({
    name: `第${chapter}章`,
    total: stats.total,
    unlocked: stats.unlocked,
    progress: stats.total > 0 ? Math.min(100, (stats.unlocked / stats.total) * 100) : 0
  }));
  
  // 计算已访问节点数
  const visitedNodesCount = gameState.currentCharacter?.visitedNodes?.length || 0;
  const totalNodesCount = Object.keys(storyNodes).length;
  
  const pieChartData = [
    { name: '已探索', value: visitedNodesCount },
    { name: '未探索', value: Math.max(0, totalNodesCount - visitedNodesCount) }
  ];
  
  const COLORS = ['#4ade80', '#475569'];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-1 sm:p-2">
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

      {/* 标题 */}
      <motion.div 
        className="text-center my-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          剧情回顾与导出
        </h1>
        <p className="text-blue-200">查看和导出完整的剧情结构</p>
      </motion.div>

      <div className="container mx-auto px-2 sm:px-4">
        {/* 筛选和搜索控件 */}
        <motion.div 
          className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-4 border border-indigo-800/50 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 章节选择 */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">选择章节</label>
              <select 
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
                className="w-full bg-blue-900/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>全部章节</option>
                <option value={1}>第一章：初入仙门</option>
                <option value={2}>第二章：丹器风云</option>
                <option value={3}>第三章：砺剑红尘</option>
                <option value={4}>第四章：天地决战</option>
                <option value={5}>第五章：执掌天纲</option>
              </select>
            </div>
            
            {/* 导出格式 */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">导出格式</label>
              <select 
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'complete' | 'simplified')}
                className="w-full bg-blue-900/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="complete">完整格式</option>
                <option value="simplified">简化格式</option>
              </select>
            </div>
            
            {/* 搜索框 */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">搜索节点</label>
              <input 
                type="text"
                placeholder="输入节点ID或内容关键词"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-900/50 border border-blue-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>
        
        {/* 视图选项卡 */}
        <motion.div 
          className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-2 border border-indigo-800/50 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'progress' ? 'bg-blue-600' : 'bg-blue-900/50'
              }`}
            >
              <i className="fa-solid fa-chart-line mr-2"></i>
              剧情进度
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-blue-600' : 'bg-blue-900/50'
              }`}
            >
              <i className="fa-solid fa-book-open mr-2"></i>
              剧情概览
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'details' ? 'bg-blue-600' : 'bg-blue-900/50'
              }`}
            >
              <i className="fa-solid fa-list-ul mr-2"></i>
              详细结构
            </button>
          </div>
        </motion.div>
        
        {/* 视图内容 */}
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div
              key="progress-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* 总体进度 */}
              <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/50 shadow-xl mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">总体进度</h2>
                    <div className="bg-blue-900/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">剧情完成度</h3>
                        <span className="text-xl bg-blue-500/50 px-3 py-1 rounded-full">
                          {totalNodesCount > 0 ? 
                            Math.round(Math.min(100, (visitedNodesCount / totalNodesCount) * 100)) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div 
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          style={{ 
                            width: totalNodesCount > 0 ? 
                              `${Math.min(100, (visitedNodesCount / totalNodesCount) * 100)}%` : '0%'
                          }}
                          initial={{ width: '0%' }}
                          animate={{ 
                            width: totalNodesCount > 0 ? 
                              `${Math.min(100, (visitedNodesCount / totalNodesCount) * 100)}%` : '0%'
                          }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-sm text-blue-200">总节点数</p>
                          <p className="text-2xl font-bold">{totalNodesCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-blue-200">已探索</p>
                          <p className="text-2xl font-bold text-green-400">
                            {visitedNodesCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-blue-200">剩余</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {Math.max(0, totalNodesCount - visitedNodesCount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">探索分布</h2>
                    <div className="bg-blue-900/30 rounded-lg p-4 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} 个节点`, name]}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.5rem' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 章节进度详情 */}
              <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/50 shadow-xl mb-6">
                <h2 className="text-2xl font-bold mb-6">章节进度详情</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        formatter={(value, name) => [name === 'progress' ? `${value.toFixed(0)}%` : `${value} 个节点`, 
                          name === 'total' ? '总节点数' : name === 'unlocked' ? '已解锁' : '完成度']}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.5rem' }}
                      />
                      <Bar dataKey="total" name="total" stackId="a" fill="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="unlocked" name="unlocked" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* 第一章进度 */}
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">第一章：初入仙门</h3>
                      <span className="text-sm bg-blue-500/50 px-2 py-1 rounded-full">{chapterProgress[1] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${chapterProgress[1] || 0}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${chapterProgress[1] || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                     <div className="text-xs text-blue-300 mt-1">
               {getChapterStats[1]?.unlocked || 0}/{getChapterStats[1]?.total || 0}个节点
                     </div>
                     
                     {/* 显示关键突破信息 */}
                     {gameState.currentCharacter && gameState.currentCharacter.choices && (
                       <div className="mt-2 text-xs">
                         {gameState.currentCharacter.choices
                           .filter((choice: string) => choice.includes('突破至') && choice.includes('第'))
                           .slice(-2)
                           .map((breakthrough, index) => (
                             <div key={index} className="text-green-400 truncate" title={breakthrough}>
                               {breakthrough}
                             </div>
                           ))
                         }
                       </div>
                     )}
                  </div>
                  
                  {/* 第二章进度 */}
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">第二章：丹器风云</h3>
                      <span className="text-sm bg-purple-500/50 px-2 py-1 rounded-full">{chapterProgress[2] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${chapterProgress[2] || 0}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${chapterProgress[2] || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
              {getChapterStats[2]?.unlocked || 0}/{getChapterStats[2]?.total || 0}个节点
                    </div>
                  </div>
                  
                  {/* 第三章进度 */}
                  <div className="bg-indigo-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">第三章：砺剑红尘</h3>
                      <span className="text-sm bg-indigo-500/50 px-2 py-1 rounded-full">{chapterProgress[3] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${chapterProgress[3] || 0}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${chapterProgress[3] || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
              {getChapterStats[3]?.unlocked || 0}/{getChapterStats[3]?.total || 0}个节点
                    </div>
                  </div>
                  
                  {/* 第四章进度 */}
                  <div className="bg-yellow-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">第四章：天地决战</h3>
                      <span className="text-sm bg-yellow-500/50 px-2 py-1 rounded-full">{chapterProgress[4] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-yellow-500"
                        style={{ width: `${chapterProgress[4] || 0}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${chapterProgress[4] || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
              {getChapterStats[4]?.unlocked || 0}/{getChapterStats[4]?.total || 0}个节点
                    </div>
                  </div>
                  
                  {/* 第五章进度 */}
                  <div className="bg-red-900/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">第五章：执掌天纲</h3>
                      <span className="text-sm bg-red-500/50 px-2 py-1 rounded-full">{chapterProgress[5] || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${chapterProgress[5] || 0}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${chapterProgress[5] || 0}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
              {getChapterStats[5]?.unlocked || 0}/{getChapterStats[5]?.total || 0}个节点
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'overview' && (
            <motion.div
              key="overview-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/50 shadow-xl mb-6">
                <h2 className="text-2xl font-bold mb-6">剧情概览</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 第一章 */}
                  <motion.div 
                    className="bg-blue-900/30 rounded-lg p-5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-book-open text-blue-300"></i>
                      第一章：初入仙门
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">节点1-1：宗门试炼</span>
                          <p className="text-sm text-blue-200 mt-1">升仙大会广场上，通过测灵碑测试修仙资质...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">内门弟子</span>
                          <p className="text-sm text-blue-200 mt-1">测灵碑光芒四射，守碑长老赞许点头，你成为内门弟子...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">外门弟子</span>
                          <p className="text-sm text-blue-200 mt-1">你通过了基础测试，成为外门弟子，踏上修仙之路...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">节点1-2：功法抉择</span>
                          <p className="text-sm text-blue-200 mt-1">藏经阁内选择适合自己的修仙功法...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">节点1-3：首次突破</span>
                          <p className="text-sm text-blue-200 mt-1">尝试引导天地灵气入体，突破至练气境...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-blue-400"></i>
                        <div>
                          <span className="font-semibold">节点1-4：小比扬名</span>
                          <p className="text-sm text-blue-200 mt-1">外门小比，展示你的修炼成果...</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* 第二章 */}
                  <motion.div 
                    className="bg-purple-900/30 rounded-lg p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-book-open text-purple-300"></i>
                      第二章：丹器风云
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div>
                          <span className="font-semibold">节点2-1：下山历练</span>
                          <p className="text-sm text-blue-200 mt-1">筑基有成，首次下山执行任务...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div>
                          <span className="font-semibold">节点2-2：筑基瓶颈</span>
                          <p className="text-sm text-blue-200 mt-1">突破筑基初期瓶颈，提升修为...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div><span className="font-semibold">节点2-3：秘境夺宝</span>
                          <p className="text-sm text-blue-200 mt-1">血色禁地冒险，获取天元果...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div>
                          <span className="font-semibold">节点2-4：结丹契机</span>
                          <p className="text-sm text-blue-200 mt-1">利用天元果突破至结丹期...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div>
                          <span className="font-semibold">节点2-5：炼制本命物</span>
                          <p className="text-sm text-blue-200 mt-1">炼制专属于自己的本命法宝...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-purple-400"></i>
                        <div>
                          <span className="font-semibold">节点2-8：心魔试炼</span>
                          <p className="text-sm text-blue-200 mt-1">直面心魔，凝结元婴...</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* 第三章 */}
                  <motion.div 
                    className="bg-indigo-900/30 rounded-lg p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-book-open text-indigo-300"></i>
                      第三章：砺剑红尘
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-1：红尘炼心</span>
                          <p className="text-sm text-blue-200 mt-1">结丹成功后，再次出山，在万丈红尘中打磨道心...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-2：洞府探秘</span>
                          <p className="text-sm text-blue-200 mt-1">发现上古修士洞府，破解符文谜题，选择丹药、功法或法宝...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-3：万法碑林</span>
                          <p className="text-sm text-blue-200 mt-1">进入万法碑林核心区域，突破元婴瓶颈...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-4：心魔试炼</span>
                          <p className="text-sm text-blue-200 mt-1">面对天、地、人三座石碑，选择感悟方向，通过心魔劫...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-5：元婴大成</span>
                          <p className="text-sm text-blue-200 mt-1">成功凝结元婴，道心稳固，修为更进一步...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-6：宗门长老</span>
                          <p className="text-sm text-blue-200 mt-1">成为宗门最年轻的长老，承担更多责任...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-7：正魔冲突</span>
                          <p className="text-sm text-blue-200 mt-1">正魔两道修炼理念差异越来越大，冲突时有发生...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点3-8：域外入侵</span>
                          <p className="text-sm text-blue-200 mt-1">域外天魔开始入侵此界，修仙界面临前所未有的危机...</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* 第四章 */}
                  <motion.div 
                    className="bg-yellow-900/30 rounded-lg p-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-book-open text-indigo-300"></i>
                      第四章：天地决战
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点4-1：正魔大战</span>
                          <p className="text-sm text-blue-200 mt-1">元婴已成，正魔两道积怨已久，大战一触即发...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点4-2：天魔入侵</span>
                          <p className="text-sm text-blue-200 mt-1">正魔大战正酣之际，天空突然撕裂！域外天魔降临...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点4-3：飞升抉择</span>
                          <p className="text-sm text-blue-200 mt-1">发现古仙飞升台，选择前往上界还是守护此界...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">节点4-4：最终天劫</span>
                          <p className="text-sm text-blue-200 mt-1">最终的天道考验，九重天劫即将降临...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">隐藏结局：上古真相</span>
                          <p className="text-sm text-blue-200 mt-1">破解上古隐秘，发现第三条道路...</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-indigo-400"></i>
                        <div>
                          <span className="font-semibold">多种结局</span>
                          <p className="text-sm text-blue-200 mt-1">飞升、至尊、守护、传奇、陨落等多种结局...</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* 第五章 */}
                  <motion.div 
                    className="bg-red-900/30 rounded-lg p-5 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-book-open text-green-300"></i>
                    第五章：执掌天纲
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-green-400"></i>
                      <div>
                        <span className="font-semibold">节点5-1：终极选择</span>
                        <p className="text-sm text-blue-200 mt-1">历经天魔之乱，你面临修仙的终极命题...</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-green-400"></i>
                      <div>
                        <span className="font-semibold">飞升者路线</span>
                        <p className="text-sm text-blue-200 mt-1">探索仙界，追求道祖之境...</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-green-400"></i>
                      <div>
                        <span className="font-semibold">统御者路线</span>
                        <p className="text-sm text-blue-200 mt-1">完善秩序，让铁律遍行诸界...</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-green-400"></i>
                      <div>
                        <span className="font-semibold">守护者路线</span>
                        <p className="text-sm text-blue-200 mt-1">化身天道，与位面共生共存...</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fa-solid fa-circle text-xs mt-1.5 mr-2 text-green-400"></i>
                      <div>
                        <span className="font-semibold">探索者路线</span>
                        <p className="text-sm text-blue-200 mt-1">拒绝既定道路，开辟全新可能...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'details' && (
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* 标准化剧情模块 */}
              <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-800/50 shadow-xl mb-6">
                <h2 className="text-2xl font-bold mb-6">标准化剧情模块</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* 第一章详情 */}
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-lg p-5 border border-blue-800/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-file-alt text-blue-300"></i>
                      第一章：初入仙门
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 text-xs">1</span>
                          节点1-1：宗门试炼
                        </h4>
                        <p className="text-sm mt-2 pl-8">升仙大会广场上，通过测灵碑测试修仙资质...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 展示天赋资质 [需悟性≥7]</li>
                            <li>• 展示身体素质 [需体质≥6]</li>
                            <li>• 展示人格魅力 [需魅力≥6]</li>
                            <li>• 资质平平，勉强通过</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 text-xs">2</span>
                          节点1-2：功法抉择
                        </h4>
                        <p className="text-sm mt-2 pl-8">藏经阁内选择适合自己的修仙功法...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 选择《长春功》- 延年益寿，根基稳固</li>
                            <li>• 选择《象甲功》- 防御强大，肉身强横 [需体质≥5]</li>
                            <li>• 选择《百毒真经》- 诡异毒功，威力惊人 [需悟性≥8]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 text-xs">3</span>
                          节点1-3：首次突破
                        </h4>
                        <p className="text-sm mt-2 pl-8">尝试引导天地灵气入体，突破至练气境...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 强行冲击瓶颈 [需体质≥7]</li>
                            <li>• 稳扎稳打突破</li>
                            <li>• 使用丹药辅助 [需丹药≥1]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-2 text-xs">4</span>
                          节点1-4：小比扬名
                        </h4>
                        <p className="text-sm mt-2 pl-8">外门小比，展示你的修炼成果...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 灵活闪躲，寻找机会 [需气运≥5]</li>
                            <li>• 运功防御，正面硬抗 [需修炼象甲功或体质≥6]</li>
                            <li>• 使用计谋，出奇制胜 [需修炼百毒真经或悟性≥7]</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 第二章详情 */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-lg p-5 border border-purple-800/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-file-alt text-purple-300"></i>
                      第二章：丹器风云
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2 text-xs">1</span>
                          节点2-1：下山历练
                        </h4>
                        <p className="text-sm mt-2 pl-8">筑基有成，首次下山执行任务...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 仗义执言，帮助少年 [需魅力≥6]</li>
                            <li>• 静观其变，伺机而动</li>
                            <li>• 专心购物，不理闲事</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-purple-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2 text-xs">2</span>
                          节点2-2：筑基瓶颈
                        </h4>
                        <p className="text-sm mt-2 pl-8">突破筑基初期瓶颈，提升修为...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 闭关苦修半年 [需悟性≥7]</li>
                            <li>• 执行宗门任务磨炼</li>
                            <li>• 求购破障丹突破 [需灵石≥150]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-purple-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2 text-xs">3</span>
                          节点2-3：秘境夺宝
                        </h4>
                        <p className="text-sm mt-2 pl-8">血色禁地冒险，获取天元果...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 正面攻击妖兽 [需体质≥7]</li>
                            <li>• 等待机会，渔翁得利 [需悟性≥8]</li>
                            <li>• 使用神秘铁片 [需拥有神秘铁片]</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 第三章详情 */}
                  <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg p-5 border border-indigo-800/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-file-alt text-indigo-300"></i>
                      第三章：砺剑红尘
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-indigo-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 text-xs">1</span>
                          节点3-1：红尘炼心
                        </h4>
                        <p className="text-sm mt-2 pl-8">结丹成功后，再次出山，在万丈红尘中打磨道心...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 拜访其他宗门 [需魅力≥7]</li>
                            <li>• 探索秘境遗迹 [需气运≥6]</li>
                            <li>• 寻找隐士高人 [需悟性≥8]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 text-xs">2</span>
                          节点3-2：洞府探秘
                        </h4>
                        <p className="text-sm mt-2 pl-8">发现上古修士洞府，破解符文谜题，选择丹药、功法或法宝...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 选择丹药石室 [需灵石≥100]</li>
                            <li>• 选择功法石室 [需悟性≥8]</li>
                            <li>• 选择法宝石室 [需体质≥7]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 text-xs">3</span>
                          节点3-3：万法碑林
                        </h4>
                        <p className="text-sm mt-2 pl-8">进入万法碑林核心区域，突破元婴瓶颈...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 正面突破结界 [需体质≥8]</li>
                            <li>• 等待法则潮汐 [需悟性≥9]</li>
                            <li>• 联合其他修士 [需魅力≥7]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 text-xs">4</span>
                          节点3-4：心魔试炼
                        </h4>
                        <p className="text-sm mt-2 pl-8">面对天、地、人三座石碑，选择感悟方向，通过心魔劫...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 选择天道感悟 [需悟性≥10]</li>
                            <li>• 选择地道感悟 [需体质≥10]</li>
                            <li>• 选择人道感悟 [需魅力≥10]</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 第四章详情 */}
                  <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-5 border border-yellow-800/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-file-alt text-yellow-300"></i>
                      第四章：天地决战
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-yellow-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center mr-2 text-xs">1</span>
                          节点4-1：正魔大战
                        </h4>
                        <p className="text-sm mt-2 pl-8">元婴已成，正魔两道积怨已久，大战一触即发...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 调解正魔冲突 [需魅力≥8]</li>
                            <li>• 支持正道宗门 [需声望≥100]</li>
                            <li>• 保持中立观望 [需悟性≥8]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center mr-2 text-xs">2</span>
                          节点4-2：天魔入侵
                        </h4>
                        <p className="text-sm mt-2 pl-8">正魔大战正酣之际，天空突然撕裂！域外天魔降临...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 寻找世界之心 [需悟性≥9]</li>
                            <li>• 启动古仙飞升台 [需修为≥元婴后期]</li>
                            <li>• 组织修士抵抗 [需声望≥200]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center mr-2 text-xs">3</span>
                          节点4-3：飞升抉择
                        </h4>
                        <p className="text-sm mt-2 pl-8">发现古仙飞升台，选择前往上界还是守护此界...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 立即飞升仙界 [需修为≥化神期]</li>
                            <li>• 统合正魔力量 [需魅力≥10]</li>
                            <li>• 封印天魔源头 [需体质≥10]</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 第五章详情 */}
                  <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 rounded-lg p-5 border border-red-800/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-file-alt text-red-300"></i>
                      第五章：执掌天纲
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-red-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center mr-2 text-xs">1</span>
                          节点5-1：终极选择
                        </h4>
                        <p className="text-sm mt-2 pl-8">历经天魔之乱，你面临修仙的终极命题...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">选项：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 飞升者路线 [需修为≥大乘期]</li>
                            <li>• 统御者路线 [需声望≥300]</li>
                            <li>• 守护者路线 [需体质≥12]</li>
                            <li>• 探索者路线 [需悟性≥12]</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-red-900/30 rounded-lg p-4">
                        <h4 className="font-bold flex items-center">
                          <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center mr-2 text-xs">2</span>
                          结局分支
                        </h4>
                        <p className="text-sm mt-2 pl-8">根据你的选择，将走向不同的结局...</p>
                        <div className="mt-2 pl-8">
                          <p className="text-xs text-blue-300 mb-1">结局类型：</p>
                          <ul className="text-sm space-y-1 pl-4">
                            <li>• 飞升结局 - 成功渡过天劫，飞升仙界</li>
                            <li>• 统御结局 - 统合正魔，建立新秩序</li>
                            <li>• 守护结局 - 牺牲自己，封印天魔</li>
                            <li>• 传奇结局 - 开辟全新道路，成为传说</li>
                            <li>• 陨落结局 - 道心破碎，修为尽失</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 导出按钮 */}
        <motion.button
          onClick={() => setShowExportModal(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 mb-6"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <i className="fa-solid fa-download mr-2"></i>
          导出JSON
        </motion.button>
        
        {/* 导出说明 */}
        <motion.div 
          className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-800/50 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-bold mb-3">使用说明</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-200">
            <li>导出的JSON文件包含完整的剧情节点结构，可用于剧情优化和扩展</li>
            <li>完整格式包含所有节点细节，适合深度分析和修改</li>
            <li>简化格式仅包含核心剧情流程，适合快速预览和分享</li>
            <li>通过章节选择可以单独导出特定章节的剧情内容</li>
            <li>使用搜索功能可以筛选包含特定关键词的剧情节点</li>
            <li>导出的JSON可以重新导入到游戏中使用（需要开发工具支持）</li>
          </ul>
        </motion.div>
        
        {/* 返回按钮 */}
        <motion.button
          onClick={() => {
            try {
              navigate('/');
            } catch (error) {
              console.error('Navigation error:', error);
              window.location.href = '/';
            }
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          返回首页
        </motion.button>
      </div>
      
      {/* JSON导出弹窗 */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExportModal(false)}
          >
            <motion.div 
              className="bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-900 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-indigo-600/50">
                <h2 className="text-2xl font-bold">剧情JSON导出</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadJson}
                    className="bg-green-700 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                    title="下载JSON文件"
                  >
                    <i className="fa-solid fa-file-arrow-down"></i>
                  </button>
                  <button 
                    onClick={() => setShowExportModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                    title="关闭"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-blue-200">剧情内容预览：{selectedChapter === 0 ? '全部章节' : `第${selectedChapter}章`}，{exportFormat === 'complete' ? '完整格式' : '简化格式'}</p>
                  {searchTerm && (
                    <span className="text-sm bg-blue-500/50 px-2 py-1 rounded-full">筛选: {searchTerm}</span>
                  )}
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-[60vh] text-sm">
                  <pre className="text-blue-200">{jsonExport}</pre>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-copy mr-2"></i>
                  复制到剪贴板
                </button>
                <button
                  onClick={downloadJson}
                  className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fa-solid fa-file-arrow-down mr-2"></i>
                  下载JSON文件
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 min-w-[100px] bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
              
              <div className="mt-4 text-xs text-blue-300">
                导出时间: {new Date().toLocaleString()} | 文件大小: {(new Blob([jsonExport]).size / 1024).toFixed(2)} KB | 版本: 1.0.1
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}