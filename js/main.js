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
    setActiveNav();
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

  // 5.1 校区城市筛选（联系我们页）
  const campusTabs = document.querySelectorAll('.campus-tabs .campus-tab');
  const campusCards = document.querySelectorAll('.campus-card');

  if (campusTabs.length && campusCards.length) {
    campusTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const city = tab.getAttribute('data-city');

        campusTabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        campusCards.forEach(function (card) {
          const matched = city === 'all' || card.getAttribute('data-city') === city;
          card.style.display = matched ? 'flex' : 'none';
        });
      });
    });

    // 支持首页「全国直营校区布局」跳转：/contact/#city-gz
    function applyCityFromHash() {
      const match = /^#city-([a-z]+)$/.exec(window.location.hash);
      if (!match) return;

      const tab = document.querySelector('.campus-tabs .campus-tab[data-city="' + match[1] + '"]');
      if (!tab) return;

      tab.click();

      const section = document.querySelector('.campus-section');
      if (section) {
        const top = section.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    applyCityFromHash();
    window.addEventListener('hashchange', applyCityFromHash);
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

/**
 * 当前导航高亮：按路径前缀匹配，支持任意层级子页面
 * /courses/ /courses/n1-ai-newmedia/ -> 培训课程
 * /knowledge/guide-geo/              -> 知识百科
 */
function setActiveNav() {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  let best = null;

  document.querySelectorAll('.nav a').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    if (href.charAt(0) !== '/') return;

    const target = href.split('#')[0].replace(/\/index\.html$/, '/');
    let matched = false;

    if (target === '/') {
      matched = (path === '/');
    } else if (path === target) {
      matched = true;
    } else if (path.indexOf(target) === 0) {
      matched = true;
    }

    if (matched && (!best || target.length > best.target.length)) {
      best = { link: link, target: target };
    }
  });

  document.querySelectorAll('.nav a').forEach(function (link) {
    link.classList.remove('active');
  });

  if (best) {
    best.link.classList.add('active');
  }
}


