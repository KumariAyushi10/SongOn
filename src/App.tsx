
import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
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
  const [volume, setVolume] = useState(70);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trending songs with real YouTube video IDs
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
    },
    {
      id: '7',
      title: 'As It Was',
      artist: 'Harry Styles',
      thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/maxresdefault.jpg',
      videoId: 'H5v3kku4y6Q',
      duration: '2:47'
    },
    {
      id: '8',
      title: 'Heat Waves',
      artist: 'Glass Animals',
      thumbnail: 'https://i.ytimg.com/vi/mRD0-GxqHVo/maxresdefault.jpg',
      videoId: 'mRD0-GxqHVo',
      duration: '3:58'
    }
  ];

  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>(trendingSongs);

  // YouTube player options
  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
  };

  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // This is a mock search for demonstration. In a real app, you'd use YouTube Data API
      const mockResults: Song[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `${query} - Result 1`,
          artist: 'Various Artist',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          videoId: 'dQw4w9WgXcQ',
          duration: '3:32'
        },
        {
          id: `search-${Date.now()}-2`,
          title: `${query} - Result 2`,
          artist: 'Various Artist',
          thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg',
          videoId: 'L_jWHffIx5E',
          duration: '4:12'
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
    const player = event.target;
    setDuration(player.getDuration());
    player.setVolume(volume);
  };

  const onStateChange = (event: any) => {
    const player = event.target;
    const state = event.data;
    
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (state === 1) { // playing
      setIsPlaying(true);
      startTimeUpdate();
    } else if (state === 2) { // paused
      setIsPlaying(false);
      stopTimeUpdate();
    } else if (state === 0) { // ended
      setIsPlaying(false);
      stopTimeUpdate();
      handleSongEnd();
    }
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 1000);
  };

  const stopTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playSong = (song: Song, index: number, playlist: Song[] = currentPlaylist) => {
    setCurrentSong(song);
    setCurrentSongIndex(index);
    setCurrentPlaylist(playlist);
    setIsPlayerVisible(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const nextSong = () => {
    const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[nextIndex], nextIndex, currentPlaylist);
  };

  const prevSong = () => {
    const prevIndex = currentSongIndex === 0 ? currentPlaylist.length - 1 : currentSongIndex - 1;
    playSong(currentPlaylist[prevIndex], prevIndex, currentPlaylist);
  };

  const handleSongEnd = () => {
    if (isLoop && playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    } else if (isAutoplay) {
      nextSong();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchYouTube(searchQuery);
  };

  useEffect(() => {
    return () => {
      stopTimeUpdate();
    };
  }, []);

  return (
    <div className={`app ${isDarkTheme ? 'dark' : 'light'}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🎵 SongOn</h1>
        </div>
        <div className="nav-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? '🔄' : '🔍'}
            </button>
          </form>
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
        {searchResults.length > 0 && (
          <section className="search-section">
            <h2>Search Results</h2>
            <div className="songs-grid">
              {searchResults.map((song, index) => (
                <div 
                  key={song.id} 
                  className="song-card"
                  onClick={() => playSong(song, index, searchResults)}
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
          </section>
        )}

        <section className="trending-section">
          <h2>Trending Songs</h2>
          <div className="songs-grid">
            {trendingSongs.map((song, index) => (
              <div 
                key={song.id} 
                className="song-card"
                onClick={() => playSong(song, index, trendingSongs)}
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
        </section>
      </main>

      {/* Music Player */}
      {isPlayerVisible && currentSong && (
        <div className="music-player">
          <button 
            className="close-player"
            onClick={() => {
              setIsPlayerVisible(false);
              if (playerRef.current) {
                playerRef.current.stopVideo();
              }
              stopTimeUpdate();
            }}
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
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hidden YouTube Player */}
          <div style={{ display: 'none' }}>
            <YouTube
              videoId={currentSong.videoId}
              opts={opts}
              onReady={onReady}
              onStateChange={onStateChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
