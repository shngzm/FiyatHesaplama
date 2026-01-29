# Architecture Document
## Elizi GoldTool - Trabzon Hasırı Gram Hesaplama Uygulaması

**Version:** 1.0  
**Last Updated:** 2026-01-26

---

## 1. System Overview

Elizi GoldTool, Angular 17 kullanılarak geliştirilmiş, client-side bir single page application (SPA)'dır. Uygulama, kullanıcıların kuyum ürünlerinin gram hesaplamalarını yapmasına ve bu hesaplamalar için gerekli model ve ürün tanımlarını yönetmesine olanak tanır.

### 1.1 Tech Stack
- **Framework:** Angular 17+
- **Language:** TypeScript 5.2+
- **Reactive Programming:** RxJS 7.8+
- **Styling:** SCSS
- **Testing:** Jasmine + Karma
- **Build Tool:** Angular CLI
- **Server:** Angular SSR (optional)

---

## 2. Application Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Angular Application                      │ │
│  │                                                     │ │
│  │  ┌──────────────┐      ┌──────────────┐          │ │
│  │  │  Components  │◄────►│   Services   │          │ │
│  │  │              │      │              │          │ │
│  │  │  - Calculator│      │  - Price     │          │ │
│  │  │  - List      │      │  - Calc      │          │ │
│  │  │  - Edit      │      │  - Notif     │          │ │
│  │  └──────────────┘      └──────────────┘          │ │
│  │         │                      │                   │ │
│  │         │                      │                   │ │
│  │         ▼                      ▼                   │ │
│  │  ┌──────────────┐      ┌──────────────┐          │ │
│  │  │    Models    │      │  In-Memory   │          │ │
│  │  │              │      │    Storage   │          │ │
│  │  │  - Price     │      │ (RxJS State) │          │ │
│  │  │  - PriceCalc │      │              │          │ │
│  │  └──────────────┘      └──────────────┘          │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Layered Architecture

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Components, Templates, Styles)        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│         (Services, Validators)          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Data Layer                     │
│     (Models, In-Memory Storage)         │
└─────────────────────────────────────────┘
```

---

## 3. Component Structure

### 3.1 Component Hierarchy

```
AppComponent (Root)
│
├── HeaderComponent
│
├── PriceCalculatorComponent
│   ├── Form Controls
│   └── Calculate Button
│
├── PriceListComponent
│   ├── Table View
│   ├── Edit Button (per row)
│   └── Delete Button (per row)
│
├── EditPriceDialogComponent (Modal)
│   └── Edit Form
│
└── DeleteConfirmationDialogComponent (Modal)
    └── Confirmation Buttons
```

### 3.2 Component Details

#### 3.2.1 AppComponent
- **Purpose:** Root component, main layout
- **Responsibilities:**
  - Application shell
  - Router outlet
  - Global error handling

#### 3.2.2 PriceCalculatorComponent
- **Purpose:** Price calculation interface
- **Responsibilities:**
  - Reactive form management
  - Input validation
  - Tax calculation
  - Save to service
- **Inputs:** None
- **Outputs:** `priceCalculated: EventEmitter<PriceCalculation>`

#### 3.2.3 PriceListComponent
- **Purpose:** Display saved price calculations
- **Responsibilities:**
  - Fetch data from service
  - Display in table format
  - Sort functionality
  - Trigger edit/delete actions
- **Inputs:** None
- **Outputs:** None

#### 3.2.4 EditPriceDialogComponent
- **Purpose:** Edit existing price calculation
- **Responsibilities:**
  - Load existing data
  - Form validation
  - Update service
- **Inputs:** `priceCalculation: PriceCalculation`
- **Outputs:** `updated: EventEmitter<PriceCalculation>`

#### 3.2.5 DeleteConfirmationDialogComponent
- **Purpose:** Confirm delete action
- **Responsibilities:**
  - Show confirmation message
  - Handle user response
- **Inputs:** `itemName: string`
- **Outputs:** `confirmed: EventEmitter<boolean>`

---

## 4. Service Layer

### 4.1 PriceService
- **Purpose:** Manage price calculation data
- **Responsibilities:**
  - CRUD operations for price calculations
  - In-memory storage using BehaviorSubject
  - Data persistence during session
- **Key Methods:**
  ```typescript
  getAll(): Observable<PriceCalculation[]>
  getById(id: string): Observable<PriceCalculation>
  create(price: PriceCalculation): void
  update(id: string, price: PriceCalculation): void
  delete(id: string): void
  ```

### 4.2 CalculationService
- **Purpose:** Price calculation logic
- **Responsibilities:**
  - Calculate total price
  - Calculate tax amounts
  - Format currency
- **Key Methods:**
  ```typescript
  calculateTotal(unitPrice: number, quantity: number): number
  calculateTax(amount: number, taxRate: number): number
  calculateWithTax(amount: number, taxRate: number): number
  formatCurrency(amount: number): string
  ```

### 4.3 NotificationService
- **Purpose:** User notifications
- **Responsibilities:**
  - Show success messages
  - Show error messages
  - Show warnings
- **Key Methods:**
  ```typescript
  success(message: string): void
  error(message: string): void
  warning(message: string): void
  ```

---

## 5. Data Models

### 5.1 PriceCalculation Model
```typescript
interface PriceCalculation {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: TaxRate;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: Date;
  updatedAt?: Date;
}
```

### 5.2 TaxRate Enum
```typescript
enum TaxRate {
  ZERO = 0,
  ONE = 1,
  EIGHT = 8,
  TWENTY = 20
}
```

---

## 6. Data Flow

### 6.1 Create Price Calculation Flow
```
User Input → PriceCalculatorComponent
     ↓
Form Validation
     ↓
CalculationService.calculateTotal()
     ↓
PriceService.create()
     ↓
BehaviorSubject.next()
     ↓
PriceListComponent (auto-update via subscription)
```

### 6.2 Update Price Calculation Flow
```
Edit Button Click → PriceListComponent
     ↓
Open EditPriceDialogComponent
     ↓
Load existing data
     ↓
User modifies
     ↓
Form Validation
     ↓
CalculationService.calculateTotal()
     ↓
PriceService.update()
     ↓
BehaviorSubject.next()
     ↓
PriceListComponent (auto-update)
```

### 6.3 Delete Price Calculation Flow
```
Delete Button Click → PriceListComponent
     ↓
Open DeleteConfirmationDialogComponent
     ↓
User confirms
     ↓
PriceService.delete()
     ↓
BehaviorSubject.next()
     ↓
PriceListComponent (auto-update)
```

---

## 7. State Management

### 7.1 In-Memory Storage Strategy
- **Implementation:** RxJS BehaviorSubject
- **Location:** PriceService
- **Lifecycle:** Application session only
- **Data Loss:** On page refresh/close

```typescript
private priceCalculations$ = new BehaviorSubject<PriceCalculation[]>([]);

// Public observable
public readonly prices$ = this.priceCalculations$.asObservable();
```

### 7.2 State Updates
- All state changes go through PriceService
- Components subscribe to state via Observable
- Immutable state updates (spread operator)

---

## 8. Routing Structure

```
/ (root)
├── /calculator  (PriceCalculatorComponent)
├── /list        (PriceListComponent)
└── /about       (AboutComponent - future)
```

---

## 9. Form Management

### 9.1 Reactive Forms
- All forms use Angular Reactive Forms
- FormBuilder for form construction
- Custom validators for business logic

### 9.2 Validation Rules
- **Product Name:** Required, min 2 chars, max 100 chars
- **Unit Price:** Required, positive number
- **Quantity:** Required, positive integer
- **Tax Rate:** Required, one of enum values

---

## 10. Error Handling

### 10.1 Strategy
- Service-level error catching
- User-friendly error messages
- Notification service for user feedback
- Console logging for debugging

### 10.2 Error Types
- Validation errors → Form-level display
- Service errors → Notification service
- Unexpected errors → Global error handler

---

## 11. Performance Considerations

### 11.1 Optimization Techniques
- OnPush change detection strategy
- TrackBy functions for *ngFor
- Lazy loading for future modules
- Pure pipes for data transformation

### 11.2 Memory Management
- Unsubscribe from observables (takeUntilDestroyed)
- Clean up event listeners
- Limit in-memory data size (optional warning)

---

## 12. Security Considerations

### 12.1 Client-Side Security
- Input sanitization
- XSS prevention (Angular built-in)
- No sensitive data storage
- HTTPS in production

---

## 13. Accessibility

### 13.1 WCAG 2.1 Compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast

---

## 14. Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

---

## 15. Future Architecture Considerations

### 15.1 Potential Enhancements
- LocalStorage persistence layer
- NgRx for state management (if complexity grows)
- Angular Material UI components
- Progressive Web App (PWA) features
- Backend API integration

### 15.2 Scalability
- Modular architecture allows easy feature addition
- Service-based design enables backend integration
- Component isolation supports parallel development

---

## 16. Development Guidelines

### 16.1 Code Organization
```
src/app/
  ├── components/       # UI components
  ├── services/         # Business logic & data
  ├── models/           # TypeScript interfaces/types
  ├── validators/       # Custom form validators
  ├── pipes/            # Custom pipes
  ├── guards/           # Route guards (future)
  └── shared/           # Shared utilities
```

### 16.2 Naming Conventions
- Components: `kebab-case.component.ts`
- Services: `kebab-case.service.ts`
- Models: `kebab-case.model.ts`
- Classes: PascalCase
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE

---

## 17. Testing Strategy

See [TESTING.md](./TESTING.md) for detailed testing architecture.

---

## Appendix: Diagrams

### Component Communication
```
PriceCalculatorComponent
        │
        │ emits priceCalculated
        ▼
   PriceService
        │
        │ BehaviorSubject.next()
        ▼
  prices$ Observable
        │
        │ subscribe
        ▼
PriceListComponent
```

### Service Dependencies
```
Components
    │
    ├─► PriceService
    │       └─► In-Memory Storage
    │
    ├─► CalculationService
    │       └─► Math Operations
    │
    └─► NotificationService
            └─► User Feedback
```
