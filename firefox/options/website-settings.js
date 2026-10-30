(() => {
  'use strict';
  async function initWebsites() {
    const preferences = globalThis.FixedSitePreferences;
    const list = document.getElementById('websiteList');
    const status = document.getElementById('websiteStatus');
    const summary = document.getElementById('websiteSummary');
    const rows = new Map();
    function render(settings) {
      summary.textContent = settings.enable_extension === false
        ? '翻译总开关已关闭。各网站的选择会保留，开启总开关后生效。'
        : '开启的网站使用插件词库；关闭的网站交由浏览器翻译。';
      for (const [id, row] of rows) {
        row.input.checked = settings[preferences.keyFor(id)] !== false;
        const active = preferences.isEnabled(settings, id);
        row.state.textContent = active ? '插件翻译' : '浏览器翻译';
        row.state.classList.toggle('is-active', active);
      }
    }
    for (const site of SUPPORTED_SITES) {
      const row = document.createElement('label');
      row.className = 'website-row';
      const info = document.createElement('span');
      info.className = 'website-info';
      const title = document.createElement('strong');
      title.textContent = site.name;
      const domains = document.createElement('span');
      domains.className = 'website-domains';
      domains.textContent = site.matches.map(pattern => pattern.replace(/^https?:\/\//, '').replace(/\/\*$/, '')).join(' · ');
      info.append(title, domains);
      const state = document.createElement('span');
      state.className = 'website-state';
      const switchWrap = document.createElement('span');
      switchWrap.className = 'ios-switch-wrap';
      const input = document.createElement('input');
      input.id = `website-${site.id}`;
      input.type = 'checkbox';
      input.className = 'ios-switch-input';
      input.setAttribute('aria-label', `启用 ${site.name} 翻译`);
      input.disabled = true;
      const switchVisual = document.createElement('span');
      switchVisual.className = 'ios-switch';
      switchVisual.setAttribute('aria-hidden', 'true');
      switchWrap.append(input, switchVisual);
      row.append(info, state, switchWrap);
      list.append(row);
      rows.set(site.id, { input, state });
      input.addEventListener('change', async () => {
        const desired = input.checked;
        input.disabled = true;
        status.textContent = '正在保存…';
        status.classList.remove('is-error');
        try {
          await chrome.storage.sync.set({ [preferences.keyFor(site.id)]: desired });
          status.textContent = desired && preferences.settings.enable_extension === false
            ? `已保存 ${site.name} 的启用选择，开启翻译总开关后生效。`
            : desired
            ? `已启用 ${site.name} 的插件翻译。该网站已打开的页面会自动刷新。`
            : `已停用 ${site.name} 的插件翻译，浏览器自带翻译恢复可用。该网站已打开的页面会自动刷新。`;
        } catch (error) {
          render(preferences.settings);
          status.textContent = '保存失败，请重试。';
          status.classList.add('is-error');
          console.error(error);
        } finally {
          input.disabled = false;
        }
      });
    }
    await preferences.ready;
    preferences.subscribe(render);
    for (const row of rows.values()) row.input.disabled = false;
  }
  document.addEventListener('DOMContentLoaded', () => {
    initWebsites().catch(error => {
      const status = document.getElementById('websiteStatus');
      status.textContent = '网站设置加载失败，请刷新设置页重试。';
      status.classList.add('is-error');
      console.error(error);
    });
  });
})();
