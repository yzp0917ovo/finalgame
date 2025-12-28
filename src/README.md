# 修仙传奇 - 第一章节点逻辑链

以下是《修仙传奇》第一章（1-1 至 1-4）的完整节点逻辑链：

## 1-1 【宗门试炼】
**节点ID**: chapter1_1
**描述**: 升仙大会广场上，通过测灵碑测试修仙资质
**选择及流向**:
- 展示天赋（需悟性≥7）→ inner_discipleship
- 用资源贿赂长老（需灵石≥50且家境≥5）→ outer_discipleship
- 通过正常选拔程序 → outer_discipleship (成功) 或 final_failure (失败)
- 观察其他人的测试，寻找规律（需气运≥6）→ outer_discipleship

## 1-2 【功法抉择】
**节点ID**: chapter1_2
**描述**: 藏经阁内选择适合自己的功法秘籍
**前置节点**: inner_discipleship 或 outer_discipleship
**选择及流向**:
- 选择《长春功》（需悟性≥7）→ chapter1_3
- 选择《象甲功》（需体质≥6）→ chapter1_3
- 选择《百毒真经》（需悟性≥8或气运≥9）→ chapter1_3
- 向守阁长老请教功法选择（需魅力≥5）→ chapter1_3

## 1-3 【首次突破】
**节点ID**: chapter1_3
**描述**: 月上中天，尝试引导天地灵气入体，从凡人迈向修仙者
**前置节点**: chapter1_2
**选择及流向**:
- 强行牵引灵气（冒险）→ chapter1_4
- 耐心感应灵气（稳妥）→ chapter1_4
- 使用辅助物品帮助修炼（需丹药≥1）→ chapter1_4

## 1-4 【小比扬名】
**节点ID**: chapter1_4
**描述**: 外门小比，与赵师兄战斗
**前置节点**: chapter1_3
**选择及流向**:
- 运功硬抗（需习得《象甲功》或体质≥7）→ competition_round2
- 洒出石灰粉干扰视线（需习得《百毒真经》或悟性≥8）→ competition_round2
- 狼狈闪躲 → competition_round2
- 以攻为守，释放你的法术反击（需悟性≥9且练气二层以上）→ competition_round2
- 角色专属选项（萧炎、韩立、白小纯、徐缺）→ competition_win

### 比赛第二回合
**节点ID**: competition_round2
**描述**: 战斗进入白热化阶段，抓住机会做出最后决定
**前置节点**: chapter1_4
**选择及流向**:
- 发动最后攻击 → chapter2_1
- 使用战术拖延，寻找破绽（需悟性≥7且气运≥6）→ chapter2_1
- 主动认输，保存实力 → chapter2_1

### 比赛胜利
**节点ID**: competition_win
**描述**: 以独特方式赢得比赛，获得奖励和赞赏
**前置节点**: chapter1_4 (角色专属选项)
**选择及流向**:
- 接受奖励，感谢宗门 → chapter2_1
- 向长老请求指导（需魅力≥7）→ chapter2_1

## 整体流程图
game_start → chapter1_1 → (inner_discipleship/outer_discipleship) → chapter1_2 → chapter1_3 → chapter1_4 → (competition_round2/competition_win) → chapter2_1