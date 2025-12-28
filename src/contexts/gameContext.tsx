import { createContext, useState, useEffect, ReactNode } from 'react';
import { getInitialCharacterState, characters, cultivationExperienceRequirements, cultivationLevels } from '@/data/characters';
import { storyNodes } from '@/data/storyNodes';
import { toast } from 'sonner';
import { nodeMapping } from '@/data/nodeMapping';

// 当前游戏版本号
const GAME_VERSION = '1.0.2';
// 存储在localStorage中的版本号键名
const VERSION_KEY = 'xiuxian_game_version';

// 添加游戏模式类型
interface GameMode {
  isQuickMode: boolean;
  quickModeMultiplier: number; // 速通模式下的文本精简比例
  quickModeDifficulty: number; // 速通模式下的小游戏难度调整
}

// 炼丹系统相关类型定义
interface AlchemyState {
  level: number;           // 炼丹等级（0-10级）
  experience: number;      // 炼丹经验
  knownRecipes: string[];  // 已掌握的丹方ID
  failedAttempts: number;  // 连续失败次数（影响成功率）
}

interface Inventory {
  herbs: Record<string, number>;  // 草药库存
  minerals: Record<string, number>; // 矿物库存
  beastParts: Record<string, number>; // 妖兽材料
  pills: Record<string, number>;   // 丹药成品
  specialIngredients: Record<string, number>; // 特殊材料
}

interface Equipment {
  cauldron?: string;       // 使用的丹炉
  fireSource?: string;     // 使用的火源
}

interface AlchemySession {
  step: string;
  attempts: number;
  recipe?: string;
  requiredMaterials?: any[];
  materialsQuality?: string;
  baseSuccessRate?: number;
  fireControl?: {
    currentTemp: number;
    targetTemp: number;
    stability: number;
    timeElapsed: number;
  };
  result?: string;
  pillQuality?: string;
}

interface AchievementClaimed {
  [key: string]: boolean;
}

  // 定义游戏状态类型
  interface GameState {
  // 新增游戏模式设置
  gameMode: GameMode;
  currentCharacter: any | null;
  currentNode: string;
  showCondition: boolean;
  unlockedAchievements: string[]; // 已解锁的成就ID列表
  claimedAchievements: AchievementClaimed; // 已领取的成就
  hideHighRiskOptions: boolean; // 是否隐藏高危选项
  showAttributeChanges: boolean; // 是否显示选项的属性变化
  showExperienceChanges: boolean; // 是否显示经验值变化
  showAttributeBonusValues: boolean; // 是否显示属性加成的具体数值
  transitionStory?: {
    text: string;
    imageUrl?: string;
    nextNode: string;
  };
  // 物品栏功能相关状态
  exchangeCodeInput: string; // 兑换码输入
  showInventoryPanel: boolean; // 是否显示物品栏面板
  // 战斗相关状态
  battleProgress: number; // 战斗进度
  battleState: any; // 战斗状态
  // 最近属性变化，用于触发动画
  recentChanges?: {
    experience?: number;
    healthRecovery?: number;
    spiritStoneIncome?: number;
    spiritStone?: number;
  };
  // 添加成就点状态
  achievementPoints: number; // 成就点
  unlockedCharacters: string[]; // 已解锁的角色ID列表
  usedCodes: string[]; // 记录已使用的兑换码
  isGameEnded?: boolean; // 游戏是否已结束
  
  // 第五章特殊机制相关状态
  merit: number; // 功德值，第五章新增
}

// 添加快捷行动方法到上下文类型
interface GameContextType {
  quickAction: () => void;// 切换游戏模式
  toggleGameMode: () => void;
  // 获取当前游戏模式
  getGameMode: () => GameMode;
  gameState: GameState;
  startNewGame: (characterId: string) => void;
  makeChoice: (choiceId: string) => void;
  toggleConditionDisplay: () => void;
  toggleHideHighRiskOptions: () => void;
  toggleAttributeChangesDisplay: () => void; // 切换属性变化显示
  toggleExperienceChangesDisplay: () => void; // 切换经验值变化显示
  generateSaveCode: () => string;
  loadFromSaveCode: (saveCode: string) => boolean;
  resetGame: () => void;
  setUnlockedAchievements: (achievements: string[]) => void; // 更新成就列表
  checkNewAchievements: () => void; // 检查新成就
  gameVersion: string; // 添加版本号
  completeTransition: () => void; // 完成过渡剧情
  // 物品栏功能相关方法
  toggleInventoryPanel: () => void; // 切换物品栏面板显示
  useItem: (itemId: string) => void; // 使用物品
  addItemToInventory: (item: any, quantity?: number) => void; // 添加物品到物品栏
  setExchangeCodeInput: (input: string) => void; // 设置兑换码输入
  redeemCode: (code: string) => {} // 兑换码兑换
  // 成就点相关方法
  addAchievementPoints: (points: number) => void; // 添加成就点
  unlockCharacter: (characterId: string) => void; // 解锁角色
  isCharacterUnlocked: (characterId: string) => boolean; // 检查角色是否解锁
  markAchievementClaimed: (achievementId: string) => void; // 标记成就为已领取
}

  export const GameContext = createContext<GameContextType>({
  gameState: {
    currentCharacter: null,
    currentNode: 'start',
    showCondition: false,
    unlockedAchievements: [],
    claimedAchievements: {},
    hideHighRiskOptions: false,
    showAttributeChanges: true, // 默认显示属性变化
    // 游戏模式设置
    gameMode: {
      isQuickMode: false,
      quickModeMultiplier: 0.7, // 速通模式下文本精简30%
      quickModeDifficulty: 0.5, // 速通模式下小游戏难度降低50%
    },
  showExperienceChanges: true, // 默认显示经验值变化
  showAttributeBonusValues: true, // 默认显示属性加成的具体数值
    exchangeCodeInput: '',
    showInventoryPanel: false,
  battleProgress: 1,
  battleState: null,
  recentChanges: {},
    // 成就点相关状态
    achievementPoints: 0,
    unlockedCharacters: ['xiaoyan'], // 默认只解锁萧炎
    usedCodes: [],
    
    // 第五章特殊机制默认值
    merit: 0, // 功德值初始为0
  },
  startNewGame: () => {},
  makeChoice: () => {},
  toggleConditionDisplay: () => {},
  toggleHideHighRiskOptions: () => {},
  toggleAttributeChangesDisplay: () => {}, // 默认实现
  toggleExperienceChangesDisplay: () => {}, // 默认实现
  toggleAttributeBonusValuesDisplay: () => {}, // 默认实现
  generateSaveCode: () => '',
  loadFromSaveCode: () => false,
  resetGame: () => {},
  setUnlockedAchievements: () => {}, // 默认实现
  checkNewAchievements: () => {}, // 默认实现
  gameVersion: GAME_VERSION, // 默认版本号
  completeTransition: () => {}, // 默认实现
  // 切换游戏模式
  toggleGameMode: () => {},
  // 获取当前游戏模式
  getGameMode: () => ({
    isQuickMode: false,
    quickModeMultiplier: 0.7,
    quickModeDifficulty: 0.5
  }),
  // 快捷行动模式
  quickAction: () => {},
  // 物品栏功能相关方法实现
  toggleInventoryPanel: () => {}, // 切换物品栏面板显示
  useItem: (itemId: string) => {}, // 使用物品
  addItemToInventory: (item: any, quantity?: number) => {}, // 添加物品到物品栏
  setExchangeCodeInput: (input: string) => {}, // 设置兑换码输入
  redeemCode: (code: string) => {}, // 兑换码兑换
  // 成就点相关方法实现
  addAchievementPoints: () => {},
  unlockCharacter: () => {},
  isCharacterUnlocked: () => false,
  markAchievementClaimed: () => {}
});

// 检查版本更新并清除旧存档的函数
const checkVersionUpdate = () => {
  try {
    const savedVersion = localStorage.getItem(VERSION_KEY);
    
    // 如果是首次运行游戏，保存当前版本号
    if (!savedVersion) {
      localStorage.setItem(VERSION_KEY, GAME_VERSION);
      return false;
    }
    
    // 如果版本号不同，清除旧存档
    if (savedVersion !== GAME_VERSION) {
      // 清除游戏状态和成就
      localStorage.removeItem('xiuxian_game_state');
      // 更新版本号
      localStorage.setItem(VERSION_KEY, GAME_VERSION);
      // 显示版本更新提示
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('versionUpdated'));
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查版本更新时出错:', error);
    return false;
  }
};

// 生成过渡剧情文本和背景图片
const generateTransitionStory = (currentNode: any, choice: any, character: any): {text: string, imageUrl: string} => {
  // 根据当前节点和选择生成过渡剧情
  if (!currentNode || !choice) return {
    text: '你的选择改变了命运的轨迹...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mystical%20chinese%20story%20background%2C%20scroll%20with%20ancient%20text&sign=4596a53489159039b8135b55c2273c0e'
  };
  
  // 获取属性变化信息
  const attributeChanges = choice.attributeChanges;
  let attributeChangeText = '';
  
  if (attributeChanges) {
    const changes = [];
    if (attributeChanges.charm) changes.push(`魅力${attributeChanges.charm > 0 ? '+' : ''}${attributeChanges.charm}`);
    if (attributeChanges.comprehension) changes.push(`悟性${attributeChanges.comprehension > 0 ? '+' : ''}${attributeChanges.comprehension}`);
    if (attributeChanges.constitution) changes.push(`体质${attributeChanges.constitution > 0 ? '+' : ''}${attributeChanges.constitution}`);
    if (attributeChanges.family) changes.push(`家境${attributeChanges.family > 0 ? '+' : ''}${attributeChanges.family}`);
    if (attributeChanges.luck) changes.push(`气运${attributeChanges.luck > 0 ? '+' : ''}${attributeChanges.luck}`);
    if (attributeChanges.spiritStone) changes.push(`灵石${attributeChanges.spiritStone > 0 ? '+' : ''}${attributeChanges.spiritStone}`);
    
    if (changes.length > 0) {
      attributeChangeText = `你的${changes.join('、')}${changes.length > 1 ? '都' : ''}发生了变化。`;
    }
  }
  
  // 根据不同类型的选择生成不同的过渡文本和背景图片
  const nodeType = currentNode.id.includes('battle') || currentNode.id.includes('combat') || currentNode.id.includes('fight') ? '战斗' :
                   currentNode.id.includes('sect') ? '宗门' :
                   currentNode.id.includes('travel') || currentNode.id.includes('explore') ? '探索' :
                   currentNode.id.includes('treasure') || currentNode.id.includes('reward') ? '宝物' :
                   currentNode.id.includes('meditate') || currentNode.id.includes('enlightenment') ? '修炼' :
                   currentNode.id.includes('trial') ? '试炼' :
                   currentNode.id.includes('love') || currentNode.id.includes('soulmate') ? '情感' :
                   '普通';
  
  let transitionText = '';
  let imagePrompt = '';
  
   // 根据节点ID和选择内容生成更加具体的提示词
   switch (nodeType) {
      case '战斗':
        transitionText = `你做出了${choice.text}的决定。战斗的尘埃逐渐散去，${attributeChangeText}你开始思考接下来的路该如何走...`;
        
        if (currentNode.id.includes('battle_demon_lord')) {
          imagePrompt = 'epic%20battle%20against%20demon%20lord%2C%20ancient%20chinese%20fantasy%2C%20smoke%20clearing%2C%20destruction%20around%2C%20hero%20standing';
        } else if (currentNode.id.includes('duel')) {
          imagePrompt = 'one-on-one%20combat%20in%20ancient%20china%2C%20martial%20arts%20battle%2C%20aftermath%2C%20winner%20and%20loser';
        } else {
          imagePrompt = 'ancient%20chinese%20battlefield%20after%20fight%2C%20smoke%20clearing%2C%20reflection%20moment%2C%20mystical%20atmosphere';
        }
        break;
        
      case '宗门':
        transitionText = `在${currentNode.text.substring(0, 20)}...的情况下，你选择了${choice.text}。这个决定在宗门中引起了不小的反响，${attributeChangeText}你的宗门生活从此发生了变化。`;
        
        if (currentNode.id.includes('sect_conflict')) {
          imagePrompt = 'ancient%20chinese%20temple%20with%20political%20intrigue%2C%20disciples%20arguing%2C%20tension%20in%20the%20air';
        } else if (currentNode.id.includes('sect_life')) {
          imagePrompt = 'ancient%20chinese%20sect%20daily%20life%2C%20disciples%20training%2C%20harmonious%20atmosphere%2C%20temple%20surroundings';
        } else {
          imagePrompt = 'ancient%20chinese%20sect%20life%2C%20monks%20training%2C%20temple%20courtyard%2C%20daily%20activities';
        }
        break;
        
      case '探索':
        transitionText = `带着好奇和期待，你选择了${choice.text}。探索的过程充满未知，${attributeChangeText}每一步都可能带来新的发现。`;
        
        if (currentNode.id.includes('ancient_dungeon')) {
          imagePrompt = 'exploring%20ancient%20chinese%20dungeon%2C%20old%20ruins%20with%20traps%2C%20mystical%20symbols%2C%20adventurer%20with%20torch';
        } else if (currentNode.id.includes('outer_land')) {
          imagePrompt = 'alien%20landscape%20in%20chinese%20fantasy%2C%20strange%20plants%20and%20crystals%2C%20otherworldly%20atmosphere%2C%20explorer';
        } else {
          imagePrompt = 'mysterious%20ancient%20exploration%20path%2C%20foggy%20forest%2C%20ancient%20ruins%2C%20adventure%20ahead';
        }
        break;
        
      case '宝物':
        transitionText = `面对眼前的诱惑，你最终决定${choice.text}。宝物入手的瞬间，${attributeChangeText}你感受到了其中蕴含的强大力量。`;
        
        if (currentNode.id.includes('treasure') || currentNode.id.includes('reward')) {
          imagePrompt = 'treasure%20room%20in%20ancient%20chinese%20style%2C%20gold%20and%20jewels%20piled%20up%2C%20magical%20aura%2C%20hero%20amazed';
        } else {
          imagePrompt = 'glowing%20treasure%20in%20ancient%20chinese%20style%2C%20magic%20aura%20surrounding%2C%20powerful%20artifact';
        }
        break;
        
      case '修炼':
        transitionText = `经过深思熟虑，你决定${choice.text}。在漫长的修炼过程中，${attributeChangeText}你的道行有了显著提升。`;
        
        if (currentNode.id.includes('meditate')) {
          imagePrompt = 'cultivator%20meditating%20in%20lotus%20position%2C%20ancient%20chinese%20mountains%2C%20spiritual%20energy%20vortex%2C%20glowing%20aura';
        } else if (currentNode.id.includes('enlightenment')) {
          imagePrompt = 'sudden%20enlightenment%20in%20chinese%20fantasy%2C%20cultivator%20with%20halo%20of%20light%2C%20epiphany%20moment';
        } else {
          imagePrompt = 'meditating%20cultivator%20in%20ancient%20chinese%20mountains%2C%20spiritual%20energy%20gathering%2C%20enlightenment';
        }
        break;
        
      case '试炼':
        transitionText = `试炼的关键时刻，你选择了${choice.text}。通过试炼的考验后，${attributeChangeText}你获得了宝贵的经验和成长。`;
        
        if (currentNode.id.includes('tribulation')) {
          imagePrompt = 'thunderstorm%20tribulation%20in%20chinese%20fantasy%2C%20cultivator%20withstanding%20lightning%20bolts%2C%20determined%20expression';
        } else {
          imagePrompt = 'trial%20completion%20in%20ancient%20chinese%20fantasy%2C%20triumphant%20hero%2C%20reward%20awaiting';
        }
        break;
        
      case '情感':
        transitionText = `面对这份情感，你选择了${choice.text}。随着关系的发展，${attributeChangeText}你们的羁绊越来越深。`;
        
        if (currentNode.id.includes('soulmate') || currentNode.id.includes('love')) {
          imagePrompt = 'romantic%20couple%20in%20ancient%20chinese%20setting%2C%20under%20cherry%20blossom%20tree%2C%20moonlight%2C%20emotional%20moment';
        } else {
          imagePrompt = 'close%20friends%20in%20ancient%20china%2C%20bonding%20moment%2C%20trust%20and%20loyalty';
        }
        break;
        
      default:
        transitionText = `你做出了${choice.text}的选择。${attributeChangeText}这个决定将带你走向未知的未来。`;
        
        // 根据当前节点的关键字生成更符合的图片提示词
        if (currentNode.id.includes('mystery')) {
          imagePrompt = 'mysterious%20chinese%20scene%2C%20foggy%20mountains%2C%20ancient%20scrolls%2C%20unsolved%20riddle';
        } else if (currentNode.id.includes('crisis')) {
          imagePrompt = 'ancient%20chinese%20village%20scenery%2C%20traditional%20buildings%2C%20busy%20streets%2C%20daily%20life';
        } else if (currentNode.id.includes('village') || currentNode.id.includes('town')) {
          imagePrompt = 'ancient%20chinese%20village%20scenery%2C%20traditional%20buildings%2C%20busy%20streets%2C%20daily%20life';
        } else if (currentNode.id.includes('mountain') || currentNode.id.includes('forest')) {
          imagePrompt = 'beautiful%20chinese%20landscape%2C%20mountains%20and%20rivers%2C%20misty%20atmosphere%2C%20poetic%20scene';
        } else {
          imagePrompt = 'mystical%20chinese%20story%20background%2C%20scroll%20with%20ancient%20text%2C%20calligraphy%2C%20ink%20painting%20style';
        }
      }
  
  // 如果角色有特殊状态，添加相应描述并调整图片提示
  if (character.statusEffects && character.statusEffects.length > 0) {
    const statusEffects = character.statusEffects.slice(-2).join('、');
    transitionText += ` 同时，你感受到${statusEffects}的影响依然存在。`;
    
    // 根据负面状态调整图片提示
    if (character.statusEffects.includes('重伤未愈')) {
      imagePrompt = 'wounded%20cultivator%20recovering%20in%20ancient%20chinese%20style%2C%20bandages%2C%20healing%20environment';
    } else if (character.statusEffects.includes('霉运缠身')) {
      imagePrompt = 'unlucky%20atmosphere%20in%20ancient%20chinese%20fantasy%2C%20dark%20clouds%2C%20bad%20luck%20omens';
    } else if (character.statusEffects.includes('声名狼藉')) {
      imagePrompt = 'ostracized%20cultivator%20in%20ancient%20chinese%20village%2C%20suspicious%20glances%2C%20negative%20reputation';
    }
  }
  
  // 根据角色属性调整图片色调
  let colorModifier = '';
  if (character.constitution >= 10) {
    colorModifier = '%2C%20vibrant%20colors';
  } else if (character.luck >= 10) {
    colorModifier = '%2C%20bright%20auspicious%20colors';
  } else if (character.comprehension >= 10) {
    colorModifier = '%2C%20mystical%20purple%20tones';
  }
  
   // 生成最终的图片URL
            const imageUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=${encodeURIComponent(imagePrompt + colorModifier)}`;
  
  return {
    text: transitionText,
    imageUrl: imageUrl
  };
};

// 游戏提供者组件
export const GameProvider = ({ children }: { children: ReactNode }) => {
  // 在组件初始化时检查版本更新
  useEffect(() => {
    const updated = checkVersionUpdate();
    
    // 如果版本已更新，重新加载页面以确保所有组件都使用新的状态
    if (updated) {
      window.location.reload();
    }
  }, []);

  // 初始化游戏状态
  const [gameState, setGameState] = useState<GameState>(() => {
    // 尝试从localStorage加载游戏状态
    const savedState = localStorage.getItem('xiuxian_game_state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // 确保新添加的字段有默认值
        return {
          ...parsedState,
          hideHighRiskOptions: parsedState.hideHighRiskOptions !== undefined 
            ? parsedState.hideHighRiskOptions 
            : false,
          showAttributeChanges: true, // 始终显示属性变化
          showExperienceChanges: true, // 始终显示经验值变化
          transitionStory: undefined,
          recentChanges: {},
          // 成就点相关状态
          achievementPoints: parsedState.achievementPoints || 0,
          unlockedCharacters: parsedState.unlockedCharacters || ['xiaoyan'], // 默认只解锁萧炎
          usedCodes: parsedState.usedCodes || [],
          claimedAchievements: parsedState.claimedAchievements || {}
        };
      } catch (e) {
        console.error('Failed to load saved game state', e);
      }
    }
    
    // 默认状态
    return {
      currentCharacter: null,
      currentNode: 'start',
      showCondition: false,
      unlockedAchievements: [],
      claimedAchievements: {},
      hideHighRiskOptions: true, // 默认隐藏高危选项，增加难度
      showAttributeChanges: false, // 默认不显示属性变化，增加策略难度
      showExperienceChanges: false, // 默认不显示经验值变化，增加策略难度
      showAttributeBonusValues: false, // 默认不显示属性加成数值
      exchangeCodeInput: '',
      showInventoryPanel: false,
      // 添加战斗状态，用于回合制战斗
      currentRound: 1,
      battleState: null,
      recentChanges: {},
      // 添加游戏模式设置
      gameMode: {
        isQuickMode: false,
        quickModeMultiplier: 0.7, // 速通模式下文本精简30%
        quickModeDifficulty: 0.5, // 速通模式下小游戏难度降低50%
      },
      // 成就点相关状态
      achievementPoints: 0,
      unlockedCharacters: ['xiaoyan'], // 默认只解锁萧炎
      usedCodes: [], // 记录已使用的兑换码
      isGameEnded: false,
      
      // 第五章特殊机制默认值
      merit: 0, // 功德值初始为0
    };
  });

  // 保存游戏状态到localStorage - 添加防抖优化
  useEffect(() => {
    // 使用防抖机制，避免频繁写入localStorage
    const saveTimer = setTimeout(() => {
      // 防止重复保存相同的状态，减少不必要的localStorage操作
      const prevState = localStorage.getItem('xiuxian_game_state');
      const currentState = JSON.stringify(gameState);
      
      if (prevState !== currentState) {
        localStorage.setItem('xiuxian_game_state', currentState);
      }
    }, 300); // 300ms防抖，避免短时间内多次写入
    
    return () => clearTimeout(saveTimer);
  }, [gameState]);

  // 开始新游戏
  const startNewGame = (characterId: string) => {
    const initialState = getInitialCharacterState(characterId);
    
    // 获取角色的基础属性值
    const character = characters.find(char => char.id === characterId);
    
    // 将初始属性添加到角色状态中
    const characterWithInitialAttributes = {
      ...initialState,
       initialAttributes: character ? {
          charm: character.charm,
          comprehension: character.comprehension,
          constitution: character.constitution,
          family: character.family,
          luck: character.luck,
          reputation: 0
        } : undefined
      };
    
      setGameState({
       ...gameState,
       currentCharacter: {
         ...characterWithInitialAttributes,
         lastDamageTurn: null, // 新增属性：上次受伤的回合
         currentTurn: 0, // 新增属性：当前回合数
         visitedNodes: [], // 初始化已访问节点数组
         // 初始化炼丹相关属性
         alchemy: {
           level: 0,
           experience: 0,
           knownRecipes: [],
           failedAttempts: 0
         },
         // 初始化物品库存
         inventory: {
           herbs: {
             lingzhi: 3, // 灵芝
             dangshen: 2, // 党参
             spirit_grass: 0, // 灵草
             ginseng: 1 // 人参
           },
           minerals: {
             clear_water: 5, // 清泉水
             spirit_stone_powder: 0, // 灵石粉末
             iron_ore: 2 // 铁矿
           },
           beastParts: {
             spirit_beast_core: 0, // 灵兽内丹
             tiger_bone: 0 // 虎骨
           },
           pills: {},
           specialIngredients: {}
         },
         // 初始化装备
         equipment: {
           cauldron: 'bronze_cauldron', // 青铜丹炉
           fireSource: 'wood_fire' // 木生火
         }
       },
       currentNode: 'game_start', // 从游戏开始节点开始游戏
       transitionStory: undefined
     });
  };

  // 转换节点ID函数
  const convertNodeId = (nodeId: string): string => {
    // 特殊处理第二章节点，确保正确连接
    if (nodeId === 'chapter2_1' || nodeId === 'chapter2_2') {
      return nodeId;
    }
    
    // 如果节点存在于映射表中，转换为新节点
    if (nodeMapping[nodeId as keyof typeof nodeMapping]) {
      return nodeMapping[nodeId as keyof typeof nodeMapping];
    }
    // 如果已经是新节点，保持不变
    if (storyNodes[nodeId]) {
      return nodeId;
    }
    // 否则返回游戏起点
    return 'game_start';
  };

  // 做出选择 - 增强版本，添加失败概率系统
  const makeChoice = (choiceId: string) => {
    // 确保有角色数据
    if (!gameState.currentCharacter) {
      console.error('No character selected');
      return;
    }

    const currentNode = storyNodes[gameState.currentNode];
    if (!currentNode) return;

    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // 保存当前修为状态，确保修为不会降低
    const currentCultivation = { 
      ...gameState.currentCharacter.cultivation 
    };

    // 更新角色状态
    const newCharacter = { ...gameState.currentCharacter };
    
    // 确保statusEffects数组存在
    if (!newCharacter.statusEffects) {
      newCharacter.statusEffects = [];
    }
    
    // 确保visitedNodes数组存在，用于追踪已访问的节点
    if (!newCharacter.visitedNodes) {
      newCharacter.visitedNodes = [];
    }
    
    // 记录当前访问的节点（如果尚未访问过）
    if (!newCharacter.visitedNodes.includes(gameState.currentNode)) {
      newCharacter.visitedNodes.push(gameState.currentNode);
    }
    
  // 应用节点的进入效果
  if (currentNode.onEnter) {
    currentNode.onEnter(newCharacter);
  }
  
     // 记录大境界突破时间
  if (newCharacter.cultivation && newCharacter.currentTurn) {
    // 检查是否有突破事件应该记录
    const cultivationLevel = newCharacter.cultivation.level;
    
    // 检查是否是第一次达到这个境界 - 确保境界名称在数组范围内
    const levelName = cultivationLevels[cultivationLevel] || '未知境界';
    const hasReachedLevel = newCharacter.choices.some(choice => 
      choice.includes(`突破至${levelName}`)
    );
    
    if (!hasReachedLevel && cultivationLevel > 0) {
      // 记录突破事件，并包含当前回合信息（可以作为"时间"的表示）
      const breakthroughEvent = `第${newCharacter.currentTurn}回合 - 突破至${levelName}境界`;
      newCharacter.choices.push(breakthroughEvent);
      
      // 触发突破事件
      const event = new CustomEvent('cultivationBreakthrough', {
        detail: {
          level: cultivationLevel,
          turn: newCharacter.currentTurn
        }
      });
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(event);
      }
    }
  }
  
     // 增加当前回合数
     newCharacter.currentTurn = (newCharacter.currentTurn || 0) + 1;
     
     // 检查是否需要计算失败概率（针对有限制条件的选项）
     let success = true;
    if (choice.condition && !choice.condition(newCharacter)) {
      // 计算失败概率 - 基于气运值，最低10%，最高90%
      // 气运越高，失败概率越低
      const luck = newCharacter.luck || 0;
        // 线性映射：luck=0 → 90%失败概率，luck=20 → 10%失败概率
        // 随着游戏进程增加难度：每5个选择，失败概率增加5%
        const choiceCount = newCharacter.choices ? newCharacter.choices.length : 0;
        const difficultyBonus = Math.min(20, Math.floor(choiceCount / 5) * 5); // 最多增加20%失败率
        const failureProbability = Math.max(10, Math.min(90, 90 - (luck * 4) + difficultyBonus));
        
        // 生成随机数判断是否失败
        const random = Math.random() * 100;
        success = random >= failureProbability;
        
        // 记录尝试强行选择
        newCharacter.choices.push(`尝试强行选择: ${choice.text}`);
        
      if (!success) {
        // 选择失败的处理
        newCharacter.choices.push(`强行选择失败: ${choice.text}`);
        
          // 根据选择类型添加不同的负面效果
          // 随机选择负面效果强度，增加多样性
          const severity = Math.random();
          
          // 添加"霉运缠身"状态作为失败标记
          if (!newCharacter.statusEffects.includes('霉运缠身')) {
            newCharacter.statusEffects.push('霉运缠身');
          }
        
        // 根据不同类型的条件添加不同的负面效果
        if (choice.conditionText) {
          // 通用失败后果
          if (severity > 0.7) {
               // 确保健康值始终是有效的数字
               const oldHealth = isNaN(newCharacter.health) ? 100 : newCharacter.health;
               newCharacter.health = Math.max(0, oldHealth - 20);
               // 记录受伤回合
               newCharacter.lastDamageTurn = newCharacter.currentTurn;
              // 记录受伤回合
              if (newCharacter.health < oldHealth) {
                newCharacter.lastDamageTurn = newCharacter.currentTurn;
              }
              newCharacter.luck = Math.max(0, newCharacter.luck - 2);
            } else if (severity > 0.4) {
            newCharacter.luck = Math.max(0, newCharacter.luck - 1);
            // 随机降低一个属性
            const attributes = ['charm', 'comprehension', 'constitution', 'family'];
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)] as keyof typeof newCharacter;
            (newCharacter as any)[randomAttr] = Math.max(0, (newCharacter as any)[randomAttr] - 1);
          } else {
            // 轻微惩罚
            newCharacter.resources.spiritStone = Math.max(0, newCharacter.resources.spiritStone - 20);
          }
        }
        
        // 设置下一个节点为失败专用节点
        setGameState({
          ...gameState,
          currentCharacter: newCharacter,
          currentNode: 'failure_consequence'
        });
        return;
      }
    }
    
     // 选择成功的处理
  // 应用选择的后果
  if (choice.consequence) {
    // 确保tags数组存在
    if (!newCharacter.tags) {
      newCharacter.tags = [];
    }
    choice.consequence(newCharacter);
  }
  
  // 处理经验值增长和境界突破
  if (choice.attributeChanges?.experience) {
    // 确保cultivation.experience存在
    if (!newCharacter.cultivation) {
      newCharacter.cultivation = { level: 0, stage: 0, experience: 0 };
    }
    if (newCharacter.cultivation.experience === undefined) {
      newCharacter.cultivation.experience = 0;
    }
    
    // 增加经验值，悟性影响经验值增长速度
    const baseExp = choice.attributeChanges.experience;
    const comprehensionBonus = Math.floor(baseExp * (newCharacter.comprehension / 20));
    const totalExpGain = baseExp + comprehensionBonus;
    
     // 更新经验值，确保不会出现超过100%的情况
    let currentLevel = newCharacter.cultivation.level;
    let requiredExp = cultivationExperienceRequirements[currentLevel] || 0;
    const currentExp = newCharacter.cultivation.experience;
    
    // 计算添加新经验值后的总经验值
    let totalExperience = currentExp + totalExpGain;
    
    // 如果总经验值超过当前境界所需，先提升境界
    while (totalExperience >= requiredExp && currentLevel < cultivationExperienceRequirements.length - 1) {
      // 扣除当前境界所需经验值
      totalExperience -= requiredExp;
      
      // 突破到下一个境界
      newCharacter.cultivation.level += 1;
      newCharacter.cultivation.stage = 0; // 重置为初期
      
      // 更新当前境界和所需经验值
      currentLevel = newCharacter.cultivation.level;
      requiredExp = cultivationExperienceRequirements[currentLevel] || 0;
      
      // 显示突破提示
      const event = new CustomEvent('cultivationBreakthrough', {
        detail: {
          oldLevel: currentLevel - 1,
          newLevel: currentLevel
        }
      });
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(event);
      }
      
      // 添加突破记录 - 确保境界名称在数组范围内
      const levelName = cultivationLevels[currentLevel] || '未知境界';
      newCharacter.choices.push(`突破至${levelName}境界`);
    }
    
    // 设置剩余经验值
    if (currentLevel < cultivationExperienceRequirements.length - 1) {
      // 未达到最高境界，设置剩余经验值
      newCharacter.cultivation.experience = totalExperience;
    } else {
      // 已达到最高境界，经验值不超过所需值
      newCharacter.cultivation.experience = Math.min(totalExperience, requiredExp);
    }
    
    // 检查是否达到元婴境界，触发心魔劫
    if (currentLevel === 5 && !newCharacter.choices.includes('已玩心魔游戏')) {
      // 准备心魔劫数据
      newCharacter.moralStains = [];
      if (newCharacter.choices.includes('合谋欺诈')) newCharacter.moralStains.push('合谋欺诈');
      if (newCharacter.choices.includes('制造混乱')) newCharacter.moralStains.push('祸水东引');
      if (newCharacter.choices.includes('与摊主合谋')) newCharacter.moralStains.push('与摊主合谋');
      if (newCharacter.choices.includes('祸水东引')) newCharacter.moralStains.push('祸水东引');
      if (newCharacter.choices.includes('沉沦忏悔')) newCharacter.moralStains.push('曾经沉沦');
      
      // 根据道德选择数量决定心魔劫难度
      let moralChoices = 0;
      if (newCharacter.choices.includes('提醒成功')) moralChoices++;
      if (newCharacter.choices.includes('放弃宝物')) moralChoices++;
      if (newCharacter.choices.includes('耐心感应')) moralChoices++;
      newCharacter.demonDifficulty = Math.max(1, 4 - moralChoices);
    }
    
    // 确保从砺剑红尘章节能正确连接到天地决战章节
    if (newCharacter.cultivation.level >= 5 && 
        gameState.currentNode === '节点3-8' && 
        !newCharacter.choices.includes('已进入第四章')) {
      newCharacter.choices.push('已进入第四章');
    }
    
     // 显示经验值获得提示
    const event = new CustomEvent('experienceGain', {
      detail: {
        amount: totalExpGain,
        source: '选择奖励'
      }
    });
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(event);
    }
    
    // 更新最近变化，用于触发动画
    setGameState(prev => ({
      ...prev,
      recentChanges: {
        ...prev.recentChanges,
        experience: totalExpGain
      }
    }));
    
    // 2秒后清除最近变化
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        recentChanges: {
          ...prev.recentChanges,
          experience: undefined
        }
      }));
    }, 2000);
  }

  // 确保修为不会下降 - 核心修复逻辑
  if (newCharacter.cultivation) {
     // 比较新的修为状态与之前的状态
    const hasLevelDecreased = newCharacter.cultivation.level < currentCultivation.level;
      const hasStageDecreased = newCharacter.cultivation.level === currentCultivation.level && 
                               newCharacter.cultivation.stage < currentCultivation.stage;
      
      // 如果修为降低了，恢复到之前的状态
      if (hasLevelDecreased || hasStageDecreased) {
        newCharacter.cultivation = currentCultivation;
        // 如果有负面效果需要应用，只应用其他负面效果而不降低修为
        if (choice.consequence && choiceId.includes('force_choice')) {
          // 重新应用选择后果，但确保修为不变
          const tempCharacter = { ...gameState.currentCharacter };
          choice.consequence(tempCharacter);
          // 只复制非修为相关的变化
          delete tempCharacter.cultivation;
          Object.assign(newCharacter, tempCharacter);
          // 确保修为仍然保持不变
          newCharacter.cultivation = currentCultivation;
        }
      }
    }
    
  // 检查生命值是否为0，如果是则触发死亡结局
  const health = newCharacter.health || 100;
  if (health <= 0) {
    // 立即设置为结局计算节点
    setGameState({
      ...gameState,
      currentCharacter: {
        ...newCharacter,
        isDeathEnding: true,
        deathReason: '生命值归零'
      },
      currentNode: 'ending_calculation_display',
      isGameEnded: true
    });
    return;
  }
    
  // 保存当前选择到角色历史记录
  if (!newCharacter.choices.includes(choice.text)) {
    newCharacter.choices.push(choice.text);
  }

        // 确定下一个节点
        let nextNode = '';
        try {
          if (typeof choice.nextNode === 'function') {
            nextNode = choice.nextNode(newCharacter);
          } else {
            nextNode = choice.nextNode;
          }
          // 转换节点ID
          nextNode = convertNodeId(nextNode);
        } catch (error) {
        console.error('获取下一个节点时出错:', error);
        nextNode = 'game_start'; // 出错时默认回到游戏开始节点，避免出现"剧情不存在"
      }
      
      // 特殊处理：确保第三章到第四章的过渡正确
      if (gameState.currentNode === '节点3-8' && 
          newCharacter.cultivation.level >= 5 && 
          !nextNode.includes('节点4-')) {
        // 如果当前在第三章最后一个节点且修为足够，但下一个节点不是第四章，强制设置为第四章开始
        nextNode = '节点4-1';
      }

      // 防止循环：检查是否与当前节点相同
       if (nextNode === gameState.currentNode) {
         console.warn('Preventing infinite loop: Next node is the same as current node');
         nextNode = gameState.currentNode === 'ending_calculation_display' ? 'ending_calculation_display' : 'game_start'; // 避免出现"剧情不存在"
      }

     // 确保结局节点始终指向正确的显示节点
     if (nextNode === 'ending_calculation') {
       nextNode = 'ending_calculation_display';
     }
     
          // 处理转世重修特殊情况
  const isReincarnation = newCharacter.choices.includes('转世重修');
  
  // 为结局节点增加年龄并标记
  const endingCharacter = {
    ...newCharacter,
    age: newCharacter.age + 50, // 增加结局年龄
    endingAgeAdded: true, // 标记已增加年龄
    isReincarnation: isReincarnation, // 标记是否为转世重修
    finalResources: { ...newCharacter.resources } // 保存最终资源状态
  };
  
   // 设置为结局节点
   // 仅在确实选择了结局节点时才设置为结局计算节点
   if (nextNode === 'ending_calculation' || nextNode.includes('ending')) {
      // 创建一个包含时间戳的唯一键，确保状态更新能触发重新渲染
      const updateKey = Date.now();
      
      setGameState({
        ...gameState,
        currentCharacter: {
          ...endingCharacter,
          // 添加一个更新标志，确保组件能检测到变化
          _updateTimestamp: updateKey
        },
        currentNode: 'ending_calculation_display',
        transitionStory: undefined,
        // 明确设置一个标志表示游戏已结束
        isGameEnded: true
      });
      
      // 触发全局事件，通知应用游戏已结束
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('gameEnded'));
      }
   } else {
        // 跳过过渡剧情，直接进入下一个节点
        setGameState({
          ...gameState,
          currentCharacter: newCharacter,
          currentNode: nextNode
        });
      }
      
      // 防止循环：检查是否与当前节点相同，如果相同则强制进入mid_game
     if (nextNode === gameState.currentNode) {
       console.warn('Preventing infinite loop: Next node is the same as current node');
       nextNode = gameState.currentNode === 'ending_calculation_display' ? 'ending_calculation_display' : 'game_start';
     }
     
     // 确保不会进入已标记为结局的节点
     if (gameState.currentNode === 'ending_calculation_display') {
       nextNode = 'ending_calculation_display';
     }
     
          // 有概率触发后期特殊事件，但确保特定事件只触发一次
        if (newCharacter.cultivation.level >= 4 && Math.random() > 0.85) {
          // 根据角色状态选择合适的事件，确保不会重复触发
          if (newCharacter.choices.includes('结为道侣') && !newCharacter.choices.includes('道侣被抓')) {
            nextNode = 'soulmate_abduction'; // 道侣被抓事件
          } else if (newCharacter.resources.spiritStone > 300 && newCharacter.cultivation.level >= 2 && !newCharacter.choices.includes('已遇劫财')) {
            nextNode = 'robbery_encounter'; // 被抢夺财物事件
          } else if (newCharacter.luck < 5 && !newCharacter.choices.includes('被背叛')) {
            nextNode = 'betrayal_event'; // 被背叛事件
          } else if (Math.random() > 0.5 && newCharacter.cultivation.level >= 3 && !newCharacter.choices.includes('已调查杀人案')) {
            nextNode = 'murder_investigation'; // 发现杀人事件
          } else if (newCharacter.cultivation.level >= 6 && !newCharacter.choices.includes('应对危机')) {
            nextNode = 'cultivation_crisis'; // 修仙界危机
          } else if (newCharacter.comprehension >= 12 && newCharacter.choices.includes('应对危机') && !newCharacter.choices.includes('已探索域外')) {
            nextNode = 'outer_land_exploration'; // 域外大陆探索
          }
        }
        
           // 根据体质恢复生命值 - 只保留一次，但在掉血后两个回合才恢复
          if (newCharacter.constitution) {
            // 检查是否可以恢复生命值：没有受伤或受伤已超过两个回合
            const canRecover = !newCharacter.lastDamageTurn || 
                              (newCharacter.currentTurn - newCharacter.lastDamageTurn) > 2;
            
            if (canRecover) {
              const recoveryAmount = Math.floor(newCharacter.constitution * 0.5); // 体质越高，恢复越多
              newCharacter.health = Math.min(100, (isNaN(newCharacter.health) ? 100 : newCharacter.health) + recoveryAmount);
              
              // 更新最近变化，用于触发动画
              if (recoveryAmount > 0) {
                setGameState(prev => ({
                  ...prev,
                  recentChanges: {
                    ...prev.recentChanges,
                    healthRecovery: recoveryAmount
                  }
                }));
                
                // 2秒后清除最近变化
                setTimeout(() => {
                  setGameState(prev => ({
                    ...prev,
                    recentChanges: {
                      ...prev.recentChanges,
                      healthRecovery: undefined
                    }
                  }));
                }, 2000);
              }
            }
          }
        
        // 这里不需要再次生成transitionStory和设置状态，因为已经在上面处理了
  };

  // 完成过渡剧情，进入下一个节点
  const completeTransition = () => {
    if (gameState.transitionStory) {
      try {
        let nextNode = gameState.transitionStory.nextNode;
        
        // 转换节点ID - 对于chapter2_2节点，直接使用，不进行转换
        if (nextNode === 'chapter2_2') {
          // 直接确认节点是否存在
          if (!storyNodes[nextNode]) {
            console.warn('chapter2_2节点不存在，使用默认节点');
            nextNode = 'game_start';
          }
        } else {
          nextNode = convertNodeId(nextNode);
        }
        
        // 先验证下一个节点是否存在
        const validNextNode = storyNodes[nextNode] ? nextNode : 'game_start';

        // 立即清除所有覆盖层状态
        setGameState(prev => ({
          ...prev,
          currentNode: validNextNode,
          transitionStory: undefined,
          showInventoryPanel: false,
          // 确保所有可能的覆盖层都被清除
          showWarningModal: false,
          showEffectToast: false,
          showTalentEffect: false
        }));
          
          // 强制重新渲染整个组件树
          setTimeout(() => {
            // 触发强制重新渲染事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('forceRenderUpdate'));
            }
            
            // 额外的保障措施，确保状态正确更新
            setGameState(prev => ({
              ...prev,
              // 再次确认节点有效性
              currentNode: storyNodes[prev.currentNode] ? prev.currentNode : 'mid_game'
            }));
          }, 300); // 减少延迟以更快响应
        } catch (error) {
          console.error('完成过渡剧情时出错:', error);
          // 出错时也直接清除过渡剧情和所有覆盖层，确保用户可以继续游戏
          setGameState(prev => ({
            ...prev,
            transitionStory: undefined,
            showInventoryPanel: false
          }));
        }
      }
    };

  // 切换条件显示
  const toggleConditionDisplay = () => {
    setGameState({
      ...gameState,
      showCondition: !gameState.showCondition
    });
  };

  // 切换高危选项隐藏状态
  const toggleHideHighRiskOptions = () => {
    setGameState({
      ...gameState,
      hideHighRiskOptions: !gameState.hideHighRiskOptions
    });
  };

  // 切换属性变化显示
  const toggleAttributeChangesDisplay = () => {
    setGameState({
      ...gameState,
      showAttributeChanges: !gameState.showAttributeChanges
    });
  };

  // 切换经验值变化显示
  const toggleExperienceChangesDisplay = () => {
    setGameState({
      ...gameState,
      showExperienceChanges: !gameState.showExperienceChanges
    });
  };

  // 切换属性加成数值显示
  const toggleAttributeBonusValuesDisplay = () => {
    setGameState({
      ...gameState,
      showAttributeBonusValues: !gameState.showAttributeBonusValues
    });
  };

  // 生成存档码
  const generateSaveCode = () => {
    try {
      // 在实际应用中，这里可能会使用更复杂的编码方式
      // 这里简单地将游戏状态转换为Base64编码
      // 增强的错误处理，确保游戏状态可以被正确序列化
      const sanitizedGameState = { ...gameState };
      
      // 移除可能无法序列化的内容
      if (sanitizedGameState.transitionStory) {
        sanitizedGameState.transitionStory = undefined;
      }
      
      const gameStateString = JSON.stringify(sanitizedGameState);
      
      // 使用encodeURIComponent来处理特殊字符，然后用btoa进行Base64编码
      // 添加额外的错误处理
      let encodedState = '';
      try {
        encodedState = btoa(encodeURIComponent(gameStateString));
      } catch (btoaError) {
        console.error('Base64 encoding failed:', btoaError);
        // 如果标准编码失败，尝试使用替代方案
        // 创建一个简化版本的游戏状态
        const simplifiedState = {
          currentCharacter: sanitizedGameState.currentCharacter ? {
            ...sanitizedGameState.currentCharacter,
            // 移除可能导致编码问题的深层嵌套对象
            resources: sanitizedGameState.currentCharacter.resources ? {
              spiritStone: sanitizedGameState.currentCharacter.resources.spiritStone || 0,
              pills: sanitizedGameState.currentCharacter.resources.pills || 0,
              treasures: sanitizedGameState.currentCharacter.resources.treasures || []
            } : {},
            cultivation: sanitizedGameState.currentCharacter.cultivation || { level: 0, stage: 0, experience: 0 },
            statusEffects: sanitizedGameState.currentCharacter.statusEffects || [],
            choices: sanitizedGameState.currentCharacter.choices || [],
            alchemy: sanitizedGameState.currentCharacter.alchemy || { level: 0, experience: 0, knownRecipes: [], failedAttempts: 0 },
            inventory: sanitizedGameState.currentCharacter.inventory || { herbs: {}, minerals: {}, beastParts: {}, pills: {}, specialIngredients: {} },
            equipment: sanitizedGameState.currentCharacter.equipment || {}
          } : null,
          currentNode: sanitizedGameState.currentNode,
          unlockedAchievements: sanitizedGameState.unlockedAchievements || [],
          achievementPoints: sanitizedGameState.achievementPoints || 0,
          unlockedCharacters: sanitizedGameState.unlockedCharacters || ['xiaoyan'],
          usedCodes: sanitizedGameState.usedCodes || [],
          claimedAchievements: sanitizedGameState.claimedAchievements || {}
        };
        const simplifiedStateString = JSON.stringify(simplifiedState);
        encodedState = btoa(encodeURIComponent(simplifiedStateString));
      }
      
      return encodedState;
    } catch (e) {
      console.error('Failed to generate save code', e);
      return '';
    }
  };

  // 从存档码加载游戏
  const loadFromSaveCode = (saveCode: string) => {
    try {
      // 解码Base64字符串
      const decodedState = decodeURIComponent(atob(saveCode));
      const loadedState = JSON.parse(decodedState);
      
      // 验证加载的状态
      if (loadedState.currentCharacter && loadedState.currentNode) {
        // 确保节点存在
        if (!storyNodes[loadedState.currentNode]) {
          console.error('Story node not found:', loadedState.currentNode);
          return false;
        }
        
        // 修复可能的结局节点问题
        // 如果是结局节点，确保能正确显示结局，而不是重复计算
        if (loadedState.currentNode === 'ending_calculation_display') {
          loadedState.currentNode = 'ending_calculation';
        }
        
        // 移除过渡剧情状态
        if (loadedState.transitionStory) {
          loadedState.transitionStory = undefined;
        }
        
        // 确保成就点和解锁角色状态存在
        if (loadedState.achievementPoints === undefined) {
          loadedState.achievementPoints = 0;
        }
        if (loadedState.unlockedCharacters === undefined) {
          loadedState.unlockedCharacters = ['xiaoyan'];
        }
        // 确保炼丹相关属性存在
        if (!loadedState.currentCharacter.alchemy) {
          loadedState.currentCharacter.alchemy = {
            level: 0,
            experience: 0,
            knownRecipes: [],
            failedAttempts: 0
          };
        }
        // 确保物品库存存在
        if (!loadedState.currentCharacter.inventory) {
          loadedState.currentCharacter.inventory = {
            herbs: {},
            minerals: {},
            beastParts: {},
            pills: {},
            specialIngredients: {}
          };
        }
        // 确保装备存在
        if (!loadedState.currentCharacter.equipment) {
          loadedState.currentCharacter.equipment = {
            cauldron: 'bronze_cauldron',
            fireSource: 'wood_fire'
          };
        }
        // 确保visitedNodes存在
        if (!loadedState.currentCharacter.visitedNodes) {
          loadedState.currentCharacter.visitedNodes = [];
        }
        
        setGameState(loadedState);
        return true;
      } else {
        console.error('Invalid save data: missing character or node');
        return false;
      }
    } catch (e) {
      console.error('Failed to load game from save code', e);
      return false;
    }
  };

  // 重置游戏 - 增强版，确保完全重置成就解锁状态
  const resetGame = () => {
    // 先创建新的游戏状态
    const newGameState = {
      currentCharacter: null,
      currentNode: 'start',
      showCondition: false,
      unlockedAchievements: [], // 重置已解锁成就列表
      claimedAchievements: {}, // 重置已领取成就
      hideHighRiskOptions: false,
      showAttributeChanges: true,
      showExperienceChanges: true,
      transitionStory: undefined,
      achievementPoints: 0, // 重置成就点
      unlockedCharacters: ['xiaoyan'], // 重置已解锁角色
      // 确保所有成就相关状态都被重置
      gameMode: {
        isQuickMode: false,
        quickModeMultiplier: 0.7,
        quickModeDifficulty: 0.5
      },
      exchangeCodeInput: '',
      showInventoryPanel: false,
      currentRound: 1,
      battleState: null,
      recentChanges: {},
      usedCodes: [],
      isGameEnded: false
    };
    
    // 更新游戏状态
    setGameState(newGameState);
    
    // 直接清除localStorage中的成就相关数据，确保完全重置
    try {
      // 清除整个游戏状态，确保所有数据都被重置
      localStorage.removeItem('xiuxian_game_state');
      
      // 重新设置基础配置
      const minimalState = {
        showCondition: false,
        hideHighRiskOptions: false,
        showAttributeChanges: true,
        showExperienceChanges: true,
        gameMode: {
          isQuickMode: false,
          quickModeMultiplier: 0.7,
          quickModeDifficulty: 0.5
        }
      };
      localStorage.setItem('xiuxian_game_state', JSON.stringify(minimalState));
      
      // 清除sessionStorage中缓存的所有成就相关数据
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('achievement_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // 清除成就检查缓存
      sessionStorage.removeItem('achievementCheckCache');
      // 清除上次更新时间记录，确保下次加载时重新检查
      sessionStorage.removeItem('lastGameStateUpdate');
      
      // 触发成就重置事件，通知相关组件更新UI
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        // 先触发一次强制渲染事件清理所有状态
        window.dispatchEvent(new Event('forceRenderUpdate'));
        // 然后触发成就重置事件
        setTimeout(() => {
          window.dispatchEvent(new Event('achievementsReset'));
        }, 100);
      }
    } catch (error) {
      console.error('重置游戏数据时出错:', error);
    }
  };

   // 检查新解锁的成就 - 优化版本，增加更完善的成就检查逻辑
  const checkNewAchievements = () => {
    if (!gameState.currentCharacter) return;
    
    try {
      // 从localStorage读取当前的已解锁成就
      const savedState = localStorage.getItem('xiuxian_game_state');
      const currentState = savedState ? JSON.parse(savedState) : { unlockedAchievements: [], achievementPoints: 0 };
      const currentUnlocked = currentState.unlockedAchievements || [];
      
      // 模拟检查新成就的逻辑
      // 在实际应用中，应该遍历所有成就并检查条件
      
      // 触发UI更新 - 使用英文事件名提高兼容性
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('achievementCheck'));
      }
    } catch (error) {
      console.error('检查成就时出错:', error);
    }
  };

  // 切换游戏模式
  const toggleGameMode = () => {
    // 先获取当前模式状态
    const currentMode = gameState.gameMode && gameState.gameMode.isQuickMode || false;
    
    // 更新游戏状态，确保gameMode对象存在
    setGameState(prev => ({
      ...prev,
      gameMode: {
        ...prev.gameMode,
        isQuickMode: !(prev.gameMode && prev.gameMode.isQuickMode)
      }
    }));
    
    // 显示模式切换提示
    toast.success(`已切换到${currentMode ? '经典' : '速通'}模式`);
  };
  
  // 获取当前游戏模式
  const getGameMode = () => {
    return gameState.gameMode;
  };

  // 添加成就点
  const addAchievementPoints = (points: number) => {
    setGameState(prev => ({
      ...prev,
      achievementPoints: prev.achievementPoints + points
    }));
    
    // 显示获得成就点的提示
    toast.success(`获得 ${points} 成就点！`, {
      duration: 3000,
      position: "top-right",
      style: {
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
      }
    });
  };

  // 解锁角色
  const unlockCharacter = (characterId: string) => {
     // 检查角色是否已经解锁
    // 更严格的检查，确保unlockedCharacters存在且是数组
    const unlockedChars = gameState.unlockedCharacters || [];
    if (Array.isArray(unlockedChars) && unlockedChars.includes(characterId)) {
      toast.info('该角色已经解锁！', {
        duration: 2000,
        position: "top-right"
      });
      return false;
    }
    
    // 获取角色所需成就点
    const character = characters.find(char => char.id === characterId);
    if (!character || !character.unlockPoints) {
      return false;
    }
    
    // 检查成就点是否足够
    if (gameState.achievementPoints < character.unlockPoints) {
      toast.error(`成就点不足！需要 ${character.unlockPoints} 点，当前只有 ${gameState.achievementPoints} 点。`, {
        duration: 3000,
        position: "top-right"
      });
      return false;
    }
    
    // 扣除成就点并解锁角色
    setGameState(prev => ({
      ...prev,
      achievementPoints: prev.achievementPoints - character.unlockPoints,
      unlockedCharacters: [...prev.unlockedCharacters, characterId]
    }));
    
    // 显示解锁成功提示
    const characterName = character.name || '新角色';
    toast.success(`恭喜解锁角色：${characterName}！`, {
      duration: 4000,
      position: "top-center",
      style: {
        backgroundColor: 'rgba(52, 211, 153, 0.9)',
      }
    });
    
    return true;
  };

  // 检查角色是否解锁
  const isCharacterUnlocked = (characterId: string) => {
    // 确保unlockedCharacters存在且是数组
    const unlockedChars = gameState.unlockedCharacters || [];
    return Array.isArray(unlockedChars) && unlockedChars.includes(characterId);
  };
  
  // 标记成就为已领取
  const markAchievementClaimed = (achievementId: string) => {
    setGameState(prev => {
      // 检查成就是否已经被标记为已领取
      if (prev.claimedAchievements[achievementId]) {
        return prev;
      }
      
      const newClaimedAchievements = {
        ...prev.claimedAchievements,
        [achievementId]: true
      };
      
      // 立即更新localStorage
      try {
        const currentState = JSON.parse(localStorage.getItem('xiuxian_game_state') || '{}');
        currentState.claimedAchievements = newClaimedAchievements;
        localStorage.setItem('xiuxian_game_state', JSON.stringify(currentState));
      } catch (error) {
        console.error('标记成就领取状态失败:', error);
      }
      
      return {
        ...prev,
        claimedAchievements: newClaimedAchievements
      };
    });
  };
  
  const contextValue: GameContextType = {
    gameState,
    startNewGame,
    makeChoice,
    toggleConditionDisplay,
    toggleHideHighRiskOptions,
  toggleAttributeChangesDisplay,
  toggleExperienceChangesDisplay,
  toggleAttributeBonusValuesDisplay,
    generateSaveCode,
    loadFromSaveCode,
    resetGame,
    // 添加setUnlockedAchievements方法
  setUnlockedAchievements: (achievements: string[]) => {
  // 创建一个新的游戏状态对象
  const newGameState = {
    ...gameState,
    unlockedAchievements: achievements
  };
  
  // 更新状态
  setGameState(prevState => ({
    ...prevState,
    unlockedAchievements: achievements,
    // 确保unlockedCharacters始终存在
    unlockedCharacters: prevState.unlockedCharacters || ['xiaoyan']
  }));
  
  // 确保成就立即保存到localStorage
  localStorage.setItem('xiuxian_game_state', JSON.stringify(newGameState));
  
  // 触发成就检查事件，确保UI更新
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    // 使用英文事件名提高兼容性
    window.dispatchEvent(new Event('achievementCheck'));
  }
  },
    // 标记成就为已领取
    markAchievementClaimed,
    // 公开检查成就的方法，方便在其他组件中调用
    checkNewAchievements,
    //暴露游戏版本号
      gameVersion: GAME_VERSION,
      // 切换游戏模式
      toggleGameMode,
      // 获取当前游戏模式
      getGameMode,
    // 完成过渡剧情
    completeTransition,
  // 物品栏功能相关方法实现
  toggleInventoryPanel: () => {
    setGameState(prev => ({
      ...prev,
      showInventoryPanel: !prev.showInventoryPanel
    }));
  },
  // 快捷行动模式 - 系统根据角色当前最高属性自动执行最合理的常规行动
  quickAction: () => {
    if (!gameState.currentCharacter) return;
    
    const character = gameState.currentCharacter;
    
    // 找出角色当前最高的属性
    const attributes = [
      { name: 'charm', value: character.charm, action: 'social' },
      { name: 'comprehension', value: character.comprehension, action: 'meditate' },
      { name: 'constitution', value: character.constitution, action: 'train' },
      { name: 'family', value: character.family, action: 'manage' },
      { name: 'luck', value: character.luck, action: 'explore' }
    ];
    
    // 找出最高属性
    const highestAttribute = attributes.reduce((max, attr) => 
      attr.value > max.value ? attr : max, attributes[0]);
    
    // 根据最高属性执行相应的行动
    let actionResult = '';
    let attributeChanges: any = {};
    
    switch (highestAttribute.action) {
      case 'social':
        actionResult = '你通过与他人交流获得了有益的信息';
        attributeChanges.charm = 1;
        attributeChanges.experience = 10;
        break;
      case 'meditate':
        actionResult = '你通过冥想获得了对大道的领悟';
        attributeChanges.comprehension = 1;
        attributeChanges.experience = 15;
        break;
      case 'train':
        actionResult = '你通过刻苦训练增强了体质';
        attributeChanges.constitution = 1;
        attributeChanges.experience = 10;
        break;
      case 'manage':
        actionResult = '你妥善管理资源，获得了额外收益';
        attributeChanges.spiritStone = Math.floor(character.family * 2);
        attributeChanges.experience = 5;
        break;
      case 'explore':
        actionResult = '你的探索带来了意想不到的收获';
        attributeChanges.luck = 1;
        attributeChanges.experience = 15;
        if (Math.random() > 0.7) {
          attributeChanges.spiritStone = Math.floor(character.luck * 1.5);
        }
        break;
      default:
        actionResult = '你度过了平凡的一天';
        attributeChanges.experience = 5;
    }
    
    // 创建新的角色状态
    const newCharacter = { ...character };
    
    // 应用属性变化
    if (attributeChanges.charm) {
      newCharacter.charm = Math.min(20, newCharacter.charm + attributeChanges.charm);
    }
    if (attributeChanges.comprehension) {
      newCharacter.comprehension = Math.min(20, newCharacter.comprehension + attributeChanges.comprehension);
    }
    if (attributeChanges.constitution) {
      newCharacter.constitution = Math.min(20, newCharacter.constitution + attributeChanges.constitution);
    }
    if (attributeChanges.luck) {
      newCharacter.luck = Math.min(20, newCharacter.luck + attributeChanges.luck);
    }
    if (attributeChanges.spiritStone) {
      newCharacter.resources.spiritStone = (newCharacter.resources.spiritStone || 0) + attributeChanges.spiritStone;
    }
    if (attributeChanges.experience) {
      // 经验值增长，包含悟性加成
      const baseExp = attributeChanges.experience;
      const comprehensionBonus = Math.floor(baseExp * (newCharacter.comprehension / 20));
      const totalExpGain = baseExp + comprehensionBonus;
      
      newCharacter.cultivation.experience += totalExpGain;
      
      // 检查是否可以突破境界
      const currentLevel = newCharacter.cultivation.level;
      const requiredExp = cultivationExperienceRequirements[currentLevel] || 0;
      
      if (currentLevel < cultivationExperienceRequirements.length - 1 && 
          newCharacter.cultivation.experience >= requiredExp) {
        // 突破到下一个境界
        newCharacter.cultivation.level += 1;
        newCharacter.cultivation.stage = 0;
        // 扣除当前境界所需经验值
        newCharacter.cultivation.experience -= requiredExp;
      }
    }
    
    // 记录快捷行动
    if (!newCharacter.choices) {
      newCharacter.choices = [];
    }
    newCharacter.choices.push(`[快捷行动] ${actionResult}`);
    
    // 更新游戏状态
    setGameState(prev => ({
      ...prev,
      currentCharacter: newCharacter
    }));
    
    // 显示行动结果
    toast.success(`快捷行动: ${actionResult}`);
    
    // 触发成就检查
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('achievementCheck'));
      }
    }, 500);
  },
  useItem: (itemId: string) => {
      try {
        setGameState(prev => {
          if (!prev.currentCharacter) return prev;
          
          const newCharacter = { ...prev.currentCharacter };
          // 确保物品栏存在
          if (!newCharacter.inventory) {
            newCharacter.inventory = {
              herbs: {},
              minerals: {},
              beastParts: {},
              pills: {},
              specialIngredients: {}
            };
          }
          
          // 解析itemId，格式为：type_id 或 type_id_quality
          const [type, ...rest] = itemId.split('_');
          const id = rest.join('_');
          
          let item: any = null;
          let itemKey = '';
          let itemQuantity = 0;
          
          // 根据类型查找物品
          if (type === 'herb' || type === 'mineral' || type === 'beast' || type === 'special') {
            // 材料类物品
            const category = type === 'herb' ? 'herbs' : type === 'mineral' ? 'minerals' : type === 'beast' ? 'beastParts' : 'specialIngredients';
            if (newCharacter.inventory[category] && newCharacter.inventory[category][id]) {
              itemQuantity = newCharacter.inventory[category][id];
              item = {
                id: itemId,
                name: id,
                description: '材料',
                quantity: itemQuantity,
                effectType: 'material',
                effect: '用于炼丹'
              };
              itemKey = id;
            }
          } else if (type === 'pill') {
            // 丹药类物品
            const [recipeId, quality] = id.split('_');
            if (newCharacter.inventory.pills && newCharacter.inventory.pills[id]) {
              itemQuantity = newCharacter.inventory.pills[id];
              item = {
                id: itemId,
                name: `${recipeId}_${quality}`,
                description: `${quality}品质丹药`,
                quantity: itemQuantity,
                effectType: 'pill',
                quality: quality,
                recipeId: recipeId,
                effect: '使用可获得效果'
              };
              itemKey = id;
              
              // 从alchemyData获取丹药效果
              const { getRecipeById } = require('@/data/alchemyData');
              const recipe = getRecipeById(recipeId);
              if (recipe) {
                item.effectType = recipe.effect.type;
                item.effectTarget = recipe.effect.target;
                item.effectValue = recipe.effect.value;
                item.specialEffect = recipe.effect.specialEffect;
              }
            }
          }
          
          if (!item) {
            console.warn('物品不存在:', itemId);
            return prev;
          }
          
          // 检查物品数量是否足够
          if (itemQuantity <= 0) {
            console.warn('物品数量不足:', itemId);
            return prev;
          }
          
          // 检查丹药品质，判断是否无效
          let isItemValid = true;
          if (item.quality) {
            const qualityInvalidChance = {
              'low': 0.5,       // 劣质：50%概率无效
              'medium': 0.2,   // 普通：20%概率无效
              'high': 0.05,     // 优质：5%概率无效
              'perfect': 0      // 完美：0%概率无效
            };
            const invalidChance = qualityInvalidChance[item.quality] || 0;
            isItemValid = Math.random() >= invalidChance;
          }
          
          // 减少物品数量
          if (type === 'herb') {
            newCharacter.inventory.herbs[itemKey]--;
          } else if (type === 'mineral') {
            newCharacter.inventory.minerals[itemKey]--;
          } else if (type === 'beast') {
            newCharacter.inventory.beastParts[itemKey]--;
          } else if (type === 'special') {
            newCharacter.inventory.specialIngredients[itemKey]--;
          } else if (type === 'pill') {
            newCharacter.inventory.pills[itemKey]--;
          }
          
          // 应用物品效果
          if (item.effectType === 'attribute' && item.effectTarget && item.effectValue) {
            if (item.effectTarget === 'random') {
              // 随机选择一个属性
              const attributes = ['charm', 'comprehension', 'constitution', 'family', 'luck'];
              const randomAttribute = attributes[Math.floor(Math.random() * attributes.length)];
              newCharacter[randomAttribute] = Math.min(20, newCharacter[randomAttribute] + item.effectValue);
              if (isItemValid) {
                toast.success(`使用了${item.name}，${randomAttribute === 'charm' ? '魅力' : randomAttribute === 'comprehension' ? '悟性' : randomAttribute === 'constitution' ? '体质' : randomAttribute === 'family' ? '家境' : randomAttribute === 'luck' ? '气运' : randomAttribute} +${item.effectValue}`);
              } else {
                toast.error(`使用了${item.name}，但丹药品质太低，效果无效！`);
              }
            } else {
              newCharacter[item.effectTarget] = Math.min(20, newCharacter[item.effectTarget] + item.effectValue);
              if (isItemValid) {
                toast.success(`使用了${item.name}，${item.effectTarget === 'charm' ? '魅力' : item.effectTarget === 'comprehension' ? '悟性' : item.effectTarget === 'constitution' ? '体质' : item.effectTarget === 'family' ? '家境' : item.effectTarget === 'luck' ? '气运' : '属性'} +${item.effectValue}`);
              } else {
                toast.error(`使用了${item.name}，但丹药品质太低，效果无效！`);
              }
            }
          } else if (item.effectType === 'experience' && item.effectValue) {
            // 确保cultivation.experience存在
            if (!newCharacter.cultivation) {
              newCharacter.cultivation = { level: 0, stage: 0, experience: 0 };
            }
            if (newCharacter.cultivation.experience === undefined) {
              newCharacter.cultivation.experience = 0;
            }
            
            // 增加经验值，悟性影响经验值增长速度
            const baseExp = item.effectValue;
            const comprehensionBonus = Math.floor(baseExp * (newCharacter.comprehension / 20));
            const totalExpGain = baseExp + comprehensionBonus;
            
            if (isItemValid) {
              newCharacter.cultivation.experience += totalExpGain;
              toast.success(`使用了${item.name}，获得${totalExpGain}点经验值`);
            } else {
              toast.error(`使用了${item.name}，但丹药品质太低，效果无效！`);
            }
          } else if (item.effectType === 'special') {
            // 添加特殊效果标记
            if (!newCharacter.statusEffects) {
              newCharacter.statusEffects = [];
            }
            // 这里可以根据特殊物品效果添加不同的状态或触发事件
            if (item.specialEffect === '解锁神秘剧情') {
              if (!newCharacter.statusEffects.includes('解锁神秘剧情')) {
                newCharacter.statusEffects.push('解锁神秘剧情');
              }
            }
            if (isItemValid) {
              toast.success(`使用了${item.name}，${item.description || '特殊效果生效'}`);
            } else {
              toast.error(`使用了${item.name}，但丹药品质太低，效果无效！`);
            }
          } else if (item.effectType === 'material') {
            // 材料不能直接使用
            toast.error(`${item.name}是材料，不能直接使用，请在炼丹系统中使用！`);
            return prev;
          }
          
          // 记录物品使用
          if (!newCharacter.choices) {
            newCharacter.choices = [];
          }
          newCharacter.choices.push(`使用了${item.name}`);
          
          return {
            ...prev,
            currentCharacter: newCharacter
          };
        });
      } catch (error) {
        console.error('使用物品时出错:', error);
        throw error; // 重新抛出错误，让调用者知道发生了问题
      }
    },
  addItemToInventory: (item: any, quantity: number = 1) => {
      // 特殊处理随机属性丹
      if (item.id === 'attribute_pill') {
        // 复制一个新物品，改变效果目标为随机属性
        const newItem = { ...item };
        const attributes = ['charm', 'comprehension', 'constitution', 'family', 'luck'];
        newItem.effectTarget = attributes[Math.floor(Math.random() * attributes.length)];
        item = newItem;
      }
       setGameState(prev => {
         if (!prev.currentCharacter) return prev;
         
         const newCharacter = { ...prev.currentCharacter };
         // 确保物品栏存在，并且是对象类型而不是数组
         if (!newCharacter.inventory) {
           newCharacter.inventory = {
             herbs: {},
             minerals: {},
             beastParts: {},
             pills: {},
             specialIngredients: {}
           };
         }
         
         // 确定物品应该属于哪个分类
         let category: string = 'herbs';
         let itemKey: string = item.id;
         
         // 根据物品类型确定分类
         if (item.id.includes('pill')) {
           category = 'pills';
         } else if (item.id.includes('herb')) {
           category = 'herbs';
         } else if (item.id.includes('mineral')) {
           category = 'minerals';
         } else if (item.id.includes('beast')) {
           category = 'beastParts';
         } else if (item.id.includes('special')) {
           category = 'specialIngredients';
         }
         
         // 确保分类存在
         if (!newCharacter.inventory[category]) {
           (newCharacter.inventory as any)[category] = {};
         }
         
         // 如果物品已存在，增加数量；否则添加新物品
         if ((newCharacter.inventory as any)[category][itemKey]) {
           (newCharacter.inventory as any)[category][itemKey] += quantity;
         } else {
           (newCharacter.inventory as any)[category][itemKey] = quantity;
         }
         
         return {
           ...prev,
           currentCharacter: newCharacter
         };
       });
     },
    setExchangeCodeInput: (input: string) => {
      setGameState(prev => ({
        ...prev,
        exchangeCodeInput: input
      }));
    },
      redeemCode: (code: string) => {
     // 标准化兑换码，不区分大小写
     const normalizedCode = code.toUpperCase();
     
     // 创建新的游戏状态对象进行修改
     const newState = { ...gameState };
     if (!newState.currentCharacter) {
       return { success: false, message: '请先选择角色' };
     }
     
     // 检查兑换码是否已经使用过
     if (newState.usedCodes && newState.usedCodes.includes(normalizedCode)) {
       return { success: false, message: '该兑换码已经使用过了' };
     }
     
     const rewards: string[] = [];
     
     try {
       // 根据兑换码执行不同的奖励
        switch (normalizedCode) {
          case 'CST22057':
            // 全属性加1
            newState.currentCharacter.charm = Math.min(20, newState.currentCharacter.charm + 1);
            newState.currentCharacter.comprehension = Math.min(20, newState.currentCharacter.comprehension + 1);
            newState.currentCharacter.constitution = Math.min(20, newState.currentCharacter.constitution + 1);
            newState.currentCharacter.family = Math.min(20, newState.currentCharacter.family + 1);
            newState.currentCharacter.luck = Math.min(20, newState.currentCharacter.luck + 1);
            rewards.push('全属性+1');
            break;
            
          case 'ACH22031':
            // 500灵石
            newState.currentCharacter.resources.spiritStone = (newState.currentCharacter.resources.spiritStone || 0) + 500;
            rewards.push('500灵石');
            break;
            
          case 'RES23018':
            // 气运加3
            newState.currentCharacter.luck = Math.min(20, newState.currentCharacter.luck + 3);
            rewards.push('气运+3');
            break;
            
          case 'SWE23039':
            // 两颗临时悟道丹
            contextValue.addItemToInventory({
              id: 'temporary_comprehension_pill',
              name: '临时悟道丹',
              description: '使用后悟性临时+2，持续3个剧情节点',
              effectType: 'special',specialEffect: 'temporary_comprehension_boost',
              icon: 'brain',
              color: 'text-purple-400'
            }, 2);
            rewards.push('2颗临时悟道丹');
            break;
            
          // 添加特殊兑换码，用于测试宝物功能
          case 'TREASURE123':
            // 获得幸运星
            contextValue.addItemToInventory({
              id: 'lucky_star',
              name: '幸运星',
              description: '能够提升持有者的气运，增加机缘',
              effectType: 'attribute',
              effectTarget: 'luck',
              effectValue: 2,
              icon: 'star',
              color: 'text-yellow-500'
            });
            rewards.push('幸运星');
            break;
            
          case 'MIRROR456':
            // 获得心灵之镜
            contextValue.addItemToInventory({
              id: 'mirror_of_hearts',
              name: '心灵之镜',
              description: '能够洞察他人的真实想法，提升社交成功率',
              effectType: 'special',
              specialEffect: 'insight_bonus',
              icon: 'mirror',
              color: 'text-blue-400'
            });
            rewards.push('心灵之镜');
            break;
            
          case 'WISDOM789':
            // 获得智慧之书
            contextValue.addItemToInventory({
              id: 'wisdom_book',
              name: '智慧之书',
              description: '提升持有者的悟性，加快修炼速度',
              effectType: 'attribute',
              effectTarget: 'comprehension',
              effectValue: 3,
              icon: 'book',
              color: 'text-indigo-400'
            });
            rewards.push('智慧之书');
            
         case 'SWE23023':
           // 三颗小修为丹
           for (let i = 0; i < 3; i++) {
             contextValue.addItemToInventory({
               id: 'experience_pill_small',
               name: '小修为丹',
               description: '服用后增加20点经验值',
               effectType: 'experience',
               effectValue: 20,
               icon: 'pill',
               color: 'text-green-400'
             });
           }
           rewards.push('3颗小修为丹');
           break;
           
         case 'SWE23018':
           // 魅力加3
           newState.currentCharacter.charm = Math.min(20, newState.currentCharacter.charm + 3);
           rewards.push('魅力+3');
           break;
           
          case 'ALCHEMY2024':
            // 炼丹材料礼包
            if (!newState.currentCharacter.inventory.herbs) {
              newState.currentCharacter.inventory.herbs = {};
            }
            if (!newState.currentCharacter.inventory.minerals) {
              newState.currentCharacter.inventory.minerals = {};
            }
            newState.currentCharacter.inventory.herbs.lingzhi = (newState.currentCharacter.inventory.herbs.lingzhi || 0) + 5;
            newState.currentCharacter.inventory.herbs.dangshen = (newState.currentCharacter.inventory.herbs.dangshen || 0) + 5;
            newState.currentCharacter.inventory.minerals.clear_water = (newState.currentCharacter.inventory.minerals.clear_water || 0) + 10;
            newState.currentCharacter.inventory.minerals.spirit_stone_powder = (newState.currentCharacter.inventory.minerals.spirit_stone_powder || 0) + 3;
            // 解锁基础丹方
            if (newState.currentCharacter.alchemy && !newState.currentCharacter.alchemy.knownRecipes.includes('healing_pill')) {
              newState.currentCharacter.alchemy.knownRecipes.push('healing_pill');
              newState.currentCharacter.alchemy.experience += 100;
            }
            rewards.push('炼丹材料礼包', '解锁回春丹方');
            break;
            
          default:
            return { success: false, message: '无效的兑换码' };
        }
        
        // 记录已使用的兑换码
        if (!newState.usedCodes) {
          newState.usedCodes = [];
        }
        newState.usedCodes.push(normalizedCode);
        
        // 保存更新后的游戏状态
        setGameState(newState);
        
        // 触发手动状态更新事件
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('inventoryUpdated'));
        }
        
        return { 
          success: true, 
          items: rewards.map(reward => ({ name: reward })) 
        };
      } catch (error) {
        console.error('兑换码处理失败:', error);
        return { success: false, message: '兑换码处理失败，请稍后再试' };
      }
    },
    // 成就点相关方法实现
    addAchievementPoints,
    unlockCharacter,
    isCharacterUnlocked
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}