import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  recipes, 
  materials, 
  getRecipeById, 
  getMaterialById, 
  hasEnoughMaterials, 
  consumeMaterials, 
  calculateSuccessRate, 
  determinePillQuality, 
  calculatePillQuantity,
  pillQualityInfo,
  PillQuality,
  Recipe,
  Material 
} from '@/data/alchemyData';

interface AlchemySystemProps {
  onComplete: (success: boolean, score: number, result?: {
    quality: string;
    quantity: number;
    recipeId: string;
  }) => void;
  onClose: () => void;
  characterStats: {
    constitution: number;
    comprehension: number;
    luck: number;
  };
  characterId: string;
  inventory: {
    herbs: Record<string, number>;
    minerals: Record<string, number>;
    beastParts: Record<string, number>;
    specialIngredients: Record<string, number>;
  };
}

type TabType = 'guide' | 'recipes' | 'crafting';

export default function AlchemySystem({ 
  onComplete, 
  onClose,
  characterStats, 
  characterId, 
  inventory 
}: AlchemySystemProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftingProgress, setCraftingProgress] = useState(0);
  const [craftingScore, setCraftingScore] = useState(0);
  const [craftingResult, setCraftingResult] = useState<{
    success: boolean;
    quality: PillQuality;
    quantity: number;
  } | null>(null);

  // 获取所有材料库存
  const getAllMaterials = () => {
    const allMaterials: { [key: string]: number } = {};
    
    Object.keys(inventory.herbs || {}).forEach(key => {
      allMaterials[key] = inventory.herbs[key];
    });
    Object.keys(inventory.minerals || {}).forEach(key => {
      allMaterials[key] = inventory.minerals[key];
    });
    Object.keys(inventory.beastParts || {}).forEach(key => {
      allMaterials[key] = inventory.beastParts[key];
    });
    Object.keys(inventory.specialIngredients || {}).forEach(key => {
      allMaterials[key] = inventory.specialIngredients[key];
    });
    
    return allMaterials;
  };

  const allMaterials = getAllMaterials();

  // 获取可用的丹方列表
  const getAvailableRecipes = () => {
    return recipes.filter(recipe => {
      // 检查境界要求
      const currentCultivationLevel = characterStats.comprehension >= 10 ? 5 : 
                                  characterStats.comprehension >= 8 ? 4 :
                                  characterStats.comprehension >= 6 ? 3 :
                                  characterStats.comprehension >= 4 ? 2 :
                                  characterStats.comprehension >= 2 ? 1 : 0;
      
      if (recipe.minCultivationLevel > currentCultivationLevel) {
        return false;
      }
      
      // 检查材料是否足够
      return hasEnoughMaterials(recipe, allMaterials);
    });
  };

  const availableRecipes = getAvailableRecipes();

  // 获取材料显示信息
  const getMaterialDisplay = (materialId: string) => {
    const material = getMaterialById(materialId);
    const quantity = allMaterials[materialId] || 0;
    return {
      ...material,
      quantity,
      hasEnough: quantity > 0
    };
  };

  // 开始炼制
  const startCrafting = () => {
    if (!selectedRecipe) return;
    
    setIsCrafting(true);
    setCraftingProgress(0);
    setCraftingScore(0);
    
    // 模拟炼制过程
    const craftingInterval = setInterval(() => {
      setCraftingProgress(prev => {
        if (prev >= 100) {
          clearInterval(craftingInterval);
          
          // 计算成功率
          const successRate = calculateSuccessRate(selectedRecipe, characterStats);
          const isSuccess = Math.random() < successRate;
          
          // 计算得分
          const baseScore = Math.floor(successRate * 100);
          const randomScore = Math.floor(Math.random() * 20) - 10;
          const finalScore = Math.max(0, Math.min(100, baseScore + randomScore));
          setCraftingScore(finalScore);
          
          // 确定品质
          const quality = determinePillQuality(finalScore);
          
          // 计算丹药数量（考虑白小纯天赋）
          const baseQuantity = isSuccess ? 3 : 1;
          const finalQuantity = calculatePillQuantity(baseQuantity, characterId);
          
          setCraftingResult({
            success: isSuccess,
            quality,
            quantity: finalQuantity
          });
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  // 取消炼制
  const cancelCrafting = () => {
    setIsCrafting(false);
    setCraftingProgress(0);
    setCraftingScore(0);
    setCraftingResult(null);
    setSelectedRecipe(null);
  };

  // 确认炼制结果
  const confirmCraftingResult = () => {
    if (!craftingResult || !selectedRecipe) return;
    
    const { success, quality, quantity } = craftingResult;
    
    if (success) {
      // 炼制成功，扣除材料
      const newMaterials = consumeMaterials(selectedRecipe, allMaterials);
      // 返回结果，包括品质、数量和丹方ID
      onComplete(true, craftingScore, {
        quality,
        quantity,
        recipeId: selectedRecipe.id
      });
    } else {
      // 炼制失败，不扣除材料（或扣除部分）
      onComplete(false, craftingScore);
    }
  };

  // 渲染玩法指南
  const renderGuide = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-300 mb-4">📜 炼丹玩法指南</h3>
        
        <div className="space-y-4 text-blue-100">
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">1. 收集材料</h4>
            <p className="text-sm">通过商店购买、剧情探索或任务奖励获得炼丹所需的材料。材料分为草药、矿物、妖兽材料和特殊材料四类。</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">2. 选择丹方</h4>
            <p className="text-sm">在丹方图鉴中查看可炼制的丹药，不同的丹方需要不同的材料组合，并有不同的效果。</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">3. 开始炼制</h4>
            <p className="text-sm">选择丹方后开始炼制，炼制过程包含三个小游戏：火候控制、时机把握、材料融合。每个小游戏考验不同的能力。</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">4. 获得丹药</h4>
            <p className="text-sm">炼制成功后，根据得分获得不同品质的丹药。品质越高，效果越好，使用后无效的概率越低。</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">5. 使用丹药</h4>
            <p className="text-sm">在物品栏中使用丹药来获得各种效果，包括提升属性、恢复生命值、获得经验值等。</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-purple-300 mb-4">⭐ 丹药品质说明</h3>
        
        <div className="grid grid-cols-2 gap-4 text-purple-100">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="font-semibold text-gray-400 mb-2">劣质</div>
            <div className="text-sm">使用后50%概率无效</div>
            <div className="text-sm">效果减半</div>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg p-4">
            <div className="font-semibold text-blue-400 mb-2">普通</div>
            <div className="text-sm">使用后20%概率无效</div>
            <div className="text-sm">正常效果</div>
          </div>
          
          <div className="bg-purple-800/50 rounded-lg p-4">
            <div className="font-semibold text-purple-400 mb-2">优质</div>
            <div className="text-sm">使用后5%概率无效</div>
            <div className="text-sm">效果提升</div>
          </div>
          
          <div className="bg-yellow-800/50 rounded-lg p-4">
            <div className="font-semibold text-yellow-400 mb-2">完美</div>
            <div className="text-sm">必定有效</div>
            <div className="text-sm">效果翻倍</div>
          </div>
        </div>
      </div>
      
      {characterId === 'baixiaochun' && (
        <div className="bg-green-900/30 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-xl font-bold text-green-300 mb-4">🎯 天赋加持</h3>
          <div className="text-green-100">
            <p className="font-semibold mb-2">白小纯 - 炼丹天才</p>
            <p className="text-sm">炼制成功时，获得的丹药数量翻倍！</p>
            <p className="text-sm">这是白小纯独特的天赋，让他在炼丹方面事半功倍。</p>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染丹方图鉴
  const renderRecipes = () => (
    <div className="space-y-4">
      <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/30">
        <h3 className="text-xl font-bold text-indigo-300 mb-4">📚 丹方图鉴</h3>
        
        {availableRecipes.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg mb-2">暂无可用的丹方</p>
            <p className="text-sm">请先收集足够的材料，或提升修炼境界以解锁更多丹方。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRecipes.map(recipe => {
              const quality = pillQualityInfo[determinePillQuality(70)]; // 假设中等品质
              const canCraft = hasEnoughMaterials(recipe, allMaterials);
              
              return (
                <motion.div
                  key={recipe.id}
                  className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    selectedRecipe?.id === recipe.id 
                      ? 'border-yellow-500 bg-yellow-900/20' 
                      : canCraft 
                        ? 'border-indigo-500/50 bg-indigo-900/20 hover:bg-indigo-800/30' 
                        : 'border-gray-700/30 bg-gray-800/20 opacity-60'
                  }`}
                  whileHover={{ scale: canCraft ? 1.02 : 1 }}
                  whileTap={{ scale: canCraft ? 0.98 : 1 }}
                  onClick={() => canCraft && setSelectedRecipe(recipe)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💊</div>
                    <h4 className="font-bold text-white mb-2">{recipe.name}</h4>
                    <p className="text-xs text-gray-300 mb-3 line-clamp-2">{recipe.description}</p>
                    
                    <div className="text-xs text-indigo-300 mb-2">
                      难度：{'⭐'.repeat(recipe.difficulty)}
                    </div>
                    
                    <div className="text-xs text-blue-300 mb-3">
                      境界要求：{recipe.minCultivationLevel >= 1 ? '练气+' : '凡人+'}
                    </div>
                    
                    {!canCraft && (
                      <div className="text-xs text-red-400 mb-2">
                        材料不足
                      </div>
                    )}
                    
                    {canCraft && (
                      <motion.button
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {selectedRecipe?.id === recipe.id ? '已选择' : '选择'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedRecipe && (
        <div className="bg-green-900/30 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-xl font-bold text-green-300 mb-4">📋 已选丹方</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-200 mb-2">{selectedRecipe.name}</h4>
              <p className="text-sm text-green-100">{selectedRecipe.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-200 mb-2">所需材料</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(selectedRecipe.requiredMaterials).map(([materialId, quantity]) => {
                  const material = getMaterialById(materialId);
                  const available = allMaterials[materialId] || 0;
                  const hasEnough = available >= quantity;
                  
                  return (
                    <div key={materialId} className={`flex items-center gap-2 p-2 rounded ${
                      hasEnough ? 'bg-green-800/30' : 'bg-red-800/30'
                    }`}>
                      <span className="text-xl">{material?.icon || '📦'}</span>
                      <div className="flex-grow">
                        <div className="text-green-200">{material?.name}</div>
                        <div className={`text-xs ${hasEnough ? 'text-green-300' : 'text-red-300'}`}>
                          需要：{quantity} | 拥有：{available}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-200 mb-2">炼制效果</h4>
              <div className="text-sm text-green-100">
                {selectedRecipe.effect.type === 'attribute' && (
                  <p>{selectedRecipe.effect.target}属性 +{selectedRecipe.effect.value}</p>
                )}
                {selectedRecipe.effect.type === 'health' && (
                  <p>恢复{selectedRecipe.effect.value}点生命值</p>
                )}
                {selectedRecipe.effect.type === 'experience' && (
                  <p>获得{selectedRecipe.effect.value}点经验值</p>
                )}
                {selectedRecipe.effect.type === 'special' && (
                  <p>{selectedRecipe.effect.description}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-200 mb-2">成功率</h4>
              <div className="text-sm text-green-100">
                基础成功率：{Math.round(selectedRecipe.baseSuccessRate * 100)}%
                <br />
                体质加成：+{Math.round(characterStats.constitution * 2)}%
                <br />
                悟性加成：+{Math.round(characterStats.comprehension * 2)}%
                <br />
                运气加成：+{Math.round(characterStats.luck * 1)}%
                <br />
                <strong>最终成功率：{Math.round(calculateSuccessRate(selectedRecipe, characterStats) * 100)}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染炼制界面
  const renderCrafting = () => (
    <div className="space-y-4">
      {!selectedRecipe ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-6xl mb-4">🔮</div>
          <p className="text-lg mb-2">请先选择一个丹方</p>
          <p className="text-sm mb-4">在丹方图鉴中查看可用的丹药配方</p>
          <motion.button
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('recipes')}
          >
            前往丹方图鉴
          </motion.button>
        </div>
      ) : (
        <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-500/30">
          <h3 className="text-xl font-bold text-orange-300 mb-4">⚗️ 炼制中</h3>
          
          {!isCrafting ? (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔥</div>
              <p className="text-orange-200 mb-2">准备炼制：{selectedRecipe.name}</p>
              <p className="text-sm text-orange-100 mb-6">
                炼制将包含三个小游戏，考验你的火候控制、时机把握和材料融合能力。
              </p>
              
              <div className="flex gap-4 justify-center">
                <motion.button
                  className="bg-orange-600 hover:bg-orange-500 text-white py-3 px-8 rounded-xl text-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCrafting}
                >
                  开始炼制
                </motion.button>
                
                <motion.button
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-xl text-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecipe(null)}
                >
                  取消选择
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-orange-200">炼制进度</span>
                  <span className="text-orange-300 font-bold">{craftingProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    style={{ width: `${craftingProgress}%` }}
                    animate={{ width: `${craftingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </div>
              
              {craftingProgress < 100 && (
                <div className="text-center text-orange-200">
                  <div className="text-4xl mb-2 animate-pulse">⚗️</div>
                  <p className="text-sm">炼制中，请稍候...</p>
                </div>
              )}
              
              {craftingResult && (
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">
                    {craftingResult.success ? '✅' : '❌'}
                  </div>
                  
                  <div className={`text-2xl font-bold mb-2 ${
                    craftingResult.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {craftingResult.success ? '炼制成功！' : '炼制失败！'}
                  </div>
                  
                  <div className="text-orange-200 mb-4">
                    最终得分：{craftingScore}/100
                  </div>
                  
                  {craftingResult.success && (
                    <div className="bg-green-800/30 rounded-lg p-4 mb-4">
                      <div className="text-green-300 font-semibold mb-2">
                        丹药品质：{pillQualityInfo[craftingResult.quality].name}
                      </div>
                      <div className="text-green-100 text-sm">
                        获得数量：{craftingResult.quantity}颗
                      </div>
                      {characterId === 'baixiaochun' && (
                        <div className="text-yellow-300 text-sm mt-2">
                          🎯 天赋加持：数量翻倍！
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <motion.button
                      className="bg-green-600 hover:bg-green-500 text-white py-3 px-8 rounded-xl text-lg font-bold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmCraftingResult}
                    >
                      确认
                    </motion.button>
                    
                    <motion.button
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-xl text-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelCrafting}
                    >
                        取消
                      </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full max-h-[80vh] flex flex-col bg-gradient-to-b from-gray-900 via-indigo-950 to-black p-4 rounded-xl">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-indigo-300">⚗️ 炼丹系统</h2>
        <motion.button
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          退出
        </motion.button>
      </div>
      
      {/* 标签导航 */}
      <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
        {[
          { id: 'guide', label: '📜 玩法指南', value: 'guide' },
          { id: 'recipes', label: '📚 丹方图鉴', value: 'recipes' },
          { id: 'crafting', label: '⚗️ 开始炼制', value: 'crafting' }
        ].map(tab => (
          <motion.button
            key={tab.id}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              activeTab === tab.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: activeTab === tab.value ? 1 : 1.05 }}
            whileTap={{ scale: activeTab === tab.value ? 0.98 : 0.95 }}
            onClick={() => setActiveTab(tab.value as TabType)}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
      
      {/* 内容区域 */}
      <div className="flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'guide' && renderGuide()}
            {activeTab === 'recipes' && renderRecipes()}
            {activeTab === 'crafting' && renderCrafting()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}