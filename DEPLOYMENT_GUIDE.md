# 游戏部署与外网访问指南

本指南将帮助您将游戏部署到网络上，使局域网外的玩家也能访问和游玩。

## 方法一：部署到云服务器或托管平台（推荐）

这是最稳定可靠的方法，适合长期提供游戏服务。

### 步骤 1：准备构建游戏

首先，确保您已构建好可以部署的游戏版本：

```bash
# 使用项目中的构建命令
npm run build
# 或
pnpm build
```

构建完成后，您的游戏文件将位于 `dist/static` 目录中。

### 步骤 2：选择部署平台

您可以选择以下任意一个平台来部署您的游戏：

#### 选项 A：Vercel（推荐）
1. 访问 [Vercel](https://vercel.com/) 并注册账号
2. 点击"New Project"按钮
3. 选择"Import Git Repository"
4. 连接您的GitHub/GitLab/Bitbucket账号
5. 选择您的游戏项目仓库
6. 配置项目设置：
   - Framework Preset: 选择 `Vite`
   - Root Directory: 保持默认
   - Build Command: `pnpm build`
   - Output Directory: `dist/static`
7. 点击"Deploy"按钮
8. 部署完成后，您将获得一个公共URL，任何人都可以通过这个URL访问游戏

#### 选项 B：Netlify
1. 访问 [Netlify](https://www.netlify.com/) 并注册账号
2. 点击"Add new site" > "Import an existing project"
3. 连接您的代码仓库
4. 配置构建设置：
   - Build Command: `pnpm build`
   - Publish Directory: `dist/static`
5. 点击"Deploy site"
6. 等待部署完成，获取公共URL

#### 选项 C：GitHub Pages
1. 确保您的项目已上传至GitHub
2. 在项目根目录创建一个 `.github/workflows/deploy.yml` 文件，内容如下：
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install pnpm
           run: npm install -g pnpm
         - name: Install dependencies
           run: pnpm install
         - name: Build
           run: pnpm build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist/static
   ```
3. 提交并推送这个文件到GitHub
4. 在GitHub仓库的Settings > Pages中，设置Source为"GitHub Actions"
5. GitHub Actions将自动构建并部署您的游戏
6. 部署完成后，您可以通过 `https://<username>.github.io/<repository>` 访问游戏

## 方法二：使用内网穿透工具（临时共享）

如果您只是想临时让局域网外的朋友访问游戏，可以使用内网穿透工具。

### 选项 A：ngrok（推荐）
1. 访问 [ngrok官网](https://ngrok.com/) 注册账号并下载客户端
2. 安装并登录ngrok
3. 启动您的本地开发服务器：
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```
4. 在另一个终端中运行：
   ```bash
   ngrok http 3000
   ```
5. ngrok将生成一个公共URL，复制这个URL分享给朋友

### 选项 B：localtunnel
1. 全局安装localtunnel：
   ```bash
   npm install -g localtunnel
   ```
2. 启动您的本地开发服务器
3. 运行：
   ```bash
   lt --port 3000
   ```
4. 获取生成的公共URL并分享

## 方法三：配置路由器端口转发（高级用户）

如果您有公网IP，可以配置路由器的端口转发功能。

### 步骤：
1. 确定您的计算机在局域网中的IP地址（通常是 `192.168.x.x` 格式）
2. 访问路由器管理界面（通常在浏览器中输入 `192.168.1.1` 或 `192.168.0.1`）
3. 登录路由器管理账号
4. 找到"端口转发"或"虚拟服务器"设置
5. 添加一条新规则：
   - 外部端口：选择一个端口（如 80 或 8080）
   - 内部IP：输入您计算机的局域网IP
   - 内部端口：3000（开发服务器端口）
   - 协议：TCP
6. 保存设置
7. 查找您的公网IP地址（可以通过搜索"我的IP地址"获取）
8. 分享 `http://<您的公网IP>:<外部端口>` 给朋友

## 注意事项

1. **性能与稳定性**：
   - 云服务部署提供最稳定的体验
   - 内网穿透工具可能有带宽限制，适合临时分享
   - 端口转发受限于您的网络上行速度和ISP政策

2. **数据存储**：
   - 本游戏使用浏览器的localStorage存储游戏进度
   - 每个玩家的游戏数据仅存储在自己的设备上，不会同步到服务器

3. **安全性**：
   - 如使用端口转发，请确保了解相关安全风险
   - 考虑设置简单的访问控制机制（如需）

4. **更新游戏**：
   - 使用云服务部署时，每次推送代码到仓库会自动更新游戏
   - 使用内网穿透或端口转发时，需要重启服务才能应用更新

## 常见问题解答

**Q: 为什么朋友访问时游戏没有加载完全？**
A: 检查网络连接是否稳定，尝试清除浏览器缓存或使用无痕模式访问。

**Q: 游戏存档可以在不同设备间同步吗？**
A: 目前不支持自动同步。玩家可以使用游戏内的"保存"功能生成存档码，然后在其他设备上使用"加载"功能恢复进度。

**Q: 如何自定义部署的域名？**
A: 大多数云服务平台都支持绑定自定义域名，具体步骤请参考各平台的文档。

按照以上方法之一部署后，局域网外的朋友就可以访问并游玩您的游戏了！