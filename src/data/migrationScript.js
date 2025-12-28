/**
 * 存档迁移脚本 - 用于批量转换旧存档的节点ID
 */

// 导入节点映射表
import { nodeMapping } from './nodeMapping';

/**
 * 迁移旧存档，将旧节点ID转换为新节点ID
 */
export const migrateOldSaves = () => {
  try {
    const oldSaves = localStorage.getItem('xiuxian_game_state') || '[]';
    const saves = JSON.parse(oldSaves);
    
    // 处理单个存档对象
    if (typeof saves === 'object' && !Array.isArray(saves)) {
      const migratedSave = migrateSingleSave(saves);
      localStorage.setItem('xiuxian_game_state', JSON.stringify(migratedSave));
      console.log('已迁移 1 个存档');
    }
    // 处理存档数组
    else if (Array.isArray(saves)) {
      const migratedSaves = saves.map(save => migrateSingleSave(save));
      localStorage.setItem('xiuxian_game_state', JSON.stringify(migratedSaves));
      console.log(`已迁移 ${migratedSaves.length} 个存档`);
    }
    
    // 设置迁移完成标记
    localStorage.setItem('migration_complete', 'true');
    return true;
  } catch (error) {
    console.error('迁移存档时出错:', error);
    return false;
  }
};

/**
 * 迁移单个存档
 */
const migrateSingleSave = (save) => {
  // 创建新存档对象，避免直接修改原对象
  const newSave = { ...save };
  
  // 转换主要节点
  if (save.currentNode) {
    newSave.currentNode = nodeMapping[save.currentNode] || save.currentNode;
  }
  
  // 转换历史记录中的节点引用
  if (save.history && Array.isArray(save.history)) {
    newSave.history = save.history.map(item => ({
      ...item,
      node: item.node ? (nodeMapping[item.node] || item.node) : item.node
    }));
  }
  
  // 转换角色选择中的节点引用
  if (save.currentCharacter && save.currentCharacter.choices && Array.isArray(save.currentCharacter.choices)) {
    // 这里不直接修改choices数组内容，因为它们可能是选择文本而不是节点ID
    // 如果需要，可以根据具体情况进行更复杂的转换
  }
  
  // 转换标签（如果标签包含节点信息）
  if (save.tags && Array.isArray(save.tags)) {
    newSave.tags = save.tags.map(tag => {
      // 如果标签是节点ID，转换它
      return nodeMapping[tag] || tag;
    });
  }
  
  // 添加迁移标记
  newSave.migrated = true;
  newSave.migrationVersion = '1.0';
  
  return newSave;
};

/**
 * 自动运行迁移脚本
 */
if (typeof window !== 'undefined' && !localStorage.getItem('migration_complete')) {
  // 延迟执行，确保DOM加载完成
  setTimeout(() => {
    migrateOldSaves();
  }, 1000);
}