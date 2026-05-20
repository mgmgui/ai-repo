# 贡献指南 —— AI 时代代码迭代规范

本文档定义了在 AI 辅助开发模式下，向本仓库贡献代码的完整规范。

---

## 一、AI 权限矩阵（Guardrails）

> AI 代理（包括 JoyCode、GitHub Copilot 等）必须严格遵守以下权限边界

| 权限级别 | 可操作文件/目录 | 说明 |
|---------|--------------|------|
| **只读** | 所有文件 | 分析、审查、生成报告 |
| **受限写** | `src/utils/`、`tests/`、`docs/`、配置文件 | AI 可自主修改，无需额外确认 |
| **需确认写** | `src/services/`、`src/models/` | AI 生成草稿 PR，需人工 Review 后合并 |
| **禁止修改** | `src/core/`（核心业务逻辑）、`*.secret*`、支付/安全模块 | AI 不得修改，违反则自动阻断 |

---

## 二、薄切片 PR 原则（L2 防线）

### 单层 PR 规范
- **行数上限**：单个 PR 的 diff 不超过 **400 行**
- **逻辑内聚**：每个 PR 只做一件事（单一职责）
- **独立可测**：每层 PR 必须能独立通过 CI 测试

### 堆叠 PR（Stacked PRs）流程

当需求较大时，拆分为多层堆叠 PR：

```
feature/user-auth-1-model     → 第1层：数据模型定义
       ↓
feature/user-auth-2-service   → 第2层：服务层实现
       ↓
feature/user-auth-3-api       → 第3层：API 接口
       ↓
feature/user-auth-4-tests     → 第4层：集成测试
```

**分支命名规范**：`<type>/<feature>-<layer>-<description>`

---

## 三、AIR Cycle 工作流（AI-Review-Integrate）

```
1. Plan（AI 规划）
   └─ AI 只读分析仓库，输出变更计划书（文件清单 + 影响面）

2. Approve（人工确认）
   └─ 维护者审阅计划：批准 / 修改 / 拒绝

3. Generate（AI 生成）
   └─ AI 按堆叠 PR 模式逐层生成代码（草稿状态）

4. Auto Review（自动审查）
   └─ AI 审查机器人自动扫描：Bug / 安全 / 性能 / 可维护性

5. CI Validate（CI 验证）
   └─ 自动运行：Lint + TypeCheck + Tests（覆盖率≥70%）

6. Human Review（人工精审）
   └─ 仅审查 AI 无法覆盖的：架构设计 / 复杂业务逻辑

7. Merge（条件合并）
   ├─ 低风险（文档/测试/配置）：AI审查通过 + CI通过 → 自动合并
   └─ 业务代码：必须人工 Approve 后合并
```

---

## 四、分支策略

| 分支 | 用途 | 保护规则 |
|------|------|---------|
| `main` | 生产就绪代码 | 需 1+ 人工 Review + CI 全绿 |
| `develop` | 集成分支 | CI 必须全绿 |
| `feature/*` | 功能开发 | 无限制，自由开发 |
| `fix/*` | Bug 修复 | 无限制 |
| `chore/*` | 配置/依赖/文档 | 支持自动合并（AI审查+CI通过） |

---

## 五、提交信息规范（Conventional Commits）

```
<type>(<scope>): <subject>

类型（type）：
  feat     - 新功能
  fix      - Bug 修复
  refactor - 重构
  test     - 测试
  docs     - 文档
  chore    - 构建/配置/依赖

示例：
  feat(user): 添加用户邮箱验证功能
  fix(validator): 修复邮箱正则未匹配加号的问题
  chore(deps): 升级 TypeScript 至 5.5
```

---

## 六、本地开发环境配置

```bash
# 1. 安装依赖（自动启用 Git Hooks）
npm install

# 2. 验证 pre-commit Hook 已安装
ls -la .husky/pre-commit

# 3. 运行全套检查
npm run lint && npm run typecheck && npm test
```

---

## 七、合并门禁（Branch Protection）

PR 合并到 `main` 必须满足：

1. CI 全部通过（规范检查 + 类型检查 + 测试 + 构建）
2. 测试覆盖率 ≥ 70%
3. AI 审查报告无 HIGH 级未处理问题
4. 至少 1 位人工 Reviewer Approve（业务代码）
5. PR 模板自查清单全部勾选