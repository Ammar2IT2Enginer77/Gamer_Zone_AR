/* ==========================================================================
   GAMER ZONE — Interactive Scroll-Driven UI & Motion Engine (GSAP + Lenis)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Initialize Lenis Smooth Scroll
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Exit early if GSAP or ScrollTrigger failed to load (e.g., offline fallback)
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 2. Interactive Hero Scroll-Driven Product Showcase (index.html)
  const showcaseStage = document.querySelector('#gzShowcaseStage');
  if (showcaseStage) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#gzShowcaseStage',
        start: 'top top',
        end: '+=3400',
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    // Stage 1: Fade out intro text, zoom watermark, move Product 1 to left & reveal Card 1
    tl.to('.gz-intro-layer', {
      opacity: 0,
      y: -50,
      duration: 0.45,
      ease: 'power2.in'
    }, 0)
    .to('#gzWatermark', {
      scale: 1.2,
      opacity: 0.08,
      duration: 1
    }, 0)
    .to('#gzProd1', {
      left: '27%',
      top: '52%',
      xPercent: -50,
      yPercent: -50,
      rotation: -14,
      scale: 1.15,
      duration: 0.85,
      ease: 'power2.inOut'
    }, 0)
    .to('#gzCard1', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      onStart: function () {
        const c1 = document.getElementById('gzCard1');
        if (c1) c1.classList.add('is-active');
      },
      onReverseComplete: function () {
        const c1 = document.getElementById('gzCard1');
        if (c1) c1.classList.remove('is-active');
      }
    }, 0.45)

    // Stage 2: Exit Product 1 upwards, bring Product 2 from bottom & reveal Card 2
    .to('#gzProd1', {
      top: '-35%',
      opacity: 0,
      rotation: 20,
      scale: 0.9,
      duration: 0.8,
      ease: 'power2.in'
    }, 1.35)
    .to('#gzCard1', {
      opacity: 0,
      y: -40,
      duration: 0.4,
      onComplete: function () {
        const c1 = document.getElementById('gzCard1');
        if (c1) c1.classList.remove('is-active');
      },
      onReverseComplete: function () {
        const c1 = document.getElementById('gzCard1');
        if (c1) c1.classList.add('is-active');
      }
    }, 1.35)
    .to('#gzWatermark', {
      scale: 1.38,
      duration: 0.8
    }, 1.35)
    .fromTo('#gzProd2',
      {
        left: '27%',
        top: '125%',
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 0.85,
        rotation: 15
      },
      {
        left: '27%',
        top: '52%',
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: 1.15,
        rotation: -10,
        duration: 0.85,
        ease: 'power2.out'
      }, 1.55)
    .to('#gzCard2', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      onStart: function () {
        const c2 = document.getElementById('gzCard2');
        if (c2) c2.classList.add('is-active');
      },
      onReverseComplete: function () {
        const c2 = document.getElementById('gzCard2');
        if (c2) c2.classList.remove('is-active');
      }
    }, 1.8)

    // Stage 3: Hold briefly then exit Product 2 cleanly before unpinning to categories
    .to('#gzProd2', {
      top: '-30%',
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    }, 2.75)
    .to('#gzCard2', {
      opacity: 0,
      y: -30,
      duration: 0.4,
      onComplete: function () {
        const c2 = document.getElementById('gzCard2');
        if (c2) c2.classList.remove('is-active');
      },
      onReverseComplete: function () {
        const c2 = document.getElementById('gzCard2');
        if (c2) c2.classList.add('is-active');
      }
    }, 2.75);
  }

  // 3. Staggered Entrance for Category Cards
  const categoryCards = gsap.utils.toArray('.category-card');
  if (categoryCards.length > 0) {
    gsap.set(categoryCards, { opacity: 0, y: 40, scale: 0.96 });
    ScrollTrigger.batch(categoryCards, {
      start: 'top 86%',
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          overwrite: true
        });
      }
    });
  }

  // 4. Section Headers & Panels Smooth Reveal
  gsap.utils.toArray('.section-head, .page-banner .container, .panel.reveal').forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 5. Dynamic Product Cards Staggered Animation (works with dynamically rendered cards)
  window.animateGZProducts = function () {
    const cards = gsap.utils.toArray('.product-card:not(.gsap-animated)');
    if (cards.length === 0) return;

    cards.forEach(function (c) {
      c.classList.add('gsap-animated', 'visible');
    });

    gsap.fromTo(cards,
      { opacity: 0, y: 45, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'transform'
      }
    );
  };

  // Run initially and watch for dynamic product renders
  window.animateGZProducts();
  const productGrids = document.querySelectorAll('.product-grid');
  productGrids.forEach(function (grid) {
    const observer = new MutationObserver(function () {
      window.animateGZProducts();
      ScrollTrigger.refresh();
    });
    observer.observe(grid, { childList: true });
  });
});
