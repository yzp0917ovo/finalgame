// 定义节点类型
interface StoryNode {
  id: string;
  text: string;
  description?: string;
  chapter?: number;
  section?: number;
  imageUrl?: string;
  choices: any[];
}

export const storyNodes: Record<string, StoryNode> = {
  // ==== 第一章：初入仙门 ====
  'game_start': {
    id: 'game_start',
    text: '你站在青玄山脚下，望着云雾缭绕的山顶，心中充满了对修仙的向往。昨日夜里，你梦到一位白胡子老道告诉你："机缘已至，青云门今日开山收徒，此去或有一番造化。"如今，你已整理好行囊，准备踏上这条充满未知的修仙之路...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20mountain%20gate%2C%20clouds%20surrounding%2C%20mystical%20atmosphere%2C%20traditional%20architecture&sign=3e361e1661d5f0449cf3402924ab94e5',
    choices: [{
      id: 'start_journey',
      text: '前往升仙大会',
      consequence: (state) => {
        // 初始化所有状态
        state.age = 16;
        state.resources = {
          spiritStone: 10,
          pills: 0,
          treasures: []
        };
        state.cultivation = {
          level: 0,
          stage: 0,
          experience: 0
        };
        state.reputation = 0;
        state.health = 100;
        state.choices = [];
        state.tags = [];
      },
      nextNode: 'chapter1_1'
    }],
    exploreTime: 20,
    chapter: 1,
    section: 0,
    isChapterStart: true
  },

  // 1-1 升仙大会
  'chapter1_1': {
    id: 'chapter1_1',
    text: '升仙大会广场上人声鼎沸，来自各地的少年少女们都怀着同一个梦想：成为一名修仙者。广场中央，一座三丈高的测灵碑散发着柔和的光芒。你排在队伍中，看着前面的人一个个测试——有的光芒四射，当场被收为内门弟子；有的勉强亮起微光，成为外门弟子；也有少数人测灵碑毫无反应，黯然离开。终于轮到你了，手心微微冒汗，你深吸一口气，将手按在测灵碑上...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=immortal%20recruitment%20gathering%2C%20magical%20stone%20detecting%20talent&sign=70f2954963690caa93aebc3a883804ea',
    chapter: 1,
    section: 1,
    isChapterStart: true,
    choices: [
      {
        id: 'show_talent_1',
        text: '展示天赋资质',
        condition: (state) => state.comprehension >= 7,
        conditionText: '[需悟性≥7]',
        consequence: (state) => {
          state.cultivation.level = 1;
          state.resources.spiritStone += 50;
          state.cultivation.experience += 30;
          state.tags.push('天赋异禀');
        },
        nextNode: 'inner_disciple_path',
        attributeChanges: { cultivationLevel: 1, spiritStone: 50, experience: 30 }
      },
      {
        id: 'show_constitution_1',
        text: '展示身体素质',
        condition: (state) => state.constitution >= 6,
        conditionText: '[需体质≥6]',
        consequence: (state) => {
          state.cultivation.level = 1;
          state.resources.spiritStone += 30;
          state.cultivation.experience += 25;
          state.tags.push('体魄强健');
        },
        nextNode: 'outer_disciple_path',
        attributeChanges: { cultivationLevel: 1, spiritStone: 30, experience: 25 }
      },
      {
        id: 'show_charm_1',
        text: '展示人格魅力',
        condition: (state) => state.charm >= 6,
        conditionText: '[需魅力≥6]',
        consequence: (state) => {
          state.cultivation.level = 1;
          state.resources.spiritStone += 40;
          state.cultivation.experience += 20;
          state.tags.push('气质出众');
        },
        nextNode: 'outer_disciple_path',
        attributeChanges: { cultivationLevel: 1, spiritStone: 40, experience: 20 }
      },
      {
        id: 'normal_pass_1',
        text: '资质平平，勉强通过',
        condition: (state) => state.comprehension < 7 && state.constitution < 6 && state.charm < 6,
        conditionText: '[资质平平]',
        consequence: (state) => {
          state.cultivation.level = 1;
          state.resources.spiritStone += 20;
          state.cultivation.experience += 15;
          state.tags.push('普通资质');
        },
        nextNode: 'outer_disciple_path',
        attributeChanges: { cultivationLevel: 1, spiritStone: 20, experience: 15 }
      }
    ],
    exploreTime: 40
  },

  // 内门弟子路线
  'inner_disciple_path': {
    id: 'inner_disciple_path',
    text: '测灵碑光芒四射，守碑长老赞许点头："好资质！你可直接成为内门弟子。"周围投来羡慕目光。林师兄，一位身着月白道袍的年轻修士热情地迎接你："随我来，我带你去内门区域。"他带你穿过重重殿宇，来到一片环境清幽的竹林，竹屋错落有致，灵气浓郁。"这是你的洞府，今后要勤加修炼，不可懈怠。"他交给你一枚玉牌和几卷竹简，"这是内门弟子令牌和基础心法，凭此可去藏经阁选取功法。"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=inner%20disciple%20receiving%20rewards%2C%20ancient%20temple%2C%20elder%20giving%20scrolls&sign=21ebbea5f0806ca44b9d05a842d7784f',
    chapter: 1,
    section: 1,
    choices: [{
      id: 'follow_lin_1',
      text: '跟随林师兄熟悉内门',
      consequence: (state) => {
        state.resources.spiritStone += 100;
        state.resources.pills += 5;
        state.cultivation.experience += 50;
        state.reputation += 10;
        state.resources.treasures.push('内门弟子令牌', '基础心法');
        state.tags.push('内门弟子');
      },
      nextNode: 'chapter1_2',
      attributeChanges: { spiritStone: 100, pills: 5, experience: 50, reputation: 10 }
    }],
    exploreTime: 30
  },

  // 外门弟子路线
  'outer_disciple_path': {
    id: 'outer_disciple_path',
    text: '你通过了基础测试，成为外门弟子。虽然资源不如内门，但总算踏上了仙途。王师兄，一位皮肤黝黑的修士带你领取基础物资："外门条件苦了点，但只要努力，也有机会晋升内门。"他递给你一套粗布道袍、一枚木牌和一卷破旧的竹简，"这是外门弟子令牌和基础吐纳法，明日开始晨课，不可迟到。"外门区域位于山脚下，几十间简陋的木屋挤在一起，但你看到许多和你一样的少年少女，眼中都闪烁着希望的光芒。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=group%20of%20outer%20disciples%20training%2C%20simple%20courtyard&sign=01adf410b9b5a4739a12f94878105645',
    chapter: 1,
    section: 1,
    choices: [{
      id: 'follow_wang_1',
      text: '跟随王师兄熟悉外门',
      consequence: (state) => {
        state.resources.spiritStone += 40;
        state.cultivation.experience += 30;
        state.reputation += 5;
        state.resources.treasures.push('外门弟子令牌', '基础吐纳法');
        state.tags.push('外门弟子');
      },
      nextNode: 'chapter1_2',
      attributeChanges: { spiritStone: 40, experience: 30, reputation: 5 }
    }],
    exploreTime: 30
  },

  // 1-2 功法选择
  'chapter1_2': {
    id: 'chapter1_2',
    text: '藏经阁内弥漫着一股淡淡的书香，四周书架上摆满了古老的典籍，许多书籍封面都泛着灵光，显然不是凡物。守阁长老白眉微垂，面前的石桌上，放着三本不同的功法秘籍：《长春功》、《象甲功》和《百毒真经》。每本功法都散发着不同的气息——《长春功》翠绿色的封面泛着生机，《象甲功》土黄色的封面厚重如山，《百毒真经》黑色的封面则带着一丝诡异。"这三本是基础功法，你可择其一修炼。每种功法各有侧重，需根据自身资质选择。"长老的声音如同洪钟，在你耳边响起。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20library%2C%20three%20ancient%20books%2C%20young%20disciple%20choosing&sign=865a4753cde4639986aee72147193578',
    chapter: 1,
    section: 2,
    choices: [
      {
        id: 'choose_changchun',
        text: '选择《长春功》- 延年益寿，根基稳固',
        description: '木属性功法，修炼缓慢但根基扎实，适合长久修行',
        consequence: (state) => {
          state.cultivation.stage = 1;
          state.cultivation.experience += 40;
          state.resources.treasures.push('长春功秘笈');
          state.tags.push('修炼长春功');
        },
        nextNode: 'chapter1_3',
        attributeChanges: { cultivationStage: 1, experience: 40 }
      },
      {
        id: 'choose_xiangjia',
        text: '选择《象甲功》- 防御强大，肉身强横',
        description: '土属性炼体功法，防御力强，近战威力大',
        condition: (state) => state.constitution >= 5,
        conditionText: '[需体质≥5]',
        consequence: (state) => {
          state.cultivation.stage = 1;
          state.constitution += 1;
          state.cultivation.experience += 40;
          state.resources.treasures.push('象甲功秘笈');
          state.tags.push('修炼象甲功');
        },
        nextNode: 'chapter1_3',
        attributeChanges: { cultivationStage: 1, constitution: 1, experience: 40 }
      },
      {
        id: 'choose_baidu',
        text: '选择《百毒真经》- 诡异毒功，威力惊人',
        description: '毒属性功法，修炼风险高但威力大，手段诡异',
        condition: (state) => state.comprehension >= 8,
        conditionText: '[需悟性≥8]',
        consequence: (state) => {
          state.cultivation.stage = 1;
          state.cultivation.experience += 45;
          state.resources.treasures.push('百毒真经秘笈');
          state.tags.push('修炼百毒真经');
        },
        nextNode: 'chapter1_3',
        attributeChanges: { cultivationStage: 1, experience: 45 }
      }
    ],
    exploreTime: 45
  },

  // 1-3 首次突破
  'chapter1_3': {
    id: 'chapter1_3',
    text: '获得功法后，你在洞府中闭关修炼。三个月过去，你每日打坐吐纳，按照功法上的指引，尝试感应天地间的灵气。终于，在一个月明星稀的夜晚，你感受到了——丝丝缕缕的灵气如同萤火虫一般，在你周围飘动。你按照功法运转路线，引导这些灵气进入体内，在经脉中循环。这是从凡人迈向修仙者的关键一步——引气入体。你能感觉到自己的身体正在发生变化，变得更加轻盈、坚韧，耳聪目明。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=cultivator%20meditating%2C%20spiritual%20energy%20flowing%2C%20glowing%20aura&sign=102e67a5835ad80b9e840012e3d75acd',
    chapter: 1,
    section: 3,
    onEnter: (state) => {
      state.age += 3;
    },
    choices: [
      {
        id: 'force_breakthrough',
        text: '强行冲击瓶颈',
        description: '运用强大意志强行突破，可能受伤但进展快',
        condition: (state) => state.constitution >= 7,
        conditionText: '[需体质≥7]',
        consequence: (state) => {
          state.cultivation.level = 2;
          state.health -= 40;
          state.cultivation.experience += 35;
          state.tags.push('冒险突破');
        },
        nextNode: 'chapter1_4',
        attributeChanges: { cultivationLevel: 2, health: -25, experience: 35 }
      },
      {
        id: 'steady_breakthrough',
        text: '稳扎稳打突破',
        description: '按照功法循序渐进，安全但耗时稍长',
        consequence: (state) => {
          state.cultivation.level = 2;
          state.cultivation.experience += 30;
          state.tags.push('稳健突破');
        },
        nextNode: 'chapter1_4',
        attributeChanges: { cultivationLevel: 2, experience: 30 }
      },
      {
        id: 'use_pill_breakthrough',
        text: '使用丹药辅助',
        description: '服用培元丹辅助突破，效果最佳',
        condition: (state) => state.resources.pills >= 1,
        conditionText: '[需丹药≥1]',
        consequence: (state) => {
          state.cultivation.level = 2;
          state.resources.pills -= 1;
          state.cultivation.experience += 40;
          state.tags.push('丹药辅助');
        },
        nextNode: 'chapter1_4',
        attributeChanges: { cultivationLevel: 2, pills: -1, experience: 40 }
      }
    ],
    exploreTime: 40
  },

   // 1-4 外门交流
  'chapter1_4': {
    id: 'chapter1_4',
    text: '入门三个月后，外门弟子间的交流活动如期举行。这是检验修炼成果的机会，表现优异者不仅能获得奖励，还有机会晋升内门。演武场上，你望着周围的师兄弟妹们，深吸一口气。终于，轮到你展示修炼成果了。赵师兄，一位入门半年的师兄，走过来对你微笑："师弟，听说你进步很快，我们交流一下如何？"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=martial%20arts%20practice%2C%20disciples%20training%20together%2C%20friendly%20competition&sign=d41f7d0e1db4c4b281cc0639ec0beb30',
    chapter: 1,
    section: 4,
    choices: [
      {
        id: 'show_skill_gently',
        text: '温和展示，友好交流',
        consequence: (state) => {
          state.cultivation.experience += 30;
          state.charm += 1;
          state.tags.push('友好交流');
        },
        nextNode: 'chapter2_1',
        attributeChanges: { experience: 30, charm: 1 }
      },
      {
        id: 'show_full_strength',
        text: '全力展示，展现实力',
        condition: (state) => state.constitution >= 6,
        conditionText: '[需体质≥6]',
        consequence: (state) => {
          state.cultivation.experience += 40;
          state.resources.spiritStone += 50;
          state.reputation += 10;
          state.tags.push('展现实力');
        },
        nextNode: 'chapter2_1',
        attributeChanges: { experience: 40, spiritStone: 50, reputation: 10 }
      },
      {
        id: 'focus_on_learning',
        text: '专注学习，观察他人',
        condition: (state) => state.comprehension >= 7,
        conditionText: '[需悟性≥7]',
        consequence: (state) => {
          state.cultivation.experience += 35;
          state.comprehension += 1;
          state.tags.push('专注学习');
        },
        nextNode: 'chapter2_1',
        attributeChanges: { experience: 35, comprehension: 1 }
      }
    ],
    exploreTime: 50
  },

  // ==== 第二章：丹器风云 ====
  'chapter2_1': {
    id: 'chapter2_1',
    text: '时光飞逝，春去秋来，一年时间匆匆而过。在这段时间里，你勤奋修炼，终于在一个清晨，感应到了体内气旋的变化——练气九层巅峰的瓶颈被打破，你成功筑基，成为一名筑基期修士！宗门允许筑基弟子下山历练，积累实战经验。你收拾行装，来到了山下最近的青竹坊市。坊市上人来人往，有卖丹药的、卖法宝的、卖灵草的，甚至还有一些散修在摆摊出售自己的战利品。你正打算购买一些修炼材料，却看到街角围着一群人。凑过去一看，原来是个衣着破烂的少年正被一个尖嘴猴腮的奸商拉扯着："你这小崽子，敢说我的聚气丹是假货？今天不赔礼道歉，别想离开！"少年涨红了脸："明明就是假的！我娘还等着这丹药治病呢！"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20market%2C%20stall%20selling%20herbs%2C%20merchant%20cheating&sign=a66674b67cbb0d7199e7c466ede38302',
    chapter: 2,
    section: 1,
    isChapterStart: true,
    onEnter: (state) => {
      state.age += 1;
      state.cultivation.level = 3; // 筑基期
    },
    choices: [
      {
        id: 'help_youngster',
        text: '仗义执言，帮助少年',
        description: '揭穿奸商骗局，帮助少年讨回公道',
        condition: (state) => state.charm >= 6,
        conditionText: '[需魅力≥6]',
        consequence: (state) => {
          state.reputation += 10;
          state.luck += 1;
          state.resources.treasures.push('少年感激赠礼');
          state.tags.push('行侠仗义');
        },
        // 直接连接到chapter2_2，不经过节点ID转换
        nextNode: 'chapter2_2',
        attributeChanges: { reputation: 10, luck: 1 }
      },
      {
        id: 'observe_and_act',
        text: '静观其变，伺机而动',
        description: '先观察情况，再做决定',
        consequence: (state) => {
          state.comprehension += 1;
          state.resources.treasures.push('神秘铁片');
          state.tags.push('谨慎观察');
        },
        // 直接连接到chapter2_2，不经过节点ID转换
        nextNode: 'chapter2_2',
        attributeChanges: { comprehension: 1 }
      },
      {
        id: 'focus_shopping',
        text: '专心购物，不理闲事',
        description: '专注于自己的采购任务',
        consequence: (state) => {
          state.resources.spiritStone -= 50;
          state.resources.treasures.push('玉髓芝');
          state.tags.push('专注任务');
        },
        // 直接连接到chapter2_2，不经过节点ID转换
        nextNode: 'chapter2_2',
        attributeChanges: { spiritStone: -50 }
      }
    ],
    exploreTime: 40
  },

   'chapter2_2': {
    id: 'chapter2_2',
    text: '返回宗门后，你发现筑基初期的修为遇到了瓶颈。无论怎么修炼，灵气都难以再进一步。林师兄得知后，前来探望："筑基期不比练气期，每个境界都需要积累和契机。我有三个建议：一是闭关苦修半年，靠自身积累突破；二是执行几次宗门任务，在实战中寻求突破；三是去坊市购买一枚破障丹，虽然花费不菲，但效果显著。"同时，他压低声音："对了，最近有个消息——血色禁地即将开启。这个禁地每五十年现世一次，里面藏着不少天材地宝，甚至还有上古传承。不过风险也很大，里面不仅有强大的妖兽，还有其他宗门的弟子虎视眈眈。"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=cultivator%20meditating%20in%20bamboo%20grove%2C%20spiritual%20energy&sign=61241240a79e8a94d22a88feffbafb9e',
    chapter: 2,
    section: 2,
    onEnter: (state) => {
      state.age += 1;
    },
    choices: [
      {
        id: 'secluded_training',
        text: '闭关苦修半年',
        description: '专心闭关，靠自身努力突破',
        condition: (state) => state.comprehension >= 7,
        conditionText: '[需悟性≥7]',
        consequence: (state) => {
          state.cultivation.stage = 1; // 筑基中期
          state.cultivation.experience += 80;
          state.tags.push('闭关苦修');
        },
        nextNode: 'chapter2_3',
        attributeChanges: { cultivationStage: 1, experience: 80 }
      },
      {
        id: 'clan_quests',
        text: '执行宗门任务磨炼',
        description: '通过实战和任务积累经验',
        consequence: (state) => {
          state.cultivation.stage = 1; // 筑基中期
          state.cultivation.experience += 70;
          state.resources.spiritStone += 100;
          state.tags.push('任务磨炼');
        },
        nextNode: 'chapter2_3',
        attributeChanges: { cultivationStage: 1, experience: 70, spiritStone: 100 }
      },
      {
        id: 'buy_breakthrough_pill',
        text: '求购破障丹突破',
        description: '使用丹药辅助，效果显著',
        condition: (state) => state.resources.spiritStone >= 150,
        conditionText: '[需灵石≥150]',
        consequence: (state) => {
          state.cultivation.stage = 1; // 筑基中期
          state.resources.spiritStone -= 150;
          state.cultivation.experience += 60;
          state.tags.push('丹药突破');
        },
        nextNode: 'chapter2_3',
        attributeChanges: { cultivationStage: 1, spiritStone: -150, experience: 60 }
      }
    ],
    exploreTime: 45
  },

   'chapter2_3': {
    id: 'chapter2_3',
    text: '血色禁地终于开启了。你与三名同门组队进入，穿过血雾笼罩的入口，来到了一个奇异的世界。天空是暗红色的，地面上生长着各种发光的植物，空气中弥漫着浓郁的灵气。按照地图，你们很快来到了中心区域，那里有一棵巨大的天元果树，树上结着九颗拳头大小的果子，散发着诱人的香气。然而，守护果树的是一层神秘的结界，需要特殊方法才能通过。这时，你们遇到了烈阳宗的弟子们，为首的是一个面容严肃的青年，他提议："我们暂时联手如何？先突破结界，再商量分配。"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=dangerous%20ruins%2C%20mystical%20fruit%20tree%2C%20protective%20barrier%2C%20multiple%20cultivators%20working%20together&sign=da45a5cc0d632b8297af790f88bf6216',
    chapter: 2,
    section: 3,
    onEnter: (state) => {
      state.age += 2;
    },
    choices: [
      {
        id: 'break_barrier_together',
        text: '合力突破结界',
        description: '与烈阳宗弟子联手破解结界',
        condition: (state) => state.charm >= 7,
        conditionText: '[需魅力≥7]',
        consequence: (state) => {
          state.cultivation.experience += 90;
          state.resources.treasures.push('天元果');
          state.reputation += 10;
          state.tags.push('合作突破');
        },
        nextNode: 'chapter2_4',
        attributeChanges: { experience: 90, reputation: 10 }
      },
      {
        id: 'find_weak_point',
        text: '寻找结界弱点',
        description: '独自寻找结界的薄弱之处',
        condition: (state) => state.comprehension >= 8,
        conditionText: '[需悟性≥8]',
        consequence: (state) => {
          state.cultivation.experience += 85;
          state.luck += 1;
          state.resources.treasures.push('天元果');
          state.tags.push('洞察先机');
        },
        nextNode: 'chapter2_4',
        attributeChanges: { experience: 85, luck: 1 }
      },
      {
        id: 'use_mysterious_iron',
        text: '使用神秘铁片',
        description: '尝试使用在坊市获得的神秘铁片',
        condition: (state) => state.resources.treasures.includes('神秘铁片'),
        conditionText: '[需神秘铁片]',
        consequence: (state) => {
          state.cultivation.experience += 120;
          state.luck += 2;
          state.resources.treasures = state.resources.treasures.filter(t => t !== '神秘铁片');
          state.resources.treasures.push('天元果', '铁片传承');
          state.tags.push('铁片机缘');
        },
        nextNode: 'chapter2_4',
        attributeChanges: { experience: 120, luck: 2 }
      }
    ],
    exploreTime: 50
  },

  'chapter2_4': {
    id: 'chapter2_4',
    text: '成功获得天元果后，你感觉筑基大圆满的瓶颈开始松动。这是结丹的最佳时机！回到宗门后，你向掌门申请了一处隐秘的山洞作为闭关之地。洞内灵气浓郁，你布置好聚灵阵，将天元果放在面前。结丹是修仙路上的关键一步，成则一步登天，败则修为尽失甚至有性命之忧。你深吸一口气，开始按照功法运转体内灵气，引导着天元果的药力进入经脉。时间不知过了多久，你感觉体内的气海开始旋转，形成一个漩涡，周围的灵气疯狂地涌入你的体内...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=cultivator%20holding%20magical%20fruit%2C%20preparing%20breakthrough&sign=472ca9fd1444e59b1451bd85e4a9986a',
    chapter: 2,
    section: 4,
    onEnter: (state) => {
      state.age += 5;
    },
    choices: [
      {
        id: 'immediate_golden_core',
        text: '立即闭关结丹',
        description: '使用天元果辅助，冲击金丹期',
        condition: (state) => state.resources.treasures.includes('天元果'),
        conditionText: '[需天元果]',
        consequence: (state) => {
          state.cultivation.level = 4; // 金丹期
          state.cultivation.experience += 150;
          state.resources.treasures = state.resources.treasures.filter(t => t !== '天元果');
          state.tags.push('金丹修士');
        },
        nextNode: 'chapter2_5',
        attributeChanges: { cultivationLevel: 4, experience: 150 }
      },
      {
        id: 'steady_golden_core',
        text: '继续积累，稳妥结丹',
        description: '不依赖天元果，靠自身积累结丹',
        consequence: (state) => {
          state.cultivation.level = 4; // 金丹期
          state.cultivation.experience += 120;
          state.tags.push('稳妥金丹');
        },
        nextNode: 'chapter2_5',
        attributeChanges: { cultivationLevel: 4, experience: 120 }
      }
    ],
    exploreTime: 40
  },

  'chapter2_5': {
    id: 'chapter2_5',
    text: '结丹成功后，你成为了一名金丹期修士。按照宗门规矩，金丹修士可以炼制本命法宝。你来到炼器阁，这里摆满了各种炼器材料——有从秘境中获得的妖兽骨、有深海寒铁、有天上坠落的星尘砂，还有你在血色禁地获得的各种材料。炼器长老看着你："本命法宝将伴随你一生，影响你的道途。你可以选择基础炼制，确保成功；也可以选择高级炼制，追求品质；甚至可以尝试完美炼制，但风险极大。"他指了指墙角的一堆材料："那些是你这次历练获得的材料，好好利用它们。"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=cultivator%20crafting%20artifact%2C%20workshop%2C%20glowing%20materials&sign=ebcef45c801f38d7cdbed5dae5d30907',
    chapter: 2,
    section: 5,
    onEnter: (state) => {
      state.age += 10;
    },
    choices: [
      {
        id: 'basic_crafting',
        text: '基础炼制，稳扎稳打',
        description: '使用基础炼器手法，确保成功',
        consequence: (state) => {
          state.cultivation.experience += 80;
          state.resources.treasures.push('中品本命法宝');
          state.tags.push('基础炼器');
        },
        nextNode: 'chapter3_1',
        attributeChanges: { experience: 80 }
      },
      {
        id: 'advanced_crafting',
        text: '高级炼制，追求品质',
        description: '使用复杂手法，可能失败但品质更高',
        condition: (state) => state.comprehension >= 9,
        conditionText: '[需悟性≥9]',
        consequence: (state) => {
          state.cultivation.experience += 120;
          state.health -= 20;
          state.resources.treasures.push('上品本命法宝', '残次本命法宝');
          state.tags.push('高级炼器');
        },
        nextNode: 'chapter3_1',
        attributeChanges: { experience: 120, health: -20 }
      },
      {
        id: 'perfect_crafting',
        text: '完美炼制，追求极致',
        description: '使用最高难度手法，追求极品法宝',
        condition: (state) => state.comprehension >= 10,
        conditionText: '[需悟性≥10]',
        consequence: (state) => {
          state.cultivation.experience += 200;
          state.comprehension += 2;
          state.health -= 50;
          state.resources.treasures.push('极品本命法宝');
          state.tags.push('完美炼器');
        },
        nextNode: 'chapter3_1',
        attributeChanges: { experience: 200, comprehension: 2, health: -50 }
      }
    ],
    exploreTime: 50
  },

  // ==== 第三章：砺剑红尘 ====
  'chapter3_1': {
    id: 'chapter3_1',
    text: '结丹成功后，你不再是初入仙门的懵懂弟子。百年时光匆匆而过，你已达到金丹后期。这百年来，你在宗门内的地位日益提升，成为了门中备受瞩目的年轻高手。然而，你渐渐感到一丝瓶颈——一味闭门苦修，很难再有寸进。你想起当年下山历练的经历，决定再次出山，在万丈红尘中打磨道心。你向掌门请辞，他并没有挽留，只是意味深长地说："红尘炼心，方得大道。去吧，记得你是青云门的弟子。"你收拾行装，看着熟悉的山门，心中感慨万千。修仙界广袤无垠，你决定去看看更广阔的世界。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=young%20immortal%20leaving%20mountain%2C%20vast%20world%20ahead&sign=398585e07ad280d157dd2fb31ab8d306',
    chapter: 3,
    section: 1,
    isChapterStart: true,
    onEnter: (state) => {
      state.age += 100;
      state.cultivation.stage = 2; // 金丹后期
    },
    choices: [
      {
        id: 'travel_mortal',
        text: '游历凡俗王朝',
        description: '化身凡人，体验红尘百态',
        consequence: (state) => {
          state.charm += 2;
          state.cultivation.experience += 100;
          state.tags.push('红尘历练');
        },
        nextNode: 'chapter3_2',
        attributeChanges: { charm: 2, experience: 100 }
      },
      {
        id: 'explore_dangerous',
        text: '探索险地秘境',
        description: '寻找更珍贵的天材地宝',
        condition: (state) => state.luck >= 8,
        conditionText: '[需气运≥8]',
        consequence: (state) => {
          state.luck += 1;
          state.cultivation.experience += 120;
          state.resources.treasures.push('千年灵草');
          state.tags.push('秘境探索');
        },
        nextNode: 'chapter3_2',
        attributeChanges: { luck: 1, experience: 120 }
      },
      {
        id: 'visit_clans',
        text: '拜访其他宗门',
        description: '交流论道，增长见识',
        condition: (state) => state.charm >= 7,
        conditionText: '[需魅力≥7]',
        consequence: (state) => {
          state.comprehension += 1;
          state.reputation += 30;
          state.cultivation.experience += 90;
          state.tags.push('宗门交流');
        },
        nextNode: 'chapter3_2',
        attributeChanges: { comprehension: 1, reputation: 30, experience: 90 }
      }
    ],
    exploreTime: 45
  },

   'chapter3_2': {
    id: 'chapter3_2',
    text: '游历十年后，你在南疆发现一处上古修士洞府。这处洞府隐藏在一座不起眼的小山之中，如果不是你敏锐地察觉到了一丝微弱的灵气波动，根本不会发现它。洞府的入口被一层淡淡的结界笼罩，你费了一番功夫才破解开来。进入洞府后，你发现中央大厅的地面上刻着古老复杂的符文图案，墙壁上挂着一些奇怪的壁画。在大厅的深处，有三间石室，分别标注着"丹药"、"功法"、"法宝"。每间石室都有禁制，而且你能感觉到，这三处禁制一旦触动一处，另外两处就会自动关闭。\n\n突然，你注意到大厅中央的符文开始发出微弱的光芒，似乎在提示着什么。仔细观察后，你发现这些符文形成了一个复杂的谜题，解开它可能会获得额外的机缘...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20cultivator%20cave%2C%20three%20stone%20doors%2C%20mysterious%20atmosphere%2C%20glowing%20runes%20on%20the%20floor&sign=92571181526b0c44cd05b347452b2ba7',
    chapter: 3,
    section: 2,
    onEnter: (state) => {
      state.age += 10;
    },
    choices: [
      {
        id: 'enter_pill_room',
        text: '直接进入丹药室',
        description: '可能获得珍贵丹药，加速修炼',
        consequence: (state) => {
          state.resources.pills += 3;
          state.cultivation.experience += 60;
          state.tags.push('丹药收获');
        },
        nextNode: 'chapter3_3',
        attributeChanges: { pills: 3, experience: 60 }
      },
      {
        id: 'enter_skill_room',
        text: '直接进入功法室',
        description: '可能获得高级功法，提升实力',
        condition: (state) => state.comprehension >= 9,
        conditionText: '[需悟性≥9]',
        consequence: (state) => {
          state.cultivation.experience += 80;
          state.comprehension += 1;
          state.resources.treasures.push('高级功法残卷');
          state.tags.push('功法收获');
        },
        nextNode: 'chapter3_3',
        attributeChanges: { experience: 80, comprehension: 1 }
      },
      {
        id: 'enter_treasure_room',
        text: '直接进入法宝室',
        description: '可能获得强力法宝',
        consequence: (state) => {
          state.cultivation.experience += 90;
          state.health -= 50;
          state.resources.treasures.push('上古法宝');
          state.tags.push('法宝收获');
        },
        nextNode: 'chapter3_3',
        attributeChanges: { experience: 90, health: -30 }
      }
    ],
    exploreTime: 40
  },
  'alchemy_room': {
    id: 'alchemy_room',
    text: '你来到了炼丹房。这里摆满了各种炼丹材料——有从秘境中获得的妖兽骨、有深海寒铁、有天上坠落的星尘砂，还有你在血色禁地获得的各种材料。炼丹长老看着你："本命法宝将伴随你一生，影响你的道途。你可以选择基础炼制，确保成功；也可以选择高级炼制，追求品质；甚至可以尝试完美炼制，但风险极大。"他指了指墙角的一堆材料："那些是你这次历练获得的材料，好好利用它们。"',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=alchemy%20room%2C%20crafting%20materials%2C%20pill%20cauldron%2C%20mystical%20atmosphere&sign=ebcef45c801f38d7cdbed5dae5d30907',
    chapter: 3,
    section: 2,
    onEnter: (state) => {
      // 确保inventory存在
      if (!state.inventory) {
        state.inventory = {
          herbs: {
            lingzhi: 3,
            dangshen: 2,
            spirit_grass: 0,
            ginseng: 1
          },
          minerals: {
            clear_water: 5,
            spirit_stone_powder: 0,
            iron_ore: 2
          },
          beastParts: {
            spirit_beast_core: 0,
            tiger_bone: 0
          },
          pills: {},
          specialIngredients: {}
        };
      }
    },
    choices: [
      {
        id: 'visit_alchemy_system',
        text: '进入炼丹系统',
        description: '使用收集的材料炼制丹药',
        consequence: (state) => {
          // 确保状态已正确更新
        },
        nextNode: 'chapter3_3'
      },
      {
        id: 'continue_to_chapter3_3',
        text: '继续探索',
        description: '不进行炼丹，继续剧情',
        consequence: (state) => {
          // 确保状态已正确更新
        },
        nextNode: 'chapter3_3'
      }
    ]
   },

  'chapter3_3': {
    id: 'chapter3_3',
    text: '游历归来，你感觉金丹大圆满的瓶颈已经松动。这时，你收到了一个重要的消息——南疆"万法碑林"即将现世！这座碑林是上古时期的遗迹，刻有古修对天地法则的感悟，是突破元婴的最佳地点之一。然而，碑林每次现世都伴随凶险的"法则潮汐"，稍不小心就会被法则之力撕碎。更重要的是，各方高手云集，不仅有各大宗门的长老，甚至还有一些隐世不出的老怪物。你知道，这是一次机遇，但也是一次挑战。你需要决定如何进入碑林核心区域。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=forest%20of%20stone%20tablets%2C%20glowing%20runes%2C%20dangerous%20energy%20tides&sign=d0c828cdf4091906d3aacd46fed5b363',
    chapter: 3,
    section: 3,
    onEnter: (state) => {
      state.age += 20;
      state.cultivation.stage = 3; // 金丹大圆满
    },
    choices: [
      {
        id: 'force_enter',
        text: '正面硬闯碑林',
        description: '凭借实力强行进入核心区域',
        condition: (state) => state.constitution >= 9,
        conditionText: '[需体质≥9]',
        consequence: (state) => {
          state.health -= 60;
          state.cultivation.experience += 150;
          state.tags.push('勇闯碑林');
        },
        nextNode: 'chapter3_4',
        attributeChanges: { health: -40, experience: 150 }
      },
      {
        id: 'find_weakness',
        text: '寻找薄弱处潜入',
        description: '观察法则潮汐，寻找安全路径',
        condition: (state) => state.comprehension >= 10,
        conditionText: '[需悟性≥10]',
        consequence: (state) => {
          state.cultivation.experience += 140;
          state.comprehension += 1;
          state.tags.push('智取碑林');
        },
        nextNode: 'chapter3_4',
        attributeChanges: { experience: 140, comprehension: 1 }
      },
      {
        id: 'unite_enter',
        text: '联合道友共同进入',
        description: '与其他修士合作，共同抵御潮汐',
        condition: (state) => state.charm >= 8,
        conditionText: '[需魅力≥8]',
        consequence: (state) => {
          state.cultivation.experience += 130;
          state.charm += 1;
          state.tags.push('联合进入');
        },
        nextNode: 'chapter3_4',
        attributeChanges: { experience: 130, charm: 1 }
      },
      {
        id: 'prepare_first',
        text: '准备充分后再行动',
        description: '暂时按兵不动，等待最佳时机',
        consequence: (state) => {
          state.cultivation.experience += 100;
          state.luck += 1;
          state.tags.push('审时度势');
        },
        nextNode: 'chapter3_4',
        attributeChanges: { experience: 100, luck: 1 }
      }
    ],
    exploreTime: 50
  },

   'chapter3_4': {
    id: 'chapter3_4',
    text: '历经艰险，你终于进入了万法碑林的核心区域。这里竖立着三座巨大的石碑，分别刻着"天"、"地"、"人"三个古老的篆字。每座石碑都散发着强大的法则波动，你能感觉到它们分别阐述着不同的道——"天道"碑蕴含着宇宙运行的规律，"地道"碑展现着大地的厚重与包容，"人道"碑则充满了人间的喜怒哀乐、因果轮回。择其一深入感悟，便可叩开元婴之门，但这也会奠定你未来的道途方向。突然，你感到一阵心悸——心魔劫悄然降临！你看到了自己内心最深处的恐惧和欲望，它们化作各种幻象，试图动摇你的道心...',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=three%20gigantic%20tablets%2C%20cultivator%20facing%20inner%20demons&sign=93c60829454d4f972a8609a3d013094e',
    chapter: 3,
    section: 4,
    choices: [
      {
        id: 'comprehend_heaven',
        text: '感悟"天道"碑',
        description: '追求至高法则，化身天地',
        condition: (state) => state.comprehension >= 11,
        conditionText: '[需悟性≥11]',
        consequence: (state) => {
          state.cultivation.level = 5; // 元婴期
          state.comprehension += 2;
          state.cultivation.experience += 200;
          state.tags.push('天道感悟');
        },
        nextNode: 'chapter4_1',
        attributeChanges: { cultivationLevel: 5, comprehension: 2, experience: 200 }
      },
      {
        id: 'comprehend_earth',
        text: '感悟"地道"碑',
        description: '掌御山河之力，厚德载物',
        condition: (state) => state.constitution >= 10,
        conditionText: '[需体质≥10]',
        consequence: (state) => {
          state.cultivation.level = 5; // 元婴期
          state.constitution += 2;
          state.cultivation.experience += 190;
          state.tags.push('地道感悟');
        },
        nextNode: 'chapter4_1',
        attributeChanges: { cultivationLevel: 5, constitution: 2, experience: 190 }
      },
      {
        id: 'comprehend_human',
        text: '感悟"人道"碑',
        description: '明悟红尘因果，我命由我',
        condition: (state) => state.charm >= 9,
        conditionText: '[需魅力≥9]',
        consequence: (state) => {
          state.cultivation.level = 5; // 元婴期
          state.charm += 2;
          state.cultivation.experience += 180;
          state.tags.push('人道感悟');
        },
        nextNode: 'chapter4_1',
        attributeChanges: { cultivationLevel: 5, charm: 2, experience: 180 }
      },
      {
        id: 'meditate_and_prepare',
        text: '暂时退避，调养后再来感悟',
        description: '面对心魔劫，你选择暂时退避，调养身心后再做打算',
        consequence: (state) => {
          state.cultivation.experience += 100;
          state.luck += 1;
          state.tags.push('审时度势');
        },
        nextNode: 'chapter4_1',
        attributeChanges: { experience: 100, luck: 1 }
      }
    ],
    exploreTime: 60
  },

  // ==== 第四章：天地决战 ====
   'chapter4_1': {
    id: 'chapter4_1',
    text: '凝结元婴后，你成为了宗门最年轻的长老。百年时光再次流逝，你已经达到了元婴中期。这百年来，修仙界风云突变——正魔两道的修炼理念差异越来越大，冲突时有发生。正道强调循序渐进，魔道追求快速突破。与此同时，域外天魔开始入侵此界的迹象越来越明显。这些来自异世界的能量正在悄然侵蚀修仙界的根基。你站在青云门的山巅，望着天空中逐渐汇聚的乌云，心中沉重——这可能是修仙界前所未有的危机。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=celestial%20mountain%20view%2C%20gathering%20storm%2C%20ancient%20temple%20on%20peak&sign=60b814742d8dd9dd57c002aa040ba0f4',
    chapter: 4,
    section: 1,
    isChapterStart: true,
    onEnter: (state) => {
      state.age += 100;
      state.cultivation.stage = 1; // 元婴中期
    },
    choices: [
      {
        id: 'promote_unity',
        text: '倡导正魔和谐',
        description: '尝试促进正魔两道的理解与合作',
        consequence: (state) => {
          state.reputation += 50;
          state.charm += 1;
          state.tags.push('和平使者');
        },
        nextNode: 'chapter4_2',
        attributeChanges: { reputation: 50, charm: 1 }
      },
      {
        id: 'strengthen_self',
        text: '专注提升实力',
        description: '不管外界纷争，专注于自身修炼',
        condition: (state) => state.comprehension >= 10,
        conditionText: '[需悟性≥10]',
        consequence: (state) => {
          state.comprehension += 2;
          state.cultivation.experience += 100;
          state.tags.push('专注修炼');
        },
        nextNode: 'chapter4_2',
        attributeChanges: { comprehension: 2, experience: 100 }
      },
      {
        id: 'investigate_threat',
        text: '调查域外威胁',
        description: '暗中调查域外天魔的来源和目的',
        consequence: (state) => {
          state.luck += 2;
          state.comprehension += 1;
          state.tags.push('危机调查者');
        },
        nextNode: 'chapter4_2',
        attributeChanges: { luck: 2, comprehension: 1 }
      }
    ],
    exploreTime: 45
  },

   'chapter4_2': {
    id: 'chapter4_2',
    text: '随着域外能量的侵蚀加剧，修仙界的灵气开始变得混乱。你带领着弟子们积极应对这一危机，却发现这些域外能量似乎在寻找某件物品。一次偶然的机会，你在探索一座古仙遗址时，发现了一个惊人的真相——这些能量其实是上古时期被封印的"虚空裂隙"泄漏出来的，它们正在寻找能够修复裂隙的"世界之心"。同时，你在遗址深处找到了一座完好的古仙飞升台！这座飞升台保存完好，只要输入足够的灵气，就可以立即启动。你意识到，这可能是拯救世界的关键，也可能是你离开这个世界的机会。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=mysterious%20ancient%20temple%2C%20floating%20platform%2C%20celestial%20light%2C%20cosmic%20energy&sign=68916928bc662ab3dbef877a92165a1e',
    chapter: 4,
    section: 2,
    onEnter: (state) => {
      state.age += 50;
    },
    choices: [
      {
        id: 'unite_cultivators',
        text: '联合所有修士',
        description: '组织修仙界力量共同应对危机',
        condition: (state) => state.charm >= 10,
        conditionText: '[需魅力≥10]',
        consequence: (state) => {
          state.cultivation.experience += 250;
          state.reputation += 100;
          state.tags.push('联合领袖');
        },
        nextNode: 'chapter4_3',
        attributeChanges: { experience: 250, reputation: 100 }
      },
      {
        id: 'seek_world_core',
        text: '寻找世界之心',
        description: '主动寻找修复虚空裂隙的关键物品',
        condition: (state) => state.luck >= 9,
        conditionText: '[需气运≥9]',
        consequence: (state) => {
          state.luck += 2;
          state.cultivation.experience += 200;
          state.resources.spiritStone += 500;
          state.tags.push('世界探索者');
        },
        nextNode: 'chapter4_3',
        attributeChanges: { luck: 2, experience: 200, spiritStone: 500 }
      },
      {
        id: 'investigate_truth',
        text: '深入研究虚空裂隙',
        description: '探寻上古隐秘和修复方法',
        condition: (state) => state.comprehension >= 12,
        conditionText: '[需悟性≥12]',
        consequence: (state) => {
          state.comprehension += 3;
          state.cultivation.experience += 300;
          state.tags.push('真相探寻者');
        },
        nextNode: 'chapter4_3',
        attributeChanges: { comprehension: 3, experience: 300 }
      }
    ],
    exploreTime: 50
  },

     'chapter4_3': {
    id: 'chapter4_3',
    text: '你已达到元婴大圆满，化神契机来临。天空中出现九重天劫，紫色的雷劫云层层叠叠，蕴含着毁天灭地的力量。这是对你道心、实力和选择的最终审判。同时，你发现了控制天魔的核心——那是一个巨大的黑色晶体，悬浮在半空中，不断吸收着周围的灵气。只要破坏这个核心，天魔就会失去控制。你站在雷劫与天魔核心之间，必须做出最终抉择。是选择立即飞升，离开这个即将毁灭的世界？是选择统合正魔力量，建立新的秩序？还是选择牺牲自己，封印天魔源头，守护这个世界？或者，你是否还有其他的选择？',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=heavenly%20tribulation%2C%20layers%20of%20thunderclouds%2C%20cultivator%20standing%20alone&sign=812d5fdffed66b2082f91b93564996ed',
    chapter: 4,
    section: 3,
    onEnter: (state) => {
      state.cultivation.stage = 3; // 元婴大圆满
    },
    choices: [
      {
        id: 'ascend_immediately',
        text: '启动飞升台，独自飞升',
        description: '追求更高层次的仙道',
        consequence: (state) => {
          state.cultivation.level = 6; // 化神期（飞升）
          state.tags.push('飞升者');
        },
        nextNode: 'ending_ascension',
        attributeChanges: { cultivationLevel: 6 }
      },
      {
        id: 'unify_world',
        text: '统合正魔力量，建立新秩序',
        description: '成为修仙界至尊',
        condition: (state) => state.reputation >= 100,
        conditionText: '[需声望≥100]',
        consequence: (state) => {
          state.cultivation.level = 6; // 化神期
          state.reputation += 200;
          state.tags.push('世界统治者');
        },
        nextNode: 'ending_unification',
        attributeChanges: { cultivationLevel: 6, reputation: 200 }
      },
      {
        id: 'seal_demon_source',
        text: '封印天魔源头，守护此界',
        description: '牺牲飞升机会，守护世界',
        consequence: (state) => {
          state.cultivation.level = 6; // 化神期
          state.reputation += 300;
          state.tags.push('世界守护者');
        },
        nextNode: 'ending_protector',
        attributeChanges: { cultivationLevel: 6, reputation: 300 }
      },
      {
        id: 'continue_cultivation',
        text: '推迟突破，继续修炼',
        description: '你感到自己还有未完成的事情，决定继续在这个世界修炼，追求更高的境界',
        condition: (state) => state.comprehension >= 12 && state.luck >= 8,
        conditionText: '[需悟性≥12且气运≥8]',
        consequence: (state) => {
          state.tags.push('继续修炼');
          state.cultivation.stage = 3; // 保持元婴大圆满
          state.comprehension += 1;
          state.luck += 1;
        },
        nextNode: 'chapter5_1',
        attributeChanges: { comprehension: 1, luck: 1 }
      }
    ],
    exploreTime: 60
  },

  // ==== 第五章：执掌天纲（结局） ====
  'ending_ascension': {
    id: 'ending_ascension',
    text: '你成功渡过了九重天劫，身体化作一道流光，飞向了那座古老的飞升台。在进入飞升通道的瞬间，你回头望了一眼这个你生活了数百年的世界——虽然正遭受天魔入侵，但你相信总有一天，这里的修士会重新站起来。仙界的大门为你敞开，迎接你的是无尽的星光和更加强大的灵气。你知道，这不是结束，而是一个新的开始。在仙界，你将面临更加残酷的竞争和更加广阔的天地，但你已经做好了准备。你的传说将在下界流传千古，成为后世修士向往的目标。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ascending%20to%20heaven%2C%20celestial%20light%2C%20heavenly%20palace&sign=7e40915ced1ae8ff194147e87de2ec7f',
    chapter: 5,
    section: 1,
    choices: [{
      id: 'restart_1',
      text: '重新开始修仙之旅',
      consequence: (state) => {
        // 重置状态，保留部分记忆
        state.age = 16;
        state.cultivation = { level: 0, stage: 0, experience: 0 };
        state.resources = { spiritStone: 10, pills: 0, treasures: [] };
        state.reputation = 0;
        state.health = 100;
        // 保留一些前世记忆（标签）
        if (!state.tags.includes('前世飞升')) {
          state.tags.push('前世飞升');
        }
      },
      nextNode: 'game_start'
    }],
    exploreTime: 30
  },

  'ending_unification': {
    id: 'ending_unification',
    text: '你凭借着强大的实力和过人的智慧，成功统合了正魔两道。在你的带领下，修士们团结一心，终于击退了天魔的入侵。战后，你建立了新的修仙秩序，废除了许多陈旧的规矩，让修仙界焕发出新的生机。千年后，你的雕像屹立在各大宗门的最中央，被尊为"混元天尊"。你的故事被编成歌谣，在街头巷尾传唱。你开创了一个新的时代，成为了修仙界的传奇。虽然你没有选择飞升，但你的名字将与天地同寿，永载史册。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=emperor%20of%20cultivation%20world%2C%20throne%2C%20subjects%20bowing&sign=9f4cbf37e435f8d0dd8217142e151068',
    chapter: 5,
    section: 2,
    choices: [{
      id: 'restart_2',
      text: '重新开始修仙之旅',
      consequence: (state) => {
        // 重置状态
        state.age = 16;
        state.cultivation = { level: 0, stage: 0, experience: 0 };
        state.resources = { spiritStone: 10, pills: 0, treasures: [] };
        state.reputation = 0;
        state.health = 100;
        if (!state.tags.includes('前世至尊')) {
          state.tags.push('前世至尊');
        }
      },
      nextNode: 'game_start'
    }],
    exploreTime: 30
  },

  'ending_protector': {
    id: 'ending_protector',
    text: '你做出了最艰难的选择——牺牲自己的飞升机会，选择守护这个世界。你用自己的身体作为封印，将天魔核心彻底封印在了虚空深处。在生命的最后时刻，你看到了弟子们悲痛的表情，看到了这个世界重获生机的希望。不知道过了多少年，人们为你建立了一座座神庙，香火千年不绝。你的精神与天地融为一体，成为了这个世界的守护者。虽然你未能飞升，但你以另一种方式获得了永恒。每当有修士遇到困难时，都会向你祈祷，而你也会在冥冥之中给予他们指引。你的名字成为了希望的象征，永远活在人们的心中。',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=hero%20sealing%20evil%2C%20temple%20with%20incense%2C%20people%20worshipping&sign=046fec5949286d080bea4d88b09b11d9',
    chapter: 5,
    section: 3,
    choices: [{
      id: 'restart_3',
      text: '重新开始修仙之旅',
      consequence: (state) => {
        // 重置状态
        state.age = 16;
        state.cultivation = { level: 0, stage: 0, experience: 0 };
        state.resources = { spiritStone: 10, pills: 0, treasures: [] };
        state.reputation = 0;
        state.health = 100;
        if (!state.tags.includes('前世守护')) {
          state.tags.push('前世守护');
        }
      },
      nextNode: 'game_start'
    }],
    exploreTime: 30
  },

   // ==== 第五章：九天雷劫 ====
   'chapter5_1': {
     id: 'chapter5_1',
     text: '时光荏苒，三百余年匆匆而过。你站在炼虚巅峰的道台上，望着天空中不断扩大的虚空裂缝，心中沉重。天地法则紊乱，域外天魔入侵加剧，人间界多处沦陷。三大上古秘境同时开启，预示着一场前所未有的天地大劫即将降临。你的修为已至瓶颈，必须做出选择，是继续提升实力，还是立即应对这场危机？',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=refining%20void%20peak%2C%20chaotic%20skies%2C%20spatial%20tears%2C%20ancient%20cultivator%20standing%20on%20mountain%20peak&sign=65995c4697faeb1c8c62ddbbd6124470',
     chapter: 5,
     section: 1,
     isChapterStart: true,
     onEnter: (state) => {
       state.age += 300;
       state.cultivation.level = 6; // 炼虚巅峰
       state.cultivation.stage = 3;
       // 初始化功德值
       if (!state.merit) {
         state.merit = 0;
       }
     },
     choices: [
       {
         id: 'seclude_for_unification',
         text: '闭关冲击合体期',
         description: '先提升实力，再应对危机',
         condition: (state) => state.comprehension >= 12,
         conditionText: '[需悟性≥12]',
         consequence: (state) => {
           state.cultivation.level = 7; // 合体期
           state.cultivation.stage = 0;
           state.comprehension += 1;
           state.cultivation.experience += 200;
           state.tags.push('闭关突破');
         },
         nextNode: 'chapter5_2',
         attributeChanges: { comprehension: 1, experience: 200 }
       },
       {
         id: 'unite_against_demons',
         text: '联合各派抵御天魔',
         description: '组织修仙界力量共同抗敌',
         condition: (state) => state.charm >= 10 || state.reputation >= 150,
         conditionText: '[需魅力≥10或声望≥150]',
         consequence: (state) => {
           state.reputation += 50;
           state.charm += 1;
           state.cultivation.experience += 150;
           state.merit += 50; // 增加功德值
           state.tags.push('抗魔领袖');
         },
         nextNode: 'chapter5_2',
         attributeChanges: { reputation: 50, charm: 1, experience: 150 }
       },
       {
         id: 'explore_mystic_realms',
         text: '探索秘境寻找机缘',
         description: '在危机中寻求突破的机会',
         condition: (state) => state.luck >= 9,
         conditionText: '[需气运≥9]',
         consequence: (state) => {
           state.luck += 2;
           state.cultivation.experience += 180;
           state.resources.spiritStone += 500;
           state.resources.treasures.push('上古秘宝');
           state.tags.push('秘境探索者');
         },
         nextNode: 'chapter5_2',
         attributeChanges: { luck: 2, experience: 180, spiritStone: 500 }
       }
     ],
     exploreTime: 60
   },

   'chapter5_2': {
     id: 'chapter5_2',
     text: '成功晋级合体期后，你面临着新的挑战——三魂七魄的完美融合。在融合过程中，尘封已久的"前世记忆"开始苏醒，你惊讶地发现自己竟是某位上古仙人的转世。与此同时，域外天魔找到了连接两界的"混沌核心"，若不及时摧毁，整个人间界将被吞噬。如何处理前世记忆与现世身份的关系，成为了你必须面对的难题。',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=soul%20fusion%2C%20three%20ethereal%20figures%20merging%2C%20cosmic%20energy%2C%20cultivation%20breakthrough&sign=71d1835a2cbf9d070d4c263ca38dd399',
     chapter: 5,
     section: 2,
     onEnter: (state) => {
       state.age += 50;
       // 根据前四章的选择设置前世印记
       if (!state.pastLifeMark) {
         state.pastLifeMark = [];
         if (state.choices.includes('选择《长春功》')) state.pastLifeMark.push('木灵体');
         if (state.choices.includes('选择《象甲功》')) state.pastLifeMark.push('大地之魂');
         if (state.choices.includes('选择《百毒真经》')) state.pastLifeMark.push('万毒之体');
         if (state.tags.includes('内门弟子')) state.pastLifeMark.push('仙门正统');
         if (state.tags.includes('外门弟子')) state.pastLifeMark.push('草根逆袭');
         if (state.tags.includes('心魔劫成功')) state.pastLifeMark.push('道心坚定');
       }
     },
     choices: [
       {
         id: 'fully_integrate_past',
         text: '完全融合前世记忆',
         description: '获得上古传承，但可能失去自我',
         condition: (state) => state.comprehension >= 14,
         conditionText: '[需悟性≥14]',
         consequence: (state) => {
           state.cultivation.experience += 300;
           state.comprehension += 3;
           state.cultivation.level = 8; // 直接提升至渡劫期
           state.tags.push('前世觉醒');
           if (state.pastLifeMark.includes('木灵体')) state.charm += 2;
           if (state.pastLifeMark.includes('大地之魂')) state.constitution += 2;
           if (state.pastLifeMark.includes('万毒之体')) state.luck += 2;
         },
         nextNode: 'chapter5_3',
         attributeChanges: { experience: 300, comprehension: 3 }
       },
       {
         id: 'keep_self_primary',
         text: '保留自我为主',
         description: '走自己的道路，进展缓慢但根基稳固',
         consequence: (state) => {
           state.cultivation.experience += 250;
           state.cultivation.level = 8; // 渡劫期
           state.constitution += 2;
           state.tags.push('自我坚持');
         },
         nextNode: 'chapter5_3',
         attributeChanges: { experience: 250, constitution: 2 }
       },
       {
         id: 'cut_past_karmic',
         text: '斩断前世因果',
         description: '彻底成为新的存在，但失去上古力量',
         consequence: (state) => {
           state.cultivation.experience += 200;
           state.cultivation.level = 8; // 渡劫期
           state.luck += 3;
           state.merit += 30; // 增加功德值
           state.tags.push('因果断绝');
         },
         nextNode: 'chapter5_3',
         attributeChanges: { experience: 200, luck: 3, merit: 30 }
       }
     ],
     exploreTime: 55
   },

   'chapter5_3': {
     id: 'chapter5_3',
     text: '达到渡劫期后，九重心魔劫如期而至。每重劫难都幻化出你修仙路上最深刻的执念与遗憾——未能保护的亲人、错过的机缘、内心的恐惧与欲望。与此同时，混沌核心即将完成，域外天魔的入侵已到关键时刻。你必须在自身与天下之间做出抉择：是先渡心魔劫成就自身，还是先拯救苍生？',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=heart%20devil%20tribulation%2C%20inner%20demons%20manifesting%2C%20cultivator%20facing%20shadows%20of%20past&sign=34d616fedb1fce47d5848168c93cd86a',
     chapter: 5,
     section: 3,
     onEnter: (state) => {
       state.age += 30;
       // 设置心魔劫难度基于功德值
       if (state.merit) {
         state.demonDifficulty = Math.max(1, 5 - Math.floor(state.merit / 30));
       }
     },
     choices: [
       {
         id: 'directly_face_tribulation',
         text: '直接渡劫',
         description: '成就自身，再救世界',
         consequence: (state) => {
           state.cultivation.experience += 280;
           state.tags.push('自我提升');
           // 功德值影响雷劫难度
           if (state.merit > 100) {
             state.luck += 2;
             state.tags.push('功德护体');
           }
         },
         nextNode: 'chapter5_4',
         attributeChanges: { experience: 280 }
       },
       {
         id: 'seal_chaos_core',
         text: '封印混沌核心',
         description: '拯救苍生，但可能错过最佳渡劫时机',
         condition: (state) => state.merit >= 50,
         conditionText: '[需功德≥50]',
         consequence: (state) => {
           state.merit += 100;
           state.cultivation.experience += 320;
           state.health -= 50;
           state.tags.push('舍己为人');
         },
         nextNode: 'chapter5_4',
         attributeChanges: { merit: 100, experience: 320, health: -50 }
       },
       {
         id: 'seek_balance_method',
         text: '寻找两全之法',
         description: '极难，但若成功可得大功德',
         condition: (state) => state.comprehension >= 15 && state.luck >= 12,
         conditionText: '[需悟性≥15且气运≥12]',
         consequence: (state) => {
           state.merit += 200;
           state.cultivation.experience += 400;
           state.comprehension += 2;
           state.luck += 2;
           state.tags.push('天人合一');
         },
         nextNode: 'chapter5_4',
         attributeChanges: { merit: 200, experience: 400, comprehension: 2, luck: 2 }
       }
     ],
     exploreTime: 60
   },

   'chapter5_4': {
     id: 'chapter5_4',
     text: '渡劫圆满，天空中汇聚起恐怖的雷云——九九雷劫即将降临。八十一道天雷，每一道都蕴含着毁灭与新生的力量。就在此时，域外天魔之主撕裂空间降临，企图在你最脆弱的时刻吞噬你的道果。你必须同时面对雷劫与天魔，这将是你修仙路上最严峻的考验。',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=eighty-one%20heavenly%20thunders%2C%20purple%20lightning%2C%20cultivator%20resisting%20tribulation&sign=14d1ae4d78e7f13572d17e8bd2bb1ab8',
     chapter: 5,
     section: 4,
     onEnter: (state) => {
       state.age += 20;
       // 功德值减少雷劫威力
       if (state.merit > 150) {
         state.thunderTribulationDifficulty = Math.max(0.5, 1 - state.merit / 300);
       } else {
         state.thunderTribulationDifficulty = 1;
       }
     },
     choices: [
       {
         id: 'endure_thunder_directly',
         text: '硬抗雷劫',
         description: '以力证道，最强但最危险',
         condition: (state) => state.constitution >= 15,
         conditionText: '[需体质≥15]',
         consequence: (state) => {
          state.health = Math.max(10, state.health - 120);
           state.cultivation.level = 9; // 大乘期
           state.constitution += 3;
           state.cultivation.experience += 500;
           state.tags.push('力证大道');
         },
         nextNode: 'chapter5_5',
         attributeChanges: { health: -80, constitution: 3, experience: 500 }
       },
       {
         id: 'use_thunder_against_demon',
         text: '借力打力',
         description: '引导雷劫攻击天魔，巧妙但需精准控制',
         condition: (state) => state.comprehension >= 16,
         conditionText: '[需悟性≥16]',
         consequence: (state) => {
           state.cultivation.level = 9; // 大乘期
           state.comprehension += 3;
           state.cultivation.experience += 550;
           state.merit += 50;
           state.tags.push('智慧过人');
         },
         nextNode: 'chapter5_5',
         attributeChanges: { comprehension: 3, experience: 550, merit: 50 }
       },
       {
         id: 'abandon_physical_body',
         text: '放弃肉身',
         description: '兵解转修散仙，放弃飞升但可保命',
         consequence: (state) => {
           state.cultivation.level = 9; // 大乘期（散仙）
           state.health = 100;
           state.cultivation.experience += 300;
           state.luck += 1;
           state.tags.push('散仙之路');
         },
         nextNode: 'ending_reincarnation',
         attributeChanges: { experience: 300, luck: 1 }
       }
     ],
     exploreTime: 70
   },

   'chapter5_5': {
     id: 'chapter5_5',
     text: '成功度过雷劫，成就大乘期！仙界之门在你面前缓缓开启，金色的光芒照耀整个天地。然而，你发现飞升通道因上古大战而破损，需要花费巨大代价才能修复。与此同时，人间界因你的渡劫而灵气复苏，但域外天魔的威胁仍未完全消除。在这关键时刻，你将做出怎样的抉择？',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=celestial%20gate%2C%20golden%20light%2C%20ascending%20to%20immortal%20realm&sign=c6be970f018c4c39a3c4d1578d21086b',
     chapter: 5,
     section: 5,
     onEnter: (state) => {
       state.age += 10;
     },
     choices: [
       {
         id: 'ascend_alone',
         text: '独自飞升',
         description: '抛下一切，追求更高境界',
         consequence: (state) => {
           state.tags.push('独自飞升');
           // 根据前世印记影响结局
           if (state.pastLifeMark.includes('仙门正统')) state.merit += 30;
         },
         nextNode: 'ending_ascension',
         attributeChanges: { merit: 30 }
       },
       {
         id: 'repair_ascension_path',
         text: '修复通道',
         description: '建立稳定飞升之路，惠及后人',
         condition: (state) => state.merit >= 200,
         conditionText: '[需功德≥200]',
         consequence: (state) => {
           state.merit += 100;
           state.reputation += 200;
           state.tags.push('功德无量');
         },
         nextNode: 'ending_unification',
         attributeChanges: { merit: 100, reputation: 200 }
       },
       {
         id: 'stay_and_protect',
         text: '留在人间',
         description: '成为守护神，放弃飞升机会',
         consequence: (state) => {
           state.merit += 300;
           state.reputation += 300;
           state.tags.push('人间守护');
         },
         nextNode: 'ending_protector',
         attributeChanges: { merit: 300, reputation: 300 }
       }
     ],
     exploreTime: 60
   },

   // 转世重修结局
   'ending_reincarnation': {
     id: 'ending_reincarnation',
     text: '你选择了放弃肉身，转修散仙之路。虽然失去了飞升仙界的机会，但你保住了性命，并且保留了大部分记忆。在漫长的岁月中，你继续修炼，等待着下一次转世重修的机会。你的故事在修仙界广为流传，成为了无数修士心中的传奇。或许在未来的某一天，你将以新的身份再次踏上修仙之路...',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=soul%20reincarnation%2C%20new%20beginning%2C%20spiritual%20cycle%2C%20hope%20for%20future&sign=9cf12e3a8b4f2ca378426103540b4587',
     chapter: 5,
     section: 6,
     choices: [{
       id: 'reincarnate_again',
       text: '转世重修',
       consequence: (state) => {
         // 重置状态，但保留前世记忆
         state.age = 16;
         state.cultivation = { level: 0, stage: 0, experience: 0 };
         state.resources = { spiritStone: 10, pills: 0, treasures: [] };
         state.reputation = 0;
         state.health = 100;
         // 保留前世印记
         if (!state.tags.includes('前世散仙')) {
           state.tags.push('前世散仙');
         }
         // 前世记忆提供属性加成
         state.comprehension += 2;
         state.luck += 2;
       },
       nextNode: 'game_start'
     }],
     exploreTime: 30
   },

   // ==== 特殊节点 ====
   'character_creation_complete': {
     id: 'character_creation_complete',
     text: '角色创建完成！你带着自己的初始属性，站在青玄山脚下，准备开始你的修仙之旅...',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ancient%20chinese%20mountain%20gate%2C%20clouds%20surrounding%2C%20mystical%20atmosphere%2C%20traditional%20architecture&sign=3e361e1661d5f0449cf3402924ab94e5',
     choices: [{
       id: 'start_real_journey',
       text: '开始真正的修仙之旅',
       consequence: (state) => {
         state.choices.push('正式踏上修仙路');
       },
       nextNode: 'chapter1_1'
     }],
     chapter: 1,
     section: 0
   },

   '最终失败': {
     id: '最终失败',
     text: '测灵碑毫无反应，长老摇头。"无灵根，仙路无缘。"周围传来惋惜叹息。你黯然离开，心中充满不甘。难道就此放弃修仙之梦？不，你决定寻找其他机缘。',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=discouraged%20person%2C%20rainy%20day%2C%20abandoned%20path%2C%20but%20with%20a%20ray%20of%20hope%2C%20future%20possibilities&sign=964b23f13bad20163ccd8d77ecbcd698',
     choices: [{
       id: 'restart_from_failure',
       text: '寻找其他机缘，重新开始',
       consequence: (state) => {
         // 重置状态，但保留一些气运加成
         state.age = 16;
         state.cultivation = { level: 0, stage: 0, experience: 0 };
         state.resources = { spiritStone: 5, pills: 0, treasures: [] };
         state.reputation = 0;
         state.health = 100;
         state.luck += 1; // 失败后的气运加成
       },
       nextNode: 'game_start'
     }]
   },

   'recovery_node': {
     id: 'recovery_node',
     text: '你在之前的冒险中受了重伤，需要时间来恢复。',
     imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=cultivator%20meditating%20to%20heal%2C%20serene%20environment%2C%20recovery%2C%20peaceful%20atmosphere&sign=f04ed917ba9a74e03d4b7230964e99a5',
     choices: [{
       id: 'rest_and_recover',
       text: '休息恢复伤势',
       consequence: (state) => {
         state.choices.push('休息恢复伤势');
         state.health = Math.min(100, (state.health || 0) + 50);
         state.age += 1;
       },
       nextNode: (state) => {
         // 根据受伤前的状态返回合适的节点
         if (state.tags.includes('内门弟子')) {
           return 'chapter1_2';
         } else if (state.tags.includes('外门弟子')) {
           return 'chapter1_2';
         } else {
           return 'chapter1_1';
         }
       }
     }]
   }
};