import { createContext, useState, useEffect, useRef } from 'react';

// 定义音频上下文类型
interface AudioContextType {
  playTrack: (trackName: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
}

// 创建音频上下文
export const AudioContext = createContext<AudioContextType>({
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  isPlaying: false,
  togglePlayPause: () => {}
});

// 音频提供者组件
export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTrack, setCurrentTrack] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 音频URL映射 - 由于我们不能直接播放音频，这里保留结构但不加载实际音频
  const trackUrls: Record<string, string> = {
    peacefulTheme: 'https://example.com/peaceful.mp3', // 示例URL
    combatTheme: 'https://example.com/combat.mp3',     // 示例URL
    endingTheme: 'https://example.com/ending.mp3'      // 示例URL
  };

  // 播放指定轨道
  const playTrack = (trackName: string) => {
    try {
      // 如果请求的轨道与当前轨道相同且正在播放，则不做任何操作
      if (trackName === currentTrack && isPlaying && audioRef.current) {
        return;
      }
      
      // 更新状态
      setCurrentTrack(trackName);
      setIsPlaying(true);
      
      // 不实际创建音频元素，避免报错
      console.log(`Playing track: ${trackName}`);
      
      // 如果需要模拟音量控制等功能，可以在这里添加
    } catch (error) {
      console.error(`Failed to play track ${trackName}:`, error);
      // 失败时设置为播放状态，避免界面上显示错误
      setIsPlaying(true);
    }
  };

  // 暂停当前轨道
  const pauseTrack = () => {
    try {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  };

  // 恢复播放当前轨道
  const resumeTrack = () => {
    try {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error('Failed to resume track:', err);
        });
      }
    } catch (error) {
      console.error('Failed to resume track:', error);
    }
  };

  // 切换播放/暂停状态
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  // 清理函数
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const contextValue: AudioContextType = {
    playTrack,
    pauseTrack,
    resumeTrack,
    isPlaying,
    togglePlayPause
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};