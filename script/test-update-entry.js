'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { buildChangelog } = require('./build-changelog');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
buildChangelog(true);
for (const browser of ['chrome', 'edge', 'firefox']) {
  for (const file of ['background.js', 'popup/popup.js', 'popup/popup.html', 'options/changelog.html']) {
    assert.equal(read(`${browser}/${file}`), read(`chrome/${file}`));
  }
  const manifest = JSON.parse(read(`${browser}/manifest.json`));
  assert.equal(manifest.homepage_url, JSON.parse(read('package.json')).homepage, '扩展主页应指向本项目');
  assert.ok(!manifest.homepage_url?.includes('maydayv.github.io'), '不冒用上游官网');
  assert.deepEqual(manifest.permissions, ['storage']);
}
assert.ok(read('chrome/background.js').includes("chrome.runtime.getURL('options/changelog.html')"));
assert.ok(read('chrome/popup/popup.js').includes('openTab(CHANGELOG_URL)'));
assert.ok(!read('chrome/popup/popup.js').includes('openTab(pending.url'));
assert.match(read('chrome/popup/popup.css'), /\.update-notice\[hidden\]\s*\{\s*display:\s*none/);
console.log('PASS 本项目本地更新日志与三端一致性');
