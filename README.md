# AI 时代代码仓库快速迭代新范式

> 以 **"护栏内自治、栈式薄切片交付"** 为核心，构建 AI 快速迭代与代码质量保障的平衡体系

---

## 痛点

1. **人工审查成为交付瓶颈**：传统代码评审依赖资深开发排期，PR 积压周期常达小时甚至天级，严重拖慢迭代节奏。
2. **大 PR 审查失效**：研究表明超过 400 行代码变更时，人工缺陷发现率显著下降，"看不完就点 Approve" 成为常态。
3. **AI 生成代码缺乏安全护栏**：AI 编码工具大规模普及后，代码产出速度暴增，但缺乏系统性的质量管控机制，AI 可能误改核心业务逻辑。
4. **规范执行靠自觉**：代码风格、提交信息、测试覆盖率等标准散落在文档中，缺少自动化强制手段，落地率低。
5. **高频合并下质量失控**：团队日均 PR 量持续增长，人工审查资源无法线性扩展，质量与速度形成不可调和的矛盾。

---

## 场景说明书

**场景名称**：AI 时代代码仓库快速迭代新范式

**核心理念**：护栏内自治、栈式薄切片交付

**目标用户**：中大型研发团队，日均 PR 量 50+，使用 GitHub/Git 协作

**典型场景流程**：

1. **需求拆解** → AI 只读分析仓库（README、CONTRIBUTING、历史提交），输出变更计划书（文件清单 + 影响面），不直接生成代码
2. **人工确认** → 维护者审阅计划，批准/修改/拒绝，确保不偏离业务目标
3. **栈式生成** → AI 将变更拆分为多层堆叠 PR（每层 diff < 400 行），逐层生成草稿代码
4. **四层防线自动验证**：
   - **L1 本地预提交**：pre-commit Hook 自动执行 ESLint + Prettier，不合规代码无法提交
   - **L2 Stacked PR 管理**：PR 模板 + diff 行数限制 + 堆叠分层审查
   - **L3 AI 自动审查**：调用 LLM 从 Bug/安全/性能/可维护性四维度生成结构化审查报告
   - **L4 CI 全量验证**：Lint + TypeCheck + 单元测试（覆盖率 >= 70%）+ 构建验证
5. **智能合并分流** → 低风险变更（文档/测试/配置）AI 审查 + CI 通过后自动合并；核心业务代码必须人工精审通过后合并

**权限矩阵**：AI 对 utils/tests 等文件可自主修改；对 services/models 需人工确认；对核心业务/安全模块禁止触碰。

---

## 功能/价值

| 功能模块 | 具体能力 | 核心价值 |
|---------|---------|---------|
| **L1 本地预提交 Hook** | ESLint + Prettier 自动检查暂存文件，不合规直接阻断提交 | 80% 规范问题在本地拦截，零成本修复 |
| **L2 薄切片 + 堆叠 PR** | 单 PR diff < 400 行，大需求自动拆分为多层堆叠 PR，独立审查 | 降低审查认知负荷，单层可独立回滚，故障半径最小化 |
| **L3 AI 自动审查** | LLM 从 Bug/安全/性能/可维护性四维度生成结构化评分报告，支持大 PR 自动分块 | 每次 PR 分钟级响应，人工审查精力释放 50%+ |
| **L4 CI 全量验证** | TypeCheck + 单元测试（覆盖率门禁）+ 构建验证，全绿方可合并 | 自动化质量底线，杜绝"编译不过就上线" |
| **低风险自动合并** | chore 类 PR 经 AI 审查 + CI 全绿后自动 squash merge，内置安全阀阻止核心文件被自动合并 | 杂务处理效率提升 10 倍，人工只聚焦高价值决策 |
| **AI 权限矩阵** | 按文件路径分级管控 AI 写权限：只读/受限写/需确认/禁止修改 | AI 护栏内自治，防止误改核心业务，安全可控 |
| **AIR Cycle 工作流** | Plan → Approve → Generate → Auto Review → CI → Human Review → Merge 完整闭环 | 人机协作最优分工：AI 负责重复性工作，人工聚焦架构与业务判断 |

**量化价值预期**：

- 代码审查响应时间：从小时/天级 → 分钟级
- 人工审查工作量：减少 50%+
- 规范类缺陷逃逸率：趋近于 0
- 低风险变更合并周期：从人工排期 → 全自动
- 回滚影响范围：从整个大 PR → 单层薄切片

---

## 整体架构：四层防线模型

```
开发者本地                    GitHub 远程
─────────────                 ──────────────────────────────────
                              
  代码修改                    
     │                        
  [L1 本地预提交]             
  pre-commit Hook             
  └─ ESLint 检查              
  └─ Prettier 格式化          
     │ 未通过 → 阻断提交      
     │ 通过 ↓                 
  git push ──────────────────▶ [L2 Stacked PR 管理]
                                 └─ PR 模板规范
                                 └─ diff < 400 行限制
                                 └─ 堆叠 PR 分层审查
                                      │
                                 [L3 AI 自动审查]
                                 ai-pr-review.yml
                                 └─ 获取 PR diff
                                 └─ 分块调用 LLM
                                 └─ 发布审查报告评论
                                      │
                                 [L4 CI 全量验证]
                                 ci.yml
                                 └─ ESLint + TypeCheck
                                 └─ Jest 测试 (覆盖率≥70%)
                                 └─ 构建验证
                                      │
                              ┌──────┴──────┐
                         低风险变更        业务代码
                         自动合并          人工精审
                         auto-merge.yml    → Approve → Merge
```

---

## 文件结构

```
.
├── src/
│   ├── models/user.ts          # 数据模型（AI 需确认后修改）
│   ├── services/userService.ts # 业务服务（AI 需确认后修改）
│   └── utils/validator.ts      # 工具函数（AI 可自主修改）
├── tests/
│   ├── services/userService.test.ts
│   └── utils/validator.test.ts
├── scripts/
│   └── ai-review.js            # AI 审查核心脚本
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # L4：CI 全量验证
│   │   ├── ai-pr-review.yml    # L3：AI PR 自动审查
│   │   └── auto-merge.yml      # 低风险变更自动合并
│   ├── ISSUE_TEMPLATE/         # Issue 模板
│   └── pull_request_template.md # PR 模板（L2）
├── .husky/pre-commit           # L1：本地预提交 Hook
├── CONTRIBUTING.md             # AI 权限矩阵 + 完整规范
└── README.md                   # 本文档
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
# 自动启用 Git Hooks（Husky）
```

### 2. 配置 AI 审查（必须）

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret 名称 | 说明 |
|------------|------|
| `DASHSCOPE_API_KEY` | 通义千问 API 密钥（[获取地址](https://dashscope.console.aliyun.com/)） |
| `DASHSCOPE_BASE_URL` | API Base URL（可选，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`，支持自定义代理） |

### 3. 配置 Branch Protection（推荐）

进入 GitHub 仓库 **Settings → Branches → Add rule**，对 `main` 分支配置：

- [x] **Require a pull request before merging** — 强制所有变更通过 PR 合入，禁止直推 main
  - Required approvals：`1`（至少 1 人审批通过，防止单人无审查合并）
  - [x] Dismiss stale pull request approvals when new commits are pushed — 新提交自动清除旧审批，确保每次变更都被审查
  - [x] Require approval of the most recent reviewable push — 最近一次提交必须由非推送者审批，防止自己审自己
  - [x] Require conversation resolution before merging — 所有讨论必须解决后才能合并，避免遗留问题
  - Allowed merge methods：仅勾选 **Squash merge**（保持 main 线性历史，与 Require linear history 配合）
- [x] **Require status checks to pass** — CI 全绿方可合并，对应 L4 防线
  - [x] Require branches to be up to date before merging — PR 必须基于最新 main 测试通过，避免合并冲突引入缺陷
  - Required checks：`规范检查 & 类型验证` / `单元测试 & 覆盖率检查` / `构建验证`（对应 [ci.yml](.github/workflows/ci.yml) 三个 Job）
- [x] **Require linear history** — 禁止 merge commit，保持 main 提交历史线性可读
- [x] **Block force pushes** — 禁止 force push，防止历史被覆写导致回滚困难

### 4. 本地验证

```bash
npm run lint        # ESLint 检查
npm run typecheck   # TypeScript 类型检查
npm test            # 运行测试
npm run build       # 构建验证
```

---

## AIR Cycle 工作流详解

### AI 驱动的 PR 流程

```
Issue/需求 → AI 规划（只读分析）→ 人工确认计划
                                      │
                              AI 生成草稿 PR（堆叠模式）
                                      │
                    ┌─────────────────┴──────────────────┐
               L3 AI 审查                           L4 CI 验证
            （LLM 分析代码）               （Lint + Test + Build）
                    └─────────────────┬──────────────────┘
                                      │
                              人工精审（仅架构/业务逻辑）
                                      │
                    ┌─────────────────┴──────────────────┐
               低风险（chore）                      业务代码
                自动合并                          人工 Approve 合并
```

---

## AI 审查报告示例

每次 PR 创建或更新后，AI 机器人将自动发布如下格式的审查评论：

```markdown
## 🤖 AI 代码审查报告

### 总体评分
| 维度 | 评分 | 说明 |
|------|------|------|
| 代码质量 | 9/10 | 命名规范、结构清晰 |
| 安全性 | 10/10 | 未发现安全风险 |
| 可维护性 | 8/10 | 建议抽取常量 |

### 发现的问题
- [HIGH] ...
- [LOW] ...

### 改进建议
...

### 总结
✅ 建议合并，LOW 级问题可后续处理
```

---

## 核心设计原则

| 原则 | 说明 |
|------|------|
| **薄切片迭代** | 单 PR diff < 400 行，降低审查负担和回滚风险，通过 .joycode/rules/ 规则让 AI 工具在生成代码时自动感知约束
 |
| **AI 只读沙箱** | AI 审查在只读 checkout 中运行，无直接写权限 |
| **权限分离** | AI 负责分析建议，关键操作由独立 runner 或人工执行 |
| **渐进式自动化** | 低风险变更自动合并，核心代码必须人工确认 |
| **可追溯性** | 所有 AI 操作生成规范提交记录，全程可审计 |

---

## 参考资料

- 需求设计参考：[需求.md](./docs/需求.md)
- 贡献规范：[CONTRIBUTING.md](./CONTRIBUTING.md)
- AI 审查脚本：[scripts/ai-review.js](./scripts/ai-review.js)
- 演示方案：[demo-guide.md](./docs/demo-guide.md)

## 更新历史
- 修复auto merge
- gh pr merge <PR_NUMBER> --auto --squash
- test