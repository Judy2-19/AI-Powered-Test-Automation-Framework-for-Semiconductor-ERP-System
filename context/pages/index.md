# 页面：首页

- 路由：`/index`（路由 `/` 重定向到 `/index`）
- 前置：已登录（通过 storageState 复用登录态）
- 页面标题：米格实验室 - 首页

## 关键区域与精确定位器

| 区域 | 定位器 | 说明 |
|------|--------|------|
| 左侧侧边栏 | `page.locator('[class*="left-menu"]')` | 深色背景侧边栏，包含所有菜单 |
| 侧边栏首页菜单项 | `getByRole('menuitem', { name: '首页' }).first()` | role 为 menuitem 的列表项 |
| 侧边栏订单管理菜单项 | `getByRole('menuitem', { name: '订单管理' }).first()` | 一级菜单 |
| 侧边栏实验室管理菜单项 | `getByRole('menuitem', { name: '实验室管理' }).first()` | 一级菜单 |
| 顶部导航栏 | `page.locator('.v-tool-header')` | 包含面包屑、工具按钮、用户信息 |
| 面包屑首页链接 | `getByText('首页').first()` | 面包屑中的首页链接 |
| 用户头像 | `page.locator('.el-avatar')` | Element Plus 头像组件 |
| 用户姓名 | `getByText('朱婧祎')` | 当前登录用户姓名（测试账号） |
| 消息通知 | `page.locator('.el-badge')` | 带角标的消息按钮 |
| 页脚公司信息 | `getByText('北京聚睿众邦科技有限公司')` | 固定在主内容区底部 |
| 页脚标语 | `getByText('让连接更简单，让服务更贴心')` | 公司标语 |

## 侧边栏菜单项清单（一级菜单）

从页面实际可见的菜单：

| 序号 | 菜单项 | 定位器 |
|------|--------|--------|
| 1 | 首页 | `getByRole('menuitem', { name: '首页' }).first()` |
| 2 | 订单管理 | `getByRole('menuitem', { name: '订单管理' }).first()` |
| 3 | 实验室管理 | `getByRole('menuitem', { name: '实验室管理' }).first()` |
| 4 | 供应商 | `getByRole('menuitem', { name: '供应商' }).first()` |
| 5 | 财务中心 | `getByRole('menuitem', { name: '财务中心' }).first()` |
| 6 | 运营管理 | `getByRole('menuitem', { name: '运营管理' }).first()` |
| 7 | 智能体相关 | `getByRole('menuitem', { name: '智能体相关' }).first()` |
| 8 | 通用管理 | `getByRole('menuitem', { name: '通用管理' }).first()` |
| 9 | 项目管理 | `getByRole('menuitem', { name: '项目管理' }).first()` |

## P0 场景

1. 登录后自动跳转到首页，页面加载完成（验证布局完整性）
2. 侧边栏菜单可见且可点击（验证导航可用性）
3. 顶部导航栏用户信息可见（验证登录态展示）
4. 页面布局正常（验证页脚可见）

## P1 场景（待补充）

1. 侧边栏菜单展开/收起功能
2. 顶部搜索框功能
3. 消息通知角标显示
4. 全屏切换功能

## 成功标准（断言口径）

- 页面加载完成 → URL 为 `/index`，页脚公司信息可见
- 侧边栏可用 → 「首页」菜单项可见且可点击
- 登录态有效 → 用户头像和用户姓名可见
- 布局完整 → 左侧侧边栏 + 顶部导航栏 + 主内容区 + 页脚均可见

## 已知坑

- **菜单动态生成**：侧边栏菜单项由后端根据用户权限动态下发，测试时需确认测试账号 `e2e_admin` 有足够权限看到核心菜单
- **登录态复用**：首页测试依赖 `storageState` 文件，首次运行需先执行登录用例生成，或在 `beforeAll` 中自动登录生成
- **页面标题**：HTML title 为「米格实验室 - 首页」，可用于断言
- **用户姓名**：不同测试账号显示不同用户名，需通过环境变量或动态获取
- **主题切换**：顶部导航栏有主题切换按钮（月亮/太阳图标），当前默认亮色模式（HTML class `light`）

## 登录态复用机制

首页测试通过 `storageState` 复用登录态，避免每次用例都重新登录：

```ts
const AUTH_FILE = 'tests/generated/.auth/user.json'

test.beforeAll(async ({ browser }) => {
  if (existsSync(AUTH_FILE)) return
  // 自动登录生成 storageState
})
test.use({ storageState: AUTH_FILE })
```

这样首页测试用例可独立运行，不依赖登录用例的执行顺序。
