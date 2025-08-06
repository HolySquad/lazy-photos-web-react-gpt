# AGENTS.md

Проект: Next.js (App Router) + React + TypeScript. Цель — продуктовый фронтенд с чёткой архитектурой, предсказуемыми API-вызовами и надёжными тестами:
- **Unit**: проверяем логику запросов, маршруты, заголовки, (де)сериализацию, обработку ошибок.
- **Integration (E2E-lite)**: пользовательские сценарии в браузере (Playwright) с контролируемым бэкендом (MSW).
- **Responsive by default**: все страницы и компоненты обязаны корректно работать на телефоне, планшете и десктопе.

---

## Технологии
- **Next.js + React + TypeScript**
- **TanStack Query** для data fetching/кэширования
- **Zod** для валидации ответов API
- **Axios** (или `fetch`) с тонким http-слоем
- **Vitest** + **@testing-library/react** для unit
- **MSW** — стаб бэкенда (unit + integration)
- **Playwright** — интеграционные тесты
- **ESLint + Prettier**, **Husky + lint-staged** — pre-commit защита
- **Стили**: допускаются **CSS Modules**/**SCSS** или **TailwindCSS** (если уже установлен). Без внедрения UI-фреймворков без потребности.

---

## Структура
```
/
├─ app/                        # Next.js App Router
│  ├─ (marketing)/
│  ├─ layout.tsx
│  └─ page.tsx
├─ src/
│  ├─ shared/
│  │  ├─ api/                 # http-клиент, схемы, сервисы
│  │  ├─ config.ts            # env, флаги
│  │  └─ styles/              # tokens.css, mixins.scss (если SCSS)
│  ├─ entities/
│  ├─ features/
│  └─ hooks/
├─ tests/
│  ├─ unit/
│  ├─ msw/
│  │  ├─ handlers.ts
│  │  └─ server.ts
│  └─ e2e/
│     ├─ playwright.config.ts
│     ├─ users.spec.ts
│     └─ users.responsive.spec.ts
├─ public/                     # сюда MSW sw (browser)
├─ .env.example
├─ package.json
└─ vitest.config.ts
```

---

## Быстрый старт
```bash
pnpm i
pnpm dev           # http://localhost:3000
```
`.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## Скрипты
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest -c vitest.config.ts",
    "test:unit": "vitest run -c vitest.config.ts --dir tests/unit --coverage",
    "test:watch": "vitest -c vitest.config.ts --dir tests/unit --watch",
    "msw:init": "msw init public/ --save",
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed",
    "e2e:update": "playwright test --update-snapshots",
    "prepare": "husky"
  }
}
```

---

## HTTP-клиент и валидация

`src/shared/api/client.ts`
```ts
import axios from "axios";
import { API_BASE_URL } from "../config";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status ?? 0;
    const message = err.response?.data?.message ?? err.message;
    return Promise.reject({ status, message });
  }
);
```

`src/shared/api/schemas.ts`
```ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});
export const UsersResponseSchema = z.array(UserSchema);
export type User = z.infer<typeof UserSchema>;
```

`src/hooks/useUsersQuery.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { http } from "@/src/shared/api/client";
import { UsersResponseSchema, User } from "@/src/shared/api/schemas";

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const res = await http.get("/users");
      return UsersResponseSchema.parse(res.data);
    },
    staleTime: 30_000
  });
}
```

---

## ✅ Responsive Design — обязательные правила

**Брейкпоинты (минимум):**
- `sm` ≥ 640px (телефон в горизонтали / маленькие планшеты)
- `md` ≥ 768px (планшеты)
- `lg` ≥ 1024px (небольшой десктоп/ноутбук)
- `xl` ≥ 1280px (широкие мониторы)

**Базовые принципы:**
1. **Mobile-first**: стили по умолчанию — для телефона; дальше — медиа-правила `@media (min-width: ...)`.
2. **Гибкие контейнеры**: `max-width` + авто-отступы, контент не «липнет» к краям.
3. **Сетки**: CSS Grid/Flex. Без фиксированных ширин в px, где возможно — `minmax()`, `fr`, `auto-fit`.
4. **Типографика**: `clamp(min, preferred, max)` для заголовков/крупного текста.
5. **Изображения**: `next/image` с `sizes` и `fill`/`responsive`, без растягивания битмапов.
6. **Касания**: размер интерактивных целей ≥ 40×40 CSS px; визуальный `:focus` обязателен.
7. **Прокрутка и переполнения**: избегаем горизонтального скролла; тексты переносятся (`overflow-wrap: anywhere` при необходимости).
8. **Доступность**: контраст ≥ WCAG AA; масштабирование 200% не ломает компоновку.

**CSS Tokens (рекомендуется):** `src/shared/styles/tokens.css`
```css
:root {
  --container-max: 1200px;
  --space-1: .25rem; --space-2: .5rem; --space-3: .75rem;
  --space-4: 1rem;  --space-6: 1.5rem; --space-8: 2rem;
  --radius: .75rem;
  --fs-body: clamp(0.95rem, 0.9rem + 0.3vw, 1.05rem);
  --fs-h1: clamp(1.5rem, 1rem + 2.2vw, 2.25rem);
}
.container {
  margin-inline: auto;
  padding-inline: var(--space-4);
  max-width: var(--container-max);
}
```

**Пример адаптивной страницы** `app/users/page.tsx` + CSS-модуль:
```tsx
// app/users/page.tsx
import styles from "./users.module.css";
import { useUsersQuery } from "@/src/hooks/useUsersQuery";

export default function UsersPage() {
  const { data = [], isLoading, isError } = useUsersQuery();
  return (
    <main className={`container ${styles.page}`}>
      <h1 className={styles.title}>Users</h1>
      {isLoading && <p>Loading…</p>}
      {isError && <p>Failed to load</p>}
      <ul className={styles.grid}>
        {data.map((u) => (
          <li key={u.id} className={styles.card}>
            <h2>{u.name}</h2>
            <p>{u.email}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

```css
/* app/users/users.module.css */
.page { padding-block: var(--space-6); }
.title { font-size: var(--fs-h1); margin-block: var(--space-4); }
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
.card {
  padding: var(--space-4);
  border: 1px solid rgba(0,0,0,.1);
  border-radius: var(--radius);
  background: white;
}
@media (min-width: 640px) {        /* sm */
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {       /* lg */
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

> Если в проекте используется Tailwind — эквивалентные классы (`container`, `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, `text-balance`, `prose`) обязательны.

---

## Unit-тесты (логика API)

`tests/unit/api.client.spec.ts`
```ts
import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import { http } from "@/src/shared/api/client";
import { server } from "../msw/server";
import { rest } from "msw";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("http client", () => {
  it("calls GET /users", async () => {
    const res = await http.get("/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("normalizes errors", async () => {
    server.use(
      rest.get("http://localhost:4000/users", (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: "boom" }))
      )
    );
    await expect(http.get("/users")).rejects.toMatchObject({
      status: 500,
      message: "boom"
    });
  });
});
```

---

## Интеграционные тесты (Playwright) + responsive

`tests/e2e/playwright.config.ts`
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 30_000,
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], baseURL: "http://localhost:3000" } },
    { name: "tablet", use: { ...devices["iPad (gen 7)"], baseURL: "http://localhost:3000" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000" } }
  ]
});
```

Инициализация MSW в браузере (dev/test):
```tsx
// app/providers.tsx (client component)
"use client";
import { useEffect } from "react";
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      import("../../tests/msw/browser").then(({ worker }) => {
        worker.start({ onUnhandledRequest: "bypass" });
      });
    }
  }, []);
  return <>{children}</>;
}
```

`tests/msw/browser.ts`
```ts
import { setupWorker } from "msw";
import { handlers } from "./handlers";
export const worker = setupWorker(...handlers);
```

Пример интеграционного сценария:
`tests/e2e/users.responsive.spec.ts`
```ts
import { test, expect } from "@playwright/test";

test("users page renders list responsively", async ({ page }) => {
  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

  // mobile (current project viewport)
  await expect(page.getByRole("list")).toBeVisible();
  const itemsMobile = await page.getByRole("listitem").count();
  expect(itemsMobile).toBeGreaterThan(0);

  // tablet check
  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(page.getByRole("listitem").first()).toBeVisible();

  // desktop check
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("listitem").first()).toBeVisible();
});
```

---

## Политика изменений (для агента)
1) Любой новый экран — **адаптивен по умолчанию** (минимум три контрольных ширины: ~375px, ~820px, ~1280px).
2) Любой компонент со списками/картками — сетка, масштабируемая от 1 колонки на `sm` до 2–3 на `lg+`.
3) Для API-вызовов:
   - юнит-тест (маршрут/параметры/ошибки),
   - Zod-схема на ответ и негативные кейсы.
4) Любой новый экран с данными — как минимум **один интеграционный тест** (Playwright), прогоняющий mobile/tablet/desktop.
5) Не хардкодить URL — `NEXT_PUBLIC_API_BASE_URL`.
6) Не обходить валидацию схемами.

---

## CI
- Джобы: `typecheck` → `lint` → `test:unit` → `build` → `e2e` (projects: mobile/tablet/desktop).
- Кэш: pnpm store, Playwright browsers.
- Артефакты: покрытие Vitest, отчёт Playwright.

---

## Быстрые команды
```bash
pnpm dev                 # локальный сервер
pnpm test:unit           # юнит-тесты API-логики/хуков
pnpm e2e                 # интеграционные тесты (3 проекта: mobile/tablet/desktop)
pnpm lint && pnpm format
pnpm typecheck
```
