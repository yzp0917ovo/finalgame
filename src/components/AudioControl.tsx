import { useContext } from 'react';
import { AudioContext } from '@/contexts/audioContext';

export default function AudioControl() {
  const { isPlaying, togglePlay } = useContext(AudioContext);

  // 确保点击时能控制所有背景音乐的开关
  const handleTogglePlay = () => {
    try {
      togglePlay();
    } catch (error) {
      console.error('控制背景音乐时出错:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleTogglePlay}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-900/80 backdrop-blur-sm border border-indigo-800 shadow-lg hover:bg-indigo-800/80 transition-colors duration-300"
        title={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
      >
        {isPlaying ? (
          <i className="fa-solid fa-pause text-white text-lg"></i>
        ) : (
          <i className="fa-solid fa-play text-white text-lg"></i>
        )}
      </button>
    </div>
  );
}