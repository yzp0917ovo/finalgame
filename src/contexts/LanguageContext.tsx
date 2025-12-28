import { createContext, useState, useEffect, ReactNode } from 'react';

// 定义支持的语言类型
export type Language = 'zh' | 'zh_tw' | 'en';

// 定义翻译字典类型
interface TranslationDict {
  [key: string]: string;
}

// 定义所有支持语言的翻译字典
interface Translations {
  [key: Language]: TranslationDict;
}

// 创建翻译字典
const translations: Translations = {
  zh: {
    'game.title': '修仙传奇',
    'game.intro': '欢迎来到修仙世界，开始你的修仙之旅吧！',
    'game.settings': '游戏设置',
    'game.achievements': '成就画廊',
    'btn.back': '返回',
    'btn.save': '保存',
    'btn.load': '读取存档',
    'btn.restart': '重新开始',
    'btn.select.character': '选择角色',
    'btn.start.game': '开始游戏',
    'btn.explore': '探索',
    'settings.language': '语言选择',
    'settings.volume': '音量调节',
    'settings.brightness': '亮度调节',
    'settings.show.conditions': '显示判定条件',
    'settings.hide.risky': '隐藏高危选项',
    'settings.reset.game': '重置游戏',
    'settings.load.save': '读档功能',
    'achievement.title': '成就画廊',
    'achievement.unlocked': '已解锁成就',
    'achievement.total.stars': '总难度星数',
    'achievement.highest.difficulty': '最高难度成就',
    'character.select': '角色选择',
    'character.stats': '角色属性',
    'character.talent': '天赋',
    'character.play.style': '核心玩法',
    'story.flow': '修仙历程',
    'ending.calculation': '结局计算',
    'status.health': '生命值',
    'status.age': '年龄',
    'status.cultivation': '修为',
    'status.resources': '资源',
    'attribute.charm': '魅力',
    'attribute.comprehension': '悟性',
    'attribute.constitution': '体质',
    'attribute.family': '家境',
    'attribute.luck': '气运',
    'resource.spirit.stone': '灵石',
    'resource.pills': '丹药',
    'resource.treasures': '宝物',
    'cultivation.stage': '阶段',
    'cultivation.level': '境界',
    'yes': '是',
    'no': '否',
    'save.success': '存档成功',
    'load.success': '读档成功',
    'reset.confirm': '确定要重置游戏吗？这将清除所有游戏数据。',
    'game.over': '游戏结束',
    'new.game': '新游戏',
    'continue.game': '继续游戏',
    'male': '男',
    'female': '女',
    'neutral': '中性'
  },
  zh_tw: {
    'game.title': '修仙傳奇',
    'game.intro': '歡迎來到修仙世界，開始你的修仙之旅吧！',
    'game.settings': '遊戲設定',
    'game.achievements': '成就畫廊',
    'btn.back': '返回',
    'btn.save': '保存',
    'btn.load': '讀取存檔',
    'btn.restart': '重新開始',
    'btn.select.character': '選擇角色',
    'btn.start.game': '開始遊戲',
    'btn.explore': '探索',
    'settings.language': '語言選擇',
    'settings.volume': '音量調節',
    'settings.brightness': '亮度調節',
    'settings.show.conditions': '顯示判定條件',
    'settings.hide.risky': '隱藏高危選項',
    'settings.reset.game': '重置遊戲',
    'settings.load.save': '讀檔功能',
    'achievement.title': '成就畫廊',
    'achievement.unlocked': '已解鎖成就',
    'achievement.total.stars': '總難度星數',
    'achievement.highest.difficulty': '最高難度成就',
    'character.select': '角色選擇',
    'character.stats': '角色屬性',
    'character.talent': '天賦',
    'character.play.style': '核心玩法',
    'story.flow': '修仙歷程',
    'ending.calculation': '結局計算',
    'status.health': '生命值',
    'status.age': '年齡',
    'status.cultivation': '修為',
    'status.resources': '資源',
    'attribute.charm': '魅力',
    'attribute.comprehension': '悟性',
    'attribute.constitution': '體質',
    'attribute.family': '家境',
    'attribute.luck': '氣運',
    'resource.spirit.stone': '靈石',
    'resource.pills': '丹藥',
    'resource.treasures': '寶物',
    'cultivation.stage': '階段',
    'cultivation.level': '境界',
    'yes': '是',
    'no': '否',
    'save.success': '存檔成功',
    'load.success': '讀檔成功',
    'reset.confirm': '確定要重置遊戲嗎？這將清除所有遊戲數據。',
    'game.over': '遊戲結束',
    'new.game': '新遊戲',
    'continue.game': '繼續遊戲',
    'male': '男',
    'female': '女',
    'neutral': '中性'
  },
  en: {
    'game.title': 'Immortal Legend',
    'game.intro': 'Welcome to the world of immortals, begin your cultivation journey!',
    'game.settings': 'Game Settings',
    'game.achievements': 'Achievements Gallery',
    'btn.back': 'Back',
    'btn.save': 'Save',
    'btn.load': 'Load Save',
    'btn.restart': 'Restart',
    'btn.select.character': 'Select Character',
    'btn.start.game': 'Start Game',
    'btn.explore': 'Explore',
    'settings.language': 'Language',
    'settings.volume': 'Volume',
    'settings.brightness': 'Brightness',
    'settings.show.conditions': 'Show Conditions',
    'settings.hide.risky': 'Hide High-Risk Options',
    'settings.reset.game': 'Reset Game',
    'settings.load.save': 'Load Save',
    'achievement.title': 'Achievements Gallery',
    'achievement.unlocked': 'Unlocked Achievements',
    'achievement.total.stars': 'Total Difficulty Stars',
    'achievement.highest.difficulty': 'Highest Difficulty Achievement',
    'character.select': 'Character Selection',
    'character.stats': 'Character Stats',
    'character.talent': 'Talent',
    'character.play.style': 'Play Style',
    'story.flow': 'Cultivation Journey',
    'ending.calculation': 'Ending Calculation',
    'status.health': 'Health',
    'status.age': 'Age',
    'status.cultivation': 'Cultivation',
    'status.resources': 'Resources',
    'attribute.charm': 'Charm',
    'attribute.comprehension': 'Comprehension',
    'attribute.constitution': 'Constitution',
    'attribute.family': 'Family',
    'attribute.luck': 'Luck',
    'resource.spirit.stone': 'Spirit Stones',
    'resource.pills': 'Pills',
    'resource.treasures': 'Treasures',
    'cultivation.stage': 'Stage',
    'cultivation.level': 'Level',
    'yes': 'Yes',
    'no': 'No',
    'save.success': 'Save Successful',
    'load.success': 'Load Successful',
    'reset.confirm': 'Are you sure you want to reset the game? This will clear all game data.',
    'game.over': 'Game Over',
    'new.game': 'New Game',
    'continue.game': 'Continue Game',
    'male': 'Male',
    'female': 'Female',
    'neutral': 'Neutral'
  }
};

// 定义语言上下文类型
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

// 创建语言上下文
export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'zh',
  setLanguage: () => {},
  t: (key, defaultValue = key) => defaultValue
});

// 语言提供者组件
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // 从localStorage加载语言设置，如果没有则使用默认语言
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('xiuxian_language');
    return savedLanguage as Language || 'zh';
  });

  // 当语言改变时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('xiuxian_language', currentLanguage);
  }, [currentLanguage]);

  // 翻译函数
  const t = (key: string, defaultValue: string = key): string => {
    return translations[currentLanguage][key] || defaultValue;
  };

  // 设置语言函数
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};