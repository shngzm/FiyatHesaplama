# Copilot Instructions (Angular Frontend - Fiyat Hesaplama Uygulaması)

> **Purpose** A single, quick‑reference guide for developing the Price Calculator (Fiyat Hesaplama) Angular application locally.

---

## 1. Tech Stack

- **Frontend:** Angular 17+ · TypeScript · RxJS
- **Build Tool:** Angular CLI
- **Styling:** CSS / SCSS
- **Testing:** Jasmine + Karma
- **Package Manager:** npm
- **Data Storage:** In-memory (no database)

## 2. Repo Layout

```
src/
  app/              components, services, models, guards
  assets/           images, icons, fonts
  environments/     environment.ts, environment.prod.ts
  styles/           global styles
  index.html
  main.ts
tests/              unit tests, integration tests
docs/               documentation (PRD.md, ROADMAP.md, STATE.md, ARCHITECTURE.md, TESTING.md)
angular.json        Angular configuration
package.json        dependencies
README.md           project overview
```

## 3. Key Documents

| File            | Purpose                                   |
| --------------- | ----------------------------------------- |
| **PRD.md**      | Functional requirements (source of truth) |
| ROADMAP.md      | Milestones derived from PRD               |
| STATE.md        | Machine‑readable progress tracker         |
| ARCHITECTURE.md | Component design & data flow              |
| TESTING.md      | Test strategy                             |
| README.md       | Project overview & setup instructions    |

> **Always update relevant docs when you change code, tests, or architecture.**

## 4. Mandatory Workflow

1. **Define requirements** – Update **PRD.md**; get approval.
2. **Plan** – Update **ROADMAP.md** → initialize **STATE.md**.
3. **Design docs** – Update **ARCHITECTURE.md** _before_ coding.
4. **Implement** – Code & tests; update **ROADMAP.md** & **STATE.md** continuously.
5. **Verify** – Run locally; ensure docs match reality.

## 5. STATE.md Schema (summary)

- JSON with: `version`, `lastUpdated`, `projectProgress`, `implementationState` (features, tests, branches), `nextSteps`.
- Update **before & after** each coding session. Use ISO dates (`YYYY‑MM‑DD`).

## 6. Development Workflow

### Local Setup
```bash
npm install
ng serve
```
Application runs on `http://localhost:4200`

### Build for Production
```bash
ng build --configuration production
```

### Run Tests
```bash
ng test
```

### Dates & Commits
- Use absolute dates (e.g., `2025‑11‑28`).
- Standard commit flow:

  ```bash
  git add .
  git commit -m "<message>"
  git push
  ```

- Only commit & push when the user asks. Do not commit on your own.

## 7. Code Standards

- **Components:** Use standalone components or feature modules.
- **Services:** Inject via constructor; use `providedIn: 'root'` where applicable.
- **Logging:** Use `console.log()` for debugging; consider a logging service for production.
- **Naming:** camelCase for variables/methods, PascalCase for classes/components.
- **Type Safety:** Always use TypeScript types; avoid `any`.

## 8. Angular Patterns

- **One component per file** in `src/app/`.
- **Shared components** in `src/app/shared/`.
- **Feature modules** organized by domain.
- **Observable subscriptions** managed with `async` pipe or `takeUntilDestroyed()`.
- **HTTP calls** wrapped in services.
- **In-memory data storage** using services with RxJS BehaviorSubject/Subject.

---

### Remember

- **Doc‑first.** `PRD.md` & `STATE.md` are authoritative.
- No TODOs in code; update `STATE.md` & `ROADMAP.md` instead.
- Test as you code; maintain good coverage.
- Keep components lean; extract logic to services.
- Data persists only during application runtime (in-memory storage).
