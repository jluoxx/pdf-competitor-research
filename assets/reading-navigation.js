(() => {
  'use strict';
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const key = 'pdf-report-navigation:' + root.href;
  const isApp = !!document.querySelector('#content');
  const fallback = new URL(isApp ? 'index.html#overview' :
    (location.pathname.includes('/hardening-evidence/') ? 'index.html#hardening' :
      location.pathname.includes('/evidence/') ? 'index.html#library' : 'index.html#focus'), root).href;
  const internal = url => typeof url === 'string' && url.startsWith(root.href);
  let stack = [];
  try { stack = JSON.parse(sessionStorage.getItem(key) || '[]').filter(x => internal(x.url)); } catch (_) {}
  let activeURL = location.href;
  const persist = () => { try { sessionStorage.setItem(key, JSON.stringify(stack.slice(-80))); } catch (_) {} };
  function savePosition() {
    const entry = stack[stack.length - 1];
    if (entry && entry.url === activeURL && location.href === activeURL) {
      entry.y = window.scrollY;
      persist();
    }
  }
  const bar = document.createElement('nav');
  bar.className = 'report-backbar' + (isApp ? ' report-backbar-app' : '');
  bar.setAttribute('aria-label', '页面返回导航');
  bar.innerHTML = '<a class="report-back" href="' + fallback + '"><span aria-hidden="true">←</span> 返回上一级</a>' +
    '<a class="report-home" href="' + new URL('index.html#overview', root).href + '">研究首页</a>';
  document.body.insertBefore(bar, isApp ? document.querySelector('#content') : document.body.firstChild);
  function arrive() {
    activeURL = location.href;
    let restore = null;
    const existing = stack.findLastIndex(x => x.url === activeURL);
    if (existing >= 0) {
      stack = stack.slice(0, existing + 1);
      restore = stack[existing].y;
    } else stack.push({url: activeURL, y: 0});
    persist();
    bar.querySelector('.report-back').href = stack.length > 1 ? stack[stack.length - 2].url : fallback;
    if (restore !== null) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, restore)));
  }
  bar.querySelector('.report-back').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    savePosition();
    if (stack.length > 1) {
      stack.pop();
      const previous = stack[stack.length - 1];
      persist();
      if (location.href === previous.url) window.scrollTo(0, previous.y);
      else location.assign(previous.url);
    } else location.assign(fallback);
  });
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; savePosition(); });
    }
  }, {passive: true});
  document.addEventListener('click', savePosition, true);
  window.addEventListener('pagehide', savePosition);
  window.addEventListener('hashchange', arrive);
  window.addEventListener('pageshow', event => { if (event.persisted) arrive(); });
  arrive();
})();
