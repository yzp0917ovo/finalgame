/**
 * 修仙传奇 - 宝物系统数据
 */

// 宝物类型定义
export interface Treasure {
  id: string;
  name: string;
  description: string;
  effect: string;
  category: '攻击' | '防御' | '辅助' | '特殊' | '资源';
  rarity: '普通' | '稀有' | '传说' | '神器';
  imageUrl: string;
}

// 宝物数据
export const treasures: Treasure[] = [
  // 特殊类宝物
  {
    id: '魅惑之眼',
    name: '魅惑之眼',
    description: '一双闪烁着粉色光芒的神秘眼睛，能够增强持有者的魅力',
    effect: '魅力永久+2，更容易获得他人的信任和帮助',
    category: '特殊',
    rarity: '稀有',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=mystical%20pink%20eye%20gem%2C%20chinese%20fantasy%20treasure&sign=06fd94ef90cc702d1b36ca30f04f0ead'
  },
  {
    id: '心灵之镜',
    name: '心灵之镜',
    description: '能够反射人心的神奇镜子，使持有者能够洞察他人的真实想法',
    effect: '社交成功率大幅提升，特殊对话选项解锁',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=mystical%20mirror%20showing%20souls%2C%20chinese%20fantasy%20artifact&sign=0cd75996d6ae993c1ab5f3de233d8511'
  },
  {
    id: '智慧之书',
    name: '智慧之书',
    description: '记载着古老智慧的神秘书籍，能够提升持有者的悟性',
    effect: '悟性永久+2，修炼速度提升20%',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20book%20with%20floating%20runes%2C%20chinese%20fantasy%20scroll&sign=73279ad65b9d6f1a3319fccbd2374697'
  },
  {
    id: '火灵圣体',
    name: '火灵圣体',
    description: '融入了火灵之力的神奇宝物，能够极大增强持有者的体质和抗火能力',
    effect: '体质永久+3，对火属性攻击免疫',
    category: '特殊',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=fiery%20spiritual%20body%20gem%2C%20chinese%20fantasy%20treasure&sign=64cb841984384766d4545afe80c6a7fb'
  },
  {
    id: '聚宝盆',
    name: '聚宝盆',
    description: '能够源源不断产生财富的神奇宝盆',
    effect: '每回合额外获得10颗灵石',
    category: '资源',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=golden%20treasure%20bowl%2C%20chinese%20fantasy%20wealth%20artifact&sign=f029d6df037263bc27020bad10cc6803'
  },
  {
    id: '幸运星',
    name: '幸运星',
    description: '一颗闪烁着金色光芒的星星，能够提升持有者的气运',
    effect: '气运永久+2，奇遇概率提升30%',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=shining%20lucky%20star%20gem%2C%20chinese%20fantasy%20treasure&sign=262359274d41df8c931b5fa75a3956e8'
  },
  {
    id: '隐形斗篷',
    name: '隐形斗篷',
    description: '能够让使用者隐身的神奇斗篷',
    effect: '可以避开部分危险事件，逃跑成功率100%',
    category: '辅助',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=invisible%20cloak%20with%20mystical%20symbols%2C%20chinese%20fantasy%20artifact&sign=b33145195978049014ead69a2a66b291'
  },
  {
    id: '禁书目录',
    name: '禁书目录',
    description: '记载着各种禁忌知识的神秘书籍',
    effect: '悟性+1，但是有概率触发负面事件',
    category: '特殊',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=forbidden%20grimoire%20with%20dark%20energy%2C%20chinese%20fantasy%20scroll&sign=9cb82b58c229aced7bdc728da27c2111'
  },
  {
    id: '火属性防护符',
    name: '火属性防护符',
    description: '能够抵抗火属性攻击的符咒',
    effect: '获得火属性抵抗，在火属性环境中不受伤害',
    category: '防御',
    rarity: '普通',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=fire%20protection%20talisman%2C%20chinese%20fantasy%20amulet&sign=998bcb663ac14f2399193b8d98eb59ff'
  },
  {
    id: '点金术卷轴',
    name: '点金术卷轴',
    description: '记载着将普通物品变成金子的法术',
    effect: '一次性获得50颗灵石',
    category: '资源',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=golden%20transmutation%20scroll%2C%20chinese%20fantasy%20artifact&sign=790c9e6e22d106150bf2f98ec03dd96c'
  },
  
  // 攻击类宝物
  {
    id: '极品法宝',
    name: '极品法宝',
    description: '威力强大的攻击性法宝',
    effect: '战斗成功率提升20%',
    category: '攻击',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=powerful%20magic%20weapon%2C%20chinese%20fantasy%20sword&sign=dc8e5e261b0457010b62415aa51793e3'
  },
  {
    id: '高级法宝',
    name: '高级法宝',
    description: '品质优良的攻击性法宝',
    effect: '战斗成功率提升10%',
    category: '攻击',
    rarity: '普通',imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=magic%20sword%20with%20spiritual%20energy%2C%20chinese%20fantasy%20weapon&sign=67cb933a1b3506678432c93780a373c9'
  },
  {
    id: '远古神器',
    name: '远古神器',
    description: '来自远古时代的强大神器',
    effect: '体质+2，攻击和防御大幅提升',
    category: '攻击',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20divine%20weapon%2C%20chinese%20fantasy%20artifact&sign=cccd5eb332cb286963b16c472ccfd22e'
  },
  
  // 辅助类宝物
  {
    id: '幸运符',
    name: '幸运符',
    description: '能够带来好运的符咒',
    effect: '临时提升气运+1，持续3个事件',
    category: '辅助',
    rarity: '普通',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lucky%20charm%20talisman%2C%20chinese%20fantasy%20amulet&sign=9b26398be6a86c21667ab99748dde16e'
  },
  {
    id: '厄运转移石',
    name: '厄运转移石',
    description: '能够将厄运转移给他人的神奇石头',
    effect: '可以抵消一次负面事件的影响',
    category: '辅助',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=dark%20luck%20transfer%20stone%2C%20chinese%20fantasy%20artifact&sign=ecc3772c51ce256c1fc36d2b160f2f90'
  },
  {
    id: '试炼之钥',
    name: '试炼之钥',
    description: '能够开启神殿核心区域的神秘钥匙',
    effect: '解锁隐藏剧情和高级奖励',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=mystical%20temple%20key%2C%20chinese%20fantasy%20artifact&sign=459a7f360cdb26eb52bfa83573840bd7'
  },
  {
    id: '神殿核心',
    name: '神殿核心',
    description: '神殿的核心能量源泉',
    effect: '可以与守护者进行高级交易',
    category: '特殊',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=sacred%20temple%20core%20with%20divine%20light%2C%20chinese%20fantasy%20artifact&sign=e478876674c1ec834f778d884905a3b2'
  },
  {
    id: '守护者之心',
    name: '守护者之心',
    description: '古老守护者的核心力量',
    effect: '体质+2，获得守护者的认可',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=guardian%20heart%20crystal%2C%20chinese%20fantasy%20treasure&sign=2f4ef795206bcdec377b560e9aa30dee'
  },
  {
    id: '永恒之心',
    name: '永恒之心',
    description: '拥有永恒之力的神秘宝物',
    effect: '境界+1，寿元增加500年',
    category: '特殊',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=eternal%20heart%20with%20infinite%20energy%2C%20chinese%20fantasy%20artifact&sign=e23f6b4b876f548f754c4be421d84738'
  },
  
  // 资源类宝物
  {
    id: '珍贵妖丹',
    name: '珍贵妖丹',
    description: '强大妖兽的内丹，蕴含丰富的能量',
    effect: '体质+1，一次性获得30颗灵石',
    category: '资源',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=precious%20demon%20core%2C%20chinese%20fantasy%20treasure&sign=0050e03175828417c4f3211a392e9669'
  },
  {
    id: '稀有材料',
    name: '稀有材料',
    description: '用于炼制高级宝物的珍贵材料',
    effect: '获得2颗丹药，交易价值提升',
    category: '资源',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=rare%20crafting%20materials%2C%20chinese%20fantasy%20ingredients&sign=856831e1cecc9d54f353be954b035052'
  },
  {
    id: '修仙心得',
    name: '修仙心得',
    description: '记录着前人修仙经验的珍贵笔记',
    effect: '悟性+1，修炼速度提升10%',
    category: '特殊',
    rarity: '普通',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20cultivation%20notes%2C%20chinese%20fantasy%20scroll&sign=c455df2f95f87b25428aee0ceafbab7c'
  },
  {
    id: '上古灵物',
    name: '上古灵物',
    description: '从上古时代流传下来的神奇灵物',
    effect: '全面提升属性，解锁高级剧情',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20spiritual%20creature%2C%20chinese%20fantasy%20treasure&sign=7136950844be498386e619e26e7dd867'
  },
  {
    id: '被诅咒的物品',
    name: '被诅咒的物品',
    description: '蕴含着诅咒之力的危险物品',
    effect: '获得"厄运缠身"状态，但同时获得大量资源',
    category: '特殊',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cursed%20artifact%20with%20dark%20energy%2C%20chinese%20fantasy%20treasure&sign=cb38beb369102755536be89efa6a9e68'
  },
  {
    id: '上古经文',
    name: '上古经文',
    description: '记载着上古修炼方法的神秘经文',
    effect: '悟性+2，解锁特殊修炼方法',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20sacred%20texts%2C%20chinese%20fantasy%20scrolls&sign=9f4cee381d36a817721a54c6befd90fc'
  },
  {
    id: '灵兽友谊',
    name: '灵兽友谊',
    description: '与神秘灵兽结下的友谊，是最珍贵的宝物',
    effect: '气运+2，关键时刻可能得到灵兽的帮助',
    category: '特殊',
    rarity: '稀有',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=spiritual%20beast%20companion%20bond%2C%20chinese%20fantasy%20friendship&sign=ad43841fa0ef0d2cc1d20f12a320b9db'
  },
  {
    id: '道侣契约',
    name: '道侣契约',
    description: '与道侣结下的灵魂契约',
    effect: '魅力+1，境界阶段+1，双修效果提升',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=soulmate%20contract%20scroll%2C%20chinese%20fantasy%20bond&sign=b7b7ece6a9d19432950e91f26bdfd829'
  },
  {
    id: '仙人指引',
    name: '仙人指引',
    description: '得到仙人的指点，是无比珍贵的机缘',
    effect: '悟性+1，气运+1，解锁隐藏修炼路径',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=celestial%20guidance%20light%2C%20chinese%20fantasy%20blessing&sign=19c7057f8f667c096b4d61c436138555'
  },
  {
    id: '守护者传承',
    name: '守护者传承',
    description: '古老守护者的完整传承',
    effect: '体质+2，悟性+1，获得守护者的全部知识',
    category: '特殊',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=guardian%20inheritance%20light%2C%20chinese%20fantasy%20power&sign=8f6242347f806254047fa2f70cf43552'
  },
  {
    id: '全部宝藏',
    name: '全部宝藏',
    description: '遗迹中的所有宝藏，价值连城',
    effect: '获得200颗灵石和多种珍贵宝物',
    category: '资源',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=treasure%20room%20full%20of%20gold%20and%20gems%2C%20chinese%20fantasy%20wealth&sign=f76a8b0d174f7aca09c2a6bda56ddc21'
  },
  {
    id: '仙缘信物',
    name: '仙缘信物',
    description: '与仙人结下缘分的信物',
    effect: '提高遇到仙人的概率，解锁特殊仙缘事件',
    category: '特殊',
    rarity: '传说',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=celestial%20token%20of%20fate%2C%20chinese%20fantasy%20amulet&sign=55d0e0536efba4e198cde155105d91e8'
  },
  {
    id: '因果之链',
    name: '因果之链',
    description: '能够操控因果律的神秘链条',
    effect: '可以影响某些事件的结果，但可能带来未知后果',
    category: '特殊',
    rarity: '神器',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=karmic%20chain%20with%20mystical%20energy%2C%20chinese%20fantasy%20artifact&sign=dc318b43675bbac79544a52a1bc3209c'
  }
];

// 获取宝物详情
export const getTreasureById = (id: string): Treasure | undefined => {
  return treasures.find(treasure => treasure.id === id);
};

// 获取所有宝物类别
export const getTreasureCategories = (): string[] => {
  return Array.from(new Set(treasures.map(treasure => treasure.category)));
};

// 获取所有宝物稀有度
export const getTreasureRarities = (): string[] => {
  return Array.from(new Set(treasures.map(treasure => treasure.rarity)));
};