/**
 * 美迪时代教育官网 - 公共交互脚本
 */

document.addEventListener('DOMContentLoaded', function () {
  // DOM 元素
  const header = document.querySelector('.header');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  const backToTop = document.querySelector('.back-to-top');
  const faqItems = document.querySelectorAll('.faq-item');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-detail-card');
  const animatedNumbers = document.querySelectorAll('[data-count]');

  // 1. 滚动时导航栏样式变化
  function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. 移动端菜单切换与当前页高亮
  if (nav) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach(function (link) {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // 点击导航链接后自动关闭菜单
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. FAQ 折叠展开
  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', function () {
        const isActive = item.classList.contains('active');

        // 关闭其他已展开的项（手风琴效果）
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
          }
        });

        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // 4. 回到顶部
  if (backToTop) {
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 5. 课程筛选
  if (filterBtns.length && courseCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const category = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        courseCards.forEach(function (card) {
          const cardCategory = card.getAttribute('data-category');

          if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 6. 数字滚动动画
  function animateNumbers() {
    if (!animatedNumbers.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          const suffix = entry.target.getAttribute('data-suffix') || '';
          const duration = 2000;
          const startTime = performance.now();

          function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            entry.target.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              entry.target.textContent = target + suffix;
            }
          }

          requestAnimationFrame(updateNumber);
        }
      });
    }, { threshold: 0.5 });

    animatedNumbers.forEach(function (num) {
      observer.observe(num);
    });
  }

  animateNumbers();

  // 7. 页面加载时淡入动画
  const revealElements = document.querySelectorAll('.course-card, .advantage-card, .teacher-card, .news-card, .partner-card, .showcase-card');

  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(function (el, index) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.transitionDelay = (index % 4 * 0.08) + 's';
      revealObserver.observe(el);
    });

    // 动态添加 revealed 样式
    const style = document.createElement('style');
    style.textContent = `
      .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 8. 表单提交提示（演示用）
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('感谢您的留言！我们的课程顾问将在 2 小时内与您联系。');
      contactForm.reset();
    });
  }

  // 10. 官方宣传片播放器控制
  const brandVideo = document.getElementById('brandVideo');
  const videoPlayOverlay = document.getElementById('videoPlayOverlay');
  const videoHeaderOverlay = document.getElementById('videoHeaderOverlay');

  if (brandVideo && videoPlayOverlay) {
    function startVideoPlay() {
      brandVideo.setAttribute('controls', 'true');
      brandVideo.play().then(function () {
        videoPlayOverlay.classList.add('hidden');
        if (videoHeaderOverlay) {
          videoHeaderOverlay.classList.add('hidden');
        }
      }).catch(function (err) {
        console.warn('Video autoplay/play blocked or error:', err);
      });
    }

    videoPlayOverlay.addEventListener('click', function (e) {
      e.preventDefault();
      startVideoPlay();
    });

    brandVideo.addEventListener('play', function () {
      brandVideo.setAttribute('controls', 'true');
      videoPlayOverlay.classList.add('hidden');
      if (videoHeaderOverlay) {
        videoHeaderOverlay.classList.add('hidden');
      }
    });

    brandVideo.addEventListener('pause', function () {
      if (brandVideo.currentTime === 0) {
        videoPlayOverlay.classList.remove('hidden');
        if (videoHeaderOverlay) {
          videoHeaderOverlay.classList.remove('hidden');
        }
      }
    });

    brandVideo.addEventListener('ended', function () {
      brandVideo.currentTime = 0;
      brandVideo.removeAttribute('controls');
      videoPlayOverlay.classList.remove('hidden');
      if (videoHeaderOverlay) {
        videoHeaderOverlay.classList.remove('hidden');
      }
    });
  }

  setActiveNav();
});

