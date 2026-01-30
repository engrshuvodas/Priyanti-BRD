/**
 * Universal Music Player Component
 * Works exactly like bbd.html music setup
 * Can be used across all pages
 */

class UniversalMusicPlayer {
  constructor() {
    this.musicBtn = null;
    this.audio = null;
    this.isPlaying = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // Get elements
    this.musicBtn = document.getElementById('music-toggle');
    this.audio = document.getElementById('celebration-music');
    
    if (!this.musicBtn || !this.audio) {
      console.warn('Music player elements not found');
      return;
    }
    
    this.initialized = true;
    this.setupEventListeners();
    this.initMusic();
  }

  setupEventListeners() {
    // Music toggle button
    this.musicBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play().catch(() => {});
        this.isPlaying = true;
      }
      this.updateMusicButton();
    });
  }

  initMusic() {
    // Try to autoplay music (may be blocked by browser)
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateMusicButton();
    }).catch(() => {
      // If autoplay is blocked, wait for user interaction
      this.isPlaying = false;
      this.updateMusicButton();
    });
  }

  updateMusicButton() {
    const icon = this.musicBtn.querySelector('.icon');
    
    if (this.isPlaying) {
      icon.textContent = '🔊';
      this.musicBtn.classList.add('playing');
    } else {
      icon.textContent = '🔇';
      this.musicBtn.classList.remove('playing');
    }
  }

  // Public methods
  play() {
    if (!this.isPlaying) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.updateMusicButton();
      }).catch(() => {});
    }
  }

  pause() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.updateMusicButton();
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}

// Initialize music player when DOM is ready
const musicPlayer = new UniversalMusicPlayer();

// Auto-initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => musicPlayer.init());
} else {
  musicPlayer.init();
}

// Also try to initialize after window load (for dynamic content)
window.addEventListener('load', () => {
  setTimeout(() => musicPlayer.init(), 500);
});

// Make it globally available
window.musicPlayer = musicPlayer;
