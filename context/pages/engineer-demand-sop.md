# 页面：工程师需求SOP管理

- 路由：`/orders/engineer-demand-sop`
- 前置：已登录（通过 storageState 复用登录态）
- 页面标题：米格实验室 - 采购SOP管理管理（注：实际显示为采购SOP管理，路由为engineer-demand-sop）
- 侧边栏路径：订单管理 → 采购SOP管理管理

## 关键区域与精确定位器

| 区域 | 定位器 | 说明 |
|------|--------|------|
| 搜索表单 | `page.locator('.el-form')` | 内联搜索表单 |
| id 输入框 | `getByLabel('id')` | 数字输入，支持回车搜索 |
| 样品名称输入框 | `getByLabel('样品名称')` | 文本输入，支持回车搜索 |
| 样品数量输入框 | `getByLabel('样品数量')` | 数字输入框（带加减按钮） |
| 搜索按钮 | `getByRole('button', { name: '搜索' })` | 蓝色主按钮 |
| 重置按钮 | `getByRole('button', { name: '重置' })` | 普通按钮 |
| 新增按钮 | `getByRole('button', { name: '新增' })` | 蓝色主按钮，带加号图标 |
| 快速新增按钮 | `getByRole('button', { name: '快速新增' })` | 蓝色主按钮，带加号图标 |
| 展开按钮 | `getByRole('button', { name: '展开' })` | 显示更多搜索条件 |
| 数据表格 | `page.locator('.el-table')` | Element Plus 表格组件 |
| 表格 ID 列 | `getByRole('columnheader', { name: 'ID' })` | 可排序 |
| 表格样品名称列 | `getByRole('columnheader', { name: '样品名称' })` | 可排序 |
| 表格样品数量列 | `getByRole('columnheader', { name: '样品数量' })` | 可排序 |
| 表格几日交付列 | `getByRole('columnheader', { name: '几日交付' })` | 可排序 |
| 表格操作列 | `getByRole('columnheader', { name: '操作' })` | 详情/编辑/更多 |
| 详情按钮 | `getByRole('button', { name: '详情' })` | 每行操作按钮 |
| 编辑按钮 | `getByRole('button', { name: '编辑' })` | 每行操作按钮 |
| 更多按钮 | `getByRole('button', { name: '更多' })` | 每行操作按钮 |

## P0 场景

1. 页面加载完成，表格数据可见（验证页面可访问性）
2. 搜索功能：输入样品名称搜索，结果过滤（验证搜索有效性）
3. 重置功能：搜索后点击重置，表单清空（验证重置有效性）
4. 新增按钮可点击（验证入口可用性）
5. 快速新增按钮可点击（验证快速新增入口可用性）
6. 编辑操作：点击编辑按钮，修改数据（验证编辑功能）
7. 更多操作：点击更多，执行复制/删除（验证更多操作菜单）
8. 新增操作：点击新增按钮，填写表单并提交（验证新增功能）
9. 表格排序：点击ID列排序箭头，验证升序/降序排序（验证排序功能）
10. 表格排序：点击样品名称列排序箭头（验证排序功能）
11. 表格排序：点击样品数量列排序箭头（验证排序功能）
12. 表格排序：点击几日交付列排序箭头（验证排序功能）

## P1 场景（待补充）

1. id 搜索功能
2. 样品数量搜索功能
3. 展开/收起搜索条件
4. 详情操作

## 成功标准（断言口径）

- 页面加载完成 → URL 为 `/orders/engineer-demand-sop`，表格可见，面包屑显示「采购SOP管理管理」
- 搜索有效 → 输入关键词后表格数据更新
- 重置有效 → 点击重置后搜索表单清空，表格恢复全量数据
- 新增可用 → 新增按钮可见且可点击
- 快速新增可用 → 快速新增按钮可见且可点击

## 已知坑

- **路由与标题不一致**：URL 为 `/orders/engineer-demand-sop`，但页面标题显示「采购SOP管理管理」，需以 URL 为准断言
- **动态路由**：该页面路由由后端菜单动态生成，需确认测试账号有权限访问
- **登录态复用**：依赖 `storageState` 文件，首次运行需先执行登录用例或自动登录生成
- **搜索条件展开**：部分搜索条件（期望几日交付、模板、类型、客户信息等）默认隐藏，点击「展开」按钮后显示
- **表格数据**：表格数据来自后端接口，测试时需确保有测试数据

## 登录态复用机制

同首页测试，通过 `storageState` 复用登录态：

```ts
const AUTH_FILE = 'tests/generated/.auth/user.json'

test.beforeAll(async ({ browser }) => {
  if (existsSync(AUTH_FILE)) return
  // 自动登录生成 storageState
})
test.use({ storageState: AUTH_FILE })
```
