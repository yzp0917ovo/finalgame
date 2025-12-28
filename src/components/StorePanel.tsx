import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { toast } from 'sonner';
import { cultivationLevels } from '@/data/characters';

interface StorePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 商店物品类型定义
interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  requiredCultivationLevel: number; // 所需修为境界
  effectType: 'attribute' | 'experience' | 'special';
  effectTarget?: 'charm' | 'comprehension' | 'constitution' | 'family' | 'luck' | 'random';
  effectValue?: number;
  specialEffect?: string;
  icon: string;
  color: string;
}

export default function StorePanel({ isOpen, onClose }: StorePanelProps) {
  const gameContext = useContext(GameContext);
  const { gameState } = gameContext;
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [exchangeCodeInput, setExchangeCodeInput] = useState(''); // 兑换码输入状态
  const [currentTab, setCurrentTab] = useState<'all' | 'attribute' | 'experience' | 'special'>('all');
  
  // 定义商店物品 - 优化后版本，合并同类道具
  const storeItems: StoreItem[] = [
    {
      id: 'attribute_pill',
      name: '属性丹',
      description: '随机提升1点属性 (魅力/悟性/体质/家境/气运)',
      price: 60,
      requiredCultivationLevel: 1, // 练气期
      effectType: 'attribute',
      effectTarget: 'random',
      effectValue: 1,
      icon: 'gem',
      color: 'text-yellow-400'
    },
    {
      id: 'experience_pill_small',
      name: '小修为丹',
      description: '服用后增加20点经验值',
      price: 30,
      requiredCultivationLevel: 1, // 练气期
      effectType: 'experience',
      effectValue: 20,
      icon: 'pill',
      color: 'text-green-400'
    },
    {
      id: 'experience_pill_medium',
      name: '中修为丹',
      description: '服用后增加50点经验值',
      price: 80,
      requiredCultivationLevel: 2, // 筑基期
      effectType: 'experience',
      effectValue: 50,
      icon: 'pill',
      color: 'text-green-500'
    },
    {
      id: 'experience_pill_large',
      name: '大修为丹',
      description: '服用后增加100点经验值',
      price: 150,
      requiredCultivationLevel: 3, // 结丹期
      effectType: 'experience',
      effectValue: 100,
      icon: 'pill',
      color: 'text-green-600'
    },
    {
      id: 'temporary_comprehension_pill',
      name: '临时悟道丹',
      description: '使用后悟性临时+2，持续3个剧情节点',
      price: 50,
      requiredCultivationLevel: 2, // 筑基期
      effectType: 'special',
      specialEffect: 'temporary_comprehension_boost',
      icon: 'brain',
      color: 'text-purple-400'
    },
    // 添加宝物类物品
    {
      id: 'lucky_star',
      name: '幸运星',
      description: '能够提升持有者的气运，增加机缘',
      price: 200,
      requiredCultivationLevel: 2, // 筑基期
      effectType: 'attribute',
      effectTarget: 'luck',
      effectValue: 2,
      icon: 'star',
      color: 'text-yellow-500'
    },
    {
      id: 'mirror_of_hearts',
      name: '心灵之镜',
      description: '能够洞察他人的真实想法，提升社交成功率',
      price: 300,
      requiredCultivationLevel: 3, // 结丹期
      effectType: 'special',
      specialEffect: 'insight_bonus',
      icon: 'mirror',
      color: 'text-blue-400'
    },
    {
      id: 'wisdom_book',
      name: '智慧之书',
      description: '提升持有者的悟性，加快修炼速度',
      price: 400,
      requiredCultivationLevel: 3, // 结丹期
      effectType: 'attribute',
      effectTarget: 'comprehension',
      effectValue: 3,
      icon: 'book',
      color: 'text-indigo-400'
    },
    {
      id: 'treasure_bowl',
      name: '聚宝盆',
      description: '能够源源不断产生财富的神奇宝盆',
      price: 500,
      requiredCultivationLevel: 4, // 元婴期
      effectType: 'special',
      specialEffect: 'spirit_stone_income',
      icon: 'bowl-food',
      color: 'text-amber-400'
    },
    {
      id: 'soulmate_contract',
      name: '道侣契约',
      description: '与道侣结下的灵魂契约，提升各项属性',
      price: 600,
      requiredCultivationLevel: 5, // 化神期
      effectType: 'special',
      specialEffect: 'soulmate_bonus',
      icon: 'heart',
      color: 'text-red-400'
    }
  ];
  
  // 过滤可购买的物品
  useEffect(() => {
    if (!gameState.currentCharacter) return;
    
    // 根据修为过滤物品
    let items = storeItems.filter(item => 
      gameState.currentCharacter.cultivation.level >= item.requiredCultivationLevel
    );
    
    // 根据标签过滤
    if (currentTab !== 'all') {
      items = items.filter(item => item.effectType === currentTab);
    }
    
    setFilteredItems(items);
  }, [gameState.currentCharacter, currentTab]);
  
  // 购买物品
  const handlePurchase = (item: StoreItem) => {
    if (!gameState.currentCharacter) return;
    
    // 检查灵石是否足够
    if (gameState.currentCharacter.resources.spiritStone < item.price) {
      toast.error(`灵石不足，需要${item.price}颗灵石`);
      return;
    }
    
    // 检查修为是否满足要求
    if (gameState.currentCharacter.cultivation.level < item.requiredCultivationLevel) {
      toast.error(`需要达到${cultivationLevels[item.requiredCultivationLevel]}境界才能购买`);
      return;
    }
    
    try {
      // 扣除灵石
      const currentCharacter = { ...gameState.currentCharacter };
      currentCharacter.resources.spiritStone = Math.max(0, currentCharacter.resources.spiritStone - item.price);
      
      // 将物品添加到物品栏
      const itemToAdd = {
        id: item.id,
        name: item.name,
        description: item.description,
        effectType: item.effectType,
        effectTarget: item.effectTarget,
        effectValue: item.effectValue,
        specialEffect: item.specialEffect,
        icon: item.icon,
        color: item.color
      };
      
      // 使用Context的方法添加物品
      gameContext.addItemToInventory(itemToAdd);
      
      // 记录购买记录
      if (!currentCharacter.choices) {
        currentCharacter.choices = [];
      }
      currentCharacter.choices.push(`购买了${item.name}`);
      
      // 保存更新后的状态（扣除灵石）
      const savedState = localStorage.getItem('xiuxian_game_state');
      const currentState = savedState ? JSON.parse(savedState) : { currentCharacter };
      currentState.currentCharacter = currentCharacter;
      localStorage.setItem('xiuxian_game_state', JSON.stringify(currentState));
      
      toast.success(`成功购买${item.name}，已添加到物品栏`);
      
      // 刷新页面以应用更改
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('购买物品时出错:', error);
      toast.error('购买失败，请稍后再试');
    }
  };
  
  // 检查物品是否可购买
  const isItemPurchasable = (item: StoreItem) => {
    if (!gameState.currentCharacter) return false;
    return gameState.currentCharacter.resources.spiritStone >= item.price && 
           gameState.currentCharacter.cultivation.level >= item.requiredCultivationLevel;
  };
  
  // 点击外部关闭面板
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!gameState.currentCharacter) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick}
        >
          <motion.div 
            className="bg-gradient-to-b from-indigo-900/95 via-blue-900/95 to-indigo-900/95 rounded-2xl p-5 border border-indigo-500/30 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-indigo-600/50">
              <div>
                <h2 className="text-2xl font-bold">云游商人</h2>
                <p className="text-blue-300 text-sm">欢迎，{gameState.currentCharacter.name}！你当前有 {gameState.currentCharacter.resources.spiritStone} 颗灵石</p>
              </div>
              <button 
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            {/* 标签切换 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setCurrentTab('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentTab === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                全部商品
              </button>
              <button
                onClick={() => setCurrentTab('attribute')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentTab === 'attribute' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                属性提升
              </button>
              <button
                onClick={() => setCurrentTab('experience')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentTab === 'experience' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                经验提升
              </button>
              <button
                onClick={() => setCurrentTab('special')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentTab === 'special' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                特殊道具
              </button>
            </div>
            
            {/* 修为限制提示 */}
            <div className="bg-yellow-900/30 rounded-lg p-3 mb-6">
              <p className="text-yellow-200 text-sm flex items-center">
                <i className="fa-solid fa-info-circle mr-2 text-yellow-400"></i>
                当前境界：{cultivationLevels[gameState.currentCharacter.cultivation.level]}，可购买对应境界及以下的物品
              </p>
            </div>
            
            {/* 兑换码输入区域 */}
            <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg p-4 mb-6 border border-blue-700/50">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <i className="fa-solid fa-gift text-yellow-400 mr-2"></i>
                兑换奖励
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="输入兑换码获取奖励 (例: xiuxian666)"
                  value={exchangeCodeInput}
                  onChange={(e) => setExchangeCodeInput(e.target.value)}
                  className="flex-grow bg-indigo-900/70 border border-indigo-700/50 rounded-lg px-3 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (exchangeCodeInput.trim()) {
                      const result = gameContext.redeemCode(exchangeCodeInput.trim());
                      if (result.success) {
                        toast.success(`兑换成功！获得了${result.items.map((item: any) => item.name).join('、')}`);
                        setExchangeCodeInput('');
                      } else {
                        toast.error(result.message || '兑换码无效');
                      }
                    } else {
                      toast.error('请输入兑换码');
                    }
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                >
                  兑换
                </button>
              </div>
            </div>
            
            {/* 商店物品列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border ${
                      isItemPurchasable(item) 
                        ? 'border-blue-600/50 hover:border-blue-500' 
                        : 'border-gray-700 opacity-70'
                    } transition-all duration-300`}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <i className={`fa-solid fa-${item.icon} text-xl ${item.color} mr-3`}></i>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="text-sm text-blue-300">
                            需求：{cultivationLevels[item.requiredCultivationLevel]}
                          </p>
                        </div>
                      </div>
                      <div className="bg-yellow-900/50 rounded-full px-3 py-1 text-yellow-300 font-bold flex items-center">
                        <i className="fa-solid fa-gem mr-1 text-yellow-400"></i>
                        {item.price}
                      </div>
                    </div>
                    
                    <p className="text-blue-100 mb-4">{item.description}</p>
                    
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!isItemPurchasable(item)}
                      className={`w-full py-2 rounded-lg transition-all duration-300 ${
                        isItemPurchasable(item)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isItemPurchasable(item) ? '购买' : '条件不足'}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-blue-300">
                  <i className="fa-solid fa-store-slash text-4xl mb-3"></i>
                  <p>当前没有可购买的物品</p>
                </div>
              )}
            </div>
            
            {/* 商店说明 */}
            <div className="mt-8 bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-2">商店说明</h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>不同修为境界可解锁不同物品，修为越高可购买的物品越高级</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>属性提升道具可以永久增加角色属性，但有上限（最高20点）</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>经验值道具可以帮助你更快地提升修为境界</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>特殊道具可以解锁隐藏剧情或在关键时刻帮助你</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}