import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioData: Uint8Array;
  fileName: string;
}

export default function AudioPlayer({ audioData, fileName }: AudioPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    const blob = new Blob([audioData], { type: getMimeType(fileName) });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    analyzeAudio(audioData, fileName);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioData, fileName]);

  const getMimeType = (filename: string): string => {
    if (filename.endsWith('.ogg')) return 'audio/ogg';
    if (filename.endsWith('.mp3')) return 'audio/mpeg';
    if (filename.endsWith('.wav')) return 'audio/wav';
    return 'audio/mpeg';
  };

  const analyzeAudio = async (data: Uint8Array, filename: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const max = Math.max(...filteredData);
      const normalized = filteredData.map(n => n / max);
      setWaveformData(normalized);

      audioContext.close();
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, width, height);

    const progress = duration > 0 ? currentTime / duration : 0;
    const progressIndex = Math.floor(waveformData.length * progress);

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      if (index <= progressIndex) {
        ctx.fillStyle = '#3B82F6';
      } else {
        ctx.fillStyle = '#6B7280';
      }

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData, currentTime, duration]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const newTime = progress * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-blue-400" />
          <span className="text-sm font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="w-full h-48 rounded cursor-pointer"
              onClick={handleCanvasClick}
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                    setCurrentTime(newTime);
                  }}
                  className="w-full"
                />
              </div>

              <div className="text-sm text-gray-400 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2 text-gray-400">Audio Information</h3>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-400">File:</span>{' '}
                <span className="text-gray-200">{fileName}</span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>{' '}
                <span className="text-gray-200">{formatTime(duration)}</span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>{' '}
                <span className="text-gray-200">{getMimeType(fileName)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
