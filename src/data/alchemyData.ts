/**
 * 炼丹系统 - 丹方和原材料数据
 */

// 丹药品质
export enum PillQuality {
  LOW = 'low',       // 低品质 - 使用后无效概率50%
  MEDIUM = 'medium', // 中品质 - 使用后无效概率20%
  HIGH = 'high',     // 高品质 - 使用后无效概率5%
  PERFECT = 'perfect' // 完美品质 - 使用后无效概率0%
}

// 丹药品质信息
export const pillQualityInfo = {
  [PillQuality.LOW]: {
    name: '劣质',
    color: 'gray',
    invalidChance: 0.5,
    effectMultiplier: 0.5
  },
  [PillQuality.MEDIUM]: {
    name: '普通',
    color: 'blue',
    invalidChance: 0.2,
    effectMultiplier: 0.8
  },
  [PillQuality.HIGH]: {
    name: '优质',
    color: 'purple',
    invalidChance: 0.05,
    effectMultiplier: 1.0
  },
  [PillQuality.PERFECT]: {
    name: '完美',
    color: 'gold',
    invalidChance: 0,
    effectMultiplier: 1.5
  }
};

// 原材料类型
export interface Material {
  id: string;
  name: string;
  description: string;
  type: 'herb' | 'mineral' | 'beast_part' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  icon: string;
}

// 原材料数据
export const materials: Material[] = [
  // 草药类
  {
    id: 'lingzhi',
    name: '灵芝',
    description: '常见的灵药，可用于炼制基础丹药',
    type: 'herb',
    rarity: 'common',
    icon: '🍄'
  },
  {
    id: 'dangshen',
    name: '党参',
    description: '温和的药材，能增强丹药的稳定性',
    type: 'herb',
    rarity: 'common',
    icon: '🌿'
  },
  {
    id: 'spirit_grass',
    name: '灵草',
    description: '蕴含灵气的稀有草药，炼制高级丹药必备',
    type: 'herb',
    rarity: 'uncommon',
    icon: '🌱'
  },
  {
    id: 'ginseng',
    name: '人参',
    description: '百年人参，能大幅提升丹药品质',
    type: 'herb',
    rarity: 'rare',
    icon: '🌾'
  },
  {
    id: 'nine_leaf_grass',
    name: '九叶灵芝',
    description: '传说中的仙草，炼制完美品质丹药的关键材料',
    type: 'herb',
    rarity: 'epic',
    icon: '✨'
  },
  // 矿物类
  {
    id: 'clear_water',
    name: '清泉水',
    description: '纯净的泉水，用于调和药性',
    type: 'mineral',
    rarity: 'common',
    icon: '💧'
  },
  {
    id: 'spirit_stone_powder',
    name: '灵石粉末',
    description: '灵石研磨而成的粉末，能增强丹药灵力',
    type: 'mineral',
    rarity: 'uncommon',
    icon: '💎'
  },
  {
    id: 'iron_ore',
    name: '铁矿',
    description: '用于炼制丹炉的基础材料',
    type: 'mineral',
    rarity: 'common',
    icon: '🪨'
  },
  {
    id: 'star_sand',
    name: '星尘砂',
    description: '来自天外的神秘矿物，能赋予丹药特殊效果',
    type: 'mineral',
    rarity: 'rare',
    icon: '⭐'
  },
  // 妖兽材料类
  {
    id: 'spirit_beast_core',
    name: '灵兽内丹',
    description: '妖兽体内的精华，炼制高级丹药的重要材料',
    type: 'beast_part',
    rarity: 'rare',
    icon: '💠'
  },
  {
    id: 'tiger_bone',
    name: '虎骨',
    description: '强化骨骼的珍贵材料',
    type: 'beast_part',
    rarity: 'uncommon',
    icon: '🦴'
  },
  {
    id: 'dragon_blood',
    name: '龙血',
    description: '传说中的龙族之血，炼制完美品质丹药的至宝',
    type: 'beast_part',
    rarity: 'epic',
    icon: '🐉'
  },
  // 特殊材料
  {
    id: 'phoenix_feather',
    name: '凤凰羽毛',
    description: '不死神鸟的羽毛，能赋予丹药重生之力',
    type: 'special',
    rarity: 'epic',
    icon: '🪶'
  }
];

// 丹方类型
export interface Recipe {
  id: string;
  name: string;
  description: string;
  requiredMaterials: { [key: string]: number };
  baseSuccessRate: number;
  effect: {
    type: 'attribute' | 'health' | 'experience' | 'special';
    target?: 'charm' | 'comprehension' | 'constitution' | 'family' | 'luck';
    value: number;
    description: string;
  };
  difficulty: number; // 1-5，影响炼制难度
  minCultivationLevel: number;
}

// 丹方数据
export const recipes: Recipe[] = [
  {
    id: 'qi_gathering_pill',
    name: '聚气丹',
    description: '帮助修仙者快速聚集天地灵气，提升修炼速度',
    requiredMaterials: {
      lingzhi: 2,
      dangshen: 1,
      clear_water: 3
    },
    baseSuccessRate: 0.7,
    effect: {
      type: 'experience',
      value: 50,
      description: '获得50点经验值'
    },
    difficulty: 1,
    minCultivationLevel: 1
  },
  {
    id: 'body_fortifying_pill',
    name: '壮体丹',
    description: '强化体质，提升生命值上限和恢复速度',
    requiredMaterials: {
      dangshen: 2,
      tiger_bone: 1,
      clear_water: 2
    },
    baseSuccessRate: 0.65,
    effect: {
      type: 'attribute',
      target: 'constitution',
      value: 2,
      description: '体质+2'
    },
    difficulty: 2,
    minCultivationLevel: 2
  },
  {
    id: 'wisdom_enhancing_pill',
    name: '悟性丹',
    description: '开启灵智，提升悟性和理解能力',
    requiredMaterials: {
      spirit_grass: 1,
      ginseng: 1,
      spirit_stone_powder: 2
    },
    baseSuccessRate: 0.6,
    effect: {
      type: 'attribute',
      target: 'comprehension',
      value: 2,
      description: '悟性+2'
    },
    difficulty: 2,
    minCultivationLevel: 2
  },
  {
    id: 'spirit_recovery_pill',
    name: '回灵丹',
    description: '快速恢复消耗的灵力，适合战斗后使用',
    requiredMaterials: {
      lingzhi: 3,
      spirit_stone_powder: 1,
      clear_water: 2
    },
    baseSuccessRate: 0.75,
    effect: {
      type: 'health',
      value: 30,
      description: '恢复30点生命值'
    },
    difficulty: 1,
    minCultivationLevel: 1
  },
  {
    id: 'charm_boosting_pill',
    name: '魅力丹',
    description: '提升个人魅力，增强社交能力',
    requiredMaterials: {
      ginseng: 1,
      tiger_bone: 1,
      spirit_stone_powder: 1
    },
    baseSuccessRate: 0.6,
    effect: {
      type: 'attribute',
      target: 'charm',
      value: 2,
      description: '魅力+2'
    },
    difficulty: 2,
    minCultivationLevel: 2
  },
  {
    id: 'luck_enhancing_pill',
    name: '气运丹',
    description: '提升气运，增加奇遇和成功概率',
    requiredMaterials: {
      spirit_grass: 2,
      star_sand: 1,
      clear_water: 3
    },
    baseSuccessRate: 0.55,
    effect: {
      type: 'attribute',
      target: 'luck',
      value: 2,
      description: '气运+2'
    },
    difficulty: 3,
    minCultivationLevel: 3
  },
  {
    id: 'foundation_stabilizing_pill',
    name: '筑基丹',
    description: '稳固修炼根基，防止走火入魔',
    requiredMaterials: {
      ginseng: 2,
      spirit_beast_core: 1,
      spirit_stone_powder: 2
    },
    baseSuccessRate: 0.5,
    effect: {
      type: 'special',
      value: 0,
      description: '稳固根基，降低修炼风险'
    },
    difficulty: 3,
    minCultivationLevel: 3
  },
  {
    id: 'golden_core_pill',
    name: '金丹丹',
    description: '辅助凝结金丹，大幅提升修炼速度',
    requiredMaterials: {
      nine_leaf_grass: 1,
      spirit_beast_core: 2,
      star_sand: 1
    },
    baseSuccessRate: 0.4,
    effect: {
      type: 'experience',
      value: 200,
      description: '获得200点经验值'
    },
    difficulty: 4,
    minCultivationLevel: 4
  },
  {
    id: 'soul_forming_pill',
    name: '元婴丹',
    description: '辅助修炼元婴，突破境界的关键丹药',
    requiredMaterials: {
      nine_leaf_grass: 2,
      dragon_blood: 1,
      star_sand: 2
    },
    baseSuccessRate: 0.35,
    effect: {
      type: 'experience',
      value: 500,
      description: '获得500点经验值'
    },
    difficulty: 5,
    minCultivationLevel: 5
  },
  {
    id: 'phoenix_rebirth_pill',
    name: '凤凰涅槃丹',
    description: '传说中的神丹，能让人起死回生',
    requiredMaterials: {
      phoenix_feather: 1,
      dragon_blood: 2,
      nine_leaf_grass: 3
    },
    baseSuccessRate: 0.25,
    effect: {
      type: 'special',
      value: 0,
      description: '起死回生，恢复全部生命值'
    },
    difficulty: 5,
    minCultivationLevel: 6
  }
];

// 根据丹方ID获取丹方
export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};

// 根据材料ID获取材料
export const getMaterialById = (id: string): Material | undefined => {
  return materials.find(material => material.id === id);
};

// 检查是否有足够的材料炼制丹药
export const hasEnoughMaterials = (
  recipe: Recipe,
  inventory: { [key: string]: number }
): boolean => {
  for (const materialId in recipe.requiredMaterials) {
    const required = recipe.requiredMaterials[materialId];
    const available = inventory[materialId] || 0;
    if (available < required) {
      return false;
    }
  }
  return true;
};

// 扣除炼制材料
export const consumeMaterials = (
  recipe: Recipe,
  inventory: { [key: string]: number }
): { [key: string]: number } => {
  const newInventory = { ...inventory };
  for (const materialId in recipe.requiredMaterials) {
    const required = recipe.requiredMaterials[materialId];
    newInventory[materialId] = (newInventory[materialId] || 0) - required;
    if (newInventory[materialId] <= 0) {
      delete newInventory[materialId];
    }
  }
  return newInventory;
};

// 计算炼制成功率
export const calculateSuccessRate = (
  recipe: Recipe,
  characterStats: { constitution: number; comprehension: number; luck: number }
): number => {
  const constitutionBonus = characterStats.constitution * 0.02;
  const comprehensionBonus = characterStats.comprehension * 0.02;
  const luckBonus = characterStats.luck * 0.01;
  
  let successRate = recipe.baseSuccessRate + constitutionBonus + comprehensionBonus + luckBonus;
  
  return Math.min(1.0, Math.max(0.1, successRate));
};

// 根据得分确定丹药品质
export const determinePillQuality = (score: number): PillQuality => {
  if (score >= 90) return PillQuality.PERFECT;
  if (score >= 70) return PillQuality.HIGH;
  if (score >= 50) return PillQuality.MEDIUM;
  return PillQuality.LOW;
};

// 计算最终丹药数量（考虑白小纯天赋）
export const calculatePillQuantity = (
  baseQuantity: number,
  characterId: string
): number => {
  if (characterId === 'baixiaochun') {
    return baseQuantity * 2;
  }
  return baseQuantity;
};