// SPDX-License-Identifier: MPL-2.0
(function attachWalletReorder(global) {
  const bound = new WeakSet();
  const animations = new WeakMap();
  const reducedMotion = global.matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;
  let liveRegion;
  const cardSelector = '[data-wallet-id]';
  const wrappers = (rail) => Array.from(rail.children).filter((node) => node.matches('.wallet-card-wrap:not(.wallet-drag-source)'));
  const idOf = (node) => node.dataset.walletReorderId || node.querySelector(cardSelector).dataset.walletId;
  const ids = (rail) => wrappers(rail).map(idOf);

  function announce(message) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.className = 'wallet-reorder-status';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  }

  function animateLayout(rail, change, placeholder = null) {
    const nodes = wrappers(rail);
    const before = new Map(nodes.map((node) => [node, node.getBoundingClientRect()]));
    nodes.forEach((node) => { animations.get(node)?.cancel(); animations.delete(node); });
    change();
    if (reducedMotion.matches) return;
    for (const node of nodes) {
      if (node === placeholder) continue;
      const previous = before.get(node);
      const next = node.getBoundingClientRect();
      const x = previous.left - next.left;
      const y = previous.top - next.top;
      if (Math.abs(x) + Math.abs(y) < .5) continue;
      const animation = node.animate([
        { transform: `translate3d(${x}px,${y}px,0)` }, { transform: 'none' },
      ], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
      animations.set(node, animation);
      animation.finished.then(() => { if (animations.get(node) === animation) animations.delete(node); }).catch(() => {});
    }
  }

  function moveTo(rail, node, index) {
    const peers = wrappers(rail).filter((item) => item !== node);
    rail.insertBefore(node, peers[index] || rail.querySelector('[data-wallet-add]'));
  }

  function bind(rail, options) {
    if (!rail || bound.has(rail)) return;
    bound.add(rail);
    rail.addEventListener('dragstart', (event) => event.preventDefault());
    // A quick swipe remains native scrolling. Once a held card lifts, stop
    // native panning before its first touchmove so the pointer stays captured.
    rail.addEventListener('touchmove', (event) => {
      if (active?.rail === rail && active.dragging) event.preventDefault();
    }, { passive: false });
    rail.addEventListener('contextmenu', (event) => {
      if (active?.rail === rail && active.touch) event.preventDefault();
    });

    rail.addEventListener('keydown', (event) => {
      if (active || !event.altKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const wrap = event.target.closest('.wallet-card-wrap');
      if (!wrap || wrap.parentElement !== rail) return;
      event.preventDefault();
      event.stopPropagation();
      const nodes = wrappers(rail);
      const from = nodes.indexOf(wrap);
      const to = Math.max(0, Math.min(nodes.length - 1, from + (event.key === 'ArrowLeft' ? -1 : 1)));
      if (from === to) return;
      const card = wrap.querySelector(cardSelector);
      const walletId = card.dataset.walletId;
      moveTo(rail, wrap, to);
      options.onCommit(ids(rail), { walletId, scrollLeft: rail.scrollLeft, keyboard: true });
      announce(options.moved(card.querySelector('.wallet-card-name').textContent, to + 1, nodes.length));
    });

    rail.addEventListener('pointerdown', (event) => {
      if (active || !event.isPrimary || event.button !== 0 || wrappers(rail).length < 2) return;
      if (event.target.closest('button,a,input,select,textarea')) return;
      const card = event.target.closest(cardSelector);
      const wrap = card?.closest('.wallet-card-wrap');
      if (!wrap || wrap.parentElement !== rail) return;
      const start = { x: event.clientX, y: event.clientY };
      const original = wrappers(rail);
      const rect = wrap.getBoundingClientRect();
      const grab = { x: start.x - rect.left, y: start.y - rect.top };
      const walletId = card.dataset.walletId;
      const name = card.querySelector('.wallet-card-name').textContent;
      let point = { ...start };
      let preview;
      let placeholder;
      let dragging = false;
      let finished = false;
      let frame;
      let previousTime;
      let holdTimer;
      const touch = event.pointerType === 'touch';
      active = { rail, touch, cancel: () => finish(false), dragging: false };

      const isInside = () => {
        const bounds = rail.getBoundingClientRect();
        return point.x >= bounds.left - 32 && point.x <= bounds.right + 32
          && point.y >= bounds.top - 48 && point.y <= bounds.bottom + 48;
      };

      function begin() {
        clearTimeout(holdTimer);
        dragging = true;
        active.dragging = true;
        options.onDragState(true);
        rail.setPointerCapture(event.pointerId);
        preview = wrap.cloneNode(true);
        preview.classList.add('wallet-drag-preview');
        preview.setAttribute('aria-hidden', 'true');
        preview.inert = true;
        preview.querySelectorAll('[id],[data-wallet-id],[data-wallet-selector],[data-wallet-action]').forEach((node) => {
          for (const attribute of ['id', 'data-wallet-id', 'data-wallet-selector', 'data-wallet-action']) node.removeAttribute(attribute);
        });
        Object.assign(preview.style, {
          width: `${rect.width}px`, height: `${rect.height}px`, minWidth: '0',
          transformOrigin: `${grab.x}px ${grab.y}px`,
          transform: `translate3d(${point.x - grab.x}px,${point.y - grab.y}px,0) scale(${reducedMotion.matches ? 1 : 1.02})`,
        });
        document.body.appendChild(preview);
        // Keep the original touch target connected and stationary in the DOM.
        // Moving it during a touch gesture can make the browser lose pointerup.
        placeholder = wrap.cloneNode(false);
        placeholder.classList.add('wallet-drag-placeholder');
        placeholder.dataset.walletReorderId = walletId;
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.style.height = `${rect.height}px`;
        wrap.classList.add('wallet-drag-source');
        wrap.setAttribute('aria-hidden', 'true');
        rail.insertBefore(placeholder, wrap);
        rail.classList.add('wallet-rail-dragging');
        document.body.classList.add('wallet-reordering');
        frame = requestAnimationFrame(paint);
      }

      function paint(time) {
        if (finished) return;
        if (!rail.isConnected) { finish(false); return; }
        const bounds = rail.getBoundingClientRect();
        const elapsed = Math.min(32, previousTime ? time - previousTime : 16);
        previousTime = time;
        if (isInside()) {
          const edge = Math.min(64, bounds.width / 4);
          const left = Math.max(0, Math.min(1, (bounds.left + edge - point.x) / edge));
          const right = Math.max(0, Math.min(1, (point.x - bounds.right + edge) / edge));
          rail.scrollLeft += (right * right - left * left) * .8 * elapsed;
          const nodes = wrappers(rail);
          const center = point.x - bounds.left + rail.scrollLeft - grab.x + rect.width / 2;
          const centers = nodes.map((node) => node.offsetLeft + node.offsetWidth / 2);
          let index = 0;
          for (let i = 1; i < centers.length; i += 1) {
            if (center > (centers[i - 1] + centers[i]) / 2) index = i;
          }
          if (index !== nodes.indexOf(placeholder)) animateLayout(rail, () => moveTo(rail, placeholder, index), placeholder);
        }
        preview.style.transform = `translate3d(${point.x - grab.x}px,${point.y - grab.y}px,0) scale(${reducedMotion.matches ? 1 : 1.02})`;
        frame = requestAnimationFrame(paint);
      }

      function move(moveEvent) {
        if (moveEvent.pointerId !== event.pointerId || finished) return;
        if (moveEvent.pointerType === 'mouse' && moveEvent.buttons === 0) { finish(false); return; }
        point = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (!dragging) {
          if (Math.hypot(point.x - start.x, point.y - start.y) < 6) return;
          // Moving before the hold completes gives the gesture back to the
          // browser, including horizontal rail swipes and vertical page scroll.
          if (touch) { finish(false); return; }
          begin();
        }
        moveEvent.preventDefault();
      }

      function up(upEvent) {
        if (upEvent.pointerId !== event.pointerId) return;
        point = { x: upEvent.clientX, y: upEvent.clientY };
        if (dragging) { cancelAnimationFrame(frame); paint(performance.now()); }
        finish(true);
      }

      function cancel() { finish(false); }
      function key(keyEvent) { if (keyEvent.key === 'Escape') { keyEvent.preventDefault(); finish(false); } }

      function finish(commit) {
        if (finished) return;
        finished = true;
        clearTimeout(holdTimer);
        cancelAnimationFrame(frame);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', cancel);
        document.removeEventListener('keydown', key);
        global.removeEventListener('blur', cancel);
        global.removeEventListener('resize', cancel);
        if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
        if (!dragging) { active = null; return; }
        const accept = commit && rail.isConnected && isInside();
        if (!accept) animateLayout(rail, () => original.forEach((node) => rail.insertBefore(node === wrap ? placeholder : node, rail.querySelector('[data-wallet-add]'))), placeholder);
        const next = ids(rail);
        const changed = accept && next.some((id, i) => id !== original[i].querySelector(cardSelector).dataset.walletId);
        const scrollLeft = rail.scrollLeft;
        const cleanup = () => {
          preview.remove();
          placeholder.replaceWith(wrap);
          wrap.classList.remove('wallet-drag-source');
          wrap.removeAttribute('aria-hidden');
          rail.classList.remove('wallet-rail-dragging');
          document.body.classList.remove('wallet-reordering');
          active = null;
          if (changed) {
            options.onCommit(next, { walletId, scrollLeft, keyboard: false });
            announce(options.moved(name, next.indexOf(walletId) + 1, next.length));
          }
          setTimeout(() => { if (!active?.dragging) options.onDragState(false); }, 0);
        };
        if (!accept || reducedMotion.matches || !rail.isConnected) { cleanup(); return; }
        const destination = placeholder.getBoundingClientRect();
        const dock = preview.animate([
          { transform: preview.style.transform },
          { transform: `translate3d(${destination.left}px,${destination.top}px,0) scale(1)` },
        ], { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
        dock.finished.then(cleanup, cleanup);
      }

      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', cancel);
      document.addEventListener('keydown', key);
      global.addEventListener('blur', cancel);
      global.addEventListener('resize', cancel);
      if (touch) holdTimer = setTimeout(begin, 240);
    });
  }

  global.KontanaWalletReorder = { bind };
}(window));
