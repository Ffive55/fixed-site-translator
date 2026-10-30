# 准备上传 GitHub 与发布

## 当前发布方式

本项目是独立派生版本，公开仓库为 [Ffive55/fixed-site-translator](https://github.com/Ffive55/fixed-site-translator)，尚无商店发布地址。自己的仓库使用 `origin`，原来源保留为 `upstream`，不要把修改推送到原作者仓库。

可选择保留派生历史，或从生成的干净源码包创建新仓库。后者不包含原仓库 Git 历史，也不包含本机缓存和截图。两种方式都必须保留许可证、来源说明和源码中的原版权声明。

## 方式一：上传当前工作目录

以下步骤供首次上传或派生到其他账号时参考。当前项目的日常修改使用已配置的 origin，提交后执行 `git push` 即可。如果需要创建自己的另一份仓库，先在 GitHub 建空仓库，不要预先创建 README，再执行：

```powershell
git status --short
npm ci
npm run build
npm test
npm run package
git add .
git diff --cached --stat
git commit -m "feat: prepare multi-site translator for release"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

示例用户名和仓库名必须替换成自己的。如果已经设置了自己的 origin，先用 `git remote -v` 核对，不要盲目覆盖。

## 方式二：从干净源码包上传

解压 `dist/fixed-site-translator-v<版本>-source.zip` 到一个新目录，打开 PowerShell：

```powershell
git init -b main
git add .
git commit -m "feat: initial release of fixed-site translator"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

源码包已经包含可直接加载的扩展目录。后续维护仍可运行 `npm ci`、`npm run upstream:check` 等命令；上游更新器不依赖完整 Git 历史。

## GitHub 自动检查

推送代码或提交 PR 时，CI 在 Windows 与 Linux 上安装锁定依赖、构建并测试，检查生成产物是否同步。手动执行“Build packages”工作流可以生成源码包及三端扩展包供下载。工作流不自动提交、推送、发布或同步上游词库。

GitHub Release 建议上传以下文件，而不是把 ZIP 提交进源码目录：

- `fixed-site-translator-v<版本>-chrome.zip`
- `fixed-site-translator-v<版本>-edge.zip`
- `fixed-site-translator-v<版本>-firefox.zip`
- `fixed-site-translator-v<版本>-source.zip`

发布新版本时修改 package.json 的 version 和 CHANGELOG.md，再构建、测试、打包。版本号会自动同步三端 manifest 与本地更新日志。

## 上传内容

提交源码、网站词库、GitHub 基线和 lock.json、构建后的三端运行文件、测试、文档、package-lock.json、许可证。不要提交 node_modules、dist、.cache、.omo、test-results、截图、API Key、浏览器用户数据或日志。

公开前可查看 `git diff --cached`。源码包已经按白名单收集，但自行添加的新文件仍需检查是否包含账号或密钥。

Firefox 使用本派生版独立的开发标识，不复用原项目商店 ID。本地 ZIP 没有签名；商店发布与签名需要另行办理。
