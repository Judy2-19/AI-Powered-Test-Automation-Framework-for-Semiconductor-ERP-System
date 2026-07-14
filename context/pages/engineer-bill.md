# 页面：采购对账管理

- 路由：`/orders/engineer-bill`
- 前置：已登录（通过 storageState 复用登录态）
- 页面标题：米格实验室 - 采购对账管理
- 侧边栏路径：订单管理 → 采购对账管理

## 关键区域与精确定位器

| 区域 | 定位器 | 说明 |
|------|--------|------|
| 面包屑 | `getByRole('link', { name: '采购对账管理' })` | 当前页面面包屑 |
| id 输入框 | `getByRole('textbox', { name: 'id' })` | 文本输入 |
| 对账单名称输入框 | `getByRole('textbox', { name: '对账单名称' })` | 文本输入 |
| 对账单编号输入框 | `getByRole('textbox', { name: '对账单编号' })` | 文本输入 |
| 搜索按钮 | `getByRole('button', { name: '搜索' })` | 搜索操作 |
| 重置按钮 | `getByRole('button', { name: '重置' })` | 重置表单 |
| 新增按钮 | `getByRole('button', { name: '新增' })` | 新增对账单 |
| 开发票按钮 | `getByRole('button', { name: '开发票' })` | 开发票操作 |
| 付款按钮 | `getByRole('button', { name: '付款' })` | 付款操作 |
| 导出按钮 | `getByRole('button', { name: '导出' })` | 导出数据 |
| 展开按钮 | `getByRole('button', { name: '展开' })` | 显示更多搜索条件 |
| 详情按钮 | `getByRole('button', { name: '详情' })` | 每行操作按钮 |
| 编辑按钮 | `getByRole('button', { name: '编辑' })` | 每行操作按钮 |
| 确认成功按钮 | `getByRole('button', { name: '确认成功' })` | 每行操作按钮 |
| 确认对账按钮 | `getByRole('button', { name: '确认对账' })` | 每行操作按钮 |
| 更多按钮 | `getByRole('button', { name: '更多' })` | 每行操作按钮 |
| 关联按钮 | `getByRole('button', { name: '关联' })` | 关联操作 |
| 采购订单标签 | `getByRole('tab', { name: '采购订单' })` | 标签页 |
| 数据表格 | `page.locator('.el-table').first()` | Element Plus 表格组件 |

## P0 场景

1. 页面加载完成，表格数据可见（验证页面可访问性）
2. 搜索功能：输入对账单名称搜索（验证搜索有效性）
3. 重置功能：搜索后点击重置，表单清空（验证重置有效性）
4. 新增按钮可点击（验证入口可用性）
5. 标签页切换：采购订单（验证标签页功能）

## P1 场景（待补充）

1. id 搜索功能
2. 对账单编号搜索
3. 详情/编辑操作
4. 开发票/付款操作
5. 确认成功/确认对账操作
6. 关联操作
7. 导出功能

## 成功标准（断言口径）

- 页面加载完成 → URL 为 `/orders/engineer-bill`，表格可见，面包屑显示「采购对账管理」
- 搜索有效 → 输入关键词后表格数据更新
- 重置有效 → 点击重置后搜索表单清空，表格恢复全量数据
- 新增可用 → 新增按钮可见且可点击
- 标签页切换 → 切换后标签激活状态变化

## 已知坑

- **动态路由**：该页面路由由后端菜单动态生成，需确认测试账号有权限访问
- **登录态复用**：依赖 `storageState` 文件，首次运行需先执行登录用例或自动登录生成
- **表格数据**：表格数据来自后端接口，测试时需确保有测试数据
- **下拉框**：部分下拉框为远程搜索，输入后会触发 API 请求获取选项

## 登录态复用机制

同首页测试，通过 `storageState` 复用登录态：

```ts
const AUTH_FILE = 'tests/generated/.auth/user.json'

test.beforeAll(async ({ browser }) => {
  if (existsSync(AUTH_FILE)) return
})
test.use({ storageState: AUTH_FILE })
```
