'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// 补回上游 package.json 引用但未提交的测试：验证真正构造的请求，不调用网络。
let captured;
const context = {
  mapTargetLangForDeepL: () => 'ZH',
  normalizeTranslationText: value => value
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../chrome/src/providers/cloud-translators.js'), 'utf8'), context);
context.proxyFetchJson = async request => {
  captured = request;
  return { translations: [{ text: '设备' }] };
};
(async () => {
  const response = await context.translateWithDeepL(['Machines'], { url: 'https://api-free.deepl.com/v2/translate', key: 'test-key' });
  assert.equal(captured.headers.Authorization, 'DeepL-Auth-Key test-key');
  assert.equal(captured.headers['Content-Type'], 'application/json');
  assert.equal(captured.method, 'POST');
  assert.deepEqual(JSON.parse(captured.body), { text: ['Machines'], target_lang: 'ZH' });
  assert.equal(response.translations[0], '设备');
  console.log('PASS DeepL 请求认证');
})().catch(error => { console.error(error); process.exitCode = 1; });
