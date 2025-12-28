import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleGameProps {
  onComplete: (success: boolean, score: number) => void;
  characterStats: {
    constitution: number;
    comprehension: number;
    luck: number;
    health: number;
  };
}

export default function BattleGame({ onComplete, characterStats }: BattleGameProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerHealth, setPlayerHealth] = useState(characterStats.health);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // 敌人属性
  const enemyStats = {
    attack: 40,
    defense: 25,
    health: 150
  };
  
  // 角色属性
  const playerStats = {
    attack: Math.max(10, 15 + Math.floor(characterStats.comprehension / 2)),
    defense: Math.max(10, 15 + Math.floor(characterStats.constitution / 2)),
    health: playerHealth
  };
  
  // 战斗流程
  useEffect(() => {
    if (isProcessing || gameOver) return;
    
    const fightRound = async () => {
      setIsProcessing(true);
      
      // 战斗开始
      await addLog(`战斗开始！`);
      
      // 计算先手
      const playerInitiative = characterStats.luck + Math.random() * 10;
      const enemyInitiative = 5 + Math.random() * 10;
      
      let playerAttacksFirst = playerInitiative > enemyInitiative;
      
      if (playerAttacksFirst) {
        await playerAttack();
        if (enemyHealth > 0) {
          await enemyAttack();
        }
      } else {
        await enemyAttack();
        if (playerHealth > 0) {
          await playerAttack();
        }
      }
      
      // 检查战斗是否结束
      if (enemyHealth <= 0) {
        await addLog('你击败了碧磷蟒！');
        setGameOver(true);
        setTimeout(() => {
          onComplete(true, currentRound);
        }, 1500);
      } else if (playerHealth <= 0) {
        await addLog('你被碧磷蟒击败了！');
        setGameOver(true);
        setTimeout(() => {
          onComplete(false, currentRound);
        }, 1500);
      } else if (currentRound >= totalRounds) {
        // 回合结束，根据剩余生命值判断胜负
        const playerRemaining = (playerHealth / characterStats.health) * 100;
        const enemyRemaining = (enemyHealth / enemyStats.health) * 100;
        const success = playerRemaining > enemyRemaining;
        
        await addLog(`战斗结束！${success ? '你获胜了！' : '碧磷蟒获胜！'}`);
        setGameOver(true);
        setTimeout(() => {
          onComplete(success, currentRound);
        }, 1500);
      } else {
        // 进入下一轮
        setCurrentRound(prev => prev + 1);
      }
      
      setIsProcessing(false);
    };
    
    fightRound();
  }, [currentRound, gameOver, isProcessing, playerHealth, enemyHealth, characterStats, onComplete]);
  
  // 玩家攻击
  const playerAttack = async () => {
    const damage = Math.max(0, playerStats.attack - (enemyStats.defense / 2));
    const finalDamage = Math.floor(damage * (0.8 + Math.random() * 0.4)); // 伤害波动
    setEnemyHealth(prev => Math.max(0, prev - finalDamage));
    await addLog(`你对碧磷蟒造成了${finalDamage}点伤害！`);
  };
  
  // 敌人攻击
  const enemyAttack = async () => {
    const damage = Math.max(0, enemyStats.attack - (playerStats.defense / 2));
    const finalDamage = Math.floor(damage * (0.8 + Math.random() * 0.4)); // 伤害波动
    setPlayerHealth(prev => Math.max(0, prev - finalDamage));
    await addLog(`碧磷蟒对你造成了${finalDamage}点伤害！`);
  };
  
  // 添加战斗日志
  const addLog = (message: string) => {
    return new Promise<void>((resolve) => {
      setBattleLog(prev => [...prev, message]);
      setTimeout(resolve, 800);
    });
  };
  
  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-indigo-950 to-black p-1 sm:p-2">
      {/* 背景特效 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-indigo-500/30"
            style={{
              width: `${Math.random() * 4 + 1}px`,height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: '50%',
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      {/* 游戏标题 */}
      <motion.h2 
        className="text-2xl font-bold mb-6 text-center text-white z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
  妖兽战斗
  </motion.h2>
      
      {/* 战斗状态 */}
      <div className="w-full max-w-md flex justify-between mb-8">
        {/* 玩家状态 */}
        <motion.div 
          className="bg-blue-900/30 backdrop-blur-sm p-3 rounded-lg w-2/5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-center mb-2">你</h3>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
            <motion.div 
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${(playerHealth / characterStats.health) * 100}%` }}
              animate={{ width: `${(playerHealth / characterStats.health) * 100}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
          <p className="text-sm text-center">{playerHealth}/{characterStats.health}</p>
        </motion.div>
        
        {/* 回合显示 */}
        <motion.div 
          className="bg-purple-900/30 backdrop-blur-sm p-3 rounded-lg flex items-center justify-center w-1/5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-bold text-xl">战斗进行中</span>
        </motion.div>
        
        {/* 敌人状态 */}
        <motion.div 
          className="bg-green-900/30 backdrop-blur-sm p-3 rounded-lg w-2/5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-center mb-2">碧磷蟒</h3>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
            <motion.div 
              className="h-full rounded-full bg-green-500"
              style={{ width: `${(enemyHealth / enemyStats.health) * 100}%` }}
              animate={{ width: `${(enemyHealth / enemyStats.health) * 100}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
          <p className="text-sm text-center">{enemyHealth}/{enemyStats.health}</p>
        </motion.div>
      </div>
      
      {/* 战斗画面 */}
      <motion.div 
        className="w-full max-w-md h-40 bg-black/30 border border-blue-500/50 rounded-xl mb-6 flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* 玩家 */}
        <motion.div 
          className="text-6xl"
          animate={{ 
            scale: isProcessing ? [1, 1.1, 1] : 1,
            rotate: isProcessing ? [0, 5, 0, -5, 0] : 0
          }}
          transition={{ duration: 1 }}
        >
          ⚔️
        </motion.div>
        
        {/* VS */}
        <div className="mx-4 text-xl font-bold text-purple-300">VS</div>
        
        {/* 敌人 */}
        <motion.div 
          className="text-6xl"
          animate={{ 
            scale: isProcessing ? [1, 1.1, 1] : 1,
            rotate: isProcessing ? [0, -5, 0, 5, 0] : 0
          }}
          transition={{ duration: 1 }}
        >
          🐍
        </motion.div>
      </motion.div>
      
      {/* 战斗日志 */}
      <motion.div 
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm p-3 rounded-lg h-32 overflow-y-auto mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="font-bold mb-2 text-center">战斗日志</h3>
        <div className="space-y-2">
          {battleLog.map((log, index) => (
            <motion.div 
              key={index} 
              className="text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {log}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* 游戏结束覆盖层 */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {enemyHealth <= 0 ? '战斗胜利！' : playerHealth <= 0 ? '战斗失败！' : '战斗结束！'}
            </h2>
            <p className="text-xl mb-6">最终回合: {currentRound}</p>
            <div className="text-blue-300 mb-8 text-center max-w-md">
              {enemyHealth <= 0 
                ? '你成功击败了碧磷蟒，获得了天元果和星尘砂！' 
                : playerHealth <= 0 
                  ? '你未能击败碧磷蟒，勉强逃出秘境。' 
                  : '战斗陷入僵持，你决定寻找其他机会。'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}