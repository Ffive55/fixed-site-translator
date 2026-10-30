<p align="center"><img src="assets/extension-icon.svg" width="96" alt="固定网站中文翻译"></p>

# 固定网站中文翻译

面向指定网站的中文界面翻译扩展。使用本地词库翻译菜单、按钮、说明与提示，支持按网站独立启用，并通过独立配置持续增加网站。

基于 [MaydayV/github-chinese](https://github.com/MaydayV/github-chinese) 开发，GitHub 词库源自 [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese)。这是独立维护的派生版本，当前版本 **3.3.0**，支持 Chrome、Edge、Firefox。

[项目仓库](https://github.com/Ffive55/fixed-site-translator) · [问题反馈](https://github.com/Ffive55/fixed-site-translator/issues) · [自动检查](https://github.com/Ffive55/fixed-site-translator/actions)

## 支持的网站

| 网站 | 覆盖范围 | 方式 |
| --- | --- | --- |
| GitHub | GitHub 及上游支持的 Gist、Skills、Education、Status；保留原有界面汉化功能 | 本地词库；可选正文翻译 |
| Tailscale | 官网主要功能区、工作台常见页面、登录页 | 本地词库，无需翻译 API |
| Docker 官网 | 首页、主要导航、产品入口及价格页面常见文案 | 本地词库，无需翻译 API |
| Docker 工作台与 Hub | 账户设置、账单、仓库、镜像搜索与详情、用量等常见界面 | 本地词库，无需翻译 API |

官网、控制台和登录页的域名分别配置。未收录的文字保留原文；代码、输入值、技术标识和业务数据不会因为追求全中文而强制改写。已知范围和实际页面检查记录见 [Tailscale 页面检查记录](docs/Tailscale页面检查记录.md)和 [Docker 页面检查记录](docs/Docker页面检查记录.md)。

## 功能

- **网站独立开关**：在“翻译设置”中分别启用或禁用 GitHub、Tailscale、Docker 官网及 Docker 工作台与 Hub；修改自动保存。
- **浏览器翻译协作**：启用站点时避免 Edge/Chrome 重复自动翻译；禁用后刷新对应页面并恢复浏览器自带翻译可用，自动与否沿用浏览器设置。
- **动态页面**：监听新增内容、文字及提示属性，处理 SPA 路由切换。
- **可扩展配置**：每个网站独立放在 `sites/<id>/site.json`，新站点自动进入设置页。
- **可选 GitHub 内容翻译**：保留 README、About、Issue、PR、Release 等功能及接口设置；默认关闭，需要自行配置服务。
- **上游词条同步**：检查并三方合并原仓库的 GitHub 词库，保留本地改动，遇到冲突停止，检查失败自动回滚。

## 安装

本项目提供源码和扩展包，**没有以本项目名义发布浏览器商店版本**。上游的商店扩展不包含本项目的新增功能。已发布的扩展包可从 [GitHub Releases](https://github.com/Ffive55/fixed-site-translator/releases) 下载；发布版本可能落后于主分支源码。

### Edge / Chrome

1. 下载仓库源码，或解压对应浏览器的发布包。
2. 打开 `edge://extensions/` 或 `chrome://extensions/`，开启开发人员模式。
3. 点击“加载解压缩的扩展”：源码分别选择 `edge/` 或 `chrome/`；发布包选择解压后含 `manifest.json` 的目录。
4. 刷新目标网站，打开扩展弹窗 → **翻译设置**，选择需要插件翻译的网站。

更新本地代码后需重新加载扩展，并刷新已经打开的网站一次。之后切换独立网站开关会自动刷新该网站已打开页面。

### Firefox

在 `about:debugging#/runtime/this-firefox` 中选择“临时载入附加组件”，打开 `firefox/manifest.json`。临时加载在重启浏览器后失效；本地包不含商店签名。

## 开发与打包

需要 **Node.js 24.15+** 和 **Git**。PowerShell、Linux、macOS 均可使用以下命令：

```sh
npm ci
npm run build
npm test
npm run package
```

`dist/` 中生成 Chrome、Edge、Firefox 扩展包及一份干净的源码包。扩展包包含许可证、来源说明和运行必需文件；源码包包含源代码、词库基线、测试和构建工具。不会包含 `.git/`、依赖、截图、临时日志、同步缓存或本机配置。

生成好的 `chrome/`、`edge/`、`firefox/` 运行文件会提交到 Git，因此下载源码也可直接加载。

修改图标时编辑 `assets/extension-icon.svg`，再执行 `npm run build:icons`。

## 新增网站

```sh
npm run site:add -- example https://example.com "示例网站"
```

补充生成的 `sites/example/site.json` 中的域名、词库及页面规则，然后运行构建和测试。完整字段说明见 [多网站翻译使用说明](docs/多网站翻译使用说明.md)。

新建配置仅生成起点，实际网站仍需验证。遇到 iframe、Shadow DOM 或复杂编辑器时，可能需要额外适配。

## 从原仓库更新 GitHub 词条

默认来源是 **MaydayV/github-chinese → chrome 分支 → chrome/locals.js**，与本项目的扩展代码保持来源一致。

```sh
# 仅检查，不改动词库
npm run upstream:check

# 三方合并、同步到三种浏览器、运行测试；失败自动恢复
npm run upstream:update
```

同步记录保存在 `upstream/github-chinese/lock.json`。不执行整仓库覆盖，不改动 Tailscale、独立网站开关、图标或扩展引擎。详细的冲突处理、回滚和来源说明见 [上游词条同步](docs/上游词条同步.md)。

以后让维护助手执行时，可以直接说：**“同步原仓库最新词条，保留本地网站适配。”** 仓库根目录的 [AGENTS.md](AGENTS.md) 已记录对应流程。

Tailscale 词库由本项目维护，不属于这个 GitHub 上游仓库；更新它需要重新核对 Tailscale 界面。

## 目录

```text
sites/                   网站注册、词库与页面规则
extension/               通用引擎、网站开关、浏览器翻译保护
chrome/src/              保留的 GitHub 专用引擎源码
chrome/ edge/ firefox/   可直接加载的扩展（含生成产物）
upstream/github-chinese/ 上游同步基线和提交锁定信息
script/                  构建、打包、同步和检查工具
tests/                   多网站及同步流程测试
docs/                    使用、维护、发布文档
.github/workflows/       GitHub 自动检查
```

## 数据与权限

界面词库翻译在浏览器本地执行。网站偏好和原 GitHub 接口配置使用扩展 `storage.sync`，可能跟随浏览器账号同步；翻译缓存和记录使用 `storage.local`。启用在线内容翻译后，待翻译内容会发送到用户配置的服务。不要把自己的 API Key、浏览器配置或运行日志提交到仓库。

默认访问权限只覆盖已注册的网站；原 GitHub 翻译 API 使用按需申请的可选主机权限。上游同步是开发维护命令，扩展不会自行下载或执行远程词库。

## 发布、贡献和许可

- [准备上传 GitHub 与发布](docs/GitHub发布指南.md)
- [贡献指南](CONTRIBUTING.md)
- [更新日志](CHANGELOG.md)
- [来源与许可](THIRD_PARTY_NOTICES.md)

项目按 **GPL-3.0-or-later** 发布，保留上游版权声明。许可证全文见 [LICENSE](LICENSE)。
