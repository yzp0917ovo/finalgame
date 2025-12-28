import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  icon: string;
  color: string;
  effect?: string; // 新增效果字段
  rarity?: string; // 新增稀有度字段
}

interface Character {
  name: string;
}

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  character: Character;
  handleOverlayClick: () => void;
  handleUseItem: (itemId: string) => void;
  getItemEffectDescription: (item: any) => string;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  isOpen,
  onClose,
  inventoryItems,
  character,
  handleOverlayClick,
  handleUseItem,
  getItemEffectDescription
}) => {
  // 确保inventoryItems始终是一个数组
  const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
  // 获取稀有度对应的颜色类
  const getRarityColorClass = (rarity?: string) => {
    switch (rarity) {
      case '神器':
        return 'bg-yellow-600';
      case '传说':
        return 'bg-purple-600';
      case '稀有':
        return 'bg-blue-600';
      case '普通':
      default:
        return 'bg-gray-600';
    }
  };

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
                <h2 className="text-2xl font-bold">物品栏</h2>
              <p className="text-blue-300 text-sm">
                {character.name}的物品 ({safeInventoryItems.reduce((total: number, item: any) => total + item.quantity, 0)} 件)
              </p>
            </div>
              <button 
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            {/* 物品列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeInventoryItems.length > 0 ? (
                safeInventoryItems.map((item: any) => (
                  <motion.div
                    key={item.id}
                    className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-600/50 hover:border-blue-500 transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <i className={`fa-solid fa-${item.icon} text-xl ${item.color} mr-3`}></i>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-blue-300">数量: {item.quantity}</p>
                            {item.rarity && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColorClass(item.rarity)} text-white`}>
                                {item.rarity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-900/50 rounded-full px-3 py-1 text-green-300 font-bold flex items-center">
                        <i className="fa-solid fa-magic mr-1 text-green-400"></i>
                        {getItemEffectDescription(item)}
                      </div>
                    </div>
                    
                    {/* 显示宝物描述 */}
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">描述:</h4>
                       <p className="text-blue-100 text-sm">{item.description || '无描述信息'}</p>
                       {item.rarity && (
                         <div className="mt-1 text-xs">
                           <span className={`inline-block px-2 py-0.5 rounded-full ${
                             item.rarity === '神器' ? 'bg-yellow-600' :
                             item.rarity === '传说' ? 'bg-purple-600' :
                             item.rarity === '稀有' ? 'bg-blue-600' :
                             'bg-gray-600'
                           } text-white`}>
                             {item.rarity}
                           </span>
                         </div>
                       )}
                    </div>
                    
                    {/* 显示宝物效果 */}
                    {item.effect && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-green-300 mb-1">效果:</h4>
                        <p className="text-green-100 text-sm">{item.effect}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleUseItem(item.id)}
                      className="w-full py-2 rounded-lg transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
                    >
                      使用
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-blue-300">
                  <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                  <p>物品栏为空</p>
                  <p className="text-sm mt-2">去商店购买一些物品吧！</p>
                </div>
              )}
            </div>
            
            {/* 物品栏说明 */}
            <div className="mt-8 bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-bold mb-2">物品使用说明</h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>点击"使用"按钮可以立即消耗物品并获得其效果</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>属性提升物品可以永久增加角色属性，但有上限（最高20点）</span>
                </li>
                <li className="flex items-start">
                  <i className="fa-solid fa-check-circle text-green-400 mt-1 mr-2"></i>
                  <span>经验值物品可以帮助你更快地提升修为境界</span>
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

export default InventoryPanel;