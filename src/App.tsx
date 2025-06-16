
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
  album?: string;
  genre?: string;
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
  const [activeSection, setActiveSection] = useState('home');
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced trending songs with better data
  const trendingSongs: Song[] = [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      genre: 'Pop',
      thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg',
      videoId: '4NRXx6U8ABQ',
      duration: '3:20'
    },
    {
      id: '2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷ (Divide)',
      genre: 'Pop',
      thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
      videoId: 'JGwWNGJdvx8',
      duration: '3:53'
    },
    {
      id: '3',
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      album: 'When We All Fall Asleep',
      genre: 'Alternative',
      thumbnail: 'https://i.ytimg.com/vi/DyDfgMOUjCI/maxresdefault.jpg',
      videoId: 'DyDfgMOUjCI',
      duration: '3:14'
    },
    {
      id: '4',
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      album: 'Fine Line',
      genre: 'Pop Rock',
      thumbnail: 'https://i.ytimg.com/vi/E07s5ZYygMg/maxresdefault.jpg',
      videoId: 'E07s5ZYygMg',
      duration: '2:54'
    },
    {
      id: '5',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      genre: 'Disco Pop',
      thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg',
      videoId: 'TUVcZfQe-Kw',
      duration: '3:23'
    },
    {
      id: '6',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3',
      genre: 'Hip Hop',
      thumbnail: 'https://i.ytimg.com/vi/kTJczUoc26U/maxresdefault.jpg',
      videoId: 'kTJczUoc26U',
      duration: '2:21'
    },
    {
      id: '7',
      title: 'As It Was',
      artist: 'Harry Styles',
      album: 'Harry\'s House',
      genre: 'Pop Rock',
      thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/maxresdefault.jpg',
      videoId: 'H5v3kku4y6Q',
      duration: '2:47'
    },
    {
      id: '8',
      title: 'Heat Waves',
      artist: 'Glass Animals',
      album: 'Dreamland',
      genre: 'Indie Rock',
      thumbnail: 'https://i.ytimg.com/vi/mRD0-GxqHVo/maxresdefault.jpg',
      videoId: 'mRD0-GxqHVo',
      duration: '3:58'
    }
  ];

  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>(trendingSongs);

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'library', label: 'Your Library', icon: '📚' },
    { id: 'playlists', label: 'Playlists', icon: '🎵' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' }
  ];

  // YouTube player options
  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      origin: window.location.origin,
      host: 'https://www.youtube-nocookie.com'
    },
  };

  const searchYouTube = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const API_KEY = 'AIzaSyB1PLcfv4QUvHPCEgxuIm3erejq-xOQkAU';
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      
      const results: Song[] = data.items.map((item: any, index: number) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        album: 'Single',
        genre: 'Music',
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        videoId: item.id.videoId,
        duration: 'Loading...'
      }));
      
      // Get video durations
      const videoIds = results.map(song => song.videoId).join(',');
      const durationResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`
      );
      
      if (durationResponse.ok) {
        const durationData = await durationResponse.json();
        const durationsMap = new Map();
        
        durationData.items.forEach((video: any) => {
          const duration = video.contentDetails.duration;
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          const seconds = parseInt(match[3] || '0');
          
          let formattedDuration = '';
          if (hours > 0) {
            formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else {
            formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
          
          durationsMap.set(video.id, formattedDuration);
        });
        
        results.forEach(song => {
          song.duration = durationsMap.get(song.videoId) || '0:00';
        });
      }
      
      setSearchResults(results);
      setActiveSection('search');
    } catch (error) {
      console.error('Search error:', error);
      const mockResults: Song[] = [
        {
          id: `search-${Date.now()}-1`,
          title: `${query} - Result 1`,
          artist: 'Various Artist',
          album: 'Single',
          genre: 'Music',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          videoId: 'dQw4w9WgXcQ',
          duration: '3:32'
        }
      ];
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
    const player = event.target;
    setDuration(player.getDuration());
    player.setVolume(volume);
    
    setTimeout(() => {
      player.playVideo();
    }, 100);
  };

  const onStateChange = (event: any) => {
    const player = event.target;
    const state = event.data;
    
    if (state === 1) {
      setIsPlaying(true);
      startTimeUpdate();
    } else if (state === 2) {
      setIsPlaying(false);
      stopTimeUpdate();
    } else if (state === 0) {
      setIsPlaying(false);
      stopTimeUpdate();
      handleSongEnd();
    } else if (state === -1) {
      setTimeout(() => {
        if (player && player.playVideo) {
          player.playVideo();
        }
      }, 500);
    }
  };

  const onError = (event: any) => {
    console.log('YouTube player error:', event.data);
    if (isAutoplay && currentPlaylist.length > 1) {
      setTimeout(() => {
        nextSong();
      }, 2000);
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
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.log('Error controlling playback:', error);
        const currentVideoId = currentSong?.videoId;
        if (currentVideoId) {
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.loadVideoById(currentVideoId);
            }
          }, 1000);
        }
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
      {/* Professional Header */}
      <header className="header">
        <div className="header-brand">
          <div className="logo">
            <span className="logo-icon">🎵</span>
            <h1>SongOn</h1>
            <span className="logo-subtitle">Premium Music</span>
          </div>
        </div>
        
        <div className="header-search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn" disabled={isSearching}>
              {isSearching ? '⏳' : 'Search'}
            </button>
          </form>
        </div>

        <div className="header-actions">
          <button className="premium-btn">Get Premium</button>
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
          <div className="user-menu">
            <div className="user-avatar">👤</div>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Professional Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="sidebar-playlists">
            <h3>Recently Played</h3>
            <div className="playlist-items">
              {trendingSongs.slice(0, 3).map((song) => (
                <div key={song.id} className="playlist-item" onClick={() => playSong(song, 0)}>
                  <img src={song.thumbnail} alt={song.title} />
                  <div className="playlist-info">
                    <p className="playlist-title">{song.title}</p>
                    <p className="playlist-artist">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {activeSection === 'home' && (
            <>
              <section className="hero-section">
                <div className="hero-content">
                  <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h1>
                  <p>Discover your perfect soundtrack</p>
                </div>
              </section>

              <section className="quick-picks">
                <h2>Made for you</h2>
                <div className="quick-picks-grid">
                  {trendingSongs.slice(0, 6).map((song, index) => (
                    <div 
                      key={song.id} 
                      className="quick-pick-card"
                      onClick={() => playSong(song, index, trendingSongs)}
                    >
                      <img src={song.thumbnail} alt={song.title} />
                      <span>{song.title}</span>
                      <div className="quick-play-btn">▶️</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="trending-section">
                <div className="section-header">
                  <h2>Trending Now</h2>
                  <button className="show-all-btn">Show all</button>
                </div>
                <div className="songs-grid">
                  {trendingSongs.map((song, index) => (
                    <div 
                      key={song.id} 
                      className="song-card professional"
                      onClick={() => playSong(song, index, trendingSongs)}
                    >
                      <div className="song-image-container">
                        <img src={song.thumbnail} alt={song.title} className="song-poster" />
                        <div className="play-overlay">
                          <div className="play-button">▶️</div>
                        </div>
                      </div>
                      <div className="song-details">
                        <h3 className="song-title">{song.title}</h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-album">{song.album}</p>
                        <div className="song-meta">
                          <span className="genre">{song.genre}</span>
                          <span className="duration">{song.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeSection === 'search' && (
            <section className="search-results">
              <h2>Search Results</h2>
              {searchResults.length > 0 ? (
                <div className="songs-grid">
                  {searchResults.map((song, index) => (
                    <div 
                      key={song.id} 
                      className="song-card professional"
                      onClick={() => playSong(song, index, searchResults)}
                    >
                      <div className="song-image-container">
                        <img src={song.thumbnail} alt={song.title} className="song-poster" />
                        <div className="play-overlay">
                          <div className="play-button">▶️</div>
                        </div>
                      </div>
                      <div className="song-details">
                        <h3 className="song-title">{song.title}</h3>
                        <p className="song-artist">{song.artist}</p>
                        <p className="song-album">{song.album}</p>
                        <div className="song-meta">
                          <span className="genre">{song.genre}</span>
                          <span className="duration">{song.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>Search for your favorite music</h3>
                  <p>Find songs, artists, albums, and more</p>
                </div>
              )}
            </section>
          )}

          {(activeSection === 'library' || activeSection === 'playlists' || activeSection === 'favorites') && (
            <section className="feature-section">
              <div className="empty-state">
                <div className="empty-icon">🚧</div>
                <h3>Coming Soon</h3>
                <p>This feature is under development</p>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Enhanced Music Player */}
      {isPlayerVisible && currentSong && (
        <div className="music-player enhanced">
          <div className="player-track-info">
            <img src={currentSong.thumbnail} alt={currentSong.title} className="player-album-art" />
            <div className="track-details">
              <h4 className="track-title">{currentSong.title}</h4>
              <p className="track-artist">{currentSong.artist}</p>
            </div>
            <button className="favorite-btn">🤍</button>
          </div>

          <div className="player-controls-center">
            <div className="control-buttons">
              <button className="control-btn" onClick={prevSong} title="Previous">⏮️</button>
              <button className="play-pause-btn" onClick={togglePlayPause}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button className="control-btn" onClick={nextSong} title="Next">⏭️</button>
            </div>

            <div className="progress-section">
              <span className="time-current">{formatTime(currentTime)}</span>
              <div className="progress-container">
                <input
                  type="range"
                  className="progress-bar"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                />
              </div>
              <span className="time-total">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-additional-controls">
            <button 
              className={`control-btn ${isLoop ? 'active' : ''}`}
              onClick={() => setIsLoop(!isLoop)}
              title="Loop"
            >
              🔁
            </button>
            <button 
              className={`control-btn ${isAutoplay ? 'active' : ''}`}
              onClick={() => setIsAutoplay(!isAutoplay)}
              title="Autoplay"
            >
              🔄
            </button>
            <div className="volume-control">
              <span className="volume-icon">🔊</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
            <button 
              className="minimize-btn"
              onClick={() => setIsPlayerVisible(false)}
              title="Minimize Player"
            >
              ⬇️
            </button>
          </div>

          {/* Hidden YouTube Player */}
          <div style={{ display: 'none' }}>
            <YouTube
              key={currentSong.videoId}
              videoId={currentSong.videoId}
              opts={opts}
              onReady={onReady}
              onStateChange={onStateChange}
              onError={onError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
