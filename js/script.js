/**
 * SÉASONS Floral Atelier — Core Functionality & GSAP Animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 0. Shared scroll lock (drawer / modal / mobile nav share one owner set)
  // ==========================================================================
  const scrollLockOwners = new Set();

  function updateScrollLock() {
    document.body.classList.toggle('is-locked', scrollLockOwners.size > 0);
  }

  function lockScroll(owner) {
    scrollLockOwners.add(owner);
    updateScrollLock();
  }

  function unlockScroll(owner) {
    scrollLockOwners.delete(owner);
    updateScrollLock();
  }

  // ==========================================================================
  // 1. Cart Management (State, LocalStorage & Render)
  // ==========================================================================
  const cartState = {
    items: JSON.parse(localStorage.getItem('seasons_cart') || '[]')
  };

  const counterBadge = document.querySelector('.js-cart-counter');
  const cartDrawer = document.querySelector('.js-cart-drawer');
  const cartItemsContainer = document.querySelector('.js-cart-items-container');
  const cartTotalPrice = document.querySelector('.js-cart-total-price');
  const toast = document.querySelector('.js-toast');

  function saveCart() {
    localStorage.setItem('seasons_cart', JSON.stringify(cartState.items));
    renderCart();
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast--active');
    setTimeout(() => {
      toast.classList.remove('toast--active');
    }, 2800);
  }

  function renderCart() {
    const totalCount = cartState.items.reduce((acc, item) => acc + item.count, 0);

    // --- PRICES DISABLED (1/3) — uncomment this line to restore the order total
    // const totalSum = cartState.items.reduce((acc, item) => acc + (item.price * item.count), 0);

    if (counterBadge) {
      counterBadge.textContent = totalCount;
    }

    // --- PRICES DISABLED (2/3) — uncomment this block to restore the order total
    // if (cartTotalPrice) {
    //   cartTotalPrice.textContent = `${totalSum.toLocaleString('ru-RU')} ₽`;
    // }

    if (!cartItemsContainer) return;

    if (cartState.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-drawer__empty">
          <p>Ваша корзина пуста</p>
          <p style="font-size: 0.8rem; margin-top: 8px;">Выберите букет из каталога или оформите индивидуальный заказ</p>
        </div>
      `;
      return;
    }

    cartItemsContainer.innerHTML = cartState.items.map(item => `
      <div class="cart-item">
        <div class="cart-item__media">
          <img src="${item.img}" alt="${item.title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80';">
        </div>
        <div class="cart-item__info">
          <h4 class="cart-item__title">${item.title}</h4>
          <!-- PRICES DISABLED (3/3) — to restore, uncomment the line below
               and remove the backslash before \${ (escaped so the expression
               is not evaluated while disabled) -->
          <!-- <p class="cart-item__price">\${(item.price * item.count).toLocaleString('ru-RU')} ₽</p> -->
          <div class="cart-item__controls">
            <button type="button" class="cart-item__btn js-cart-minus" data-id="${item.id}">−</button>
            <span class="cart-item__count">${item.count}</span>
            <button type="button" class="cart-item__btn js-cart-plus" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Add to cart buttons
  document.querySelectorAll('.js-add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      const price = parseInt(btn.dataset.price, 10);
      const img = btn.dataset.img;

      const existing = cartState.items.find(i => i.id === id);
      if (existing) {
        existing.count += 1;
      } else {
        cartState.items.push({ id, title, price, img, count: 1 });
      }

      saveCart();
      showToast(`«${title}» добавлен в корзину`);

      // Gentle badge animation if GSAP available
      if (window.gsap && counterBadge) {
        gsap.fromTo(counterBadge, { scale: 1.4 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
      }
    });
  });

  // Cart item plus/minus
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const plusBtn = e.target.closest('.js-cart-plus');
      const minusBtn = e.target.closest('.js-cart-minus');

      if (plusBtn) {
        const id = plusBtn.dataset.id;
        const item = cartState.items.find(i => i.id === id);
        if (item) {
          item.count += 1;
          saveCart();
        }
      }

      if (minusBtn) {
        const id = minusBtn.dataset.id;
        const itemIndex = cartState.items.findIndex(i => i.id === id);
        if (itemIndex > -1) {
          if (cartState.items[itemIndex].count > 1) {
            cartState.items[itemIndex].count -= 1;
          } else {
            cartState.items.splice(itemIndex, 1);
          }
          saveCart();
        }
      }
    });
  }

  // Open / Close Cart Drawer
  const openCartBtns = document.querySelectorAll('.js-open-cart');
  const closeCartBtns = document.querySelectorAll('.js-close-cart');

  function openCart() {
    if (cartDrawer) {
      closeMobileNav();
      cartDrawer.classList.add('cart-drawer--active');
      cartDrawer.setAttribute('aria-hidden', 'false');
      lockScroll('cart');
    }
  }

  function closeCart() {
    if (cartDrawer) {
      cartDrawer.classList.remove('cart-drawer--active');
      cartDrawer.setAttribute('aria-hidden', 'true');
      unlockScroll('cart');
    }
  }

  openCartBtns.forEach(b => b.addEventListener('click', openCart));
  closeCartBtns.forEach(b => b.addEventListener('click', closeCart));

  // ==========================================================================
  // 1b. Mobile Navigation Drawer
  // ==========================================================================
  const mobileNav = document.querySelector('.js-mobile-nav');
  const burgerBtn = document.querySelector('.js-burger');
  const closeNavBtns = document.querySelectorAll('.js-close-mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.js-mobile-nav-link');

  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('mobile-nav--active');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (burgerBtn) {
      burgerBtn.classList.add('header__burger--active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      burgerBtn.setAttribute('aria-label', 'Закрыть меню');
    }
    lockScroll('mobile-nav');
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('mobile-nav--active');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (burgerBtn) {
      burgerBtn.classList.remove('header__burger--active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      burgerBtn.setAttribute('aria-label', 'Открыть меню');
    }
    unlockScroll('mobile-nav');
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav && mobileNav.classList.contains('mobile-nav--active');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  closeNavBtns.forEach(b => b.addEventListener('click', closeMobileNav));

  // Let the drawer close before the browser performs the anchor scroll
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileNav());
  });

  // Drawer is desktop-irrelevant: drop it if the viewport grows past the breakpoint
  const desktopQuery = window.matchMedia('(min-width: 901px)');
  const handleDesktopChange = (e) => {
    if (e.matches) closeMobileNav();
  };

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleDesktopChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleDesktopChange);
  }

  // ==========================================================================
  // 2. Modals (Callback / Order Form)
  // ==========================================================================
  const modal = document.querySelector('.js-modal');
  const openModalBtns = document.querySelectorAll('.js-open-callback, .js-cart-checkout-btn');
  const closeModalBtns = document.querySelectorAll('.js-close-modal');
  // Two forms share one handler: the modal one and the inline one that
  // replaced the delivery zones card
  const orderForms = document.querySelectorAll('.js-order-form');

  function openModal() {
    closeCart();
    closeMobileNav();
    if (modal) {
      modal.classList.add('modal--active');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll('modal');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('modal--active');
      modal.setAttribute('aria-hidden', 'true');
      unlockScroll('modal');
    }
  }

  openModalBtns.forEach(b => b.addEventListener('click', openModal));
  closeModalBtns.forEach(b => b.addEventListener('click', closeModal));

  orderForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      cartState.items = [];
      saveCart();
      showToast('Заявка принята! Флорист SÉASONS свяжется с вами');
      form.reset();
    });
  });

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeModal();
      closeMobileNav();
    }
  });

  // ==========================================================================
  // 3. Catalog Filter Tabs & Triggers
  // ==========================================================================
  const tabs = document.querySelectorAll('.js-tab');
  const products = document.querySelectorAll('.js-product-item');

  // Mobile filter bar (dropdown that replaces the tab row)
  const filterBar = document.querySelector('.js-filterbar');
  const filterToggle = document.querySelector('.js-filter-toggle');
  const filterList = document.querySelector('.js-filter-list');
  const filterCurrent = document.querySelector('.js-filter-current');
  const filterOptions = document.querySelectorAll('.js-filter-option');

  function setFilterListOpen(open) {
    if (!filterToggle || !filterList) return;
    filterList.hidden = !open;
    filterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function filterCatalog(category) {
    tabs.forEach(tab => {
      if (tab.dataset.category === category) {
        tab.classList.add('catalog__tab--active');
      } else {
        tab.classList.remove('catalog__tab--active');
      }
    });

    // Keep the dropdown in sync, whichever control triggered the filter
    filterOptions.forEach(opt => {
      const selected = opt.dataset.category === category;
      opt.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (selected && filterCurrent) filterCurrent.textContent = opt.textContent.trim();
    });

    products.forEach(item => {
      const match = category === 'all' || item.dataset.category === category;
      if (match) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterCatalog(tab.dataset.category);
    });
  });

  if (filterToggle) {
    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setFilterListOpen(filterList.hidden);
    });
  }

  filterOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      filterCatalog(opt.dataset.category);
      setFilterListOpen(false);

      // Bring the first bouquet into view under the sticky bars
      if (filterBar) {
        const header = document.getElementById('header');
        const offset = (header ? header.offsetHeight : 0) + filterBar.offsetHeight;
        const grid = document.querySelector('.js-catalog-grid');
        if (grid) {
          const y = grid.getBoundingClientRect().top + window.scrollY - offset - 8;
          if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

  // Close the dropdown on outside tap and on Escape
  document.addEventListener('click', (e) => {
    if (filterBar && !filterBar.contains(e.target)) setFilterListOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setFilterListOpen(false);
  });

  // The filter bar sticks right under the main header; keep the offset exact
  const headerEl = document.getElementById('header');
  function syncHeaderHeight() {
    if (headerEl) {
      document.documentElement.style.setProperty('--header-h', headerEl.offsetHeight + 'px');
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  // Clicking on collection cards scrolls and applies filter
  document.querySelectorAll('.js-filter-trigger').forEach(card => {
    card.addEventListener('click', () => {
      const targetCat = card.dataset.targetCategory;
      const catalogSection = document.getElementById('catalog');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          filterCatalog(targetCat);
        }, 400);
      }
    });
  });

  // ==========================================================================
  // 3b. Preloader — ported 1:1 from tihiy_sad_v1 (initPreloader)
  // ==========================================================================
  // Replaced by the GSAP block below; stays a no-op if GSAP failed to load.
  let playHeroIntro = () => {};

  function initPreloader(done) {
    const el = document.getElementById('preloader');
    if (!el) { done(); return; }

    document.body.classList.add('is-preloading');

    let finished = false;
    const hide = () => {
      if (finished) return; // load handler and safety net must not both fire
      finished = true;
      el.classList.add('preloader--hidden');
      document.body.classList.remove('is-preloading');
      done();
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 900);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reduced ? 100 : 1500;

    if (document.readyState === 'complete') {
      setTimeout(hide, delay);
    } else {
      window.addEventListener('load', () => { setTimeout(hide, delay); });
      setTimeout(hide, delay + 2200); // safety net
    }
  }

  // ==========================================================================
  // 4. GSAP Smooth Animations
  // ==========================================================================
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero entrance. Created paused: `.from()` still renders the start state
    // immediately (hidden), and the timeline plays when the preloader lifts,
    // so the entrance is not wasted behind the overlay.
    const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 1 } });
    playHeroIntro = () => heroTl.play();
    // 1) The hero photo comes in first: fade + a gentle zoom-out of the frame.
    //    The frame is animated rather than the <img>, because the <img> has a
    //    CSS transform transition that would fight GSAP.
    heroTl.from('.hero__media-wrapper', { opacity: 0, duration: 0.9, ease: 'power2.out' })
          .from('.hero__image-frame', { scale: 1.06, duration: 1.4, ease: 'power3.out' }, '<');

    // 2) Then the copy, in the order it appears on screen. On mobile the
    //    overline sits below the buttons, so it goes last there.
    const tagOnTop = !window.matchMedia('(max-width: 900px)').matches;
    const heroText = tagOnTop
      ? ['.hero__tag', '.hero__title', '.hero__description', '.hero__actions']
      : ['.hero__title', '.hero__description', '.hero__actions', '.hero__tag'];

    heroText.forEach((sel, i) => {
      heroTl.from(sel, { opacity: 0, y: i === 0 ? 30 : 20 }, i === 0 ? '-=0.5' : '-=0.75');
    });

    // Scroll Triggered reveals
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.collection-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%'
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: (i % 3) * 0.1
        });
      });

      gsap.utils.toArray('.product-card').forEach((prod, i) => {
        gsap.from(prod, {
          scrollTrigger: {
            trigger: prod,
            start: 'top 90%'
          },
          opacity: 0,
          y: 30,
          duration: 0.7,
          delay: (i % 3) * 0.08
        });
      });

      const careMM = gsap.matchMedia();

      // Wider screens: simple staggered reveal
      careMM.add('(min-width: 641px)', () => {
        gsap.utils.toArray('.care-step').forEach((step, i) => {
          gsap.from(step, {
            scrollTrigger: {
              trigger: step,
              start: 'top 90%'
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: i * 0.08
          });
        });
      });

      // Phones: "stack" — cards are sticky (see CSS); while the next card
      // slides over, the one underneath shrinks slightly and dims.
      careMM.add('(max-width: 640px) and (prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray('.care-step');
        const grid = document.querySelector('.care__grid');
        const headerEl = document.getElementById('header');
        const STACK_TOP = 18;   // must match the CSS sticky offset
        const STACK_STEP = 12;  // must match the CSS per-card step

        // Sticky elements report their *stuck* position, which breaks
        // ScrollTrigger maths. Measure natural offsets with sticky disabled.
        const naturalTops = [];
        function measure() {
          steps.forEach(s => { s.style.position = 'relative'; });
          const gridTop = grid.getBoundingClientRect().top + window.scrollY;
          steps.forEach((s, i) => {
            naturalTops[i] = s.getBoundingClientRect().top + window.scrollY - gridTop;
          });
          steps.forEach(s => { s.style.position = ''; });
        }
        measure();
        ScrollTrigger.addEventListener('refreshInit', measure);

        steps.forEach((step, i) => {
          if (i === steps.length - 1) return;

          gsap.fromTo(step,
            { scale: 1 },
            {
              // Gentle shrink only — no dimming, so cards behind stay bright
              scale: 0.95,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: grid,
                // Start only when the next card actually begins to overlap
                // this one, i.e. reaches the bottom edge of its sticky slot.
                start: () => {
                  const headerH = headerEl ? headerEl.offsetHeight : 0;
                  const slotTop = headerH + STACK_TOP + i * STACK_STEP;
                  return `top+=${naturalTops[i + 1]} ${slotTop + step.offsetHeight}px`;
                },
                // ...and finish when it lands on its own sticky slot.
                end: () => {
                  const headerH = headerEl ? headerEl.offsetHeight : 0;
                  return `top+=${naturalTops[i + 1]} ${headerH + STACK_TOP + (i + 1) * STACK_STEP}px`;
                },
                scrub: 0.3,
                invalidateOnRefresh: true
              }
            }
          );
        });

        return () => ScrollTrigger.removeEventListener('refreshInit', measure);
      });
    }
  }

  // Initial cart render
  renderCart();

  // Start last, once the hero timeline exists
  initPreloader(() => {
    playHeroIntro();
    // Positions were measured under the scroll lock; re-measure now
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
});