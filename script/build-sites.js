'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ROOT, loadSites } = require('./site-config');
const normalize = value => value.replace(/\r\n/g, '\n');

function buildSites(check = false) {
  const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const sites = loadSites().filter(site => site.enabled !== false);
  const runtime = normalize(fs.readFileSync(path.join(ROOT, 'extension', 'site-runtime.js'), 'utf8'));
  const guard = normalize(fs.readFileSync(path.join(ROOT, 'extension', 'browser-translation-guard.js'), 'utf8'));
  const preferences = normalize(fs.readFileSync(path.join(ROOT, 'extension', 'site-preferences.js'), 'utf8'));
  const websiteSettings = normalize(fs.readFileSync(path.join(ROOT, 'extension', 'website-settings.js'), 'utf8'));
  const shared = ['sites/catalog.js', 'sites/preferences.js', 'sites/browser-translation-guard.js'];
  const entries = sites.map(site => ({
    matches: site.matches,
    js: [...shared, ...(site.engine === 'github' ? ['locals.js', 'content.js'] : [`sites/${site.id}.js`])],
    run_at: 'document_start'
  }));
  let stale = false;
  function output(relative, value) {
    const target = path.join(ROOT, relative);
    if (check) {
      if (!fs.existsSync(target) || normalize(fs.readFileSync(target, 'utf8')) !== value) {
        console.error(`[sites] 需要构建: ${relative}`);
        stale = true;
      }
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, value);
    }
  }
  for (const browser of ['chrome', 'edge', 'firefox']) {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, browser, 'manifest.json'), 'utf8'));
    manifest.name = '固定网站中文翻译';
    manifest.version = project.version;
    if (project.homepage) manifest.homepage_url = project.homepage;
    else delete manifest.homepage_url;
    if (browser === 'firefox') manifest.browser_specific_settings.gecko.id = 'fixed-site-translator@local.invalid';
    manifest.description = '使用本地词库汉化 GitHub、Tailscale 等已适配网站的界面，支持通过独立网站配置持续扩展。';
    manifest.action.default_title = '固定网站中文翻译';
    manifest.host_permissions = [...new Set(sites.flatMap(site => site.matches))];
    manifest.content_scripts = entries;
    output(`${browser}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
    output(`${browser}/sites/browser-translation-guard.js`, guard);
    output(`${browser}/sites/preferences.js`, preferences);
    output(`${browser}/options/website-settings.js`, websiteSettings);
    output(`${browser}/sites/catalog.js`, `// 自动生成，请修改 sites/<id>/site.json\nconst SUPPORTED_SITES = ${JSON.stringify(sites.map(({ id, name, matches, engine }) => ({ id, name, matches, engine })), null, 2)};\n`);
    for (const site of sites.filter(site => site.engine === 'dictionary')) {
      const content = `// 自动生成，请修改 sites/${site.id}/site.json 和 extension/site-runtime.js\n(() => {\nconst SITE = ${JSON.stringify(site, null, 2)};\n${runtime}\n})();\n`;
      new vm.Script(content, { filename: `${site.id}.js` });
      output(`${browser}/sites/${site.id}.js`, content);
    }
  }
  if (stale) throw new Error('网站构建产物未同步，请执行 npm run build');
  console.log(`[sites] ${check ? '校验' : '构建'}完成: ${sites.map(site => site.name).join('、')}`);
}

if (require.main === module) buildSites(process.argv.includes('--check'));
module.exports = { buildSites };
