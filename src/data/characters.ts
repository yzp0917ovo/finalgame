/**
 * 修仙传奇 - 角色数据
 */

// 角色类型定义
export interface Character {
  id: string;
  name: string;
  charm: number;       // 魅力
  comprehension: number; // 悟性 - 影响经验值增长速度
  constitution: number; // 体质 - 影响生命值恢复速度
  family: number;      // 家境 - 影响灵石增长速度
  luck: number;        // 气运
  imageUrl: string;    // 角色图片URL
  reputation?: number; // 声望 - 影响宗门地位和特殊事件触发
  unlockPoints?: number; // 解锁所需成就点
}

// 角色数据
export const characters: Character[] = [
  {
    id: 'xiaoyan',
    name: '萧炎',
    charm: 7,
    comprehension: 9,
    constitution: 8,
    family: 5,
    luck: 8,
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20warrior%2C%20young%20man%2C%20fire%20element%2C%20heroic%20posture%2C%20fantasy%20world&sign=48376eaf06c3ed89192aab45bf0f7bd4',
    unlockPoints: 0 // 默认解锁
  },
  {
    id: 'hanli',
    name: '韩立',
    charm: 5,
    comprehension: 9,
    constitution: 6,
    family: 3,
    luck: 10,
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20swordsman%2C%20calm%20expression%2C%20low-key%20appearance%2C%20wise%20look%2C%20fantasy%20world&sign=db75fbfcdd69629bedc2b5a9ae33897b',
    unlockPoints: 100 // 需要100点成就点解锁（提高难度）
  },
  {
    id: 'wangteng',
    name: '王腾',
    charm: 4,
    comprehension: 5,
    constitution: 5,
    family: 10,
    luck: 5,
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20nobleman%2C%20rich%20clothing%2C%20arrogant%20expression%2C%20powerful%20aura%2C%20fantasy%20world&sign=8290ffe6582bda5ce6e0bb92aaf5cc1e',
    unlockPoints: 200 // 需要200点成就点解锁（提高难度）
   },
   {
     id: 'baixiaochun',
     name: '白小纯',
     charm: 7,
     comprehension: 10,
     constitution: 4, // 确保低于6，符合节点1-1失败分支的触发条件
     family: 4,
     luck: 9,
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20alchemist%2C%20young%20man%2C%20cunning%20smile%2C%20holding%20medicine%20pestle%2C%20fantasy%20world&sign=cdee5dc3a58e1f9f2a3968d7ae13b7ec',
     unlockPoints: 300 // 需要300点成就点解锁（提高难度）
   },
  {
    id: 'xuque',
    name: '徐缺',
    charm: 10,
    comprehension: 7,
    constitution: 6,
    family: 2,
    luck: 6,
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20hero%2C%20confident%20smile%2C%20flamboyant%20clothing%2C%20dramatic%20posture%2C%20fantasy%20world&sign=0aaba49e9c82a3505003858a1ec7d80f',
    unlockPoints: 500 // 需要500点成就点解锁（提高难度）
  },
  {
    id: 'liqiye',
    name: '李七夜',
    charm: 10,
    comprehension: 10,
    constitution: 10,
    family: 10,
    luck: 10,
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=chinese%20ancient%20immortal%2C%20wise%20old%20man%2C%20aura%20of%20dominance%2C%20mysterious%20smile%2C%20fantasy%20world&sign=a5379183372995e97bc693057346b9e2',
    unlockPoints: 1000 // 需要1000点成就点解锁（最难解锁）
  }
];

// 修为境界 - 修仙者实力的主要划分
export const cultivationLevels = [
  '凡人',   // 0 - 普通人类，未踏入修仙之路
  '练气',   // 1 - 感应天地灵气，开始修炼
  '筑基',   // 2 - 稳固根基，寿命延长
  '结丹',   // 3 - 凝结丹道，实力大增
  '金丹',   // 4 - 金丹大成，寿元可达千年
  '元婴',   // 5 - 修炼出元神，可御空飞行
  '炼虚',   // 6 - 炼虚化神，掌握空间法则
  '合体',   // 7 - 身心合一，拥有移山填海之力
  '渡劫',   // 8 - 历经雷劫，准备飞升
  '大乘'    // 9 - 大乘圆满，可突破界面限制
];

// 获取境界描述
export const getLevelDescription = (index: number): string => {
  const descriptions = [
    "普通人类，未踏入修仙之路",
    "感应天地灵气，开始修炼",
    "稳固根基，寿命延长",
    "凝结丹道，实力大增",
    "金丹大成，寿元可达千年",
    "修炼出元神，可御空飞行",
    "炼虚化神，掌握空间法则",
    "身心合一，拥有移山填海之力",
    "历经雷劫，准备飞升",
    "大乘圆满，可突破界面限制"
  ];
  return descriptions[index] || "未知境界";
};

// 获取不同境界的最大寿元 - 大幅降低寿元上限，增加修炼压力
export const getMaxAgeForCultivation = (level: number): number => {
  // 不同境界对应不同寿元 - 大幅降低
  // 大幅降低寿元上限，增加修炼压力
    const ageLimits = [
    80,   // 凡人 - 普通人类寿命
    110,  // 练气 - 感应天地灵气，寿命延长
    180,  // 筑基 - 稳固根基，寿命大幅增加
    260,  // 结丹 - 凝结丹道，寿元可达二百六十年
    380,  // 金丹 - 金丹大成，寿元三百八十年
    500,  // 元婴 - 修炼出元神，寿元五百年
    650,  // 炼虚 - 炼虚化神，寿元六百五十年
    800,  // 合体 - 身心合一，寿元八百年
    1000, // 渡劫 - 历经雷劫，寿元一千年
    1200  // 大乘 - 不再永生，寿元一千二百年
  ];
  return ageLimits[level] || 100;
}

// 境界阶段 - 每个境界内的实力细分
export const cultivationStages = [
  '初期',     // 0 - 刚入此境界，实力不稳定
  '中期',     // 1 - 熟悉此境界，实力稳步提升
  '后期',     // 2 - 此境界巅峰，即将突破
  '大圆满'    // 3 - 完全掌控此境界的力量
];

  // 不同境界所需经验值
  export const cultivationExperienceRequirements = [
    0,     // 凡人
    300,   // 练气
    900,   // 筑基
    2400,  // 结丹
    6000,  // 金丹
    15000, // 元婴
    37500, // 炼虚
    90000, // 合体
    210000, // 渡劫
    450000 // 大乘
  ];

// 获取经验值进度百分比
export const getExperiencePercentage = (currentExperience: number, level: number): number => {
  try {
    // 确保参数有效
    if (isNaN(currentExperience) || isNaN(level) || level < 0) {
      return 0;
    }
    
    if (level >= cultivationExperienceRequirements.length - 1) {
      return 100; // 已到大乘境界，进度为100%
    }
    
    const requiredExperience = cultivationExperienceRequirements[level] || 0;
    // 确保不会返回超过100%的值
    return requiredExperience > 0 
      ? Math.min(100, Math.max(0, (currentExperience / requiredExperience) * 100))
      : 0;
  } catch (error) {
    console.error('计算经验值百分比时出错:', error);
    return 0;
  }
};

// 获取角色初始状态，包含生命值
export const getInitialCharacterState = (characterId: string) => {
  const character = characters.find(c => c.id === characterId);
  if (!character) {
    throw new Error('角色不存在');
  }

  return {
    ...character,
    age: 16,
    health: 100, // 新增生命值，初始为100
    reputation: 0, // 新增声望属性，初始为0
    cultivation: {
      level: 0, // 凡人
      stage: 0, // 初期
      experience: 0 // 经验值
    },
    statusEffects: [] as string[],
    resources: {
      spiritStone: 50 + character.family * 10, // 家境影响初始灵石
      pills: 5 + Math.floor(character.family / 2), // 家境越好，初始丹药越多
      treasures: [] as string[]
    },
    choices: [] as string[],
    visitedNodes: [] as string[], // 追踪已访问的节点
    achievements: [] as string[],
    currentNode: 'start',
    // 记录初始属性，用于计算成长
    initialAttributes: {
      charm: character.charm,
      comprehension: character.comprehension,
      constitution: character.constitution,
      family: character.family,
      luck: character.luck,
      reputation: 0 // 初始声望也记录
    }
  };
}

// 物品类型定义
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  effectType: 'attribute' | 'experience' | 'special';
  effectTarget?: 'charm' | 'comprehension' | 'constitution' | 'family' | 'luck' | 'reputation';
  effectValue?: number;
  specialEffect?: string;
  icon: string;
  color: string;
  quantity: number;
}

 // 获取关键剧情节点列表
 export const keyStoryNodes = [
   'game_start',           // 游戏开始
   '节点1-1',              // 宗门试炼
   '节点1-2',              // 功法抉择
   '节点1-3',              // 首次突破
   '节点1-4',              // 小比扬名
   '节点2-1',              // 下山历练
   '节点2-2',              // 筑基瓶颈
   '节点2-3',              // 秘境夺宝
   '节点2-4',              // 结丹契机
   '节点2-5',              // 炼制本命物
   '节点2-8',              // 心魔试炼
   '节点3-1',              // 砺剑红尘 - 下山历练
   '节点3-2',              // 砺剑红尘 - 凡尘历练
   '节点3-3',              // 砺剑红尘 - 秘境寻宝
   '节点3-4',              // 砺剑红尘 - 宗门论道
   '节点3-5',              // 砺剑红尘 - 建立势力
   '节点3-6',              // 砺剑红尘 - 万法碑林
   '节点3-7',              // 砺剑红尘 - 化神契机
   '节点3-8',              // 砺剑红尘 - 化神归宗
   '节点4-1',              // 天地决战 - 正魔大战
   '节点4-2',              // 天地决战 - 天魔入侵
   '节点4-3',              // 天地决战 - 飞升抉择
   '节点4-4',              // 天地决战 - 最终天劫
   '节点5-1',              // 执掌天纲 - 终极选择
   'ending_calculation_display'    // 结局计算
 ];