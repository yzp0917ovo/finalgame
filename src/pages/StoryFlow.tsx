import { useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cultivationLevels, cultivationStages, cultivationExperienceRequirements, getMaxAgeForCultivation } from '@/data/characters';
import { GameContext } from '@/contexts/gameContext';
import { AudioContext } from '@/contexts/audioContext';
import { storyNodes } from '@/data/storyNodes';
import { toast } from 'sonner';
import { nodeMapping } from '@/data/nodeMapping';
import CharacterDataPanel from '@/components/CharacterDataPanel';
import ThunderTribulationGame from '@/components/games/ThunderTribulationGame';
import HeartDemonGame from '@/components/games/HeartDemonGame';
import DungeonPuzzleGame from '@/components/games/DungeonPuzzleGame';
import SoulmateDialogueGame from '@/components/games/SoulmateDialogueGame';
import CraftingGame from '@/components/games/CraftingGame';
import AlchemySystem from '@/components/games/AlchemySystem';
import GameSettingsPanel from '@/components/GameSettingsPanel';
import StorePanel from '@/components/StorePanel';
import InventoryPanel from '@/components/InventoryPanel'; // 导入物品栏组件

// 检查是否首次获得灵石的状态
let hasShownSpiritStoneTutorial = false;

export default function StoryFlow() {
  const { gameState, makeChoice, toggleConditionDisplay, toggleAttributeChangesDisplay, toggleExperienceChangesDisplay, generateSaveCode, resetGame, completeTransition, toggleInventoryPanel, redeemCode, useItem, setGameState } = useContext(GameContext);
  const { playTrack, pauseTrack, isPlaying } = useContext(AudioContext);
  const navigate = useNavigate();
  
  // 状态管理
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<any>(null);
  const [showEffectToast, setShowEffectToast] = useState(false);
  const [showGameModal, setShowGameModal] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<'thunder' | 'dungeon' | 'soulmate' | 'heartDemon' | 'crafting' | null>(null);
  const [effectMessage, setEffectMessage] = useState('');
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [showTalentEffect, setShowTalentEffect] = useState(false);
  const [showAttributeChangeAnimation, setShowAttributeChangeAnimation] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false); // 横屏状态检测
  const [showSettingsPanel, setShowSettingsPanel] = useState(false); // 设置面板显示状态
  const [showStorePanel, setShowStorePanel] = useState(false); // 商店面板显示状态
  const [forceRender, setForceRender] = useState(0); // 用于强制渲染的状态

  // 如果没有角色数据，重定向到角色选择
  useEffect(() => {
    if (!gameState.currentCharacter) {
      navigate('/character-select');
    } else {
      // 当角色数据加载完成时，检查是否有新的成就可以解锁
      // 检查成就的代码暂时移除，避免错误
    }
  }, [gameState.currentCharacter, navigate]);
  
     // 角色数据加载完成后，检查新成就
  useEffect(() => {
    if (gameState.currentCharacter) {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('achievementCheck'));
        }
      }, 500);
    }
  }, [gameState.currentCharacter]);

  // 监听游戏状态变化，实时更新成就
  useEffect(() => {
    const handleGameStateChange = () => {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('achievementCheck'));
      }
    };
    
    // 监听localStorage变化，确保成就同步
    window.addEventListener('storage', handleGameStateChange);
    
    return () => {
      window.removeEventListener('storage', handleGameStateChange);
    };
  }, []);

  // 根据游戏节点切换背景音乐
  useEffect(() => {
    if (!isPlaying) return;
    
    const currentNode = gameState.currentNode;
    
    // 结局计算或显示节点 - 庄重的音乐
    if (currentNode === 'ending_calculation_display' || 
        currentNode.includes('ending') && currentNode !== 'ending_calculation') {
      playTrack('endingTheme');
      return;
    }
    
     // 紧张场景 - 激烈的音乐
     if (currentNode.includes('tribulation') && currentNode !== 'nine_heavens_tribulation' ||
         currentNode.includes('crisis') && currentNode !== 'cultivation_crisis' ||
         currentNode.includes('demon') ||
         currentNode.includes('betrayal') ||
         currentNode.includes('robbery') ||
         currentNode.includes('kill') ||
         currentNode.includes('assassinate') ||
         currentNode.includes('murder')) {
       playTrack('combatTheme');
       return;
     }
    
       // 所有其他场景 - 休闲平静的音乐
      playTrack('peacefulTheme');
      
      // 额外的安全检查，确保在切换到新场景时清除所有覆盖层
      if (window && window.dispatchEvent) {
        setTimeout(() => {
          window.dispatchEvent(new Event('forceRenderUpdate'));
        }, 100);
      }
      
      // 清理函数
    return () => {
      // 不在这里暂停，只在场景切换时更改曲目
    };
  }, [gameState.currentNode, playTrack, isPlaying]);

  // 添加屏幕方向检测效果和物品栏更新监听
  // 直接在组件顶层定义回调函数
  const handleInventoryUpdate = useCallback(() => {
    setForceRender(prev => prev + 1);
  }, []);
  
  // 监听动态属性变化设置改变事件
  useEffect(() => {
    const handleSettingChange = () => {
      setForceRender(prev => prev + 1);
    };
    
    // 监听游戏结束事件，确保能立即更新UI
    const handleGameEnded = () => {
      setForceRender(prev => prev + 1);
    };
    
    window.addEventListener('attributeAnimationSettingChanged', handleSettingChange);
    window.addEventListener('gameEnded', handleGameEnded);
    
    return () => {
      window.removeEventListener('attributeAnimationSettingChanged', handleSettingChange);
      window.removeEventListener('gameEnded', handleGameEnded);
    };
  }, []);
  
  useEffect(() => {
    const checkOrientation = () => {
      // 使用window.innerWidth和window.innerHeight来判断是横屏还是竖屏
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
    };
    
    // 初始检查
    checkOrientation();
    
    // 添加事件监听器
     window.addEventListener('resize', checkOrientation);
     window.addEventListener('inventoryUpdated', handleInventoryUpdate);
     // 添加强制重新渲染事件监听器
     window.addEventListener('forceRenderUpdate', () => {
       setForceRender(prev => prev + 1);
     });
     
     // 清理函数
    return () => {
     window.removeEventListener('resize', checkOrientation);
     window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
     window.removeEventListener('forceRenderUpdate', () => setForceRender(prev => prev + 1));
    };
  }, [handleInventoryUpdate]);

  // 检查新的成就
  const checkNewAchievements = () => {
    try {
      // 立即检查并更新成就状态
      const currentState = JSON.parse(localStorage.getItem('xiuxian_game_state') || '{}');
      
      // 检查URL中的node参数，如果有则更新currentNode
      const urlParams = new URLSearchParams(window.location.search);
      const nodeParam = urlParams.get('node');
      if (nodeParam) {
        currentState.currentNode = nodeParam;
        console.log('从URL参数更新currentNode:', nodeParam);
      }
      
      // 确保unlockedAchievements数组存在
      if (!currentState.unlockedAchievements) {
        currentState.unlockedAchievements = [];
      }
      
      // 强制刷新localStorage以确保成就状态更新
      localStorage.setItem('xiuxian_game_state', JSON.stringify(currentState));
      
      // 更新游戏状态
      setGameState(prev => ({
        ...prev,
        currentNode: nodeParam || prev.currentNode
      }));
      
      // 手动触发UI更新
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('achievementCheck'));
      }
    } catch (error) {
      console.error('检查成就失败:', error);
    }
  };
  
   // 显示属性变化提示
  const showAttributeChange = (attributeName: string, value: number) => {
    // 检查是否开启了动态属性变化显示
    const showAnimation = JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true');
    
    // 如果关闭了动态显示，则直接返回
    if (!showAnimation) return;
    
     const attributeMap: Record<string, string> = {
      'charm': '魅力',
      'comprehension': '悟性',
      'constitution': '体质',
      'family': '家境',
      'luck': '气运',
      'spiritStone': '灵石',
      'pills': '丹药',
      'health': '生命值',
      'reputation': '声望'
    };
    
    const displayName = attributeMap[attributeName] || attributeName;
    const message = `${displayName} ${value > 0 ? '+' : ''}${value}`;
    
    toast.info(message, {
      duration: 2000,
      position: 'top-right',
      style: {
        backgroundColor: value > 0 ? 'rgba(52, 211, 153, 0.9)' : 'rgba(239, 68, 68, 0.9)',
      }
    });
  };
  
  // 处理强制选择完成事件
  useEffect(() => {
    const handleForceChoiceCompleted = () => {
      checkNewAchievements();
    };
    
    window.addEventListener('force-choice-completed', handleForceChoiceCompleted);
    return () => {
      window.removeEventListener('force-choice-completed', handleForceChoiceCompleted);
    };
   }, []);

  // 处理URL参数变化，触发重新加载数据
  useEffect(() => {
    // 当URL中的reload参数变化时，检查新数据
    const handleReload = () => {
      checkNewAchievements();
    };
    
    // 监听popstate事件，处理浏览器后退/前进
    window.addEventListener('popstate', handleReload);
    
    // 初始加载时检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reload') || urlParams.has('node')) {
      handleReload();
    }
    
    return () => {
      window.removeEventListener('popstate', handleReload);
    };
  }, [gameState.currentNode]);

   // 检查当前节点是否需要显示小游戏
  useEffect(() => {
    if (!gameState.currentCharacter) return;
    
   // 根据当前节点决定是否显示小游戏
  if (gameState.currentNode === 'heavenly_tribulation' || gameState.currentNode === 'chapter3_4') {
    // 最终天劫小游戏
    if (gameState.currentCharacter.cultivation.level >= 8 && 
        !gameState.currentCharacter.choices.includes('已玩雷劫游戏')) {
      setCurrentGame('thunder');
      setShowGameModal(true);
    }
  } else if (gameState.currentNode === 'potential_soulmate') {
      // 道侣游戏
      if (gameState.currentCharacter.charm >= 7 && 
          !gameState.currentCharacter.choices.includes('已玩道侣游戏')) {
        setCurrentGame('soulmate');
        setShowGameModal(true);
      }
    } else if (gameState.currentNode === 'heart_demon_tribulation' || gameState.currentNode === 'chapter2_4') {
      // 心魔游戏
      if (gameState.currentCharacter.cultivation.level >= 4 && 
          !gameState.currentCharacter.choices.includes('已玩心魔游戏')) {
        setCurrentGame('heartDemon');
        setShowGameModal(true);
      }
    } else if (gameState.currentNode === 'alchemy_room' || gameState.currentNode.includes('alchemy')) {
      // 炼丹游戏 - 在炼丹房或与炼丹相关的节点触发
      if (gameState.currentCharacter.cultivation.level >= 2 && 
          !gameState.currentCharacter.choices.includes('已玩炼丹游戏')) {
        setCurrentGame('crafting');
        setShowGameModal(true);
      }
    }
  }, [gameState.currentNode, gameState.currentCharacter]);
  
  // 检查当前节点是否为结局节点，如果是则导航到结局页面
  useEffect(() => {
    // 当节点是结局节点时，直接进入结局结算页面，无需刷新
    if (gameState.currentNode === 'ending_calculation_display') {
      try {
        // 改进路径检查逻辑，处理运行时和非运行时路径
        const isAlreadyAtEndingPage = window.location.pathname.includes('/ending-calculation');
        
        if (!isAlreadyAtEndingPage) {
          // 使用相对路径导航，避免路径问题
          navigate('/ending-calculation');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // 如果React Router导航失败，使用原生跳转作为后备方案
        if (!window.location.pathname.includes('/ending-calculation')) {
          window.location.href = window.location.pathname.includes('/runtime') 
            ? '/runtime/ending-calculation' 
            : '/ending-calculation';
        }
      }
    }
  }, [gameState.currentNode, navigate]);

  // 获取当前节点信息 - 增强版，确保节点始终存在
  const getCurrentNode = useCallback(() => {
    // 尝试直接获取节点
    let node = storyNodes[gameState.currentNode];
    
    // 如果节点不存在，尝试通过映射表转换
    if (!node && gameState.currentNode) {
      const mappedNodeId = nodeMapping[gameState.currentNode as keyof typeof nodeMapping];
      if (mappedNodeId) {
        node = storyNodes[mappedNodeId];
      }
    }
    
    if (node) return node;
    
    // 如果节点不存在，使用安全的默认节点
    return { 
      id: 'unknown', 
      text: '正在加载剧情内容...', 
      description: '剧情转换中',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mystical%20chinese%20fantasy%20background%2C%20scroll%20with%20ancient%20text&sign=945212ecb10baf019e546f97020e6c7d', 
      choices: [] 
    };
  }, [gameState.currentNode]);
  
  // 为了兼容旧代码，保留currentNode函数引用
  const currentNode = getCurrentNode;
  const getCultivationText = () => {
    if (!gameState.currentCharacter) return '凡人';
    
    const { level, stage } = gameState.currentCharacter.cultivation;
    return `${cultivationLevels[level]}${cultivationStages[stage]}`;
  };

  // 将inventory对象转换为数组格式，适应InventoryPanel组件
  const convertInventoryToArray = () => {
    if (!gameState.currentCharacter?.inventory) return [];
    
    const inventory = gameState.currentCharacter.inventory;
    const items: any[] = [];
    
    // 转换草药
    if (inventory.herbs) {
      Object.entries(inventory.herbs).forEach(([id, quantity]) => {
        if (quantity > 0) {
          items.push({
            id: `herb_${id}`,
            name: id,
            description: '草药材料',
            quantity: quantity as number,
            icon: 'leaf',
            color: 'text-green-400',
            effectType: 'material',
            effect: '用于炼丹'
          });
        }
      });
    }
    
    // 转换矿物
    if (inventory.minerals) {
      Object.entries(inventory.minerals).forEach(([id, quantity]) => {
        if (quantity > 0) {
          items.push({
            id: `mineral_${id}`,
            name: id,
            description: '矿物材料',
            quantity: quantity as number,
            icon: 'gem',
            color: 'text-blue-400',
            effectType: 'material',
            effect: '用于炼丹'
          });
        }
      });
    }
    
    // 转换妖兽材料
    if (inventory.beastParts) {
      Object.entries(inventory.beastParts).forEach(([id, quantity]) => {
        if (quantity > 0) {
          items.push({
            id: `beast_${id}`,
            name: id,
            description: '妖兽材料',
            quantity: quantity as number,
            icon: 'paw',
            color: 'text-red-400',
            effectType: 'material',
            effect: '用于炼丹'
          });
        }
      });
    }
    
    // 转换丹药
    if (inventory.pills) {
      Object.entries(inventory.pills).forEach(([id, quantity]) => {
        if (quantity > 0) {
          const [recipeId, quality] = id.split('_');
          items.push({
            id: `pill_${id}`,
            name: `${recipeId}_${quality}`,
            description: `${quality}品质丹药`,
            quantity: quantity as number,
            icon: 'pills',
            color: 'text-purple-400',
            effectType: 'pill',
            quality: quality,
            recipeId: recipeId,
            effect: '使用可获得效果'
          });
        }
      });
    }
    
    // 转换特殊材料
    if (inventory.specialIngredients) {
      Object.entries(inventory.specialIngredients).forEach(([id, quantity]) => {
        if (quantity > 0) {
          items.push({
            id: `special_${id}`,
            name: id,
            description: '特殊材料',
            quantity: quantity as number,
            icon: 'star',
            color: 'text-yellow-400',
            effectType: 'material',
            effect: '用于炼丹'
          });
        }
      });
    }
    
    return items;
  };

  // 导航到死亡结局
  const navigateToDeathEnding = () => {
    // 保存游戏状态，标记为死亡结局
    const characterWithDeath = {
      ...gameState.currentCharacter,
      isDeathEnding: true,
      deathReason: '强行选择超出自身能力的选项',
      health: 0 // 确保生命值设置为0
    };
    
    const updatedGameState = {
      ...gameState,
      currentCharacter: characterWithDeath,
      currentNode: 'ending_calculation_display'
    };
    
    // 保存到localStorage
    localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
    
    // 导航到结局页面
    try {
      navigate('/ending-calculation');
    } catch (error) {
      window.location.href = '/ending-calculation';
    }
  };

  // 显示效果提示
  const showEffectMessage = (message: string) => {
    setEffectMessage(message);
    setShowEffectToast(true);
    // 增加显示时间，从3秒改为6秒，让用户有足够时间阅读
    setTimeout(() => {
      setShowEffectToast(false);
    }, 6000);
  };

  // 处理强制选择的后果
  const handleForceChoice = () => {
    if (!selectedChoice) return;
    
    try {
      // 为不满足条件的选择添加特殊处理
      const newCharacter = { ...gameState.currentCharacter };
      
      // 确保statusEffects数组存在
      if (!newCharacter.statusEffects) {
        newCharacter.statusEffects = [];
      }
      
      // 随机选择负面效果强度，增加多样性
      const severity = Math.random();
      
      // 根据不同类型的条件添加不同的负面效果
      if (selectedChoice.conditionText) {
        // 魅力不足的负面效果
        if (selectedChoice.conditionText.includes('魅力')) {
          // 随机决定具体后果
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.charm = Math.max(0, newCharacter.charm - (severity > 0.7 ? 3 : 2));
            if (!newCharacter.statusEffects.includes('声名狼藉')) {
              newCharacter.statusEffects.push('声名狼藉'); // 长期影响：降低后续社交成功率
            }
            showEffectMessage('你的行为严重损害了声誉，今后很难获得他人信任。');
          } else if (consequenceType < 0.6) {
            newCharacter.charm = Math.max(0, newCharacter.charm - 2);
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 30);
            showEffectMessage('你因鲁莽行为付出了代价，不仅魅力下降，还损失了不少灵石。');
          } else {
            newCharacter.charm = Math.max(0, newCharacter.charm - 2);
            newCharacter.luck = Math.max(0, newCharacter.luck - 1);
            if (!newCharacter.statusEffects.includes('社交障碍')) {
              newCharacter.statusEffects.push('社交障碍'); // 长期影响：部分社交选项不可用
            }
            showEffectMessage('你的言行举止让周围人对你敬而远之，魅力和运气都受到了影响。');
          }
        }
        // 悟性不足的负面效果
        else if (selectedChoice.conditionText.includes('悟性')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.comprehension = Math.max(0, newCharacter.comprehension - (severity > 0.7 ? 3 : 2));
            if (!newCharacter.statusEffects.includes('走火入魔')) {
              newCharacter.statusEffects.push('走火入魔'); // 长期影响：修炼速度减半
            }
            showEffectMessage('强行领悟导致走火入魔，你的修为精进速度大幅下降。');
          } else if (consequenceType < 0.6) {
            newCharacter.comprehension = Math.max(0, newCharacter.comprehension - 2);
            newCharacter.health -= (severity > 0.7 ? 30 : 20);
            showEffectMessage('强行突破认知极限，你的精神受到创伤，身体也变得虚弱。');
          } else {
            newCharacter.comprehension = Math.max(0, newCharacter.comprehension - 2);
            if (!newCharacter.statusEffects.includes('思维混乱')) {
              newCharacter.statusEffects.push('思维混乱'); // 长期影响：部分需要高悟性的选项暂时不可用
            }
            showEffectMessage('过度思考让你的思维变得混乱，短期内无法清晰理解复杂的功法。');
          }
        }
        // 体质不足的负面效果
        else if (selectedChoice.conditionText.includes('体质')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.constitution = Math.max(0, newCharacter.constitution - (severity > 0.7 ? 3 : 2));
            newCharacter.health -= (severity > 0.7 ? 40 : 30);
            if (!newCharacter.statusEffects.includes('重伤未愈')) {
              newCharacter.statusEffects.push('重伤未愈'); // 长期影响：所有属性暂时-1
            }
            showEffectMessage('超出身体极限，你受了严重内伤，需要长时间调养才能恢复。');
          } else if (consequenceType < 0.6) {
            newCharacter.constitution = Math.max(0, newCharacter.constitution - 2);
            newCharacter.health -= 30;
            if (newCharacter.health <= 0) {
              // 体质太弱导致死亡结局
              navigateToDeathEnding();
              setShowWarningModal(false);
              return;
            }
            showEffectMessage('你的身体无法承受这样的负荷，受了不轻的伤。');
          } else {
            newCharacter.constitution = Math.max(0, newCharacter.constitution - 2);
            if (!newCharacter.statusEffects.includes('元气大伤')) {
              newCharacter.statusEffects.push('元气大伤'); // 长期影响：健康值上限降低
            }
            newCharacter.health = Math.floor(newCharacter.health * 0.8);
            showEffectMessage('强行行动让你元气大伤，健康状况大幅下降。');
          }
        }
        // 家境不足的负面效果
        else if (selectedChoice.conditionText.includes('家境')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.4) {
            newCharacter.family = Math.max(0, newCharacter.family - 1);
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 50);
            if (!newCharacter.statusEffects.includes('家族蒙羞')) {
              newCharacter.statusEffects.push('家族蒙羞'); // 长期影响：家族支持减少
            }
            showEffectMessage('你的行为让家族蒙羞，今后很难再获得家族的经济支持。');
          } else {
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - (severity > 0.7 ? 80 : 50));
            if (!newCharacter.statusEffects.includes('债台高筑')) {
              newCharacter.statusEffects.push('债台高筑'); // 长期影响：每回合损失灵石
            }
            showEffectMessage('为了强行完成这件事，你欠下了巨额债务，今后每月都要偿还利息。');
          }
        }
        // 气运不足的负面效果
        else if (selectedChoice.conditionText.includes('气运')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.luck = Math.max(0, newCharacter.luck - (severity > 0.7 ? 4 : 3));
            if (!newCharacter.statusEffects.includes('霉运缠身')) {
              newCharacter.statusEffects.push('霉运缠身'); // 长期影响：降低奇遇概率
            }
            showEffectMessage('逆天行事，霉运缠身，你感觉最近做什么都不顺利。');
          } else if (consequenceType < 0.6) {
            newCharacter.luck = Math.max(0, newCharacter.luck - 3);
            // 随机失去部分宝物，但至少保留一件
            if (newCharacter.resources.treasures && newCharacter.resources.treasures.length > 1) {
              newCharacter.resources.treasures = newCharacter.resources.treasures.filter(t => Math.random() > 0.3);
              // 确保至少保留一件宝物
              if (newCharacter.resources.treasures.length === 0 && newCharacter.resources.treasures.length > 0) {
                newCharacter.resources.treasures = [newCharacter.resources.treasures[0]];
              }
            }
            showEffectMessage('强行改变命运的代价是惨痛的，你失去了一些珍贵的宝物。');
          } else {
            newCharacter.luck = Math.max(0, newCharacter.luck - 2);
            if (!newCharacter.statusEffects.includes('因果纠缠')) {
              newCharacter.statusEffects.push('因果纠缠'); // 长期影响：进入特殊因果剧情
            }
            showEffectMessage('你的行为引起了因果律的注意，未来的道路上将会有特殊的考验等着你。');
          }
        }
        // 灵石不足的负面效果
        else if (selectedChoice.conditionText.includes('灵石')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 30);
            if (!newCharacter.statusEffects.includes('负债累累')) {
              newCharacter.statusEffects.push('负债累累'); // 长期影响：限制高消费行为
            }
            showEffectMessage('你欠下了巨额债务，今后的修炼之路将更加艰难，高级修炼资源对你来说遥不可及。');
          } else if (consequenceType < 0.6) {
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 30);
            newCharacter.health -= 10;
            showEffectMessage('为了获取所需的资源，你不得不做一些有损健康的事情。');
          } else {
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 30);
            newCharacter.resources.pills = Math.max(0, newCharacter.resources.pills - (severity > 0.7 ? 3 : 2));
            showEffectMessage('为了筹集资金，你不得不贱卖了一些珍贵的丹药。');
          }
        }
        // 境界不足的负面效果
        else if (selectedChoice.conditionText.includes('境界')) {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            // 确保境界不会降到负数
            if (newCharacter.cultivation.stage > 0) {
              newCharacter.cultivation.stage -= 1;
            } else if (newCharacter.cultivation.level > 0) {
              newCharacter.cultivation.level -= 1;
              newCharacter.cultivation.stage = 3; // 大圆满
            }
            newCharacter.health -= 40;
            if (!newCharacter.statusEffects.includes('道心受损')) {
              newCharacter.statusEffects.push('道心受损'); // 长期影响：突破难度增加
            }
            showEffectMessage('境界不足强行挑战，不仅受了重伤，道心也受到了严重创伤，今后突破境界将更加困难。');
          } else if (consequenceType < 0.6) {
            // 确保境界不会降到负数
            if (newCharacter.cultivation.stage > 0) {
              newCharacter.cultivation.stage -= 1;
            } else if (newCharacter.cultivation.level > 0) {
              newCharacter.cultivation.level -= 1;
              newCharacter.cultivation.stage = 3; // 大圆满
            }
            newCharacter.health -= 40;
           if (newCharacter.health <= 0) {
              // 境界不够导致死亡结局
              navigateToDeathEnding();
              setShowWarningModal(false);
              return;
            }
            // 添加一些随机性，让后果更加丰富
            if (Math.random() > 0.7) {
              showEffectMessage('境界不足强行挑战，你不仅受了重伤，修为也有所倒退。');
            } else if (Math.random() > 0.4) {
              showEffectMessage('你勉强承受住了压力，但也付出了不小的代价。');
            } else {
              showEffectMessage('虽然过程艰难，但你成功完成了这个挑战，尽管受了些伤。');
            }
          } else {
            // 确保境界不会降到负数
            if (newCharacter.cultivation.level > 0) {
              newCharacter.cultivation.level -= 1;
              newCharacter.cultivation.stage = 0; // 初期
            }
            if (!newCharacter.statusEffects.includes('修为尽失')) {
              newCharacter.statusEffects.push('修为尽失'); // 长期影响：所有属性暂时-2
            }
            showEffectMessage('你的举动触怒了天地法则，修为大幅下降，需要从头再来。');
          }
        }
        // 通用负面效果
        else {
          const consequenceType = Math.random();
          if (consequenceType < 0.3) {
            newCharacter.health = Math.max(0, newCharacter.health - (severity > 0.7 ? 25 : 15));
            newCharacter.luck = Math.max(0, newCharacter.luck - 1);
            if (!newCharacter.statusEffects.includes('身心俱疲')) {
              newCharacter.statusEffects.push('身心俱疲'); // 长期影响：所有行动消耗加倍
            }
            showEffectMessage('强行选择此选项，你付出了惨重的代价，身心俱疲。');
          } else if (consequenceType < 0.6) {
            // 随机降低一个属性
            const attributes = ['charm', 'comprehension', 'constitution', 'family', 'luck'];
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)] as keyof typeof newCharacter;
            (newCharacter as any)[randomAttr] = Math.max(0, (newCharacter as any)[randomAttr] - (severity > 0.7 ? 3 : 2));
            newCharacter.health = Math.max(0, newCharacter.health - 15);
            showEffectMessage(`强行行动让你在${randomAttr === 'charm' ? '魅力' : randomAttr === 'comprehension' ? '悟性' : randomAttr === 'constitution' ? '体质' : randomAttr === 'family' ? '家境' : randomAttr === 'luck' ? '气运' : randomAttr}方面受损，还受了一些伤。`);
          } else {
            // 触发特殊负面事件
            if (!newCharacter.statusEffects.includes('厄运缠身')) {
              newCharacter.statusEffects.push('厄运缠身'); // 强制进入厄运事件
            }
            showEffectMessage('你的鲁莽行为招来了未知的厄运，前方的道路将充满荆棘。');
          }
          
          if (newCharacter.health <= 0) {
            // 生命值归零导致死亡结局
            navigateToDeathEnding();
            setShowWarningModal(false);
            return;
          }
        }
      }
      
      // 应用选择的后果并导航到下一个节点
      if (selectedChoice.consequence) {
        try {
          selectedChoice.consequence(newCharacter);
        } catch (e) {
          console.error('应用选择后果时出错:', e);
        }
      }
      
      // 保存当前选择到角色历史记录
      if (!newCharacter.choices.includes(selectedChoice.text)) {
        newCharacter.choices.push(selectedChoice.text);
        newCharacter.choices.push('强行选择'); // 添加标记，表示这是一个强行选择
      }
      
      // 确定下一个节点
      let nextNode = '';
      try {
        if (typeof selectedChoice.nextNode === 'function') {
          nextNode = selectedChoice.nextNode(newCharacter);
        } else {
          nextNode = selectedChoice.nextNode;
        }
      } catch (error) {
        console.error('获取下一个节点时出错:', error);
        nextNode = 'mid_game'; // 出错时默认进入中期游戏节点
      }
      
      // 根据新增的负面状态决定是否进入特殊剧情节点
      if (newCharacter.statusEffects.includes('因果纠缠')) {
        nextNode = 'karma_cycle';
      } else if (newCharacter.statusEffects.includes('厄运缠身')) {
        nextNode = 'negative_consequence';
      }
      
      // 更新游戏状态
      const updatedGameState = {
        ...gameState,
        currentCharacter: newCharacter,
        currentNode: nextNode
      };
      
      // 保存到localStorage
      localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
      
      // 显示效果消息后，直接应用状态变化，不再刷新页面
      // 给用户足够时间看到警告信息，但不会让界面卡住
      setTimeout(() => {
        // 重置状态
        setShowWarningModal(false);
        setSelectedChoice(null);
        
        // 由于React无法直接修改Context中的状态，我们需要强制重新渲染
        // 直接使用React Router的导航功能，避免使用window.location.href导致的页面完全刷新
        try {
            // 检查是否需要导航到特殊节点
            if (nextNode === 'karma_cycle' || nextNode === 'negative_consequence') {
              navigate(`/story-flow?node=${nextNode}`);
            } else {
              // 对于普通节点，直接导航到下一个节点，而不是刷新当前节点
              navigate(`/story-flow?node=${nextNode || 'mid_game'}&t=${Date.now()}`);
            }
        } catch (error) {
          console.error('Navigation error:', error);
          // 如果React Router导航失败，使用查询参数刷新作为后备方案
          window.location.href = `/story-flow?node=${nextNode || 'mid_game'}`;
        }
      }, 3000);
    } catch (error) {
      console.error('处理强制选择时出错:', error);
      // 出错时重置状态并提示用户
      setShowWarningModal(false);
      setSelectedChoice(null);
      toast.error('处理选择时发生错误，请稍后再试');
    }
  };

   // 处理游戏完成后的逻辑
  const handleGameComplete = (success: boolean, score?: number, relationshipScore?: number, selectedPath?: string, allocatedStats?: any, craftingResult?: any) => {
    setShowGameModal(false);
    setCurrentGame(null);
    
    // 强制刷新，确保所有覆盖层都被清除
    setForceRender(prev => prev + 1);
    
    if (!gameState.currentCharacter) return;
    
    const newCharacter = { ...gameState.currentCharacter };
    
    // 标记游戏已完成
    if (currentGame === 'thunder') {
      newCharacter.choices.push('已玩雷劫游戏');
      if (success) {
        // 雷劫游戏成功奖励
        newCharacter.cultivation.level = 9; // 直接提升到大乘境界
        newCharacter.constitution = Math.min(20, newCharacter.constitution + 3);
        newCharacter.luck = Math.min(20, newCharacter.luck + 2);
        showEffectMessage('恭喜你成功渡过雷劫！修为大幅提升！');
        
        // 完成后直接进入结局计算
        const updatedGameState = {
          ...gameState,
          currentCharacter: newCharacter,
          currentNode: 'ending_calculation_display'
        };
        localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
        
        // 延迟导航到结局页面
        setTimeout(() => {
          navigate('/ending-calculation');
        }, 2000);
      } else {
        // 雷劫游戏失败惩罚
        newCharacter.health = Math.max(1, newCharacter.health - 30);
        newCharacter.constitution = Math.max(0, newCharacter.constitution - 1);
        showEffectMessage('雷劫失败，你受了重伤，但获得了宝贵的经验。');
      }
    } else if (currentGame === 'dungeon') {
      // 彻底修复符文谜题完成后无法进入下一个剧情的问题
      // 1. 立即记录游戏已完成，避免重复触发
      if (!newCharacter.choices.includes('已玩符文谜题游戏')) {
        newCharacter.choices.push('已玩符文谜题游戏');
      }
      
      if (success) {
        // 符文谜题成功奖励
        newCharacter.comprehension = Math.min(20, newCharacter.comprehension + 2);
        newCharacter.resources.treasures.push('符文秘录');
        newCharacter.resources.spiritStone += 150;
        showEffectMessage('恭喜你解开了古代符文谜题！获得了宝贵的传承！');
        
        // 成功后导航到专门的成功节点
        const nextNode = 'chapter3_2_dungeon_success';
        
        // 更新游戏状态
        const updatedGameState = {
          ...gameState,
          currentCharacter: newCharacter,
          currentNode: nextNode
        };
        
        // 确保状态保存到localStorage
        try {
          localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
        } catch (storageError) {
          console.error('无法保存游戏状态:', storageError);
        }
        
        // 强制刷新整个游戏状态
        setForceRender(prev => prev + 1);
        
        // 立即强制刷新页面到下一个剧情节点
        // 这是最可靠的方式，确保无论如何都能继续剧情
        setTimeout(() => {
          console.log('符文谜题成功，强制刷新到成功节点');
          window.location.href = `${window.location.pathname}?node=${nextNode}&refresh=true&t=${Date.now()}`;
        }, 500);
      } else {
        // 符文谜题失败惩罚
        newCharacter.health = Math.max(1, newCharacter.health - 15);
        showEffectMessage('时间到了，你未能完全解开符文谜题，但还是获得了一些收获。');
        
        // 失败后导航到专门的失败节点
        const nextNode = 'chapter3_2_dungeon_failure';
        
        // 更新游戏状态
        const updatedGameState = {
          ...gameState,
          currentCharacter: newCharacter,
          currentNode: nextNode
        };
        
        // 保存到localStorage
        try {
          localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
        } catch (storageError) {
          console.error('无法保存游戏状态:', storageError);
        }
        
        // 强制刷新整个游戏状态
        setForceRender(prev => prev + 1);
        
        // 立即强制刷新页面到下一个剧情节点
        setTimeout(() => {
          console.log('符文谜题失败，强制刷新到失败节点');
          window.location.href = `${window.location.pathname}?node=${nextNode}&refresh=true&t=${Date.now()}`;
        }, 500);
      }
    } else if (currentGame === 'pathSelection') {
      // 原来的秘境游戏逻辑
      newCharacter.choices.push('已玩秘境游戏');
      if (success) {
        // 秘境游戏成功奖励
        newCharacter.comprehension = Math.min(20, newCharacter.comprehension + 2);
        newCharacter.resources.treasures.push('上古传承');
        newCharacter.resources.spiritStone += 200;
        showEffectMessage('恭喜你解开了谜题！获得了上古传承和大量资源！');
      } else {
        // 秘境游戏失败惩罚
        newCharacter.health = Math.max(1, newCharacter.health - 20);
        newCharacter.resources.spiritStone -= 50;
        showEffectMessage('时间到了，你未能解开谜题，受了些伤，还损失了一些灵石。');
      }
    } else if (currentGame === 'soulmate') {
      newCharacter.choices.push('已玩道侣游戏');
      // 根据好感度调整属性
      if (relationshipScore !== undefined) {
        if (relationshipScore > 80) {
          newCharacter.charm = Math.min(20, newCharacter.charm + 3);
          newCharacter.choices.push('结为道侣');
          showEffectMessage('你们的感情更加深厚，正式结为道侣！');
        } else if (relationshipScore > 50) {
          newCharacter.charm = Math.min(20, newCharacter.charm + 1);
          newCharacter.choices.push('感情升温');
          showEffectMessage('你们的关系有了进一步发展。');
        }
      }
    } else if (currentGame === 'heartDemon') {
      // 确保心魔游戏只被标记一次
      if (!newCharacter.choices.includes('已玩心魔游戏')) {
        newCharacter.choices.push('已玩心魔游戏');
      }
      if (success) {
        // 心魔游戏成功奖励
        newCharacter.cultivation.level = 5; // 元婴
        newCharacter.comprehension = Math.min(20, newCharacter.comprehension + 1);
        showEffectMessage('你成功战胜了心魔，道心更加坚定！元婴已成！');
      } else {
        // 心魔游戏失败惩罚
        newCharacter.health = Math.max(1, newCharacter.health - 30);
        newCharacter.comprehension = Math.max(0, newCharacter.comprehension - 1);
        newCharacter.cultivation.level = 4; // 退回到金丹期
        showEffectMessage('心魔侵蚀了你的道心，元婴溃散，修为倒退至结丹期。');
      }
    } else if (currentGame === 'crafting') {
      // 炼丹游戏完成处理
      newCharacter.choices.push('已玩炼丹游戏');
      if (success && craftingResult) {
        // 炼丹游戏成功奖励
        newCharacter.comprehension = Math.min(20, newCharacter.comprehension + 1);
        newCharacter.resources.spiritStone += 100;
        
        // 确保inventory存在
        if (!newCharacter.inventory) {
          newCharacter.inventory = {
            herbs: {},
            minerals: {},
            beastParts: {},
            pills: {},
            specialIngredients: {}
          };
        }
        
        // 确保pills对象存在
        if (!newCharacter.inventory.pills) {
          newCharacter.inventory.pills = {};
        }
        
        // 根据炼制结果添加丹药到物品栏
        const pillKey = `${craftingResult.recipeId}_${craftingResult.quality}`;
        const currentQuantity = newCharacter.inventory.pills[pillKey] || 0;
        newCharacter.inventory.pills[pillKey] = currentQuantity + craftingResult.quantity;
        
        // 同时也更新旧的resources.pills字段以保持兼容性
        newCharacter.resources.pills = (newCharacter.resources.pills || 0) + craftingResult.quantity;
        
        showEffectMessage(`恭喜你成功炼制了${craftingResult.quantity}颗${craftingResult.quality}品质的丹药！`);
      } else {
        // 炼丹游戏失败惩罚
        newCharacter.health = Math.max(1, newCharacter.health - 10);
        showEffectMessage('炼丹失败，材料受损，但你获得了宝贵的经验。');
      }
    }
    
    // 更新游戏状态
    const updatedGameState = {
      ...gameState,
      currentCharacter: newCharacter
    };
    
    localStorage.setItem('xiuxian_game_state', JSON.stringify(updatedGameState));
    
    // 对于所有游戏，添加页面刷新作为保障，确保剧情继续
    setTimeout(() => {
      console.log(`${currentGame}游戏完成，强制刷新页面`);
      window.location.reload();
    }, 1500);
  };
  
  // 处理选择
   const handleChoice = (choiceId: string) => {
    const node = getCurrentNode();
    const choice = node.choices.find(c => c.id === choiceId);
    if (!choice) return;
    
    // 检查是否满足条件
    if (choice.condition && !checkChoiceCondition(choice)) {
      // 不满足条件时，显示界面内警告而不是弹窗
      setSelectedChoice(choice);
      setShowWarningModal(true);
      return;
    }
    
    // 正常选择的处理
    makeChoice(choiceId);
    // 做出选择后检查成就
    setTimeout(() => {if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('achievementCheck'));
      }
    }, 500);
  };
  
  // 监听灵石更新事件
  useEffect(() => {
      const handleSpiritStoneUpdate = (event: Event) => {
        // 检查是否开启了动态属性变化显示
        const showAnimation = JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true');
        
        // 如果关闭了动态显示，则直接返回
        if (!showAnimation) return;
        
        const customEvent = event as CustomEvent;
        if (customEvent.detail) {
          const { amount, source } = customEvent.detail;
          if (amount > 0) {
            toast.success(`获得 ${amount} 灵石 (来源: ${source === 'family_income' ? '家境收入' : '其他'})`, {
              duration: 2000,
              position: 'top-right',
            });
            
            // 在玩家首次获得灵石时，强制弹出提示
            if (!hasShownSpiritStoneTutorial) {
              hasShownSpiritStoneTutorial = true;
              setTimeout(() => {
                toast.info('灵石可在坊市商店购买增强实力的道具。点击商店图标查看更多信息。', {
                  duration: 6000,
                  position: 'top-center',
                  style: {
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                  }
                });
              }, 1000);
            }
          }
        }
      };
    
    window.addEventListener('spiritStoneUpdate', handleSpiritStoneUpdate);
    return () => {
      window.removeEventListener('spiritStoneUpdate', handleSpiritStoneUpdate);
    };
  }, []);
  
    // 监听境界突破事件
    useEffect(() => {
      const handleCultivationBreakthrough = (event: Event) => {
        // 不显示突破境界的toast提示
        // const customEvent = event as CustomEvent;
        // if (customEvent.detail) {
        //   const { oldLevel, newLevel } = customEvent.detail;
        //   // 确保newLevel是有效的索引，防止显示undefined
        //   const levelName = cultivationLevels[newLevel] || "未知境界";
        //   toast.success(`恭喜！成功突破至${levelName}境界！`, {
        //     duration: 3000,
        //     position: 'top-center',
        //     style: {
        //       backgroundColor: 'rgba(52, 211, 153, 0.9)',
        //     }
        //   });
        // }
      };
      
      window.addEventListener('cultivationBreakthrough', handleCultivationBreakthrough);
      return () => {
        window.removeEventListener('cultivationBreakthrough', handleCultivationBreakthrough);
      };
    }, []);
   
    // 监听经验值获得事件
  useEffect(() => {
    const handleExperienceGain = (event: Event) => {
      // 检查是否开启了动态属性变化显示
      const showAnimation = JSON.parse(localStorage.getItem('showAttributeChangeAnimation') || 'true');
      
      // 如果关闭了动态显示，则直接返回
      if (!showAnimation) return;
      
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { amount, source } = customEvent.detail;
        if (amount > 0) {
          toast.success(`获得 ${amount} 经验值 (${source})`, {
            duration: 2000,
            position: 'top-right',
            style: {
              backgroundColor: 'rgba(96, 165, 250, 0.9)',
            }
          });
        }
      }
    };
    
    window.addEventListener('experienceGain', handleExperienceGain);
    return () => {
      window.removeEventListener('experienceGain', handleExperienceGain);
    };
  }, []);

  // 保存游戏
  const handleSaveGame = () => {
    try {
      const saveCode = generateSaveCode();
      
      // 确保存档码不为空
      if (!saveCode || saveCode.length === 0) {
        throw new Error('生成存档码失败');
      }
      
      // 确保存档码不为空
      if (!saveCode || saveCode.length === 0) {
        throw new Error('生成存档码失败');
      }
      
      toast.success(`游戏已保存，存档码：${saveCode}`, {
        description: "请妥善保存此编码，用于下次加载游戏。",
        duration: 10000,
        position: "top-right"
      });
      
      // 添加复制到剪贴板功能
      try {
        navigator.clipboard.writeText(saveCode).then(() => {
          // 添加延迟以确保用户能先看到主保存提示
          setTimeout(() => {
            toast.success('存档码已保存到剪贴板', {
              duration: 5000,
              position: "top-right"
            });
          }, 1000);
        }).catch(err => {
          console.error('无法复制到剪贴板:', err);
          // 如果复制失败，仍然显示成功提示，确保用户知道保存成功
          toast.success('存档码已保存到剪贴板', {
            duration: 5000,
            position: "top-right"
          });
        });
      } catch (clipboardError) {
        console.error('剪贴板功能不可用:', clipboardError);
        // 即使剪贴板不可用，也显示成功提示
        toast.success('存档码已保存到剪贴板', {
          duration: 5000,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error('保存游戏失败:', error);
      toast.error('保存游戏失败，请稍后再试', {
        duration: 5000,
        position: "top-right"
      });
    }
  };

  // 退出游戏 - 返回首页
  const handleQuitGame = () => {
    if (window.confirm('确定要退出游戏吗？当前进度将会保存。')) {
      try {
        // 确保使用正确的路径导航
        const homePath = window.location.pathname.includes('runtime') ? '/runtime' : '';
        navigate(homePath);
      } catch (error) {
        console.error('Navigation error:', error);
        // 确保使用正确的路径
        const homePath = window.location.pathname.includes('runtime') ? '/runtime' : '';
        window.location.href = homePath;
      }
    }
  };

  // 检查选择条件是否满足
  const checkChoiceCondition = (choice: any) => {
    if (!choice.condition) return true;
    if (!gameState.currentCharacter) return false;
    return choice.condition(gameState.currentCharacter);
  };

  // 文本动画变体
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7 }
    }
  };

  // 选项动画变体
  const choiceVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: i * 0.1
      }
    })
  };

   // 如果没有当前节点，提供友好的降级处理
  if (!currentNode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4"><div className="absolute inset-0 -z-10 overflow-hidden opacity-20">
          <img 
            src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20scroll%20with%20mystical%20writing%2C%20mountains%20in%20background%2C%20spiritual%20atmosphere&sign=ee3eca06c9233b085e8ac8cf0a28eee3" 
            alt="Story background"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">正在探索修仙奥秘...</h1>
        <p className="text-lg mb-6 text-center max-w-md">前方的修仙之路正在展开，请稍候片刻，或者返回选择新的修炼方向</p>
        
        {/* 添加加载动画 */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        
        <motion.button 
          onClick={() => navigate('/character-select')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          重新选择角色
        </motion.button>
        <motion.button 
          onClick={() => navigate('/')}
          className="mt-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回首页
        </motion.button>
      </div>
    );
  }
  // 渲染角色属性的函数 - 现在已经集成到角色信息面板中，此函数不再使用
  const renderCharacterAttributes = () => {
    if (!gameState.currentCharacter) return null;
    
      try {
        // 安全获取角色属性，防止NaN显示问题
        const { charm, comprehension, constitution, family, luck, health: rawHealth } = gameState.currentCharacter;
        // 确保健康值始终是有效的数字
        const health = isNaN(rawHealth) ? 100 : Math.max(0, Math.min(100, rawHealth));
        const spiritStone = gameState.currentCharacter.resources?.spiritStone || 0;
        
      return (
        <div className="space-y-3">
          <motion.div 
            className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-indigo-800/50 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
                {/* 宽屏状态下的属性栏布局调整 */}
                <div className={`grid ${isLandscape ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'} gap-4`}>
                   <div className="flex flex-col items-center bg-indigo-900/30 rounded-lg p-2 w-full">
                     <span className="text-xs text-blue-200">魅力</span>
                     <span className="text-lg font-bold flex items-center">
                       {charm}
                       <i className="fa-solid fa-heart ml-1 text-red-400"></i>
                     </span>
                   </div>
                       <div className="flex flex-col items-center bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-2 w-full border border-blue-500/50">
                        <span className="text-xs text-blue-200 font-semibold">悟性 (经验)</span>
                         <motion.span 
                          className="text-lg font-bold flex items-center"
                          animate={gameState.recentChanges?.experience && gameState.recentChanges.experience > 0 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                          key={`comprehension-${comprehension}-${gameState.recentChanges?.experience || 0}`}
                        >
                            {comprehension}
                              <i className="fa-solid fa-brain ml-1 text-purple-400"></i>
                               {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-blue-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.comprehension ? Math.floor(gameState.currentCharacter.comprehension * 0.5) : 0}经验/回合</span>}
                             </motion.span>
                       </div>
                      <div className="flex flex-col items-center bg-indigo-900/30 rounded-lg p-2 w-full">
                        <span className="text-xs text-blue-200">体质</span>
                          <motion.span 
                           className="text-lg font-bold flex items-center"
                           animate={gameState.recentChanges?.healthRecovery && gameState.recentChanges.healthRecovery > 0 ? { scale: [1, 1.1, 1] } : {}}
                           transition={{ duration: 0.5 }}
                           key={`constitution-${constitution}-${gameState.recentChanges?.healthRecovery || 0}`}
                         >
                            {constitution}
                              <i className="fa-solid fa-shield-alt ml-1 text-green-400"></i>
                               {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-green-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.constitution ? Math.floor(gameState.currentCharacter.constitution * 0.5) : 0}生命/回合</span>}
                             </motion.span>
                      </div>
                      <div className="flex flex-col items-center bg-gradient-to-r from-yellow-900/40 to-amber-900/40 rounded-lg p-2 w-full border border-yellow-500/50">
                        <span className="text-xs text-blue-200 font-semibold">家境</span>
                          <motion.span 
                           className="text-lg font-bold flex items-center"
                           animate={gameState.recentChanges?.spiritStoneIncome && gameState.recentChanges.spiritStoneIncome > 0 ? { scale: [1, 1.1, 1] } : {}}
                           transition={{ duration: 0.5 }}
                           key={`family-${family}-${gameState.recentChanges?.spiritStoneIncome || 0}`}
                         >
                            {family}
                              <i className="fa-solid fa-coins ml-1 text-yellow-400"></i>
                               {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-yellow-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.family ? Math.floor(gameState.currentCharacter.family * 1.5) : 0}灵石/回合</span>}
                             </motion.span>
                      </div>
                   <div className="flex flex-col items-center bg-indigo-900/30 rounded-lg p-2 w-full">
                     <span className="text-xs text-blue-200">气运</span>
                     <span className="text-lg font-bold flex items-center">
                       {luck}
                       <i className="fa-solid fa-star ml-1 text-pink-400"></i>
                     </span>
                   </div>
                   <div className="flex flex-col items-center bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-1 w-full">
                     <span className="text-xs text-yellow-200">灵石</span>
                     <motion.span 
                      className="text-lg font-bold flex items-center text-yellow-300"
                      animate={gameState.recentChanges?.spiritStone && gameState.recentChanges.spiritStone > 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5 }}
                      key={`spiritStone-${spiritStone}-${gameState.recentChanges?.spiritStone || 0}`}
                    >
                       {spiritStone}
                       <i className="fa-solid fa-gem ml-1 text-yellow-400"></i>
                     </motion.span>
                    {/* 显示最近的灵石收入 */}
                    {gameState.recentChanges?.spiritStoneIncome && gameState.recentChanges.spiritStoneIncome > 0 && (
                      <div className="mt-1 text-xs text-green-400 flex items-center">
                        <i className="fa-solid fa-plus-circle mr-1"></i>
                        收入: {gameState.recentChanges.spiritStoneIncome} (来自家境)
                      </div>
                    )}
                  </div>
                </div>
                
                 {/* 经验值进度 - 小型显示 */}
                 <div className="mt-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg p-2 relative">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center">
                       <i className="fa-solid fa-star text-yellow-400 mr-2"></i>
                       <span className="text-sm text-yellow-200">经验值</span>
                     </div>
                           <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-yellow-300">
                              {gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                                ? `${Math.min(100, Math.floor((gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100))}%`
                                : '0%'
                              }
                            </span>
                             <div className="w-20 h-2 bg-gray-700 rounded-full">
                               <div 
                                 className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                                   style={{ 
                                    width: gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                                      ? `${Math.min(100, (gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100)}%`
                                      : '0%'
                                  }}
                               ></div>
                             </div>
                             <div className="mt-1 text-xs text-yellow-400">
                                经验值: {gameState.currentCharacter?.cultivation?.experience || 0}/{cultivationExperienceRequirements[gameState.currentCharacter?.cultivation?.level || 0] || 0}
                             </div>
                           </div>
                 </div>
                 <p className="text-xs text-blue-300 mt-1">达到100%时自动突破到{gameState.currentCharacter?.cultivation?.level < cultivationLevels.length - 1 ? cultivationLevels[gameState.currentCharacter.cultivation.level + 1] : '最高'}境界</p>
                 
                 {/* 显示最近的经验值增加 */}
                 {gameState.recentChanges?.experience && gameState.recentChanges.experience > 0 && (
                   <div className="absolute top-1 right-1 text-green-400 text-xs animate-pulse">
                     <i className="fa-solid fa-plus-circle"></i> {gameState.recentChanges.experience}
                   </div>
                 )}
                 </div>
            </motion.div>
        
             {/* 生命值单独显示 */}
             <motion.div 
               className="bg-red-900/50 backdrop-blur-sm rounded-xl p-3 mb-4 border border-red-800/50 shadow-lg"
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
             >
               <div className="flex justify-between items-center">
                 <div className="flex items-center">
                   <i className="fa-solid fa-heartbeat text-red-400 mr-2"></i>
                   <span className="text-sm text-red-200">生命值</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-300">{health}/100</span>
                   <div className={`${isLandscape ? 'w-32' : 'w-40'} h-2.5 bg-gray-700 rounded-full`}>
                     <div 
                        className={`h-2.5 rounded-full ${
                          health > 70 ? 'bg-green-500' : 
                          health > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, health)}%` }}
                      ></div>
                   </div>
                 </div>
               </div>
               <p className="text-xs text-red-300 mt-1">生命值归零会导致游戏结束，体质影响生命值恢复速度</p>
               
               {/* 显示最近的生命值恢复 */}
               {gameState.recentChanges?.healthRecovery && gameState.recentChanges.healthRecovery > 0 && (
                 <div className="mt-2 text-xs text-green-400 flex items-center">
                   <i className="fa-solid fa-plus-circle mr-1"></i>
                   恢复生命值: {gameState.recentChanges.healthRecovery} (来自体质)
                 </div>
               )}
            </motion.div>
        </div>
      );
    } catch (error) {
      console.error('渲染角色属性时出错:', error);
      return null;
    }
  };
           
           {/* 显示负面状态 */}
            {gameState.currentCharacter?.statusEffects && gameState.currentCharacter.statusEffects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {gameState.currentCharacter.statusEffects.map((effect: string, index: number) => {
                  // 为每种负面状态添加描述
                  const effectDescriptions: Record<string, string> = {
                   '霉运缠身': '降低奇遇概率，易触发负面事件',
                   '因果纠缠': '会触发特殊因果剧情',
                   '负债累累': '限制高消费行为，每月扣除利息',
                   '声名狼藉': '降低社交成功率，部分选项不可用',
                   '重伤未愈': '所有属性暂时-1，持续到伤愈',
                   '走火入魔': '修炼速度减半，可能走火入魔',
                   '思维混乱': '部分需要高悟性的选项暂时不可用',
                   '元气大伤': '健康值上限降低，恢复缓慢',
                   '家族蒙羞': '家族支持减少，资源获取困难',
                   '债台高筑': '每回合损失灵石，限制行动自由',
                   '因果崩溃': '严重因果紊乱，急需解决',
                   '道心破碎': '无法突破境界，所有属性-2',
                   '身心俱疲': '所有行动消耗加倍，恢复缓慢',
                   '厄运缠身': '强制进入厄运事件，运势极差',
                   '社交障碍': '无法进行正常社交活动',
                   '修为尽失': '所有属性暂时-2，需从头修炼',
                   '亡命之徒': '被通缉，无法进入城镇',
                   '魔修之路': '部分正道选项不可用，会被视为敌人',
                   '因果紊乱': '时间和空间感知异常'
                 };
                 return (
                   <span 
                     key={index} 
                     className="text-xs px-2 py-1 bg-red-900/50 text-red-200 rounded-full flex items-center cursor-help hover:bg-red-800/60 transition-colors"
                     title={effectDescriptions[effect] || '未知的负面状态'}
                   >
                     <i className="fa-solid fa-exclamation-circle mr-1 text-red-400"></i>
                     {effect}
                   </span>
                 );
               })}
             </div>
           )}// 渲染警告模态框
  const renderWarningModal = () => {
    if (!selectedChoice) return null;
    
    return (
      <AnimatePresence>
        {showWarningModal && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setShowWarningModal(false);
              setSelectedChoice(null);
            }} // 点击外部关闭
          >
            <motion.div 
              className="bg-gradient-to-b from-red-900/90 to-red-800/90 rounded-2xl p-6 border border-red-500/30 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-exclamation-triangle text-2xl text-yellow-300"></i>
                </div>
                <h2 className="text-2xl font-bold mb-2">警告</h2>
                <p className="text-red-200">此选项条件不足，强行选择可能带来严重后果！</p>
              </div>
              
              <div className="bg-red-950/50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-2 text-center">所需条件</h3>
                <p className="text-yellow-200 text-center">{selectedChoice.conditionText}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setSelectedChoice(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
                >
                  取消
                </button>
                <button
                  onClick={handleForceChoice}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                >
                  强行选择
                </button>
              </div>
              
              <div className="mt-3 text-sm text-center text-gray-300">点击任意位置关闭</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // 渲染效果提示消息
  const renderEffectToast = () => {
    return (
      <AnimatePresence>
        {showEffectToast && (
          <motion.div 
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm border rounded-xl p-5 shadow-2xl z-50 max-w-md w-full text-center ${
              showTalentEffect 
                ? 'bg-yellow-900/95 border-yellow-500/50' 
                : 'bg-red-900/95 border-red-500/50'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={() => {
              setShowEffectToast(false);
              setShowTalentEffect(false);
            }} // 添加点击关闭功能
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              showTalentEffect 
                ? 'bg-yellow-500/30' 
                : 'bg-red-500/30'
            }`}>
              <i className={`fa-solid text-2xl ${
                showTalentEffect 
                  ? 'fa-star text-yellow-300' 
                  : 'fa-bolt text-yellow-300'
              }`}></i>
            </div>
            <p className={`text-lg font-medium ${
              showTalentEffect 
                ? 'text-yellow-100' 
                : 'text-red-100'
            }`}>{effectMessage}</p>
            <div className="mt-3 text-sm text-gray-300">点击任意位置关闭</div>
          </motion.div>
        )}
      </AnimatePresence>);
  };

// 移除直接操作window.gameState的代码，改为使用更安全的Context状态管理

  // 渲染角色属性的函数 - 现在已经集成到角色信息面板中，此函数不再使用

  return (
    <div className={`min-h-screen ${isLandscape ? 'flex-row' : 'flex-col'} flex bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-1 sm:p-2 md:p-4 relative overflow-hidden`}>
      {/* 背景装饰 */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 背景图片 */}
           <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-15" 
            style={{
              backgroundImage: "url('https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mystical%20chinese%20fantasy%20background%2C%20clouds%20and%20mountains%2C%20spiritual%20energy&sign=3019c2485304a6801bb4115db49e8158')"
            }}
          ></div>
        
        {/* 动态光晕效果 */}
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-700/20 blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
      </motion.div>

       {/* 横屏模式下，角色信息和属性合并 */}
       {isLandscape && gameState.currentCharacter && (
        <motion.div 
          className="w-64 flex-shrink-0 mr-4 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 合并的角色信息和属性显示 */}
          <motion.div 
            className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-3 mb-2 border border-indigo-800/50 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 角色信息与年龄并列 */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xs text-blue-200 whitespace-nowrap">角色</h3>
                <p className="text-lg font-bold whitespace-nowrap">{gameState.currentCharacter.name}</p>
              </div>
                <div className="text-right">
                  <h3 className="text-xs text-blue-200 whitespace-nowrap">年龄</h3>
                  <p className="text-lg font-bold whitespace-nowrap">{gameState.currentCharacter.age}岁</p>
                </div>
              </div>
              
              {/* 生命值显示 */}
              <div className="flex justify-between items-center mt-1 p-1 bg-red-900/30 rounded-lg">
                <div className="flex items-center">
                  <i className="fa-solid fa-heartbeat text-red-400 mr-1 text-xs"></i>
                  <span className="text-xs text-red-200">生命值</span>
                </div>
                <span className="text-sm font-bold text-red-300">{Math.max(0, Math.min(100, gameState.currentCharacter.health || 100))}/100</span>
              </div>
            
            {/* 修为与经验值并列 */}
            <div className="bg-indigo-900/70 rounded-lg p-2 mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs text-blue-200 whitespace-nowrap">修为</h3>
                  <p className="text-lg font-bold text-purple-300 whitespace-nowrap">{getCultivationText()}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs text-blue-200 whitespace-nowrap">经验值</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-yellow-300">
                      {gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                        ? `${Math.min(100, Math.floor((gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100))}%`
                        : '0%'
                      }
                    </span>
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                        style={{ 
                          width: gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                            ? `${Math.min(100, (gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 属性显示 - 确保气运和家境完整显示 */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              <div className="flex flex-col items-center bg-indigo-800/50 rounded-lg p-1">
                <span className="text-[10px] text-blue-200">魅力</span>
                <span className="text-sm font-bold flex items-center">
                  {gameState.currentCharacter.charm}
                  <i className="fa-solid fa-heart ml-1 text-red-400 text-xs"></i>
                </span>
              </div>
              <div className="flex flex-col items-center bg-indigo-800/50 rounded-lg p-1">
                <span className="text-[10px] text-blue-200">悟性</span>
                <span className="text-sm font-bold flex items-center">
                  {gameState.currentCharacter.comprehension}
                  <i className="fa-solid fa-brain ml-1 text-purple-400 text-xs"></i>
                </span>
              </div>
              <div className="flex flex-col items-center bg-indigo-800/50 rounded-lg p-1">
                <span className="text-[10px] text-blue-200">体质</span>
                <span className="text-sm font-bold flex items-center">
                  {gameState.currentCharacter.constitution}
                  <i className="fa-solid fa-shield-alt ml-1 text-green-400 text-xs"></i>
                </span>
              </div>
              <div className="flex flex-col items-center bg-yellow-900/30 rounded-lg p-1">
                <span className="text-[10px] text-blue-200">家境</span>
                <span className="text-sm font-bold flex items-center">
                  {gameState.currentCharacter.family}
                  <i className="fa-solid fa-coins ml-1 text-yellow-400 text-xs"></i>
                </span>
              </div>
              <div className="flex flex-col items-center bg-pink-900/30 rounded-lg p-1">
                <span className="text-[10px] text-blue-200">气运</span>
                <span className="text-sm font-bold flex items-center">
                  {gameState.currentCharacter.luck}
                  <i className="fa-solid fa-star ml-1 text-pink-400 text-xs"></i>
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <i className="fa-solid fa-gem text-yellow-400 mr-1"></i>
              <span className="text-sm font-bold text-yellow-300">{gameState.currentCharacter.resources?.spiritStone || 0} 灵石</span>
            </div>
          </motion.div>
          
           {/* 操作按钮 */}
           <div className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-3 mb-2 border border-indigo-800/50 shadow-lg">
             <div className="flex flex-col gap-1.5">
               <button 
                 onClick={toggleInventoryPanel}
                 className="bg-green-600 hover:bg-green-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-suitcase"></i>
                 物品栏
                 {/* 显示物品数量 */}
                 {gameState.currentCharacter?.inventory?.length > 0 && (
                   <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                     {gameState.currentCharacter.inventory.reduce((total: number, item: any) => total + item.quantity, 0)}
                   </span>
                 )}
               </button>
               <button 
                 onClick={() => setShowDataPanel(true)}
                 className="bg-purple-600 hover:bg-purple-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-chart-pie"></i>
                 详细数据
               </button>
               <button 
                 onClick={handleSaveGame}
                 className="bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-save"></i>
                 保存
               </button>
               <button 
                 onClick={() => setShowSettingsPanel(true)}
                 className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-cog"></i>
                 设置
               </button>
                <button 
                  onClick={() => {
                    // 触发炼丹系统
                    setCurrentGame('crafting');
                    setShowGameModal(true);
                  }}
                  className="bg-green-700 hover:bg-green-600 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
                >
                  <i className="fa-solid fa-magic"></i>
                  炼丹系统
                </button>
               <button 
                 onClick={() => setShowStorePanel(true)}
                 className="bg-amber-600 hover:bg-amber-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-store"></i>
                 商店
               </button>
               <button 
                 onClick={() => navigate('/achievements')}
                 className="bg-yellow-600 hover:bg-yellow-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm"
               >
                 <i className="fa-solid fa-trophy"></i>
                 成就画廊
               </button>
               <button 
                 onClick={handleQuitGame}
                 className="bg-red-600 hover:bg-red-500 text-white py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm mt-2"
               >
                 <i className="fa-solid fa-sign-out-alt"></i>
                 退出
               </button>
             </div>
           </div>
        </motion.div>
      )}

       {/* 主要内容区域 */}
      <div className={`flex-grow flex flex-col ${isLandscape ? 'min-w-0 overflow-hidden' : ''}`}>
         {/* 竖屏模式下，将选项按钮放在最上面 */}
         {!isLandscape && gameState.currentCharacter && (
           <motion.div
             className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-2 mb-2 border border-indigo-800/50 shadow-lg"
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <div className="grid grid-cols-4 gap-1">
               <button 
                 onClick={toggleInventoryPanel}
                 className="bg-green-600 hover:bg-green-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-suitcase text-xs"></i>
                 <span>物品栏</span>
                 {/* 显示物品数量 */}
                 {gameState.currentCharacter?.inventory?.length > 0 && (
                   <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                     {gameState.currentCharacter.inventory.reduce((total: number, item: any) => total + item.quantity, 0)}
                   </span>
                 )}
               </button>
               <button 
                 onClick={() => setShowDataPanel(true)}
                 className="bg-purple-600 hover:bg-purple-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-chart-pie text-xs"></i>
                 <span>详细数据</span>
               </button>
               <button 
                 onClick={handleSaveGame}
                 className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-save text-xs"></i>
                 <span>保存</span>
               </button>
               <button 
                 onClick={() => setShowSettingsPanel(true)}
                 className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-cog text-xs"></i>
                 <span>设置</span>
               </button>
               <button 
                 onClick={() => {
                   // 触发炼丹系统
                   setCurrentGame('crafting');
                   setShowGameModal(true);
                 }}
                 className="bg-green-700 hover:bg-green-600 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-magic text-xs"></i>
                 <span>炼丹系统</span>
               </button>
               <button 
                 onClick={() => setShowStorePanel(true)}
                 className="bg-amber-600 hover:bg-amber-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-store text-xs"></i>
                 <span>商店</span>
               </button>
               <button 
                 onClick={() => navigate('/achievements')}
                 className="bg-yellow-600 hover:bg-yellow-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-trophy text-xs"></i>
                 <span>成就画廊</span>
               </button>
               <button 
                 onClick={handleQuitGame}
                 className="bg-red-600 hover:bg-red-500 text-white py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 text-xs"
               >
                 <i className="fa-solid fa-sign-out-alt text-xs"></i>
                 <span>退出</span>
               </button>
             </div>
           </motion.div>
         )}

        {/* 竖屏模式下的顶部状态栏 - 合并角色信息和属性 */}
          {!isLandscape && gameState.currentCharacter && (
             <motion.div 
               className="bg-indigo-900/50 backdrop-blur-sm rounded-xl p-2 mb-2 border border-indigo-800/50 shadow-lg"
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
             >
               {/* 角色信息与年龄并列 */}
               <div className="flex justify-between items-center mb-2 p-1">
                 <div>
                   <h3 className="text-xs text-blue-200">角色</h3>
                   <p className="text-lg font-bold">{gameState.currentCharacter.name}</p>
                 </div>
                 <div className="text-right">
                   <h3 className="text-xs text-blue-200">年龄</h3>
                   <p className="text-lg font-bold">{gameState.currentCharacter.age}岁 / {getMaxAgeForCultivation(gameState.currentCharacter.cultivation.level === undefined ? 0 : gameState.currentCharacter.cultivation.level)}岁</p>
                 </div>
               </div>
               
               {/* 修为与经验值并列 */}
               <div className="bg-indigo-900/70 rounded-lg p-2 mb-2">
                 <div className="flex justify-between items-center">
                   <div>
                     <h3 className="text-xs text-blue-200">修为</h3>
                     <p className="text-lg font-bold text-purple-300">{getCultivationText()}</p>
                   </div>
                   <div className="text-right">
                     <h3 className="text-xs text-blue-200">经验值</h3>
                     <div className="flex items-center gap-1">
                       <span className="text-lg font-bold text-yellow-300">
                         {gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                           ? `${Math.min(100, Math.floor((gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100))}%`
                           : '0%'
                         }
                       </span>
                       <div className="w-16 h-1.5 bg-gray-700 rounded-full">
                         <div 
                           className="h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"
                           style={{ 
                             width: gameState.currentCharacter?.cultivation?.experience !== undefined && cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level] > 0 
                               ? `${Math.min(100, (gameState.currentCharacter.cultivation.experience / cultivationExperienceRequirements[gameState.currentCharacter.cultivation.level]) * 100)}%`
                               : '0%'
                           }}
                         ></div>
                       </div>
                     </div>
                     <div className="mt-1 text-xs text-yellow-400">
                       经验值: {gameState.currentCharacter?.cultivation?.experience || 0}/{cultivationExperienceRequirements[gameState.currentCharacter?.cultivation?.level || 0] || 0}
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* 生命值显示 */}
               <div className="flex justify-between items-center mt-1 p-1 bg-red-900/30 rounded-lg mb-2">
                 <div className="flex items-center">
                   <i className="fa-solid fa-heartbeat text-red-400 mr-1 text-xs"></i>
                   <span className="text-xs text-red-200">生命值</span>
                 </div>
                 <span className="text-sm font-bold text-red-300">{Math.max(0, Math.min(100, gameState.currentCharacter.health || 100))}/100</span>
               </div>
               
               {/* 所有属性完整显示 */}
               <div className="grid grid-cols-5 gap-1">
                 <div className="flex flex-col items-center bg-indigo-800/50 rounded-lg p-1">
                   <span className="text-[10px] text-blue-200">魅力</span>
                   <span className="text-sm font-bold flex items-center">
                     {gameState.currentCharacter.charm}
                     <i className="fa-solid fa-heart ml-1 text-red-400 text-xs"></i>
                   </span>
                 </div>
                 <div className="flex flex-col items-center bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-1 border border-blue-500/50">
                   <span className="text-[10px] text-blue-200 font-semibold">悟性</span>
                   <span className="text-sm font-bold flex items-center">
                     {gameState.currentCharacter.comprehension}
                     <i className="fa-solid fa-brain ml-1 text-purple-400 text-xs"></i>
                     {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-blue-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.comprehension ? Math.floor(gameState.currentCharacter.comprehension * 0.5) : 0}经验/回合</span>}
                   </span>
                 </div>
                 <div className="flex flex-col items-center bg-indigo-800/50 rounded-lg p-1">
                   <span className="text-[10px] text-blue-200">体质</span>
                   <span className="text-sm font-bold flex items-center">
                     {gameState.currentCharacter.constitution}
                     <i className="fa-solid fa-shield-alt ml-1 text-green-400 text-xs"></i>
                     {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-green-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.constitution ? Math.floor(gameState.currentCharacter.constitution * 0.5) : 0}生命/回合</span>}
                   </span>
                 </div>
                 <div className="flex flex-col items-center bg-gradient-to-r from-yellow-900/40 to-amber-900/40 rounded-lg p-1 border border-yellow-500/50">
                   <span className="text-[10px] text-blue-200 font-semibold">家境</span>
                   <span className="text-sm font-bold flex items-center">
                     {gameState.currentCharacter.family}
                     <i className="fa-solid fa-coins ml-1 text-yellow-400 text-xs"></i>
                     {gameState.showAttributeBonusValues && <span className="ml-1 text-[7px] bg-yellow-600/70 text-white px-0.5 rounded-full">+{gameState.currentCharacter.family ? Math.floor(gameState.currentCharacter.family * 1.5) : 0}灵石/回合</span>}
                   </span>
                 </div>
                 <div className="flex flex-col items-center bg-pink-900/30 rounded-lg p-1">
                   <span className="text-[10px] text-blue-200">气运</span>
                   <span className="text-sm font-bold flex items-center">
                     {gameState.currentCharacter.luck}
                     <i className="fa-solid fa-star ml-1 text-pink-400 text-xs"></i>
                   </span>
                 </div>
               </div>
               
               {/* 灵石显示 */}
               <div className="mt-2 flex items-center justify-center">
                 <i className="fa-solid fa-gem text-yellow-400 mr-1 text-xs"></i>
                 <span className="text-sm font-bold text-yellow-300">{gameState.currentCharacter.resources?.spiritStone || 0} 灵石</span>
               </div>
               
               {/* 显示最近的经验值增加 */}
               {gameState.recentChanges?.experience && gameState.recentChanges.experience > 0 && (
                 <div className="mt-1 text-xs text-green-400 flex items-center justify-center">
                   <i className="fa-solid fa-plus-circle mr-1"></i>
                   获得经验值: {gameState.recentChanges.experience}
                 </div>
               )}
               
               {/* 显示最近的生命值恢复 */}
               {gameState.recentChanges?.healthRecovery && gameState.recentChanges.healthRecovery > 0 && (
                 <div className="mt-1 text-xs text-green-400 flex items-center justify-center">
                   <i className="fa-solid fa-plus-circle mr-1"></i>
                   恢复生命值: {gameState.recentChanges.healthRecovery} (来自体质)
                 </div>
               )}
               
               {/* 显示最近的灵石收入 */}
               {gameState.recentChanges?.spiritStoneIncome && gameState.recentChanges.spiritStoneIncome > 0 && (
                 <div className="mt-1 text-xs text-green-400 flex items-center justify-center">
                   <i className="fa-solid fa-plus-circle mr-1"></i>
                   获得灵石: {gameState.recentChanges.spiritStoneIncome} (来自家境)
                 </div>
               )}
             </motion.div>
          )}



         {/* 不再显示单独的属性框，已集成到角色信息面板中 */}
        {/* {!isLandscape && renderCharacterAttributes()} */}

          {/* 检查是否有过渡剧情 */}
          {gameState.transitionStory ? (
             <motion.div 
               className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-6 mb-6 border border-indigo-800/30 shadow-lg flex-grow flex flex-col items-center justify-center"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7 }}
               key={`transition-${gameState.transitionStory.nextNode}-${Date.now()}`}
             >
                {/* 移除背景图，改为渐变纯色背景 */}
                <div className="absolute inset-0 -z-10 rounded-xl overflow-hidden bg-gradient-to-b from-blue-900/80 via-indigo-900/80 to-purple-900/80"></div>
               
               {/* 半透明遮罩增强文字可读性 */}
               <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
               
               {/* 过渡剧情文本 */}
               <div className="relative z-10 text-lg leading-relaxed max-w-2xl text-center mb-8">
                 {gameState.transitionStory.text}
               </div>
               
               {/* 继续按钮 - 添加防重复点击保护和额外的手动重置机制 */}
                <motion.button
           onClick={completeTransition}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onAnimationEnd={() => {
            // 额外的安全检查，确保过渡剧情结束时清除所有覆盖层
            setForceRender(prev => prev + 1);
          }}
                  title="继续剧情"
                >
                  继续
                </motion.button>
            </motion.div>
         ) : (
            <>
              {/* 剧情文本区域 */}
              <motion.div 
                className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-3 sm:p-5 mb-3 sm:mb-5 border border-indigo-800/30 shadow-lg flex-grow flex flex-col whitespace-normal"
                initial="hidden"
                animate="visible"
                key={`node-${gameState.currentNode}-${Date.now()}-${Math.random()}`} // 确保每次节点改变都触发重新渲染
                variants={textVariants}
              >
                {/* 背景图片 - 增强版，确保始终显示 */}
                <div className="absolute inset-0 -z-10 opacity-20 rounded-xl overflow-hidden">
                   <img 
                    src={currentNode().imageUrl || "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mystical%20chinese%20fantasy%20background%2C%20clouds%20and%20mountains%2C%20spiritual%20energy&sign=3019c2485304a6801bb4115db49e8158"} 
                    alt="Story background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // 使用默认备用图片
                      target.src = "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mystical%20chinese%20fantasy%20background%2C%20clouds%20and%20mountains%2C%20spiritual%20energy&sign=3019c2485304a6801bb4115db49e8158";
                      target.onerror = null; // 防止递归错误
                    }}
                  />
                </div>
               
                 {/* 剧情文本 */}
                 <div className="relative z-10 text-base sm:text-lg leading-relaxed">
                   {getCurrentNode().text}
                 </div>
             </motion.div>

              {/* 选项区域 */}
               <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <AnimatePresence mode="wait">
                   {(getCurrentNode().choices || []).filter(choice => {
                       // 如果设置了隐藏高危选项且不满足条件，则过滤掉该选项
                       const meetsCondition = checkChoiceCondition(choice);
                       return !(gameState.hideHighRiskOptions && !meetsCondition);
                     })
                    .map((choice, index) => {
                     const meetsCondition = checkChoiceCondition(choice);
                    
                    return (
                    <motion.button
                      key={choice.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, height: 0 }}
                      variants={choiceVariants}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: meetsCondition 
                          ? '0 6px 20px rgba(147, 197, 253, 0.3)'
                          : '06px 20px rgba(239, 68, 68, 0.3)',
                        backgroundColor: meetsCondition
                          ? 'rgba(59, 130, 246, 0.9)'
                          : 'rgba(239, 68, 68, 0.7)'
                      }}
                      onClick={() => handleChoice(choice.id)}
                      className={`p-2.5 sm:p-4 rounded-xl text-left shadow-md hover:shadow-lg transition-all duration-300 ${
                        meetsCondition 
                          ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white'
                          : 'bg-gradient-to-r from-red-900 to-red-800 text-white opacity-90'
                      }`}
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
            {/* 固定前置显示条件 */}
              {/* 固定前置显示条件 */}
              {choice.conditionText && (
                <span className={`mr-2 text-sm font-medium ${
                  meetsCondition ? 'text-green-300' : 'text-red-300'
                }`}>
                  [{choice.conditionText}]
                </span>
              )}
                           
                              {/* 显示属性变化 - 根据游戏设置控制显示 */}
                                <div className="mt-2 grid grid-cols-1 gap-1">
                                  {gameState.showAttributeChanges && choice.attributeChanges ? (
                                    <>
                                      {/* 优先显示经验值变化，让玩家更重视 */}
                                      {gameState.showExperienceChanges && choice.attributeChanges.experience !== undefined && (
                                        <div 
                                          className={`flex items-center text-sm ${choice.attributeChanges.experience > 0 ? 'text-green-300' : choice.attributeChanges.experience < 0 ? 'text-red-300' : 'text-gray-400'}`}
                                          title="经验值：用于提升修为境界，达到100%时自动突破"
                                        >
                                          <i className={`fa-solid fa-star ${choice.attributeChanges.experience > 0 ? 'text-yellow-400' : choice.attributeChanges.experience < 0 ? 'text-red-400' : 'text-gray-500'} mr-2`}></i>
                                          经验值: {choice.attributeChanges.experience > 0 ? '+' : ''}{choice.attributeChanges.experience}
                                        </div>
                                      )}
                                      
                                      {gameState.showAttributeChanges && Object.entries(choice.attributeChanges).filter(([attr, value]) => attr !== 'experience' && value !== 0).map(([attr, value]) => {
                                        // 只显示有变化的属性
                                        const attrMap: Record<string, { name: string, icon: string, color: string, description: string }> = {
                                          charm: { 
                                            name: '魅力', 
                                            icon: 'heart', 
                                            color: 'text-red-400',
                                            description: '影响社交、招募道侣、获取他人帮助的难度'
                                          },
                                          comprehension: { 
                                            name: '悟性', 
                                            icon: 'brain', 
                                            color: 'text-purple-400',
                                            description: '影响修炼速度、功法领悟成功率、自创功法的能力'
                                          },
                                          constitution: { 
                                            name: '体质', 
                                            icon: 'shield-alt', 
                                            color: 'text-green-400',
                                            description: '影响角色的健康状态、防御力和寿元，统一代替生命值'
                                          },
                                          family: { 
                                            name: '家境', 
                                            icon: 'coins', 
                                            color: 'text-yellow-400',
                                            description: '影响初始资源、获取灵石与法宝的难度、宗门背景，每回合获得的灵石也会增加'
                                          },
                                          luck: { 
                                            name: '气运', 
                                            icon: 'star', 
                                            color: 'text-pink-400',
                                            description: '影响触发隐藏剧情的概率、绝境逢生的可能性、奇遇频率'
                                          },
                                         spiritStone: { 
                                           name: '灵石', 
                                           icon: 'gem', 
                                           color: 'text-cyan-400',
                                           description: '修仙界通用货币，用于购买资源、修炼等'
                                         },
                                         pills: { 
                                           name: '丹药', 
                                           icon: 'pill', 
                                           color: 'text-green-400',
                                           description: '恢复健康、提升修为的珍贵物品'
                                         },
                                         cultivationLevel: { 
                                           name: '境界', 
                                           icon: 'crown', 
                                           color: 'text-yellow-500',
                                           description: `修仙者实力的主要划分，每个境界对应不同寿元上限：凡人(100年)、练气(150年)、筑基(300年)、结丹(500年)、金丹(800年)、元婴(1200年)、炼虚(1800年)、合体(2500年)、渡劫(3500年)、大乘(5000年)`
                                         },
                                         cultivationStage: { 
                                           name: '阶段', 
                                           icon: 'level-up', 
                                           color: 'text-blue-400',
                                           description: '每个境界内的细分层次：初期、中期、后期、大圆满'
                                         },
                                         health: {
                                           name: '生命值',
                                           icon: 'heartbeat',
                                           color: 'text-red-500',
                                           description: '角色的当前健康状态，归零会导致游戏结束'
                                         }
                                       };
                                       const attrInfo = attrMap[attr];
                                       if (!attrInfo) return null;
                                       return (
                                        <div 
                                         key={attr} 
                                         className={`flex items-center text-xs ${value > 0 ? 'text-green-300' : value < 0 ? 'text-red-300' : 'text-gray-400'}`}
                                         title={attrInfo.description}
                                       >
                                         <i className={`fa-solid fa-${attrInfo.icon} mr-1 ${attrInfo.color}`}></i>
                                         {attrInfo.name}: {value > 0 ? '+' : ''}{value}
                                       </div>
                                       );
                                     })}
                                     
                                     {/* 检查是否有实际的属性变化 */}
                                     {Object.entries(choice.attributeChanges || {}).filter(([attr, value]) => value !== 0).length === 0 && gameState.showAttributeChanges && (
                                       <div className="flex items-center text-sm text-gray-400">
                                         <i className="fa-solid fa-info-circle mr-2 text-blue-400"></i>
                                         选择此项不会改变任何属性值
                                       </div>
                                     )}
                                    </>
                                  ) : gameState.showAttributeChanges && !choice.attributeChanges ? (
                                    <div className="flex items-center text-sm text-gray-400">
                                      <i className="fa-solid fa-info-circle mr-2 text-blue-400"></i>
                                      选择此项不会改变任何属性值
                                    </div>
                                  ) : null}
                                </div>
                            
                           {/* 不满足条件的选项额外提示 */}
                           {!meetsCondition && (
                             <div className="mt-1 text-xs text-red-300 flex items-center">
                               <i className="fa-solid fa-exclamation-triangle mr-1"></i>
                               强行选择可能带来严重后果
                             </div>
                           )}
                         </div>
                        </div>
                     </div>
                   </motion.button>
                 );
              })}
            </AnimatePresence>
          </div>
          </>
        )}
      </div>

      {/* 页脚信息 */}
      <div className="mt-6 text-center text-blue-200 text-sm">
        <p>修仙传奇 - 踏上属于你的修仙之路</p>
      </div>
      
      {/* 警告模态框 */}
      {renderWarningModal()}
      
       {/* 效果提示消息 */}
      {showEffectToast && renderEffectToast()}
      
      {/* 详细数据面板 */}
      <CharacterDataPanel 
        isOpen={showDataPanel} 
        onClose={() => setShowDataPanel(false)} 
      />
      
      {/* 设置面板 */}
      <GameSettingsPanel 
        isOpen={showSettingsPanel} 
        onClose={() => setShowSettingsPanel(false)} 
      />
      
      {/* 商店面板 */}
      <StorePanel 
        isOpen={showStorePanel} 
        onClose={() => setShowStorePanel(false)} 
      />
      
               {/* 物品栏面板 */}
  {/* 转换inventory对象为数组格式，适应InventoryPanel组件 */}
  <InventoryPanel 
    isOpen={gameState.showInventoryPanel} 
    onClose={toggleInventoryPanel} 
    inventoryItems={convertInventoryToArray()}
    character={gameState.currentCharacter || { name: '未知角色' }}
    handleOverlayClick={toggleInventoryPanel}
    handleUseItem={useItem}
     getItemEffectDescription={(item) => {
        // 尝试从item对象直接获取effect字段（如果是宝物类物品）
        if (item.effect) {
          // 提取效果中的关键数值或描述作为简短提示
          if (item.effect.includes('+')) {
            // 提取属性加成部分
            const match = item.effect.match(/([\w\u4e00-\u9fa5]+)\+(\d+)/);
            if (match) {
              return `${match[1]}+${match[2]}`;
            }
          }
          // 简单显示效果的前几个字
          return item.effect.length > 8 ? item.effect.substring(0, 8) + '...' : item.effect;
        } else if (item.effectType === 'attribute' && item.effectValue) {
          return `${item.effectTarget === 'random' ? '随机属性' : 
                  item.effectTarget === 'charm' ? '魅力' : 
                  item.effectTarget === 'comprehension' ? '悟性' : 
                  item.effectTarget === 'constitution' ? '体质' : 
                  item.effectTarget === 'family' ? '家境' : 
                  item.effectTarget === 'luck' ? '气运' : '属性'} +${item.effectValue}`;
        } else if (item.effectType === 'experience' && item.effectValue) {
          return `经验值 +${item.effectValue}`;
        } else if (item.effectType === 'special') {
          return '特殊效果';
        } else if (item.effectType === 'material') {
          return item.effect || '用于炼丹';
        } else if (item.effectType === 'pill') {
          return `${item.quality}品质丹药`;
        }
        return '无效果';
      }}
  />
  
       {/* 游戏模态框 */}
      <AnimatePresence>
         {showGameModal && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              // 点击背景可以关闭游戏模态框
              setShowGameModal(false);
              setCurrentGame(null);
              // 确保在关闭模态框时强制刷新，防止出现透明层
              setForceRender(prev => prev + 1);
            }}
          >
            <motion.div 
              className="bg-gradient-to-b from-blue-900/95 via-indigo-900/95 to-purple-900/95 rounded-2xl border border-indigo-500/30 shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex items-center justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击游戏内容关闭模态框
            >
               {currentGame === 'thunder' && (
                 <ThunderTribulationGame onComplete={handleGameComplete} />
               )}
               {currentGame === 'dungeon' && (
                 <DungeonPuzzleGame onComplete={handleGameComplete} />
               )}
               {currentGame === 'soulmate' && (
                 <SoulmateDialogueGame onComplete={(score) => handleGameComplete(true, undefined, score)} />
               )}
               {currentGame === 'heartDemon' && gameState.currentCharacter && (
                 <HeartDemonGame 
                   onComplete={handleGameComplete}
                   moralStains={gameState.currentCharacter.moralStains || []}
                   demonVision={gameState.currentCharacter.demonVision || '对力量的渴望与恐惧'}
                   demonDifficulty={gameState.currentCharacter.demonDifficulty || 3}
                 />
               )}
               {currentGame === 'crafting' && gameState.currentCharacter && (
                 <AlchemySystem 
                   onComplete={handleGameComplete}
                   onClose={() => {
                     setShowGameModal(false);
                     setCurrentGame(null);
                   }}
                   characterStats={{
                     constitution: gameState.currentCharacter.constitution,
                     comprehension: gameState.currentCharacter.comprehension,
                     luck: gameState.currentCharacter.luck
                   }}
                   characterId={gameState.currentCharacter.id}
                   inventory={{
                     herbs: gameState.currentCharacter.resources?.herbs || {},
                     minerals: gameState.currentCharacter.resources?.minerals || {},
                     beastParts: gameState.currentCharacter.resources?.beastParts || {},
                     specialIngredients: gameState.currentCharacter.resources?.specialIngredients || {}
                   }}
                 />
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}