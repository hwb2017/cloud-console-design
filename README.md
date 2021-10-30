# cloud-console-design
参考Iaas云服务商的控制台UI实现

## 发布流程
1. 提交最新的更新，并且要包含对 package.json version 字段的变更, git push commit
2. 执行 npm publish . 发布 npm 包，prepublishOnly生命周期的脚本中会自动执行一些检查，主要包括 git status 检查，version 校验，产物构建，git tag
3. git push tag