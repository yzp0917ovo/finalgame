import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContext } from '@/contexts/gameContext';
import { LanguageContext } from '@/contexts/LanguageContext';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

  // 定义成就类型
  interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  condition: (state: any) => boolean;
  difficultyStars: number; // 难度星级 (1-5星)
  category?: string; // 成就类别
  hint?: string; // 成就获取提示
  }

export default function Achievements() {
  const { gameState, setUnlockedAchievements, addAchievementPoints, markAchievementClaimed } = useContext(GameContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [localUnlockedAchievements, setLocalUnlockedAchievements] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all'); // 活跃分类
  const [isLoading, setIsLoading] = useState<boolean>(true); // 加载状态
  const [currentAchievementPoints, setCurrentAchievementPoints] = useState<number>(0);
  const [claimedAchievements, setClaimedAchievements] = useState<Record<string, boolean>>({}); // 已领取成就点的成就ID对象
  const [hasUnclaimedAchievements, setHasUnclaimedAchievements] = useState<boolean>(false); // 是否有可领取的成就
  
  // 处理游戏状态变化的函数
  const handleGameStateChange = () => {
    // 记录游戏状态更新时间，用于缓存失效判断
    sessionStorage.setItem('lastGameStateUpdate', Date.now().toString());
    
    const updatedState = localStorage.getItem('xiuxian_game_state');
    if (updatedState) {
      try {
        const parsedUpdatedState = JSON.parse(updatedState);
        // 完整更新所有成就相关数据
        if (parsedUpdatedState.unlockedAchievements !== undefined) {
          setLocalUnlockedAchievements(parsedUpdatedState.unlockedAchievements);
        }
        
        if (parsedUpdatedState.claimedAchievements !== undefined) {
          setClaimedAchievements(parsedUpdatedState.claimedAchievements);
        }
        
        if (parsedUpdatedState.achievementPoints !== undefined) {
          setCurrentAchievementPoints(parsedUpdatedState.achievementPoints);
        }
      } catch (updateError) {
        console.error('更新成就数据失败:', updateError);
      }
    } else {
      // 如果没有保存的游戏状态，重置所有成就相关状态
      setLocalUnlockedAchievements([]);
      setClaimedAchievements({});
      setCurrentAchievementPoints(0);
    }
    
    // 强制重新检查所有成就，提高即时性
    setTimeout(() => {
      // 清除所有成就缓存，强制重新计算
      const allAchievementKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('achievement_')
      );
      allAchievementKeys.forEach(key => sessionStorage.removeItem(key));
      
      // 触发UI重新渲染，使用一个新的引用确保React能够检测到变化
      setLocalUnlockedAchievements(prev => [...prev]);
      setClaimedAchievements(prev => ({...prev}));
    }, 100);
  };

  // 从localStorage加载已保存的成就 - 优化版，增强实时性和可靠性
  useEffect(() => {
    const loadAchievements = () => {
      setIsLoading(true);
      try {
        // 直接读取localStorage，不依赖context
        const savedState = localStorage.getItem('xiuxian_game_state');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.unlockedAchievements) {
            setLocalUnlockedAchievements(parsedState.unlockedAchievements);
            
            // 如果context中也需要更新，同时更新context
            if (setUnlockedAchievements) {
              setUnlockedAchievements(parsedState.unlockedAchievements);
            }
          } else {
            // 如果没有已解锁成就，设置为空数组
            setLocalUnlockedAchievements([]);
            if (setUnlockedAchievements) {
              setUnlockedAchievements([]);
            }
          }
          
          // 加载已领取的成就点信息
          if (parsedState.claimedAchievements) {
            setClaimedAchievements(parsedState.claimedAchievements);
          } else {
            // 如果没有已领取成就记录，设置为空对象
            setClaimedAchievements({});
          }
          
          // 更新当前成就点数量
          if (parsedState.achievementPoints !== undefined) {
            setCurrentAchievementPoints(parsedState.achievementPoints);
          } else {
            // 如果没有成就点记录，设置为0
            setCurrentAchievementPoints(0);
          }
        } else {
          // 如果没有保存的游戏状态，初始化所有成就相关状态
          setLocalUnlockedAchievements([]);
          setClaimedAchievements({});
          setCurrentAchievementPoints(0);
          if (setUnlockedAchievements) {
            setUnlockedAchievements([]);
          }
        }
        
         // 添加事件监听器 - 使用英文事件名提高兼容性
        window.addEventListener('achievementCheck', handleGameStateChange);
        window.addEventListener('achievementsReset', handleGameStateChange); // 监听成就重置事件
        window.addEventListener('forceRenderUpdate', handleGameStateChange); // 监听强制渲染事件
        
        // 清理函数
        return () => {
          window.removeEventListener('achievementCheck', handleGameStateChange);
          window.removeEventListener('achievementsReset', handleGameStateChange);
          window.removeEventListener('forceRenderUpdate', handleGameStateChange);
        };
      } catch (error) {
        console.error('加载成就数据失败:', error);
        // 显示错误提示
        toast.error('加载成就数据失败，请刷新页面重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    // 立即加载成就
    loadAchievements();
    
    // 添加轮询机制，定期检查成就更新（提高即时性的最后保障）
    const pollingInterval = setInterval(() => {
      const lastUpdateTime = sessionStorage.getItem('lastGameStateUpdate');
      // 如果最近3秒内有更新，则不进行轮询检查
      if (!lastUpdateTime || Date.now() - parseInt(lastUpdateTime) > 3000) {
        handleGameStateChange();
      }
    }, 2000); // 每2秒检查一次
    
    return () => clearInterval(pollingInterval);
  }, [setUnlockedAchievements]);

  // 返回主页
  const handleBack = () => {
    try {
      // 直接使用最可靠的方式导航到包含"新的游戏"的主页
      window.location.href = '/';
    } catch (error) {
      console.error('Navigation error:', error);
      // 如果出现任何错误，仍然强制导航到主页
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  // 成就列表 - 重构并加入难度星数
  const achievements: Achievement[] = [
    {
      id: 'first_step',
      title: '初入仙途',
      description: '成功加入一个修仙宗门',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=young%20disciple%20entering%20sect%20gate%2C%20determined%20expression&sign=fb7a56768efaf636b622d715626d4b41',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        return state.currentCharacter.choices && (state.currentCharacter.tags && state.currentCharacter.tags.includes('内门弟子') || 
               state.currentCharacter.tags && state.currentCharacter.tags.includes('外门弟子'));
      },
      difficultyStars: 1,
      category: '入门',
      hint: '完成游戏初始选择，加入任意宗门即可解锁'
    },
    {
      id: 'quick_learner',
      title: '悟性超群',
      description: '悟性达到10点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=wise%20young%20man%20meditating%2C%20enlightened%20expression&sign=e4e13b6d6dc60cebd7216daccc2542fc',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.comprehension >= 10;
      },
      difficultyStars: 2,
      category: '属性',
      hint: '选择悟性较高的角色（如白小纯），并在游戏中选择增加悟性的选项'
    },
    {
      id: 'social_butterfly',
      title: '魅力四射',
      description: '魅力达到10点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=charming%20cultivator%20surrounded%20by%20followers%2C%20charismatic%20smile&sign=4cb80298be5421b45d4eee07a95ae786',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.charm >= 10;
      },
      difficultyStars: 2,
      category: '属性',
      hint: '选择魅力较高的角色（如徐缺），并在游戏中选择社交类选项'
    },
    {
      id: 'strong_body',
      title: '铜皮铁骨',
      description: '体质达到10点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=muscular%20warrior%20showing%20strength%2C%20powerful%20aura&sign=53969531a8c8872b2e069b3248062c4c',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.constitution >= 10;
      },
      difficultyStars: 2,
      category: '属性',
      hint: '选择体质较高的角色（如萧炎），并在游戏中选择增加体质的选项'
    },
    {
      id: 'lucky_star',
      title: '鸿运当头',
      description: '气运达到10点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lucky%20person%20finding%20treasure%2C%20golden%20light%20surrounding&sign=b3affdf61bc16941667e9c83f2853ed5',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.luck >= 10;
      },
      difficultyStars: 2,
      category: '属性',
      hint: '选择气运较高的角色（如韩立），并在游戏中选择增加气运的选项'
    },
    {
      id: 'rich_kid',
      title: '富贵人家',
      description: '家境达到10点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=wealthy%20cultivator%20with%20treasures%2C%20luxurious%20clothing&sign=8bc13ae2dfafc3c4d3ea591df86055d8',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.family >= 10;
      },
      difficultyStars: 2,
      category: '属性',
      hint: '选择家境较高的角色（如王腾），并在游戏中选择增加家境的选项'
    },
    {
      id: 'foundation_laying',
      title: '筑基成功',
      description: '达到筑基境界',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20breaking%20through%20to%20higher%20level%2C%20spiritual%20energy&sign=becbf8c71b83b238c4b78570dcfbdb68',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.cultivation.level >= 2;
      },
      difficultyStars: 2,
      category: '境界',
      hint: '通过勤奋修炼或选择能快速提升境界的选项'
    },
    {
      id: 'core_formation',
      title: '结丹宗师',
      description: '达到结丹境界',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=powerful%20cultivator%20with%20spiritual%20core%2C%20aura%20of%20authority&sign=d1f24df33720de38398534d20fa3cf76',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.cultivation.level >= 3;
      },
      difficultyStars: 3,
      category: '境界',
      hint: '需要较高的悟性和修为积累，可通过特殊奇遇加速提升'
    },
    {
      id: 'nascent_soul',
      title: '元婴真君',
      description: '达到元婴境界',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=immortal%20with%20nascent%20soul%2C%20divine%20aura&sign=b82672284824aa4acbffa638640b93ac',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.cultivation.level >= 5;
      },
      difficultyStars: 4,
      category: '境界',
      hint: '游戏中后期通过顿悟或特殊机遇才能突破'
    },
    {
      id: 'immortal_ascent',
      title: '羽化登仙',
      description: '达到大乘境界并成功飞升',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=immortal%20ascending%20to%20heaven%2C%20celestial%20beings%20welcoming&sign=07c7cea9916391772ed77f7b128bfae5',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.cultivation.level >= 9;
      },
      difficultyStars: 5,
      category: '境界',
      hint: '游戏终极目标，需要各方面属性都达到极高水平'
    },
    {
      id: 'righteous_path',
      title: '侠义心肠',
      description: '选择行侠仗义的道路',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=righteous%20hero%20helping%20people%2C%20compassionate%20expression&sign=980fbbde86d79d7d323167ad3755b032',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && state.currentCharacter.tags.includes('行侠仗义');
      },
      difficultyStars: 2,
      category: '道路',
      hint: '在中期游戏选择"保护弱小，行侠仗义"选项'
    },
    {
      id: 'power_seeker',
      title: '力量追求者',
      description: '选择追求力量的道路',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=power-hungry%20cultivator%20training%20intensely%2C%20determined%20look&sign=5cc5e408eb207b9dc579c7e22e2ba11a',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && state.currentCharacter.tags.includes('追求力量');
      },
      difficultyStars: 2,
      category: '道路',
      hint: '在中期游戏选择"追求更强大的力量"选项'
    },
    {
      id: 'truth_seeker',
      title: '求道者',
      description: '选择探索永生之道',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=philosopher%20studying%20ancient%20texts%2C%20thoughtful%20expression&sign=b012d72b7492f148750fb352050f1a95',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && state.currentCharacter.tags.includes('探索永生');
      },
      difficultyStars: 2,
      category: '道路',
      hint: '在中期游戏选择"探索永生之道"选项'
    },
    {
      id: 'world_traveler',
      title: '云游四海',
      description: '选择游历天下增长见识',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=traveler%20with%20backpack%20on%20mountain%20path%2C%20adventurous%20spirit&sign=9defc46e2f6ca34e65b63de2d51847f8',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && state.currentCharacter.tags.includes('游历天下');
      },
      difficultyStars: 2,
      category: '道路',
      hint: '游戏开始时选择"先游历天下增长见识"选项（需气运≥7）'
    },
    {
      id: 'hermit_follower',
      title: '隐士门徒',
      description: '选择寻找隐士高人拜师',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=disciple%20learning%20from%20hermit%20master%2C%20reverent%20attitude&sign=a2d8764997198ce9aeacd59a4fc2cd8d',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && state.currentCharacter.tags.includes('隐士高人');
      },
      difficultyStars: 2,
      category: '道路',
      hint: '游戏开始时选择"寻找隐士高人拜师"选项（需悟性≥8）'
    },
    {
      id: 'lone_wolf',
      title: '独行侠',
      description: '选择不加入任何宗门，独自修行',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lone%20cultivator%20on%20mountain%20peak%2C%20independent%20spirit%2C%20misty%20atmosphere&sign=7d66fa91816d6671c42a136bc16c9317',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && (state.currentCharacter.tags.includes('自学修仙') || 
               state.currentCharacter.tags.includes('坚持自学'));
      },
      difficultyStars: 3,
      category: '道路',
      hint: '选择自学修仙或坚持独自修炼的道路，难度较高'
    },
    {
      id: 'wealthy_cultivator',
      title: '财大气粗',
      description: '拥有500颗以上灵石',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=treasure%20room%20with%20spirit%20stones%2C%20rich%20cultivator%2C%20gold%20light&sign=74b2182ec8a03b5cdded63d77fb57f41',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources) return false;
        return state.currentCharacter.resources.spiritStone >= 500;
      },
      difficultyStars: 3,
      category: '资源',
      hint: '通过完成任务、探索遗迹等方式积累大量灵石，可选择家境好的角色'
    },
    {
      id: 'collector',
      title: '收集狂人',
      description: '收集10种不同的宝物',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20with%20many%20treasures%2C%20ancient%20artifacts%2C%20excited%20expression&sign=d606e9b6b650fc569251e2f4e60463d4',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        return state.currentCharacter.resources.treasures.length >= 10;
      },
      difficultyStars: 3,
      category: '资源',
      hint: '积极探索各种奇遇和事件，收集各种宝物'
    },
    {
      id: 'extremely_lucky',
      title: '福大命大',
      description: '气运达到15点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lucky%20person%20surrounded%20by%20divine%20light%2C%20heavenly%20aura&sign=874124bd1cb08effbacf132e54810e70',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.luck >= 15;
      },
      difficultyStars: 4,
      category: '属性',
      hint: '需要多次选择增加气运的选项或触发奇遇事件，难度很高'
    },
    {
      id: 'genius',
      title: '聪明绝顶',
      description: '悟性达到15点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=wise%20old%20cultivator%20with%20glowing%20eyes%2C%20enlightened%20expression&sign=1bdf0249d168712fc94e84d13c620aad',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.comprehension >= 15;
      },
      difficultyStars: 4,
      category: '属性',
      hint: '选择白小纯等悟性高的角色，并专注选择增加悟性的选项'
    },
    {
      id: 'heartthrob',
      title: '万人迷',
      description: '魅力达到15点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=charismatic%20cultivator%20with%20admirers%2C%20magnetic%20personality&sign=893a2676b9b7fdcb71667453cd4de574',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.charm >= 15;
      },
      difficultyStars: 4,
      category: '属性',
      hint: '选择徐缺等魅力高的角色，并专注选择社交类选项'
    },
    {
      id: 'invincible_body',
      title: '铜墙铁壁',
      description: '体质达到15点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=immortal%20body%20with%20golden%20armor%2C%20invincible%20aura&sign=2f813af9e4c4e581280d80b63013beb7',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.constitution >= 15;
      },
      difficultyStars: 4,
      category: '属性',
      hint: '选择萧炎等体质高的角色，并专注选择增加体质的选项'
    },
    {
      id: 'rich_second_gen',
      title: '富二代',
      description: '家境达到15点',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=wealthy%20young%20master%20in%20palace%2C%20luxurious%20lifestyle&sign=12a175edfcb9af4aba611435844166a4',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.family >= 15;
      },
      difficultyStars: 4,
      category: '属性',
      hint: '选择王腾等家境好的角色，并专注选择增加家境的选项'
    },
    {
      id: 'quick_cultivator',
      title: '仙途匆匆',
      description: '在50岁前达到元婴境界',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=young%20immortal%20with%20nascent%20soul%2C%20surprised%20expression&sign=4eaa0e95378545dd457fa5dc3622f13f',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.age < 50 && state.currentCharacter.cultivation.level >= 5;
      },
      difficultyStars: 5,
      category: '挑战',
      hint: '需要极高的悟性和气运，选择白小纯等悟性高的角色，并抓住所有快速提升境界的机会'
    },
    {
      id: 'long_lived',
      title: '寿与天齐',
      description: '年龄超过200岁',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=ancient%20immortal%20with%20long%20beard%2C%20wise%20expression&sign=05e4014cce8dc43e8ffed1e35593bbfc',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.age >= 200;
      },
      difficultyStars: 3,
      category: '历程',
      hint: '避免高风险行为，注重养生和长寿，可通过特殊奇遇增加寿命'
    },
    {
      id: 'protector',
      title: '护道者',
      description: '成功守护宗门免受魔修侵害',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=hero%20defending%20sect%20from%20demonic%20invasion%2C%20courageous%20stance&sign=99517f9a41b8b6cfea0a979e212f3f57',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags && (state.currentCharacter.tags.includes('守护宗门') || 
               state.currentCharacter.tags.includes('诛杀魔帝'));
      },
      difficultyStars: 3,
      category: '事件',
      hint: '在魔修入侵事件中选择守护宗门或诛杀魔帝的选项'
    },
    {
      id: 'fortune_smiled',
      title: '幸运儿',
      description: '连续触发3次奇遇事件',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lucky%20cultivator%20finding%20treasure%20after%20treasure%2C%20amazed%20expression&sign=18b3bd0735ea7a5a92805f4e51604d70',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        // 检查是否拥有多个奇遇相关的宝物
        const adventureTreasures = ['少年感激赠礼', '灵兽友谊', '上古传承', '符文秘录', '高级功法残卷', '上古法宝'];
        const matchedTreasures = state.currentCharacter.resources.treasures.filter(treasure => 
          treasure && adventureTreasures.includes(treasure)
        );
        return matchedTreasures.length >= 3;
      },
      difficultyStars: 3,
      category: '幸运',
      hint: '需要高气运值并多次选择探险类选项'
    },
    {
      id: 'firm_will',
      title: '道心坚定',
      description: '完成10个关键选择而不偏离初始道路',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20meditating%20with%20unwavering%20focus%2C%20strong%20willpower&sign=ad57a1b4e5b35fc0f2f65bd817c7958b',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        return state.currentCharacter.choices.length >= 10;
      },
      difficultyStars: 2,
      category: '历程',
      hint: '坚持完成游戏中的各种选择，不中途放弃'
    },
    {
      id: 'polymath',
      title: '博学多才',
      description: '学习5种不同的修炼技巧',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=scholar%20cultivator%20with%20many%20scrolls%2C%20knowledgeable%20expression&sign=42b051c8344e14ba0656e5d8e33e41fa',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        // 检查是否拥有多种不同类型的宝物/技能
        const skillTreasures = ['修仙心得', '上古功法', '自创功法', '领悟经文', '学习技巧'];
        const matchedTreasures = state.currentCharacter.resources.treasures.filter(treasure => 
          treasure && skillTreasures.includes(treasure)
        );
        return matchedTreasures.length >= 5;
      },
      difficultyStars: 3,
      category: '技能',
      hint: '学习各种不同的修炼技巧和功法，收集相关宝物'
    },
    {
      id: 'spiritual_companion',
      title: '灵宠相伴',
      description: '获得灵兽的友谊',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20with%20spiritual%20beast%20companion%2C%20bond%20of%20friendship&sign=2c3e8a2266d24ecacee3d31f9541d213',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        return state.currentCharacter.resources.treasures.includes('灵兽友谊');
      },
      difficultyStars: 2,
      category: '奇遇',
      hint: '在遇到受伤灵兽时选择治疗并帮助它'
    },
    {
      id: 'cultivation_couple',
      title: '道侣双修',
      description: '成功结为道侣',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=two%20cultivators%20meditating%20together%2C%20spiritual%20connection%2C%20harmonious%20aura&sign=b3813900eb25d92f36dfee3491197f91',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags.includes('结为道侣');
      },
      difficultyStars: 3,
      category: '情感',
      hint: '在遇到道侣候选人时选择结为道侣，需要较高的魅力值'
    },
    {
      id: 'realm_explorer',
      title: '秘境探险者',
      description: '成功探索神秘秘境',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=adventurous%20cultivator%20in%20mysterious%20realm%2C%20exploring%20ancient%20ruins&sign=49fa4c0ac6de8ac01dffb98ada894d11',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        return state.currentCharacter.resources.treasures.includes('符文秘录') || 
               state.currentCharacter.resources.treasures.includes('高级功法残卷') ||
               state.currentCharacter.resources.treasures.includes('上古法宝');
      },
      difficultyStars: 3,
      category: '探索',
      hint: '找到并成功探索神秘秘境，需要较高的气运和境界'
    },
    {
      id: 'pill_master',
      title: '炼丹大师',
      description: '拥有10颗以上丹药',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=alchemist%20with%20many%20pills%2C%20flask%20and%20mortar%2C%20wise%20expression&sign=6c4b94d5bb9a30d2ca40e5a56b5c1e2f',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources) return false;
        return state.currentCharacter.resources.pills >= 10;
      },
      difficultyStars: 2,
      category: '资源',
      hint: '通过购买或炼制积累大量丹药'
    },
    {
      id: 'love_at_first_sight',
      title: '一见倾心',
      description: '在筑基期遇到道侣候选人',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=two%20cultivators%20meeting%20for%20the%20first%20time%2C%20love%20at%20first%20sight%2C%20chinese%20fantasy&sign=c60acb8294191107b369cbfe13c6b7a0',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags.includes('遇到道侣候选人');
      },
      difficultyStars: 2,
      category: '情感',
      hint: '在筑基期选择与道侣候选人发展关系，需要一定的魅力值'
    },
    {
      id: 'eternal_love',
      title: '永恒之爱',
      description: '与道侣一起度过百年时光',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=old%20couple%20cultivators%20meditating%20together%2C%20long%20lasting%20love%2C%20chinese%20fantasy&sign=3a3165179f4c364a52080f94fb9f1aab',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags.includes('结为道侣') && state.currentCharacter.age >= 100;
      },
      difficultyStars: 4,
      category: '情感',
      hint: '与道侣一起度过百年时光，并且保持高魅力值和良好的状态'
   },
    {
      id: 'soulmate_forever',
      title: '永恒伴侣',
      description: '与道侣一起经历多次转世',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=two%20soulmates%20reunited%20in%20multiple%20lives%2C%20spiritual%20connection%2C%20chinese%20fantasy&sign=e5d45e8fa7910890ad0cecee70c6fc2c',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags.includes('结为道侣') && 
               state.currentCharacter.tags.includes('转世重修');
      },
      difficultyStars: 5,
      category: '情感',
      hint: '需要先结为道侣，然后选择转世重修，难度极大'
    },
    {
      id: 'master_of_all',
      title: '全能修士',
      description: '所有基础属性都达到15点以上',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=perfect%20cultivator%20with%20balanced%20attributes%2C%20divine%20aura%2C%20chinese%20fantasy&sign=48a914a680118b4705f85c8747e3dca5',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        const { charm, comprehension, constitution, family, luck } = state.currentCharacter;
        return charm >= 15 && comprehension >= 15 && constitution >= 15 && family >= 15 && luck >= 15;
      },
      difficultyStars: 5,
      category: '挑战',
      hint: '需要极高的策略和运气，平衡提升所有属性'
    },
    {
      id: 'trap_avoider',
      title: '谨慎行事',
      description: '从未触发过陷阱或负面事件',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cautious%20cultivator%20avoiding%20danger%2C%20sharp%20observation%2C%20chinese%20fantasy&sign=f3d4d37df8a95d215c288f2489335edf',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.statusEffects) return false;
        // 检查是否没有任何负面状态
        const negativeStatuses = ['霉运缠身', '因果纠缠', '负债累累', '声名狼藉', '重伤未愈', '走火入魔', '思维混乱', '元气大伤', '家族蒙羞', '债台高筑', '因果崩溃', '道心破碎'];
        return !negativeStatuses.some(status => state.currentCharacter.statusEffects.includes(status));
      },
      difficultyStars: 4,
      category: '挑战',
      hint: '选择所有安全的选项，避开一切风险'
    },
    {
      id: 'ancient_treasure_hunter',
      title: '考古专家',
      description: '探索5个不同的上古遗迹',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=adventurer%20with%20ancient%20artifacts%2C%20treasure%20hunter%2C%20chinese%20fantasy&sign=9c7396c97c2790a31edad86797fe2e90',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        // 检查是否拥有多种遗迹相关的宝物
        const relicTreasures = ['上古灵物', '上古功法', '仙人传承', '守护者传承', '全部宝藏'];
        const matchedTreasures = state.currentCharacter.resources.treasures.filter(treasure => 
          treasure && relicTreasures.includes(treasure)
        );
        return matchedTreasures.length >= 5;
      },
      difficultyStars: 4,
      category: '探索',
      hint: '积极寻找并探索各种遗迹和秘境'
       },
    {
      id: 'peace_bringer',
      title: '和平使者',
      description: '成功调解三次不同的势力争端',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=peacemaker%20between%20warring%20factions%2C%20diplomatic%20skills%2C%20chinese%20fantasy&sign=5c35d4901b88207f90a70102dea4b6ec',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有多次调解成功的记录
        const peaceChoices = ['化解争端', '促成和平', '谈判成功'];
        const matchedChoices = state.currentCharacter.choices.filter(choice => 
          choice && peaceChoices.includes(choice)
        );
        return matchedChoices.length >= 3;
      },
      difficultyStars: 3,
      category: '事件',
      hint: '在各种冲突中选择调解和和平选项'
    },
    {
      id: 'bad_luck_boy',
      title: '霉运缠身',
      description: '连续5次强行选择失败',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=unlucky%20cultivator%20with%20dark%20cloud%20following%2C%20bad%20luck%2C%20chinese%20fantasy&sign=c38de85da2a8fb471e6c0840524d6ca0',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有连续的失败记录
        const failureChoices = state.currentCharacter.choices.filter(choice => 
          choice && choice.includes('强行选择失败')
        );
        return failureChoices.length >= 5;
      },
      difficultyStars: 4,
      category: '挑战',
      hint: '尝试多次强行选择超出能力范围的选项'
    },
    {
      id: 'never_give_up',
      title: '永不言弃',
      description: '在连续失败后最终成功完成挑战',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20finally%20succeeding%20after%20many%20failures%2C%20triumphant%20expression%2C%20chinese%20fantasy&sign=a0f2590330f0106abcbfe90271cda310',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有失败后成功的记录
        const choices = state.currentCharacter.choices;
        let failureCount = 0;
        let hasSuccess = false;
        for (const choice of choices) {
          if (choice && choice.includes('强行选择失败')) {
            failureCount++;
          } else if (choice && choice.includes('成功') && failureCount > 0) {
            hasSuccess = true;
            break;
          }
        }
        return failureCount >= 3 && hasSuccess;
      },
      difficultyStars: 3,
      category: '挑战',
      hint: '在多次失败后不放弃，继续尝试直到成功'
    },
    {
      id: 'lesson_learner',
      title: '吃一堑长一智',
      description: '从失败中获得5次属性提升',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=wise%20cultivator%20learning%20from%20mistakes%2C%20enlightened%20expression%2C%20chinese%20fantasy&sign=66a4c9900248738698d0344a0312f3ed',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有从失败中学习的记录
        const lessonChoices = state.currentCharacter.choices.filter(choice => 
          choice && choice.includes('接受失败教训')
        );
        return lessonChoices.length >= 5;
      },
      difficultyStars: 2,
      category: '历程',
      hint: '在失败后选择接受教训，吸取经验'
    },
    {
      id: 'solo_survivor',
      title: '独行侠',
      description: '从未加入任何宗门，也没有道侣',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=lone%20wolf%20cultivator%20in%20mountains%2C%20independent%20spirit%2C%20chinese%20fantasy&sign=175a4d87bbf3ff729950d0c9afa6a708',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否没有加入宗门或结为道侣
        const hasNoSect = !state.currentCharacter.choices.some(choice => 
          choice.includes('加入') && (choice.includes('宗门') || choice.includes('青云门'))
        );
        const hasNoSoulmate = !state.currentCharacter.choices.includes('结为道侣');
        return hasNoSect && hasNoSoulmate;
      },
      difficultyStars: 3,
      category: '道路',
      hint: '始终选择独立修炼的道路，拒绝加入任何组织'
    },
    {
      id: 'demonic_slayer',
      title: '除魔卫道',
      description: '击败10个强大的魔修或妖兽',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=hero%20defeating%20demon%20beast%2C%20righteous%20aura%2C%20chinese%20fantasy&sign=8160690f2387c5e77e10a63eb83247e2',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有多次击败魔修或妖兽的记录
        const demonChoices = ['诛杀魔帝', '战胜强者', '征服妖兽', '驱除恶灵', '守护宗门'];
        const matchedChoices = state.currentCharacter.choices.filter(choice => 
          choice && demonChoices.includes(choice)
        );
        return matchedChoices.length >= 10;
      },
      difficultyStars: 4,
      category: '战斗',
      hint: '积极参与战斗和除魔任务，选择正面冲突的选项'
    },
    {
      id: 'miracle_pill_crafter',
      title: '神丹大师',
      description: '拥有30颗以上的珍贵丹药',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=master%20alchemist%20with%20many%20pills%2C%20magical%20cauldron%2C%20chinese%20fantasy&sign=d9a313ed185b9b120ed380f7dcf65689',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources) return false;
        return state.currentCharacter.resources.pills >= 30;
      },
      difficultyStars: 3,
      category: '资源',
      hint: '选择能够获得丹药的选项，或选择有炼丹天赋的角色'
    },
    {
      id: 'celestial_visitor',
      title: '仙缘深厚',
      description: '遇到10次以上的仙缘奇遇',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=cultivator%20with%20celestial%20blessing%2C%20heavenly%20light%2C%20chinese%20fantasy&sign=8c648f6dcc4b21b39491da303d1aa109',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        // 检查是否有多次奇遇的记录
        const luckChoices = ['获得传承', '发现宝藏', '救助灵兽', '获得神药', '获得指引'];
        const matchedChoices = state.currentCharacter.choices.filter(choice => 
          choice && luckChoices.some(keyword => choice.includes(keyword))
        );
        return matchedChoices.length >= 10;
      },
      difficultyStars: 4,
      category: '幸运',
      hint: '选择气运高的角色，并多选择冒险探索的选项'
    },
    {
      id: 'ancient_language_master',
      title: '符文专家',
      description: '成功解读5种不同的上古符文',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=scholar%20deciphering%20ancient%20runes%2C%20mystical%20knowledge%2C%20chinese%20fantasy&sign=8f423034b219cb6cbd3a3a0acdae20de',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        // 检查是否拥有多种符文相关的宝物
        const runeTreasures = ['上古经文', '符文秘典', '研究符文', '破解谜题', '因果天书'];
        const matchedTreasures = state.currentCharacter.resources.treasures.filter(treasure => 
          treasure && runeTreasures.includes(treasure)
        );
        return matchedTreasures.length >= 5;
      },
      difficultyStars: 3,
      category: '技能',
      hint: '选择悟性高的角色，并多选择研究古代文字和符文的选项'
    },
    {
      id: 'zen_master',
      title: '禅心通明',
      description: '从未有过负面情绪或状态',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=zen%20master%20with%20peaceful%20expression%2C%20enlightened%20aura%2C%20chinese%20fantasy&sign=a75408e9164b093b3237cef6efcf84a1',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.statusEffects) return false;
        // 检查是否从未有过任何负面状态
        return state.currentCharacter.statusEffects.length === 0;
      },
      difficultyStars: 5,
      category: '挑战',
      hint: '这是游戏中最难的成就之一，需要完美的策略和运气'
    },
    {
      id: 'time_master',
      title: '时光行者',
      description: '经历过时间悖论事件并成功化解',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=time%20traveler%20in%20cosmic%20void%2C%20control%20over%20time%2C%20chinese%20fantasy&sign=4e26c150c58386b97f13e4abf398fb08',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        return state.currentCharacter.choices.includes('改变命运') && 
               state.currentCharacter.choices.includes('警告过去');
      },
      difficultyStars: 4,
      category: '奇遇',
      hint: '需要先触发时间悖论事件，然后成功化解'
    },
    {
      id: 'legacy_creator',
      title: '传承创造者',
      description: '创立自己的宗门并培养10名以上的优秀弟子',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=founder%20of%20great%20sect%2C%20many%20disciples%2C%20chinese%20fantasy&sign=a28e2becab0b753083a7a43f2f4ad607',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.choices) return false;
        return state.currentCharacter.choices.includes('创立门派') || 
               state.currentCharacter.choices.includes('家族辉煌');
      },
      difficultyStars: 3,
      category: '历程',
      hint: '选择创立自己的宗门或家族，并成功发展壮大'
    },
    {
      id: 'perfect_human',
      title: '人中龙凤',
      description: '所有基础属性都达到20点以上',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=perfect%20human%20being%2C%20divine%20aura%2C%20chinese%20fantasy%20god&sign=32be61f786b80cd21c084b13f767467a',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        const { charm, comprehension, constitution, family, luck } = state.currentCharacter;
        return charm >= 20 && comprehension >= 20 && constitution >= 20 && family >= 20 && luck >= 20;
      },
      difficultyStars: 5,
      category: '传说',
      hint: '游戏中最高难度的成就，需要多周目游戏和完美的策略'
    },
    {
      id: 'treasure_hoarder',
      title: '宝藏收藏家',
      description: '收集20种不同的宝物',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=collector%20with%20room%20full%20of%20treasures%2C%20ancient%20artifacts%2C%20chinese%20fantasy&sign=3e873a2421ce1c549269eca0c33905f3',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.resources || !state.currentCharacter.resources.treasures) return false;
        return state.currentCharacter.resources.treasures.length >= 20;
      },
      difficultyStars: 4,
      category: '收集',
        hint: '可收集的宝物包括：魅惑之眼、心灵之镜、智慧之书、火灵圣体、聚宝盆、幸运星、极品法宝、珍稀材料、修仙心得、上古灵物、远古神器、高级法宝、被诅咒的物品、上古经文、灵兽友谊、道侣契约、仙人指引、守护者之心、永恒之心、神秘老人的信物等。这些宝物在主线剧情中会有特殊的使用选项！'
    },
    {
      id: 'quick_ascension',
      title: '一日千里',
      description: '在30岁前达到金丹境界',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=young%20genius%20cultivator%20reaching%20high%20level%20quickly%2C%20chinese%20fantasy&sign=22a61c18523ca1d34c0e596cf61511bf',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.age < 30 && state.currentCharacter.cultivation.level >= 4;
      },
      difficultyStars: 5,
      category: '挑战',
      hint: '选择悟性高的角色，并专注于快速提升境界的选项'
    },
    {
      id: 'immortal_king',
      title: '仙王',
      description: '成为修仙界的统治者',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=immortal%20king%20on%20throne%2C%20domineering%20aura%2C%20chinese%20fantasy&sign=1c6b41bb837cee59f194fc6ab0c0836f',
      condition: (state) => {
        if (!state.currentCharacter || !state.currentCharacter.tags) return false;
        return state.currentCharacter.tags.includes('世界统治者') && 
               state.currentCharacter.cultivation.level >= 8;
      },
      difficultyStars: 5,
      category: '结局',
      hint: '需要极高的魅力和体质，以及正确的选择路径'
    },
    {
      id: 'true_immortal',
      title: '真仙',
      description: '突破到大乘后期并保持所有正面状态',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=true%20immortal%20with%20divine%20light%2C%20chinese%20fantasy%20deity&sign=da7629323061bd95aef340579a49c76c',
      condition: (state) => {
        if (!state.currentCharacter) return false;
        return state.currentCharacter.cultivation.level >= 9 && 
               state.currentCharacter.cultivation.stage >= 2 &&
               state.currentCharacter.statusEffects.length === 0;
      },
      difficultyStars: 5,
      category: '传说',
      hint: '游戏的终极成就，只有最优秀的玩家才能达成'
    },
    {
      id: 'all_endings_master',
      title: '全结局达成',
      description: '体验过游戏中所有的不同结局',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=book%20of%20destinies%2C%20multiple%20paths%2C%20chinese%20fantasy&sign=ffc846aaa9d372acba6738e71dcda458',
      condition: (state) => {
        // 这个成就需要多次游戏才能解锁，这里仅作为展示
        return false;
      },
      difficultyStars: 5,
      category: '成就',
      hint: '需要多次游玩游戏，选择不同的道路和角色'
    }
  ];

      // 检查成就是否已解锁 - 优化版，提高即时判定性能和准确性
  const checkAchievement = (achievement: Achievement) => {
    try {
      // 首先检查本地已保存的解锁记录
      if (localUnlockedAchievements && localUnlockedAchievements.includes(achievement.id)) {
        return true;
      }
      
      // 使用优化的缓存机制，避免重复计算
      const cacheKey = `achievement_${achievement.id}`;
      const cachedResult = sessionStorage.getItem(cacheKey);
      
      // 如果游戏状态已更新，则忽略缓存，强制重新计算
      const lastUpdateTime = sessionStorage.getItem('lastGameStateUpdate');
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
      
      if (cachedResult && cacheTime && lastUpdateTime && 
          parseInt(cacheTime) > parseInt(lastUpdateTime)) {
        return cachedResult === 'true';
      }
      
      // 如果没有本地记录，尝试从gameState计算
      if (gameState && gameState.currentCharacter) {
        try {
          // 动态计算是否满足成就条件
          const isUnlocked = achievement.condition(gameState);
          
          // 更新缓存并记录缓存时间
          sessionStorage.setItem(cacheKey, isUnlocked.toString());
          sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          
          // 如果成就应该解锁但未记录，立即更新解锁列表（不再使用防抖，提高即时性）
          if (isUnlocked) {
            // 创建一个新的数组以避免直接修改状态
            const newUnlockedAchievements = [...new Set([...localUnlockedAchievements, achievement.id])];
            
            // 立即更新本地状态
            setLocalUnlockedAchievements(newUnlockedAchievements);
            
            // 如果上下文提供了更新方法，同时更新上下文
            if (setUnlockedAchievements) {
              setUnlockedAchievements(newUnlockedAchievements);
            }
            
            // 立即更新localStorage以确保持久化
            try {
              const currentState = JSON.parse(localStorage.getItem('xiuxian_game_state') || '{}');
              currentState.unlockedAchievements = newUnlockedAchievements;
              localStorage.setItem('xiuxian_game_state', JSON.stringify(currentState));
            } catch (localStorageError) {
              console.error('保存成就到localStorage失败:', localStorageError);
            }
            
            // 使用更友好的toast通知，显示难度星数
            toast.success(
              `恭喜解锁成就：${achievement.title}`,
              {
                description: `${achievement.difficultyStars}⭐ ${achievement.description}`,
                duration: 5000,
                position: "top-center",
                // 添加解锁动画效果
                toastOptions: {
                  className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
                }
              }
            );
          }
          
          return isUnlocked;
        } catch (conditionError) {
          console.error(`计算成就条件 ${achievement.id} 时出错:`, conditionError);
          return false;
        }
      }
      
      // 如果没有游戏状态，使用本地存储的记录
      return false;
    } catch (error) {
      console.error(`检查成就 ${achievement.id} 时出错:`, error);
      return false;
    }
  };

  // 获取已解锁成就数量 - 处理可能的undefined情况
  const unlockedCount = achievements.filter(achievement => checkAchievement(achievement)).length;
  
  // 获取所有成就类别
  const categories = Array.from(new Set(achievements.map(a => a.category || '其他')));
  
  // 根据活跃分类过滤成就
  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);
  
  // 按难度星数分组成就
  const achievementsByDifficulty = filteredAchievements.reduce((groups, achievement) => {
    const key = `difficulty_${achievement.difficultyStars}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);
  
      // 获取已解锁成就的总难度星数
  const totalStars = achievements
    .filter(a => checkAchievement(a))
    .reduce((sum, a) => sum + a.difficultyStars, 0);
    
  // 计算总体完成度
  const overallCompletionRate = (unlockedCount / achievements.length * 100).toFixed(1);
  const overallStarsRate = (totalStars / achievements.reduce((sum, a) => sum + a.difficultyStars, 0) * 100).toFixed(1);
  
  // 计算总共有多少可领取的成就点
  const getTotalUnclaimedPoints = () => {
    return achievements
      .filter(a => checkAchievement(a) && (!claimedAchievements || !claimedAchievements[a.id]))
      .reduce((sum, a) => sum + getAchievementPoints(a.difficultyStars), 0);
  };
  
  // 一键领取所有成就点
  const claimAllAchievementPoints = () => {
     const unclaimedAchievements = achievements.filter(a => 
  checkAchievement(a) && !claimedAchievements[a.id]
);
    
    if (unclaimedAchievements.length === 0) {
      return;
    }
    
    let totalPoints = 0;
    
    // 先计算所有需要更新的状态
    const newClaimedAchievements = { ...claimedAchievements };
    
    // 计算总点数和更新成就领取状态
    unclaimedAchievements.forEach(achievement => {
      const points = getAchievementPoints(achievement.difficultyStars);
      totalPoints += points;
      
      // 标记成就为已领取（一次性更新）
      newClaimedAchievements[achievement.id] = true;
    });
    
    // 一次性更新状态
    setClaimedAchievements(newClaimedAchievements);
    
    // 一次性更新localStorage
    try {
      const savedState = localStorage.getItem('xiuxian_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        parsedState.claimedAchievements = newClaimedAchievements;
        localStorage.setItem('xiuxian_game_state', JSON.stringify(parsedState));
      }
      
      // 通知context更新所有成就
      if (markAchievementClaimed) {
        unclaimedAchievements.forEach(achievement => {
          markAchievementClaimed(achievement.id);
        });
      }
    } catch (error) {
      console.error('保存成就领取状态失败:', error);
    }
    
    // 添加所有成就点
    addAchievementPoints(totalPoints);
    
    // 显示领取成功提示
    toast.success(`恭喜获得 ${totalPoints} 成就点！`, {
      description: `成功领取了 ${unclaimedAchievements.length} 个成就的奖励`,
      duration: 5000,
      position: "top-center",
      toastOptions: {
        className: "bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium"
      }
    });
  };
  
  // 检查是否有可领取的成就
  useEffect(() => {
    const hasUnclaimed = achievements.some(a => 
      checkAchievement(a) && (!claimedAchievements || !claimedAchievements[a.id])
    );
    setHasUnclaimedAchievements(hasUnclaimed);
  }, [achievements, claimedAchievements, checkAchievement]);

    // 动画变体
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          staggerChildren: 0.05,
          delayChildren: 0.2
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      }
    };

    const titleVariants = {
      hidden: { opacity: 0, y: -30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.8 }
      }
    };

  // 模拟数据 - 用于确保界面有内容展示，帮助用户理解功能
  const mockAchievements: Achievement[] = [
    {
      id: 'mock_achievement_1',
      title: '初次尝试',
      description: '完成第一个游戏选择',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=young%20disciple%20in%20training%2C%20determined%20expression&sign=827ac638e42d97c8b1a77e17a407945b',
      condition: () => false,
      difficultyStars: 1,
      category: '入门',
      hint: '开始你的修仙之旅'
    },
    {
      id: 'mock_achievement_2',
      title: '小有成就',
      description: '完成5个游戏选择',
      imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=portrait_4_3&prompt=successful%20cultivator%2C%20happy%20expression&sign=1354d1b46ac3585d653b0f8a124c76f5',
      condition: () => false,
      difficultyStars: 2,
      category: '历程',
      hint: '继续你的修仙之路'
    }
  ];

  // 渲染成就星级评分
  const renderStars = (count: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <i 
            key={i} 
            className={`fa-solid ${i < count ? 'fa-star text-yellow-400' : 'fa-star text-gray-600'}`} 
            style={{ fontSize: '0.8rem' }}
          ></i>
        ))}
      </div>
    );
  };
  
  // 计算每个成就的点数，基于难度星级
  const getAchievementPoints = (difficultyStars: number): number => {
    // 难度越高，奖励的成就点越多
    const pointsMap = [0, 10, 20, 40, 80, 160]; // 难度1-5星对应的点数
    return pointsMap[difficultyStars] || 10;
  };
  
  // 领取成就点
  const claimAchievementPoints = (achievement: Achievement) => {
    // 检查成就是否已解锁且未领取
    if (!checkAchievement(achievement) || (claimedAchievements && claimedAchievements[achievement.id])) {
      return;
    }
    
    // 计算并添加成就点
    const points = getAchievementPoints(achievement.difficultyStars);
    addAchievementPoints(points);
    
    // 标记成就为已领取
    const newClaimedAchievements = { ...claimedAchievements, [achievement.id]: true };
    setClaimedAchievements(newClaimedAchievements);
    
    // 更新localStorage
    try {
      const savedState = localStorage.getItem('xiuxian_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        parsedState.claimedAchievements = newClaimedAchievements;
        localStorage.setItem('xiuxian_game_state', JSON.stringify(parsedState));
      }
      
      // 通知context更新
      if (markAchievementClaimed) {
        markAchievementClaimed(achievement.id);
      }
    } catch (error) {
      console.error('保存成就领取状态失败:', error);
    }
    
    // 显示领取成功提示
    toast.success(`恭喜获得 ${points} 成就点！`, {
      description: `${achievement.title} - ${achievement.difficultyStars}⭐`,
      duration: 3000,
      position: "top-center",
      toastOptions: {
        className: "bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium"
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950 text-white p-4">
           {/* 返回主页按钮 - 优化版，确保在所有屏幕尺寸下都可点击 */}
             <button 
              onClick={handleBack}
              className="fixed top-4 left-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-800 p-4 rounded-full shadow-2xl transition-all duration-300 z-[9999] flex items-center justify-center border-2 border-blue-400 hover:scale-110 w-16 h-16 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="返回主页"
              title="返回游戏主页面"
              data-testid="back-button"
            >
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>

            {/* 提示用户如何开启BGM - 增强用户体验 */}
            <motion.div 
              className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-indigo-900/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-indigo-500/30 z-40 text-xs sm:text-sm text-white flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <i className="fa-solid fa-music mr-1"></i>
              <span>点击右下角按钮开启背景音乐</span>
            </motion.div>

       <motion.div 
         className="flex-grow flex flex-col items-center justify-start max-w-6xl mx-auto pt-20 sm:pt-16 w-full"
         initial="hidden"
         animate="visible"
         variants={containerVariants}
       >
         {/* 标题和成就概览 */}
         <motion.div 
           className="text-center mb-8 w-full"
           variants={titleVariants}
             >
   <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
     {t('achievement.title')}
   </h1>
           
           {/* 一键领取按钮 */}
           <motion.button
             className={`mt-4 mb-6 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 ${
               hasUnclaimedAchievements 
                 ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-green-500/30 active:bg-green-700' 
                 : 'bg-gray-700 text-gray-400 cursor-not-allowed'
             }`}
             onClick={claimAllAchievementPoints}
             disabled={!hasUnclaimedAchievements}
             whileHover={hasUnclaimedAchievements ? { scale: 1.05 } : {}}
             whileTap={hasUnclaimedAchievements ? { scale: 0.95 } : {}}
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <div className="flex items-center justify-center gap-2">
               <i className={`fa-solid ${hasUnclaimedAchievements ? 'fa-gift text-yellow-300' : 'fa-lock'}`}></i>
               {hasUnclaimedAchievements ? (
                 <>一键领取全部 <span className="bg-yellow-500/20 px-2 py-0.5 rounded-full text-yellow-300 text-sm font-bold">{getTotalUnclaimedPoints()} 点</span></>
               ) : (
                 '暂无可领取的成就点'
               )}
             </div>
           </motion.button>
           
           {/* 成就统计卡片 */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
             <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-800/50 shadow-lg">
               <p className="text-blue-200 text-sm">已解锁成就</p>
               <p className="text-3xl font-bold flex items-center justify-center">
                 {unlockedCount} / {achievements.length}
               </p>
               <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                 <motion.div 
                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                   initial={{ width: 0 }}
                   animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                   transition={{ duration: 1, delay: 0.5 }}
                 ></motion.div>
               </div>
               <p className="text-xs text-blue-300 mt-1">{overallCompletionRate}% 完成度</p>
             </div>
             
             <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 border border-indigo-800/50 shadow-lg">
               <p className="text-blue-200 text-sm">总难度星数</p>
               <p className="text-3xl font-bold flex items-center justify-center gap-1">
                 {totalStars} 
                 <span className="text-yellow-400">⭐</span>
               </p>
               <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                 <motion.div 
                   className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                   initial={{ width: 0 }}
                   animate={{ width: `${parseFloat(overallStarsRate)}%` }}
                   transition={{ duration: 1, delay: 0.5 }}
                 ></motion.div>
               </div>
               <p className="text-xs text-blue-300 mt-1">{overallStarsRate}% 难度完成度</p>
             </div>
             
             <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-800/50 shadow-lg">
               <p className="text-blue-200 text-sm">最高难度成就</p>
               <p className="text-xl font-bold">
                 {(() => {
                   const highestDifficulty = Math.max(...achievements.map(a => a.difficultyStars));
                   return `${highestDifficulty}星`;
                 })()}
               </p>
               <div className="flex justify-center mt-1">
                 {renderStars(Math.max(...achievements.map(a => a.difficultyStars)))}
               </div>
               <p className="text-xs text-blue-300 mt-1">
                 {(achievements.filter(a => a.difficultyStars === 5).length > 0 
                   ? '羽化登仙等' 
                   : '尚未挑战')}
               </p>
             </div>
           </div>
         </motion.div>

        {/* 攻略提示 */}
        <motion.div 
          className="w-full bg-yellow-900/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-yellow-800/50 shadow-lg"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-yellow-400 text-xl mt-1"></i>
            <div>
               <h3 className="font-bold text-lg mb-1">{t('achievement.title')} {t('settings.language')}</h3>
              <p className="text-yellow-100">点击任何成就卡片可以查看详细的触发条件和攻略提示。星级越高，难度越大！</p>
            </div>
          </div>
        </motion.div>

        {/* 分类筛选 */}
        <div className="w-full mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              全部
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 成就列表 - 按难度分组 */}
        <div className="w-full">
          {isLoading ? (
            // 加载状态
            <div className="flex flex-col gap-6 items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-300 mt-4">加载成就数据中...</p>
            </div>
          ) : filteredAchievements.length > 0 ? (
            // 按难度分组显示成就
            Object.keys(achievementsByDifficulty)
              .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]))
              .map(difficultyKey => {
                const difficultyLevel = parseInt(difficultyKey.split('_')[1]);
                const difficultyAchievements = achievementsByDifficulty[difficultyKey];
                return (
                  <div key={difficultyKey} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 flex items-center">
                        {renderStars(difficultyLevel)}
                      </div>
                      <h2 className="text-xl font-bold">
                        {difficultyLevel === 1 ? '简单难度' : 
                         difficultyLevel === 2 ? '普通难度' : 
                         difficultyLevel === 3 ? '困难难度' : 
                         difficultyLevel === 4 ? '专家难度' : '传说难度'}
                      </h2>
                      <div className="flex-grow h-px bg-blue-800"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {difficultyAchievements.map((achievement, index) => {
                        const isUnlocked = checkAchievement(achievement);
                        const unlockedCountInDifficulty = difficultyAchievements.filter(a => checkAchievement(a)).length;
                        
                        return (
                           <motion.div
                            key={achievement.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.05 }}
                            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                              isUnlocked 
                                ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                : 'border-gray-700 opacity-70'
                            } hover:shadow-xl cursor-pointer group`}
                            onClick={() => {
                              if (isUnlocked) {
                                // 如果已解锁但未领取成就点，点击领取
                                if (!claimedAchievements.includes(achievement.id)) {
                                  claimAchievementPoints(achievement);
                                } else {
                                  // 显示成就详情
                                  toast.info(
                                    `${achievement.title}`,
                                    {
                                      description: `${achievement.difficultyStars}⭐ ${achievement.description}\n\n已获得 ${getAchievementPoints(achievement.difficultyStars)} 成就点`,
                                      duration: 6000,
                                      position: "top-center"
                                    }
                                  );
                                }
                              } else {
                                // 未解锁的成就，显示攻略提示
                                toast.info(
                                  `${achievement.title}`,
                                  {
                                    description: `${achievement.difficultyStars}⭐ ${achievement.description}\n\n${achievement.hint || '完成特定游戏目标即可解锁'}`,
                                    duration: 6000,
                                    position: "top-center"
                                  }
                                );
                              }
                            }}
                          >
                            {/* 成就图片 */}
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={achievement.imageUrl} 
                                alt={achievement.title}
                                className={`w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 ${
                                  !isUnlocked ? 'filter grayscale' : ''
                                }`}
                              />
                            </div>
                            
                            {/* 成就信息覆盖层 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
                              {/* 分类标签 */}
                              {achievement.category && (
                                <div className="absolute top-2 right-2 bg-blue-900/70 backdrop-blur-sm text-xs py-1 px-2 rounded-full text-blue-200">
                                  {achievement.category}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-lg font-bold">{achievement.title}</h3>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isUnlocked ? 'bg-green-500' : 'bg-gray-700'
                                }`}>
                                  <i className={`fa-solid ${isUnlocked ? 'fa-check' : 'fa-lock'} text-white`}></i>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm text-blue-100 line-clamp-1">{achievement.description}</p>
                                <div className="flex items-center">
                                  {renderStars(achievement.difficultyStars)}
                                </div>
                              </div>
                              
                              {/* 成就进度 */}
                              <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-blue-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(unlockedCountInDifficulty / difficultyAchievements.length) * 100}%` }}
                                  transition={{ duration: 1 }}
                                ></motion.div>
                              </div>
                              
                              {/* 成就点提示 */}
                              {isUnlocked && (
                                <div className={`mt-2 text-xs flex items-center ${
                                  claimedAchievements && claimedAchievements[achievement.id]
                                    ? 'text-green-300' 
                                    : 'text-yellow-300 animate-pulse'
                                }`}>
                                {claimedAchievements && claimedAchievements[achievement.id] ? (
                                    <>
                                      <i className="fa-solid fa-coins mr-1 text-yellow-400"></i>
                                      已获得 {getAchievementPoints(achievement.difficultyStars)} 成就点
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-hand-pointer mr-1 text-yellow-400"></i>
                                      点击领取 {getAchievementPoints(achievement.difficultyStars)} 成就点
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* 未解锁成就显示点击查看攻略提示 */}
                              {!isUnlocked && (
                                <div className="mt-2 text-xs text-yellow-300 flex items-center">
                                  <i className="fa-solid fa-circle-info mr-1"></i>
                                  点击查看攻略
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          ) : (
            // 没有找到成就时显示模拟数据
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-xl cursor-pointer group`}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={achievement.imageUrl} 
                      alt={achievement.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
                    {achievement.category && (
                      <div className="absolute top-2 right-2 bg-blue-900/70 backdrop-blur-sm text-xs py-1 px-2 rounded-full text-blue-200">
                        {achievement.category}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold">{achievement.title}</h3>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                        <i className="fa-solid fa-check text-white"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-blue-100 line-clamp-1">{achievement.description}</p>
                      <div className="flex items-center">
                        {renderStars(achievement.difficultyStars)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-yellow-300 flex items-center">
                      <i className="fa-solid fa-circle-info mr-1"></i>
                      开始游戏解锁更多成就
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 隐藏剧情提示 */}
        <motion.div 
          className="w-full bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 mt-8 border border-purple-800/50 shadow-lg"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-mask text-purple-400 text-xl mt-1"></i>
            <div>
              <h3 className="font-bold text-lg mb-1">隐藏剧情提示</h3>
              <ul className="text-purple-100 list-disc pl-5 space-y-1 text-sm">
                <li>某些选项需要特定属性值才能解锁</li>
                <li>高气运值更容易触发奇遇和隐藏事件</li>
                <li>尝试不同的角色和选择路径以体验所有结局</li>
                <li>部分5星成就需要多次游戏才能解锁</li>
                <li>在筑基期左右可能会遇到道侣候选人，记得保持魅力值哦</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 页脚提示 */}
        <motion.div 
          className="mt-8 text-center text-blue-200 text-sm mb-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.4 }}
        >
           <p>{t('game.intro')}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}