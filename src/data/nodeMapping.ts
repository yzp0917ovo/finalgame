/**
 * 节点映射表 - 用于旧节点ID和新节点ID之间的转换
 */

export const nodeMapping = {
  // 旧节点 -> 新节点
  '节点1-1': 'chapter1_1',
  '内门弟子': 'inner_disciple_path',
  '外门弟子': 'outer_disciple_path',
  '节点1-2': 'chapter1_2',
  '节点1-3': 'chapter1_3',
  '节点1-4': 'chapter1_4',
  '小比第二回合': 'chapter1_battle_round2',
  '节点2-1': 'chapter2_1',
  '节点2-2': 'chapter2_2',
  '节点2-3': 'chapter2_3',
  '节点2-4': 'chapter2_4',
  '节点2-5': 'chapter2_5',
    '节点3-1': 'chapter3_1',
  '节点3-2': 'chapter3_2',
   'dungeon_puzzle_game': 'chapter3_2_dungeon_puzzle', // 仅在第三章第二节的洞府中触发，重命名以避免冲突
  'dungeon_puzzle_success': 'chapter3_2_dungeon_success',
  'dungeon_puzzle_failure': 'chapter3_2_dungeon_failure',
  '节点3-3': 'chapter3_3',
  '节点3-4': 'chapter3_4',
  '节点4-1': 'chapter4_1',
  '节点4-2': 'chapter4_2',
  '节点4-3': 'chapter4_3',
  
   // 结局节点
   '最终失败': 'ending_fail',
   '结局_飞升': 'ending_ascension',
   '结局_至尊': 'ending_unification',
   '结局_守护': 'ending_protector',
   '结局_转世': 'ending_reincarnation',
   
   // 第五章节点
   '节点5-1': 'chapter5_1',
   '节点5-2': 'chapter5_2',
   '节点5-3': 'chapter5_3',
   '节点5-4': 'chapter5_4',
   '节点5-5': 'chapter5_5',
   
   // 通用节点
   'game_start': 'game_start',
   'recovery_node': 'recovery_node',
   'character_creation_complete': 'character_creation_complete'
};

// 反向映射，用于兼容旧存档
export const reverseNodeMapping = Object.fromEntries(
  Object.entries(nodeMapping).map(([key, value]) => [value, key])
);