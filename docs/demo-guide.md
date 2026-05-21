# 演示方案：GitHub 完整流程验证

> 本文档提供一套可执行的演示方案，验证"护栏内自治、栈式薄切片交付"范式的完整闭环。

---

## 一、创建 PR 的标准步骤

```bash
# 1. 从 main 创建功能分支
git checkout -b chore/update-docs-readme

# 2. 修改代码（保持 diff < 400 行）
# 3. 提交（L1 pre-commit 自动触发 ESLint + Prettier）
git add .
git commit -m "docs: 更新 README 示例说明"

# 4. 推送并创建 PR
git push origin chore/update-docs-readme
gh pr create --title "docs: 更新 README" --body "$(cat .github/pull_request_template.md)"
```

---

## 二、前置配置清单

在开始演示前，确保 GitHub 仓库已完成以下配置：

### 2.1 Secrets 配置

进入 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret 名称 | 说明 |
|------------|------|
| `DASHSCOPE_API_KEY` | 通义千问 API 密钥（[获取地址](https://dashscope.console.aliyun.com/)） |
| `DASHSCOPE_BASE_URL` | API Base URL（可选，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`） |

### 2.2 Branch Protection 配置

进入 GitHub 仓库 **Settings → Branches → Add rule**，对 `main` 分支配置：

- [x] **Require a pull request before merging**
  - Required approvals：`1`
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require approval of the most recent reviewable push
  - [x] Require conversation resolution before merging
  - Allowed merge methods：仅 **Squash merge**
- [x] **Require status checks to pass**
  - [x] Require branches to be up to date before merging
  - Required checks：
    - `CI - 代码质量验证 / 规范检查 & 类型验证`
    - `CI - 代码质量验证 / 单元测试 & 覆盖率检查`
    - `CI - 代码质量验证 / 构建验证`
- [x] **Require linear history**
- [x] **Block force pushes**

### 2.3 GitHub Auto-merge 配置

进入 GitHub 仓库 **Settings → General → Pull Requests**，确保勾选：

- [x] **Allow auto-merge**（允许自动合并）

> 这是 GitHub 原生功能，启用后 `gh pr merge --auto` 命令可注册 auto-merge 意图，CI + Approve 全部满足后 GitHub 自动执行合并。

### 2.4 Actions Approvals 配置

进入 GitHub 仓库 **Settings → Actions → General**，在底部找到并勾选：

- Workflow permissions：选择 **Read and write permissions**

- [x] **Allow GitHub Actions to create approvals**

> 这是关键配置！默认情况下，GitHub Actions bot（`github-actions[bot]`）使用 `GITHUB_TOKEN` 提交的 Approve 不计入分支保护规则要求的 approval 数量。启用此选项后，bot 的 Approve 才能满足 "Required approvals: 1" 的要求，低风险 PR 才能真正零人工介入自动合并。

### 2.5 Labels 配置

创建 `auto-merge-eligible` 标签，用于标记低风险 PR 触发自动合并流程：

```bash
gh label create "auto-merge-eligible" --description "低风险 PR，触发自动合并流程" --color "0075ca"
```

> 注意：`gh pr create --label` 要求标签必须预先在仓库中存在，否则会报 `could not add label: 'auto-merge-eligible' not found` 错误。请在首次使用前执行上述命令创建标签。

---

## 三、测试场景

### 场景 A：低风险文档修改 → 全自动合并

**目的**：验证低风险变更可零人工介入自动合并

**需求**：更新 README 中的快速开始章节说明

```bash
# 1. 创建分支
git checkout main
git pull
git checkout -b chore/update-readme

# 2. 修改 README.md（仅改几行说明文字，如补充一段描述）

# 3. 提交（L1 pre-commit 自动触发）
git add .
git commit -m "docs: 补充快速开始步骤说明"

# 4. 推送并创建 PR，标记为自动合并候选
git push origin chore/update-readme
gh pr create \
  --title "docs: 补充快速开始步骤说明" \
  --label "auto-merge-eligible" \
  --body "$(cat .github/pull_request_template.md)"
```

**预期流程**：

```
L1 pre-commit ✅ ESLint + Prettier 通过
     ↓
auto-merge.yml ✅ 安全阀检查无核心文件 → 等待 CI 全绿 → 自动 Approve → 启用 auto-merge
     ↓
L3 AI 审查 ✅ 发布评论报告（代码质量 10/10，无 HIGH 问题）
     ↓
L4 CI 全绿 ✅ lint + typecheck + test + build
     ↓
GitHub 原生 ✅ 所有条件满足 → 自动 squash merge
```

**人工介入：0 次**

**验证点**：
- [ ] PR 创建后自动触发 AI 审查，评论中出现结构化评分报告
- [ ] CI 三个 Job 全部通过
- [ ] auto-merge.yml 安全阀通过后自动 Approve PR
- [ ] 自动合并成功，无需人工 Approve

---

### 场景 B：utils 工具函数 → AI 审查后人工合并

**目的**：验证 AI 审查辅助人工决策，人工仅需 1 次 Approve

**需求**：给 `src/utils/validator.ts` 新增手机号验证函数

```bash
# 1. 创建分支
git checkout main
git pull
git checkout -b feat/validator-phone

# 2. 修改 src/utils/validator.ts，添加 validatePhone() 函数
# 3. 修改 tests/utils/validator.test.ts，添加对应测试用例

# 4. 提交
git add .
git commit -m "feat(validator): 新增手机号格式验证"

# 5. 推送并创建 PR（不加 auto-merge-eligible 标签）
git push origin feat/validator-phone
gh pr create \
  --title "feat(validator): 新增手机号格式验证" \
  --body "$(cat .github/pull_request_template.md)"
```

**预期流程**：

```
L1 pre-commit ✅
     ↓
L3 AI 审查 → 发布报告
  可能提示：[LOW] 正则未覆盖港澳号段
           [LOW] 建议抽取手机号正则为常量
     ↓
L4 CI ✅ 测试覆盖率 ≥ 70%
     ↓
人工精审 → 阅读 AI 报告，确认 LOW 问题可后续处理 → Approve → Merge
```

**人工介入：1 次 Approve**

**验证点**：
- [ ] AI 审查报告覆盖 Bug / 安全 / 性能 / 可维护性四个维度
- [ ] 审查报告中包含具体的问题等级（HIGH / MEDIUM / LOW）
- [ ] 人工无需逐行检查格式和规范，仅关注业务逻辑正确性
- [ ] 测试覆盖率满足 70% 门禁

---

### 场景 C：大需求拆分堆叠 PR → 逐层人工审查

**目的**：验证大需求自动拆分为薄切片，降低单层审查认知负荷

**需求**：用户认证功能（涉及 model + service + tests，预估超 400 行）

拆分为 3 层堆叠 PR：

```
feat/user-auth-1-model    → 第1层：User 认证数据模型（~80行）
       ↓ 基于第1层分支
feat/user-auth-2-service  → 第2层：AuthService 业务逻辑（~150行）
       ↓ 基于第2层分支
feat/user-auth-3-tests    → 第3层：认证集成测试（~100行）
```

```bash
# ── 第1层：数据模型 ──
git checkout main
git pull
git checkout -b feat/user-auth-1-model

# 仅修改 src/models/user.ts，新增认证相关字段
git add .
git commit -m "feat(model)[1/3]: User 认证字段定义"

git push origin feat/user-auth-1-model
gh pr create \
  --title "feat(model)[1/3]: User 认证字段定义" \
  --body "$(cat .github/pull_request_template.md)"

# ── 第2层：服务层（基于第1层分支） ──
git checkout -b feat/user-auth-2-service feat/user-auth-1-model

# 修改 src/services/userService.ts，实现认证逻辑
git add .
git commit -m "feat(service)[2/3]: AuthService 实现"

git push origin feat/user-auth-2-service
gh pr create \
  --base feat/user-auth-1-model \
  --title "feat(service)[2/3]: AuthService 实现" \
  --body "$(cat .github/pull_request_template.md)"

# ── 第3层：集成测试（基于第2层分支） ──
git checkout -b feat/user-auth-3-tests feat/user-auth-2-service

# 修改 tests/ 下文件，添加认证集成测试
git add .
git commit -m "test[3/3]: 认证集成测试"

git push origin feat/user-auth-3-tests
gh pr create \
  --base feat/user-auth-2-service \
  --title "test[3/3]: 认证集成测试" \
  --body "$(cat .github/pull_request_template.md)"
```

**预期流程**：

```
第1层 PR → L3 AI 审查 + L4 CI → 人工 Approve → Merge
                                              ↓
第2层 PR → 自动换基到 main（Stacked PR 自动换基）→ L3 AI 审查 + L4 CI → 人工 Approve → Merge
                                                           ↓
第3层 PR → 自动换基到 main（Stacked PR 自动换基）→ L3 AI 审查 + L4 CI → 人工 Approve → Merge
```

**人工介入：3 次 Approve（每层 1 次，但每次聚焦单一逻辑单元）**

**验证点**：
- [ ] 每个 PR diff < 400 行
- [ ] 每层独立触发 AI 审查和 CI
- [ ] 上层 merge 后，下层自动换基到 main（并尝试自动 Update branch 保持 up-to-date）
- [ ] 单层出问题可独立回滚，不影响已合并的其他层
- [ ] 人工每次只需审查一个逻辑单元，认知负荷显著降低

---

### 场景 D：触碰核心文件 → 自动阻断

**目的**：验证安全护栏能有效阻止核心业务文件被自动合并

**需求**（错误示范）：修改 `src/services/userService.ts` 并尝试自动合并

```bash
# 1. 创建分支
git checkout main
git pull
git checkout -b chore/hack-service

# 2. 修改 src/services/userService.ts（核心业务文件）

# 3. 提交
git add .
git commit -m "chore: 尝试修改 service 并自动合并"

# 4. 推送并创建 PR，故意标记为自动合并候选
git push origin chore/hack-service
gh pr create \
  --title "chore: 修改 userService" \
  --label "auto-merge-eligible" \
  --body "$(cat .github/pull_request_template.md)"
```

**预期流程**：

```
L1 pre-commit ✅ 代码格式无问题
     ↓
L3 AI 审查 → 发布报告（可能标记 [HIGH] 修改核心业务逻辑）
     ↓
L4 CI ✅ 代码本身可编译可测试
     ↓
auto-merge.yml ❌ 安全阀检测到 src/services/ 模式
  → 自动合并被阻断
  → 输出：检测到核心业务文件变更: src/services/userService.ts
  → 需人工 Review 后才能合并
```

**人工介入：必须人工 Review + Approve**

**验证点**：
- [ ] auto-merge.yml 安全阀正确识别核心文件模式
- [ ] 自动合并被阻断，PR 保持 open 状态
- [ ] 阻断消息清晰说明原因和涉及的文件
- [ ] 人工 Approve 后方可合并，护栏不可绕过

---

### 场景 E：L1 本地拦截 → 不合规代码无法提交

**目的**：验证 pre-commit Hook 在本地直接阻断规范问题

```bash
# 1. 创建分支
git checkout main
git pull
git checkout -b test/lint-block

# 2. 故意写不合规代码（如：缺少分号、使用 var、超长行）
# 修改 src/utils/validator.ts，加入不合规代码

# 3. 尝试提交
git add .
git commit -m "test: 故意提交不合规代码"
```

**预期结果**：

```
L1 pre-commit ❌ ESLint 检测到规范问题
  → 提交被阻断
  → 输出具体错误位置和修复建议
  → 代码未进入 git 历史
```

**人工介入：0 次（问题在本地修复）**

**验证点**：
- [ ] 不合规代码无法提交，git commit 被阻断
- [ ] 错误信息清晰指出问题和位置
- [ ] 修复后可正常提交

---

## 四、方案价值量化对比

| 指标 | 传统方式 | 本方案 |
|------|---------|--------|
| 文档/配置 PR 合并周期 | 等人工排期（小时~天级） | 全自动（分钟级） |
| 规范问题发现时机 | Code Review 时发现 | 提交前本地拦截 |
| 大需求 PR 审查质量 | 400+ 行审查失效 | 拆分每层 < 100 行 |
| 核心代码误合并风险 | 依赖人为警惕 | 安全阀自动阻断 |
| AI 审查覆盖率 | 0% | 100% PR 均有报告 |
| 人工审查精力分配 | 规范 + 逻辑全部人工 | 仅聚焦架构与业务逻辑 |

---

## 五、推荐演示顺序

建议按以下顺序执行，逐步展现方案价值：

1. **场景 E**（L1 拦截）→ 证明本地防线有效，零成本修复规范问题
2. **场景 A**（全自动合并）→ 证明低风险变更可零人工处理
3. **场景 B**（AI 辅助审查）→ 证明 AI 审查减轻人工负担
4. **场景 C**（堆叠 PR）→ 证明大需求可拆分为可管理的薄切片
5. **场景 D**（安全阻断）→ 证明护栏防止误操作，保障核心代码安全