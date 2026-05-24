# Seven Habits Scheduler — Project Handoff Spec

> 목적: Codex, Claude Code, Cursor Agent 등 코딩 에이전트에게 바로 넘겨서 초기 구현을 시작할 수 있도록 정리한 프로젝트 결정 문서.

---

## 1. 최종 결정 요약

```text
Project:
Seven Habits 기반 시간관리 앱

Development Strategy:
Greenfield 신규 개발
기존 GitHub 레포는 fork하지 않고 참고자료로만 사용한다.

Monorepo:
Turborepo

Package Manager:
pnpm

Architecture:
Vertical Slice Architecture

Platforms:
- Web
- Mobile

Apps:
- apps/web
- apps/mobile

Web:
- Next.js
- React
- TypeScript
- Clerk
- Convex
- shadcn/ui
- Tailwind CSS

Mobile:
- Expo
- React Native
- TypeScript
- Clerk
- Convex
- React Native 전용 UI

Auth:
Clerk

Backend / Realtime DB:
Convex

Sync:
계정 로그인 + 클라우드 저장 + 실시간 동기화

UI Strategy:
- Web: shadcn/ui + Tailwind CSS
- Mobile: React Native 전용 UI
- Web/Mobile UI 직접 공유하지 않음
- 도메인 로직만 packages/core에서 공유
```

---

## 2. 제품 컨셉

스티븐 코비의 『성공하는 사람들의 7가지 습관』에서 말하는 시간관리 철학을 바탕으로 한 개인 생산성 앱이다.

핵심은 단순한 Todo 앱이 아니다.

```text
일반 Todo 앱:
할 일 입력
→ 마감일 설정
→ 완료 체크

이 앱:
역할 정의
→ 목표 설정
→ 할 일 수집
→ 시간관리 매트릭스로 분류
→ Q2 중심으로 주간 계획
→ 일간 실행
→ 주간 리뷰
```

제품의 중심은 **Planner**다.  
Matrix는 앱의 전부가 아니라 **우선순위 판단 도구**다.

---

## 3. 핵심 제품 원칙

```text
1. Planner가 중심이다.
2. Weekly Planner가 핵심 화면이다.
3. Daily Planner는 실행 레이어다.
4. Matrix는 우선순위 분류 도구다.
5. Roles와 Goals는 계획의 방향성을 제공한다.
6. Review는 주간 계획 루프를 닫는다.
7. Q2, 즉 중요하지만 긴급하지 않은 일을 보호하는 것이 앱의 핵심 가치다.
```

---

## 4. 시간관리 매트릭스 정의

```text
Q1: 중요하고 긴급함
Q2: 중요하지만 긴급하지 않음
Q3: 중요하지 않지만 긴급함
Q4: 중요하지도 긴급하지도 않음
```

분류 규칙:

```ts
type Importance = "high" | "low";
type Urgency = "high" | "low";

type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

function getQuadrant(importance: Importance, urgency: Urgency): Quadrant {
  if (importance === "high" && urgency === "high") return "Q1";
  if (importance === "high" && urgency === "low") return "Q2";
  if (importance === "low" && urgency === "high") return "Q3";
  return "Q4";
}
```

---

## 5. 기존 GitHub 후보 검토 결과

기존 후보는 모두 참고용이다. 코드 베이스로 fork하지 않는다.

### 5.1 Appaxaap/Focus

```text
역할:
Task/Quadrant 모델, Focus Mode, 알림, Command Palette 참고용

장점:
- Eisenhower Matrix 기반 task manager
- Flutter 기반
- Android/Windows/Linux
- dueDate, 완료 상태, 로컬 저장, 알림 등 존재

단점:
- Flutter 앱이라 웹앱 베이스로 부적합
- GPLv3

판정:
코드 베이스로 사용하지 않음.
Task 모델과 기능 아이디어만 참고.
```

### 5.2 jesusantguerrero/zen

```text
역할:
일간 실행, Pomodoro, Time Tracker, Metrics, daily line-up 참고용

장점:
- Eisenhower Matrix + Pomodoro + GTD 일부 원칙
- Plan Ahead, Zenboard, Matrix, Metrics 구조 참고 가능

단점:
- Firebase 전제
- 앱 철학이 개발자 집중/포모도로 쪽으로 강함
- 라이선스 표기 혼선
- 주간/월간/연간 계획 구조 없음

판정:
코드 베이스로 사용하지 않음.
실행 화면과 metrics 아이디어만 참고.
```

### 5.3 adityaketkar/eisenlist

```text
역할:
4분면 drag-and-drop UX, 간단한 Matrix UI, Google Calendar export 참고용

장점:
- React 웹앱
- MIT 라이선스
- 드래그앤드롭
- 오프라인 브라우저 저장
- Google Calendar export 아이디어

단점:
- React 16, react-scripts 3 계열로 오래됨
- local browser storage 중심이라 회사-집-모바일 동기화 요구와 맞지 않음

판정:
코드 베이스로 사용하지 않음.
Matrix UI와 Calendar export 아이디어만 참고.
```

---

## 6. 모노레포 구조

기본 구조:

```text
root/
  apps/
    web/
      Next.js app

    mobile/
      Expo React Native app

  packages/
    backend/
      Convex schema/functions

    core/
      shared domain logic

    ui-web/
      optional web-only shared UI

    ui-mobile/
      optional mobile-only shared UI

    config/
      shared tooling config

    utils/
      shared utility functions

  package.json
  pnpm-workspace.yaml
  turbo.json
```

추천 상세 구조:

```text
root/
  apps/
    web/
      src/
        app/
        features/
        components/
          ui/
        providers/
        styles/

    mobile/
      src/
        app/
        features/
        components/
          ui/
        navigation/
        styles/

  packages/
    backend/
      convex/
        schema.ts
        auth.config.ts
        users/
        roles/
        goals/
        tasks/
        planner/
        reviews/

    core/
      src/
        features/
          roles/
          goals/
          inbox/
          matrix/
          planner/
          review/
        date/
        scheduling/
        validation/

    ui-web/
      src/

    ui-mobile/
      src/

    config/
      eslint/
      typescript/
      prettier/
      tailwind/

    utils/
      src/
```

---

## 7. pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 8. Turborepo 기본 태스크

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
```

---

## 9. Vertical Slice Architecture 원칙

기술 레이어 중심으로 나누지 않는다.

피해야 할 구조:

```text
components/
hooks/
services/
types/
utils/
pages/
```

권장 구조:

```text
features/
  auth/
  users/
  roles/
  goals/
  inbox/
  matrix/
  planner/
  review/
  settings/
```

각 slice는 자기 안에 필요한 요소를 가진다.

```text
features/planner/
  screens/
  components/
  hooks/
  state/
  utils/
```

백엔드도 slice 기준으로 나눈다.

```text
packages/backend/convex/planner/
  queries.ts
  mutations.ts
  validators.ts
  helpers.ts
```

공통 도메인도 slice 기준으로 나눈다.

```text
packages/core/src/features/planner/
  planner.types.ts
  planner.rules.ts
  planner.schema.ts
  planner.helpers.ts
```

---

## 10. Web 구조: Next.js

Next.js는 App Router 기반으로 간다.

단, `app/`에는 실제 비즈니스 로직을 몰아넣지 않는다.

```text
apps/web/src/app:
- routing
- layout
- metadata
- provider boundary
- page shell

apps/web/src/features:
- actual feature implementation
- screens
- hooks
- slice-specific components
- feature-level state
```

추천 구조:

```text
apps/web/
  src/
    app/
      layout.tsx
      page.tsx

      inbox/
        page.tsx

      matrix/
        page.tsx

      planner/
        page.tsx

      roles/
        page.tsx

      goals/
        page.tsx

      review/
        page.tsx

      settings/
        page.tsx

    features/
      auth/
      users/
      inbox/
      matrix/
      planner/
      roles/
      goals/
      review/
      settings/

    components/
      ui/

    providers/
      AppProviders.tsx
      ClerkConvexProvider.tsx
```

라우트와 feature 매핑:

```text
/         -> dashboard or planner redirect
/inbox    -> features/inbox
/matrix   -> features/matrix
/planner  -> features/planner
/roles    -> features/roles
/goals    -> features/goals
/review   -> features/review
/settings -> features/settings
```

`page.tsx`는 얇게 유지한다.

```tsx
// apps/web/src/app/planner/page.tsx
import { PlannerPageScreen } from "@/features/planner/screens/PlannerPageScreen";

export default function PlannerPage() {
  return <PlannerPageScreen />;
}
```

---

## 11. Mobile 구조: Expo React Native

모바일은 웹 UI를 공유하지 않는다.

```text
apps/mobile/
  src/
    app/
    navigation/
    features/
      auth/
      users/
      inbox/
      matrix/
      planner/
      roles/
      goals/
      review/
      settings/
    components/
      ui/
```

모바일 UI 우선순위:

```text
1. 읽기 쉬운 세로 리스트
2. 빠른 입력
3. Bottom Sheet 기반 편집
4. Stack / Tab navigation
5. 손가락 조작에 맞는 큰 터치 영역
```

예상 navigation:

```text
AuthStack:
- SignIn
- SignUp

MainTabs:
- Today
- Planner
- Matrix
- Inbox
- Settings

Nested stacks:
- Roles
- Goals
- Review
```

---

## 12. UI 전략

### Web UI

```text
- shadcn/ui
- Tailwind CSS
- apps/web/src/components/ui 안에 shadcn 컴포넌트 배치
- 초기에는 packages/ui-web로 옮기지 않는다
```

예상 컴포넌트:

```text
apps/web/src/components/ui/
  button.tsx
  card.tsx
  dialog.tsx
  input.tsx
  textarea.tsx
  select.tsx
  tabs.tsx
  sheet.tsx
  dropdown-menu.tsx
  calendar.tsx
  popover.tsx
```

### Mobile UI

```text
- React Native 전용 UI
- 웹 컴포넌트와 직접 공유하지 않는다
- 공통화는 도메인 로직에서만 한다
```

예상 컴포넌트:

```text
apps/mobile/src/components/ui/
  Button.tsx
  Card.tsx
  TextField.tsx
  Screen.tsx
  BottomSheet.tsx
  Section.tsx
  EmptyState.tsx
```

---

## 13. 공유하는 것과 공유하지 않는 것

공유한다:

```text
- domain types
- validation schemas
- date/week calculation logic
- quadrant rules
- planner rules
- scheduling helpers
- API contracts via Convex generated API
```

초기에 공유하지 않는다:

```text
- web layout components
- mobile layout components
- navigation
- gestures
- screen components
- platform-specific forms
```

---

## 14. Clerk + Convex 인증 원칙

```text
Auth:
Clerk

Backend:
Convex

Rule:
모든 사용자 개인 데이터는 Clerk user identity 기준으로 격리한다.

Convex function rule:
사용자별 데이터 query/mutation은 항상 ctx.auth.getUserIdentity()를 먼저 확인한다.
```

Convex 함수 인증 패턴:

```ts
const identity = await ctx.auth.getUserIdentity();

if (!identity) {
  throw new Error("Unauthorized");
}

const clerkUserId = identity.subject;
```

Provider 구성 개념:

```tsx
// apps/web/src/providers/ClerkConvexProvider.tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ClerkConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

Expo 쪽도 같은 원칙을 사용한다.

```tsx
// apps/mobile/src/providers/ClerkConvexProvider.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export function ClerkConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

---

## 15. 환경변수 초안

### apps/web

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
```

### apps/mobile

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_CONVEX_URL=
```

### packages/backend / Convex

```env
CLERK_JWT_ISSUER_DOMAIN=
```

Convex auth config 예시:

```ts
// packages/backend/convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

---

## 16. 핵심 데이터 모델

### UserProfile

```text
UserProfile:
- clerkUserId
- displayName
- timezone
- onboardingCompleted
- createdAt
- updatedAt
```

### Role

```text
Role:
- userId
- name
- description
- sortOrder
- archived
- createdAt
- updatedAt
```

### Goal

```text
Goal:
- userId
- roleId
- title
- description
- horizon: yearly | monthly | weekly
- status: active | completed | archived
- createdAt
- updatedAt
```

### Task

```text
Task:
- userId
- roleId
- goalId
- title
- description
- importance: high | low
- urgency: high | low
- quadrant: Q1 | Q2 | Q3 | Q4
- dueDate
- estimatedMinutes
- status: inbox | planned | done | deferred | cancelled
- createdAt
- updatedAt
```

### ScheduleBlock

```text
ScheduleBlock:
- userId
- taskId
- startAt
- endAt
- date
- source: weeklyPlan | dailyPlan | manual
- createdAt
- updatedAt
```

### WeeklyPlan

```text
WeeklyPlan:
- userId
- weekStartDate
- selectedRoleIds
- bigRockTaskIds
- status: draft | active | completed
- createdAt
- updatedAt
```

### Review

```text
Review:
- userId
- periodType: weekly | monthly | yearly
- periodStartDate
- wins
- misses
- lessons
- nextAdjustments
- createdAt
- updatedAt
```

---

## 17. Convex schema 초안

```ts
// packages/backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const importance = v.union(v.literal("high"), v.literal("low"));
const urgency = v.union(v.literal("high"), v.literal("low"));
const quadrant = v.union(
  v.literal("Q1"),
  v.literal("Q2"),
  v.literal("Q3"),
  v.literal("Q4"),
);

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    timezone: v.string(),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),

  roles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    archived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
    title: v.string(),
    description: v.optional(v.string()),
    horizon: v.union(v.literal("yearly"), v.literal("monthly"), v.literal("weekly")),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_roleId", ["roleId"]),

  tasks: defineTable({
    userId: v.id("users"),
    roleId: v.optional(v.id("roles")),
    goalId: v.optional(v.id("goals")),
    title: v.string(),
    description: v.optional(v.string()),
    importance,
    urgency,
    quadrant,
    dueDate: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
    status: v.union(
      v.literal("inbox"),
      v.literal("planned"),
      v.literal("done"),
      v.literal("deferred"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_userId_quadrant", ["userId", "quadrant"]),

  weeklyPlans: defineTable({
    userId: v.id("users"),
    weekStartDate: v.string(),
    selectedRoleIds: v.array(v.id("roles")),
    bigRockTaskIds: v.array(v.id("tasks")),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_weekStartDate", ["userId", "weekStartDate"]),

  scheduleBlocks: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    title: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.number(),
    date: v.string(),
    source: v.union(v.literal("weeklyPlan"), v.literal("dailyPlan"), v.literal("manual")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  reviews: defineTable({
    userId: v.id("users"),
    periodType: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    periodStartDate: v.string(),
    wins: v.optional(v.string()),
    misses: v.optional(v.string()),
    lessons: v.optional(v.string()),
    nextAdjustments: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_period", ["userId", "periodType", "periodStartDate"]),
});
```

---

## 18. Convex auth helper 패턴

```ts
// packages/backend/convex/users/helpers.ts
import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User profile not found");
  }

  return user;
}
```

---

## 19. 기능 Slice 목록

```text
features/
  auth/
    Clerk + Convex 인증 연결

  users/
    사용자 프로필, 온보딩 상태

  roles/
    7 Habits식 역할 관리

  goals/
    역할별 목표 관리

  inbox/
    할 일 수집함

  matrix/
    중요도/긴급도 분류

  planner/
    주간/일간 계획
    추후 월간/연간 확장

  review/
    주간 리뷰

  settings/
    계정, 테마, 알림, 데이터 설정
```

---

## 20. Product Flow

```text
1. User signs in
2. User profile is created or loaded
3. User defines roles
4. User defines goals
5. User creates tasks in inbox
6. User classifies tasks in matrix
7. User selects Q2 tasks for the week
8. User schedules tasks into weekly planner
9. User executes through daily planner
10. User performs weekly review
```

---

## 21. MVP Scope

1차 MVP에 포함:

```text
- Clerk sign-in/sign-up
- Convex user profile creation/loading
- Role CRUD
- Goal CRUD
- Task inbox
- Importance/Urgency classification
- Q1/Q2/Q3/Q4 matrix view
- Weekly planner
- Daily planner
- Weekly review
```

1차 MVP에서 제외하거나 후순위:

```text
- AI 자동 분류
- 외부 캘린더 양방향 연동
- 팀 협업
- 고급 반복 일정
- 복잡한 통계 대시보드
- 완전한 연간/월간 캘린더 고도화
- 알림 고도화
```

---

## 22. 추천 구현 순서

더 이상 제품 결정을 묻지 말고 아래 순서로 구현한다.

```text
1. Monorepo scaffold
2. apps/web Next.js scaffold
3. apps/mobile Expo scaffold
4. packages/backend Convex scaffold
5. packages/core scaffold
6. Clerk + Convex provider 연결
7. users slice
8. roles slice
9. goals slice
10. inbox/tasks slice
11. matrix slice
12. planner slice
13. review slice
14. web/mobile 기본 UI 정리
15. lint/typecheck/build 정리
```

첫 번째로 안정화할 slice:

```text
auth + users
```

이유:

```text
웹/모바일/Convex/Clerk가 모두 엮이는 기반이다.
이것이 안정화되어야 사용자별 roles, goals, tasks, planner 데이터를 안전하게 분리할 수 있다.
```

---

## 23. Web Feature 예시 구조

```text
apps/web/src/features/planner/
  screens/
    PlannerPageScreen.tsx
    WeeklyPlannerScreen.tsx
    DailyPlannerScreen.tsx

  components/
    WeeklyPlannerBoard.tsx
    DailyTaskList.tsx
    ScheduleBlockCard.tsx
    BigRockPanel.tsx

  hooks/
    useWeeklyPlan.ts
    useDailyPlan.ts
    useScheduleBlocks.ts

  state/
    planner-ui-state.ts

  utils/
    planner-view.helpers.ts
```

---

## 24. Mobile Feature 예시 구조

```text
apps/mobile/src/features/planner/
  screens/
    PlannerHomeScreen.tsx
    WeeklyPlannerScreen.tsx
    DailyPlannerScreen.tsx

  components/
    WeekDayList.tsx
    BigRockCard.tsx
    MobileScheduleBlockCard.tsx
    PlanBottomSheet.tsx

  hooks/
    useWeeklyPlan.ts
    useDailyPlan.ts
```

---

## 25. Core Feature 예시 구조

```text
packages/core/src/features/planner/
  planner.types.ts
  planner.rules.ts
  planner.schema.ts
  planner.helpers.ts
  week.helpers.ts
```

예상 공통 함수:

```ts
export function getWeekStartDate(date: Date, weekStartsOn: "monday" | "sunday" = "monday") {
  // implementation
}

export function isQ2Task(task: { importance: "high"; urgency: "low" }) {
  return task.importance === "high" && task.urgency === "low";
}
```

---

## 26. Backend Slice 예시 구조

```text
packages/backend/convex/tasks/
  queries.ts
  mutations.ts
  validators.ts
  helpers.ts
```

예시 mutation 방향:

```ts
// packages/backend/convex/tasks/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "../users/helpers";

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    importance: v.union(v.literal("high"), v.literal("low")),
    urgency: v.union(v.literal("high"), v.literal("low")),
    roleId: v.optional(v.id("roles")),
    goalId: v.optional(v.id("goals")),
    dueDate: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    const quadrant = getQuadrant(args.importance, args.urgency);

    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      importance: args.importance,
      urgency: args.urgency,
      quadrant,
      roleId: args.roleId,
      goalId: args.goalId,
      dueDate: args.dueDate,
      estimatedMinutes: args.estimatedMinutes,
      status: "inbox",
      createdAt: now,
      updatedAt: now,
    });
  },
});

function getQuadrant(
  importance: "high" | "low",
  urgency: "high" | "low",
): "Q1" | "Q2" | "Q3" | "Q4" {
  if (importance === "high" && urgency === "high") return "Q1";
  if (importance === "high" && urgency === "low") return "Q2";
  if (importance === "low" && urgency === "high") return "Q3";
  return "Q4";
}
```

실제 구현 시 `getQuadrant`는 `packages/core`에서 가져오도록 정리한다.

---

## 27. Coding Agent Instructions

코딩 에이전트는 아래 원칙을 따른다.

```text
You are implementing a new Greenfield Turborepo monorepo.

Do not fork existing Eisenhower Matrix repositories.
Use them only as conceptual references.

Use:
- pnpm
- Turborepo
- Next.js for apps/web
- Expo React Native for apps/mobile
- Clerk for auth
- Convex for backend, database, realtime sync
- shadcn/ui + Tailwind CSS for web UI
- React Native-specific UI for mobile
- Vertical Slice Architecture

Do not use:
- Supabase
- Firebase
- REST-first backend
- SQL database layer
- shared web/mobile UI abstraction too early
- technical-layer-first folder organization

Prioritize:
1. working monorepo
2. auth integration
3. user data isolation
4. core domain slices
5. simple but functional UI
```

---

## 28. Do Not Do

```text
Do not ask further high-level stack questions before scaffolding.
Do not reorganize into layer-first architecture.
Do not put all business logic inside Next.js app routes.
Do not force web and mobile to share UI components.
Do not use browser-only local storage as the primary persistence layer.
Do not use Supabase.
Do not use Firebase.
Do not build a generic Todo app and call it done.
Do not make Matrix the whole product.
```

---

## 29. Definition of Done: Initial Scaffold

초기 스캐폴드 완료 기준:

```text
- pnpm install succeeds
- turbo dev script exists
- turbo build script exists
- turbo lint script exists
- apps/web starts successfully
- apps/mobile starts successfully
- packages/backend contains Convex schema and auth config
- packages/core contains matrix/planner domain rules
- Clerk + Convex provider boundary exists in web
- Clerk + Convex provider boundary exists in mobile
- Vertical slice folders exist in web/mobile/backend/core
- No Supabase/Firebase dependency exists
```

---

## 30. Suggested Initial Scripts

루트 `package.json` 방향:

```json
{
  "private": true,
  "packageManager": "pnpm@latest",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest"
  }
}
```

---

## 31. Naming

작업명은 임시로 다음 중 하나를 사용할 수 있다.

```text
repo name candidate:
seven-habits-scheduler

package scope candidate:
@seven-habits

app name candidate:
Seven Habits Scheduler
```

---

## 32. Final Product Direction

```text
This is not an Eisenhower Matrix clone.
This is a Seven Habits style planning system.

The Matrix helps users decide.
The Planner helps users commit.
The Daily view helps users execute.
The Review helps users improve.
Roles and Goals ensure that tasks are connected to what matters.
```
