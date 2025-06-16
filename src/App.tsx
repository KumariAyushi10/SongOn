
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId: string;
  duration: string;
}

const App: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock trending songs data
  const trendingSongs: Song[] = [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
      videoId: '4NRXx6U8ABQ',
      duration: '3:20'
    },
    {
      id: '2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      videoId: 'JGwWNGJdvx8',
      duration: '3:53'
    },
    {
      id: '3',
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      thumbnail: 'https://i.ytimg.com/vi/DyDfgMOUjCI/maxresdefault.jpg',
      videoId: 'DyDfgMOUjCI',
      duration: '3:14'
    },
    {
      id: '4',
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      thumbnail: 'https://i.ytimg.com/vi/E07s5ZYygMg/maxresdefault.jpg',
      videoId: 'E07s5ZYygMg',
      duration: '2:54'
    },
    {
      id: '5',
      title: 'Levitating',
      artist: 'Dua Lipa',
      thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg',
      videoId: 'TUVcZfQe-Kw',
      duration: '3:23'
    },
    {
      id: '6',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      thumbnail: 'https://i.ytimg.com/vi/kTJczUoc26U/maxresdefault.jpg',
      videoId: 'kTJczUoc26U',
      duration: '2:21'
    }
  ];

  const playSong = (song: Song, index: number) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
    setIsPlayerVisible(true);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    const nextIndex = (currentSongIndex + 1) % trendingSongs.length;
    playSong(trendingSongs[nextIndex], nextIndex);
  };

  const prevSong = () => {
    const prevIndex = currentSongIndex === 0 ? trendingSongs.length - 1 : currentSongIndex - 1;
    playSong(trendingSongs[prevIndex], prevIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSongEnd = () => {
    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (isAutoplay) {
      nextSong();
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className={`app ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🎵 SongOn</h1>
        </div>
        <div className="nav-controls">
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h2>Trending Songs</h2>
        <div className="songs-grid">
          {trendingSongs.map((song, index) => (
            <div 
              key={song.id} 
              className="song-card"
              onClick={() => playSong(song, index)}
            >
              <img src={song.thumbnail} alt={song.title} />
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
                <span className="duration">{song.duration}</span>
              </div>
              <div className="play-overlay">
                <div className="play-button">▶️</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Music Player */}
      {isPlayerVisible && currentSong && (
        <div className="music-player">
          <button 
            className="close-player"
            onClick={() => setIsPlayerVisible(false)}
          >
            ✕
          </button>
          
          <div className="player-content">
            <div className="current-song-info">
              <img src={currentSong.thumbnail} alt={currentSong.title} />
              <div>
                <h3>{currentSong.title}</h3>
                <p>{currentSong.artist}</p>
              </div>
            </div>

            <div className="player-controls">
              <div className="control-buttons">
                <button onClick={prevSong}>⏮️</button>
                <button className="play-pause" onClick={togglePlayPause}>
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button onClick={nextSong}>⏭️</button>
              </div>

              <div className="progress-section">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                />
                <span>{formatTime(duration)}</span>
              </div>

              <div className="additional-controls">
                <button 
                  className={`control-btn ${isAutoplay ? 'active' : ''}`}
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  title="Autoplay"
                >
                  🔄
                </button>
                <button 
                  className={`control-btn ${isLoop ? 'active' : ''}`}
                  onClick={() => setIsLoop(!isLoop)}
                  title="Loop"
                >
                  🔁
                </button>
                <div className="volume-control">
                  <span>🔊</span>
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={`https://www.youtube.com/watch?v=${currentSong.videoId}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleSongEnd}
            autoPlay={isPlaying}
          />
        </div>
      )}
    </div>
  );
};

export default App;
