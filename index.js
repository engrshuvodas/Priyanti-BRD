document.addEventListener('DOMContentLoaded', () => {
  // GSAP Setup
  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  // Constants & Elements
  const card = document.getElementById('card');
  const openBtn = document.getElementById('open');
  const closeBtn = document.getElementById('close');
  const loader = document.getElementById('loader');
  const musicBtn = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const cursorLight = document.querySelector('.cursor-light');
  const endingScene = document.getElementById('ending-scene');
  const replayBtn = document.getElementById('replay-btn');
  const heartTrigger = document.getElementById('heart-trigger');
  const signature = document.getElementById('signature');
  const revealSurpriseBtn = document.getElementById('reveal-surprise-btn');

  const cardFront = document.getElementById('card-front');

  let isMusicPlaying = true; // Start with music playing
  let isCardOpen = false;

  const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffc8dd', '#fb6f92'];

  // 1. LOADING SCREEN
  window.addEventListener('load', () => {
    const tl = gsap.timeline();
    tl.to('.progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
      .to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.style.display = 'none';
          startEntranceAnimations();
        }
      });
  });

  function startEntranceAnimations() {
    gsap.timeline()
      .from('.main-title', { y: 50, opacity: 0, duration: 1.2, ease: 'power4.out' })
      .from('.cake-container', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, "-=0.8")
      .from('.card-controls', { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
      .from('.audio-player', { x: -20, opacity: 0, duration: 0.8 }, "-=0.8");
  }

  // 2. 3D INTERACTION
  const handleMove = (x, y) => {
    if (window.innerWidth < 1024) return; // Only for desktop
    if (!isCardOpen) {
      // Very subtle hover effect when closed
      const rx = (window.innerHeight / 2 - y) / 50;
      const ry = (x - window.innerWidth / 2) / 50;
      gsap.to(card, {
        rotationX: rx,
        rotationY: ry,
        duration: 0.7,
        ease: 'power2.out'
      });
    } else {
      // Even subtler when open to keep text readable
      const rx = (window.innerHeight / 2 - y) / 100;
      const ry = (x - window.innerWidth / 2) / 100;
      gsap.to(card, {
        rotationX: rx + 5, // 5deg base tilt
        rotationY: ry,
        duration: 0.7,
        ease: 'power2.out'
      });
    }

    // Move light source
    gsap.to(cursorLight, { left: x, top: y, duration: 0.3 });

    // Subtle orb reaction
    gsap.to('.orb-1', { x: (x - window.innerWidth / 2) * 0.05, y: (y - window.innerHeight / 2) * 0.05, duration: 2 });
    gsap.to('.orb-2', { x: (window.innerWidth / 2 - x) * 0.05, y: (window.innerHeight / 2 - y) * 0.05, duration: 2 });
  };

  document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

  // Mobile Orientation
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (!isCardOpen) {
        const x = (e.gamma || 0) * 2; // Left to right
        const y = (e.beta || 0) * 2;  // Front to back
        handleMove(window.innerWidth / 2 + x, window.innerHeight / 2 + y);
      }
    });
  }

  // 3. CARD OPEN/CLOSE (Human Flow)
  // Typing Animation Configuration
  const typingConfig = {
    lines: [
      "Priyanti, you are truly amazing and such a cute lady. When you say it in your voice, that Bangla and Hindi mix sounds really cute—just wow. It stays in my mind...!",
      "You genuinely deserve all the happiness and success in the world..!"
    ],
    duration: 1.5, // Faster typing for better UX
    pauseBetweenLines: 0.2
  };

  function startTypingAnimation() {
    const tl = gsap.timeline();

    typingConfig.lines.forEach((line, index) => {
      const elementId = `line-${index + 1}`;
      const el = document.getElementById(elementId);

      tl.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      })
        .add(() => el.classList.add('typing-active'))
        .to(el, {
          duration: line.length * 0.04, // Dynamic duration based on length
          text: line,
          ease: 'none'
        })
        .add(() => el.classList.remove('typing-active'), `+=${typingConfig.pauseBetweenLines}`);
    });

    return tl;
  }

  const openCard = () => {
    isCardOpen = true;
    card.classList.add('is-open');
    document.body.classList.add('card-is-open');

    const tl = gsap.timeline();

    // SCALE UP & OPEN: Fast 0.6 second duration for instant response
    tl.to(card, { scale: 1.1, duration: 0.6, ease: 'power3.inOut' }, 0);
    tl.to(cardFront, { rotationY: -180, duration: 0.6, ease: 'power4.inOut' }, 0);

    // Reveal title
    tl.fromTo('.wish-title',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      "-=0.2"
    );

    // Start typing animation
    tl.add(() => {
      startTypingAnimation();
    }, "-=0.1");

    // Signature (reveals after title, but before typing finishes)
    tl.fromTo('.signed',
      { opacity: 0, y: 10, filter: 'blur(5px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
      "-=0.1"
    ).add(() => {
      heartTrigger.classList.add('heart-pulse');
    });
  };

  const closeCard = () => {
    isCardOpen = false;
    card.classList.remove('is-open');
    document.body.classList.remove('card-is-open');
    // Scale back down fast (0.6s)
    gsap.to(card, { scale: 1, duration: 0.6, ease: 'power3.inOut' });
    gsap.to(cardFront, { rotationY: 0, duration: 0.6, ease: 'power3.inOut' });
  };

  openBtn.addEventListener('click', openCard);
  closeBtn.addEventListener('click', closeCard);

  // 4. MODAL INTERACTIONS (LoveFunCode)
  const funModal = document.getElementById('fun-modal');
  const launchBtn = document.getElementById('launch-fun');
  const closeModalBtn = document.getElementById('close-modal');

  launchBtn.addEventListener('click', () => {
    funModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable scroll
  });

  closeModalBtn.addEventListener('click', () => {
    funModal.classList.remove('active');
    document.body.style.overflow = ''; // Enable scroll
    // Force reset iframe to stop music if any
    const iframe = document.getElementById('fun-iframe');
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  });

  // 5. SCROLL REVEAL FOR SURPRISE SECTION
  const surpriseSection = document.getElementById('fun-surprise');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        surpriseSection.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(surpriseSection);

  // 6. ENHANCED MICRO-INTERACTIONS
  heartTrigger.addEventListener('click', () => {
    gsap.to(heartTrigger, {
      scale: 1.8,
      color: '#ff0000',
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const msg = document.createElement('div');
        msg.innerText = "You're an amazing friend! ✨";
        msg.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: linear-gradient(135deg, #ff4d6d, #ff758f); padding: 15px 30px; border-radius: 50px; z-index: 3000; font-weight: 600; box-shadow: 0 10px 25px rgba(255, 77, 109, 0.4); animation: messagePopup 0.5s ease-out;`;
        document.body.appendChild(msg);
        
        // Enhanced animation for the message
        gsap.from(msg, { 
          scale: 0, 
          opacity: 0, 
          duration: 0.5, 
          ease: 'back.out(1.7)' 
        });
        gsap.to(msg, { 
          y: -40, 
          opacity: 0, 
          delay: 2, 
          duration: 0.8, 
          onComplete: () => msg.remove() 
        });
      }
    });

    // Create more sparkles for better effect
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createSparkle(window.innerWidth / 2, window.innerHeight / 2), i * 50);
    }
  });

  // Enhanced button interactions
  document.querySelectorAll('.btn-interact').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('click', () => {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
    });
  });

  // Enhanced navigation button
  const nextPageBtn = document.querySelector('.next-page-btn');
  if (nextPageBtn) {
    nextPageBtn.addEventListener('mouseenter', () => {
      gsap.to('.arrow-circle', {
        x: 5,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    nextPageBtn.addEventListener('mouseleave', () => {
      gsap.to('.arrow-circle', {
        x: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }

  // Add ripple effect to buttons
  document.querySelectorAll('button, .next-page-btn').forEach(element => {
    element.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Enhanced loading experience
  window.addEventListener('load', () => {
    const tl = gsap.timeline();
    tl.to('.progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
      .to(loader, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          loader.style.display = 'none';
          startEntranceAnimations();
        }
      });
  });

  function startEntranceAnimations() {
    const tl = gsap.timeline();
    
    // Enhanced card entrance
    tl.from('.main-container', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power4.out'
    })
    .from('#card', {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'back.out(1.7)'
    }, "-=0.5")
    .from('.main-title', { 
      y: 30, 
      opacity: 0, 
      duration: 1,
      ease: 'power4.out' 
    }, "-=0.8")
    .from('.cake-container', { 
      scale: 0, 
      opacity: 0, 
      duration: 0.8, 
      ease: 'back.out(1.7)' 
    }, "-=0.6")
    .from('.card-controls', { 
      y: 20, 
      opacity: 0, 
      duration: 0.6 
    }, "-=0.4")
    .from('.audio-player', { 
      x: -20, 
      opacity: 0, 
      duration: 0.6 
    }, "-=0.4");
  }

  // Enhanced particle system
  function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.cssText = `
        position: absolute; 
        width: ${size}px; 
        height: ${size}px; 
        background: white; 
        opacity: ${Math.random() * 0.3 + 0.1}; 
        border-radius: 50%; 
        top: ${Math.random() * 100}%; 
        left: ${Math.random() * 100}%; 
        pointer-events: none;
        animation: particleFloat ${8 + Math.random() * 4}s infinite linear;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(p);
    }
  }

  // Enhanced sparkle effect
  function createSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    document.body.appendChild(s);
    const size = Math.random() * 8 + 4;
    gsap.set(s, { 
      x, y, 
      width: size, 
      height: size, 
      backgroundColor: colors[Math.floor(Math.random() * colors.length)], 
      borderRadius: '50%', 
      position: 'absolute', 
      pointerEvents: 'none', 
      zIndex: 9999 
    });
    
    gsap.to(s, { 
      x: x + (Math.random() * 200 - 100), 
      y: y + (Math.random() * 200 - 100), 
      opacity: 0, 
      scale: 0, 
      duration: 1.2, 
      ease: 'power2.out', 
      onComplete: () => s.remove() 
    });
  }

  // Add CSS for new animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes particleFloat {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.4;
      }
      90% {
        opacity: 0.4;
      }
      100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
      }
    }
    
    @keyframes messagePopup {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  createParticles();
  
  // Enhanced click effects
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && !e.target.closest('button')) {
      createSparkle(e.pageX, e.pageY);
    }
  });

  // 5. FINAL SCENE TRIGGER
  function showFinalEnding() {
    if (!isCardOpen) return;
    endingScene.classList.add('active');
    gsap.from('.ending-content > *', {
      y: 20,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  revealSurpriseBtn.addEventListener('click', () => {
    window.location.href = 'bbd.html';
  });

  replayBtn.addEventListener('click', () => {
    endingScene.classList.remove('active');
  });

  // 6. DECORATIONS
  function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `position: absolute; width: ${Math.random() * 3 + 2}px; height: ${Math.random() * 3 + 2}px; background: white; opacity: ${Math.random() * 0.3 + 0.1}; border-radius: 50%; top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; pointer-events: none;`;
      container.appendChild(p);
      animateParticle(p);
    }
  }

  function animateParticle(p) {
    gsap.to(p, {
      y: "-=150",
      x: `+=${Math.random() * 40 - 20}`,
      opacity: 0,
      duration: Math.random() * 5 + 3,
      onComplete: () => {
        p.style.top = '110%';
        p.style.left = `${Math.random() * 100}%`;
        p.style.opacity = Math.random() * 0.3 + 0.1;
        animateParticle(p);
      }
    });
  }

  function createSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    document.body.appendChild(s);
    const size = Math.random() * 6 + 4;
    gsap.set(s, { x, y, width: size, height: size, backgroundColor: colors[Math.floor(Math.random() * colors.length)], borderRadius: '50%', position: 'absolute', pointerEvents: 'none', zIndex: 9999 });
    gsap.to(s, { x: x + (Math.random() * 200 - 100), y: y + (Math.random() * 200 - 100), opacity: 0, scale: 0, duration: 1.2, ease: 'power2.out', onComplete: () => s.remove() });
  }

  createParticles();
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      createSparkle(e.pageX, e.pageY);
    }
  });

  // Music Toggle - Same as bbd.html
  let isPlaying = false;
  let musicInitialized = false;

  // Auto-play music on page load
  function initMusic() {
    if (musicInitialized) return;
    musicInitialized = true;
    
    // Try to autoplay music (may be blocked by browser)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        updateMusicButton();
        console.log('Music auto-play started successfully');
      }).catch((error) => {
        // If autoplay is blocked, wait for user interaction
        isPlaying = false;
        updateMusicButton();
        console.log('Auto-play blocked, waiting for user interaction');
        
        // Add one-time user interaction listener
        const startMusicOnInteraction = () => {
          if (!isPlaying) {
            audio.play().then(() => {
              isPlaying = true;
              updateMusicButton();
              console.log('Music started after user interaction');
            }).catch((err) => {
              console.error('Failed to play music after interaction:', err);
            });
          }
          // Remove the listener after first interaction
          document.removeEventListener('click', startMusicOnInteraction);
          document.removeEventListener('keydown', startMusicOnInteraction);
        };
        
        // Listen for first user interaction
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
      });
    }
  }

  // Update music button appearance
  function updateMusicButton() {
    const icon = musicBtn.querySelector('.icon');
    
    if (isPlaying) {
      icon.textContent = '🔊';
      musicBtn.classList.add('playing');
    } else {
      icon.textContent = '🔇';
      musicBtn.classList.remove('playing');
    }
  }

  musicBtn.addEventListener('click', () => {
    if (!isPlaying) {
      audio.play().then(() => {
        isPlaying = true;
        updateMusicButton();
        console.log('Music started by button click');
      }).catch((error) => {
        console.error('Failed to play music:', error);
      });
    } else {
      audio.pause();
      isPlaying = false;
      updateMusicButton();
      console.log('Music paused by button click');
    }
  });

  // Initialize music on page load with delay
  setTimeout(() => {
    initMusic();
  }, 500);
});

