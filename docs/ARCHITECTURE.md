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

---

## VERSION 2.0 - NEW ARCHITECTURE

### 18. Version 2.0 System Overview

Version 2.0 introduces three major features with AWS DynamoDB integration:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (Client)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            Angular Application v2.0                       │ │
│  │                                                           │ │
│  │  Components                   Services                   │ │
│  │  ├── Calculation (Updated)    ├── Calculation           │ │
│  │  ├── Customer Management      ├── Customer              │ │
│  │  ├── Order Management         ├── Order                 │ │
│  │  └── Report Dashboard         └── Report                │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS API Gateway                              │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Lambda (Node.js)                         │
│  ├── Customer Controller                                        │
│  ├── Order Controller                                           │
│  └── Report Controller                                          │
└─────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │DynamoDB  │    │DynamoDB  │    │DynamoDB  │
    │Customers │    │Orders    │    │Reports   │
    └──────────┘    └──────────┘    └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │S3 Bucket │
                    │Reports   │
                    └──────────┘
```

---

### 19. New Data Models (Version 2.0)

#### 19.1 Customer Model
```typescript
interface Customer {
  customerId: string;          // PK: UUID
  name: string;                // Required
  phone: string;               // Required, unique
  email?: string;              // Optional
  address?: string;            // Optional
  notes?: string;              // Optional
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}
```

#### 19.2 Order Model
```typescript
interface Order {
  orderId: string;             // PK: UUID
  customerId: string;          // FK: Customer
  productType: 'Kolye/Bilezik' | 'Yüzük/Küpe';
  modelId: string;             // FK: Model
  ayar: 14 | 22;
  sira: number;
  uzunluk?: number;            // Only for Kolye/Bilezik
  calculatedGram: number;
  goldPrice: number;
  totalPrice: number;
  orderDate: string;           // ISO 8601
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Denormalized for display
  customerName?: string;
  customerPhone?: string;
  modelName?: string;
}
```

#### 19.3 Monthly Report Model
```typescript
interface MonthlyReport {
  reportId: string;            // UUID
  month: string;               // PK: "YYYY-MM"
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalGrams: number;
  ayar14Count: number;
  ayar22Count: number;
  kolyeBilezikCount: number;
  yuzukKupeCount: number;
  topModels: Array<{
    modelId: string;
    modelName: string;
    count: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    orderCount: number;
    totalSpent: number;
  }>;
  createdAt: string;
  generatedBy: string;
}
```

---

### 20. DynamoDB Schema Design

#### 20.1 Customers Table
```
Table Name: GramFiyat-Customers
Partition Key: customerId (String)
Sort Key: None

GSI1: phone-index
  - Partition Key: phone (String)
  - Projection: ALL

Attributes:
  - customerId: String
  - name: String
  - phone: String
  - email: String (optional)
  - address: String (optional)
  - notes: String (optional)
  - createdAt: String
  - updatedAt: String
```

#### 20.2 Orders Table
```
Table Name: GramFiyat-Orders
Partition Key: orderId (String)
Sort Key: orderDate (String)

GSI1: customer-orders-index
  - Partition Key: customerId (String)
  - Sort Key: orderDate (String)
  - Projection: ALL

GSI2: status-orders-index
  - Partition Key: status (String)
  - Sort Key: orderDate (String)
  - Projection: ALL

Attributes: All Order fields (see model)
```

#### 20.3 Reports Table
```
Table Name: GramFiyat-Reports
Partition Key: month (String) "YYYY-MM"
Sort Key: createdAt (String)

Attributes: All MonthlyReport fields (see model)
```

---

### 21. API Endpoints (Version 2.0)

#### 21.1 Customer Endpoints
```
POST   /api/customers              - Create customer
GET    /api/customers              - List all customers
GET    /api/customers/:id          - Get customer by ID
PUT    /api/customers/:id          - Update customer
DELETE /api/customers/:id          - Delete customer
GET    /api/customers/phone/:phone - Check phone uniqueness
```

#### 21.2 Order Endpoints
```
POST   /api/orders                 - Create order
GET    /api/orders                 - List orders (filters: status, dateRange, customerId)
GET    /api/orders/:id             - Get order by ID
PUT    /api/orders/:id             - Update order
PUT    /api/orders/:id/status      - Update order status
DELETE /api/orders/:id             - Delete order
```

#### 21.3 Report Endpoints
```
POST   /api/reports/generate       - Generate monthly report
GET    /api/reports/:month         - Get report by month
GET    /api/reports                - List all reports
GET    /api/reports/:month/pdf     - Download PDF
GET    /api/reports/:month/excel   - Download Excel
POST   /api/reports/:reportId/upload-s3 - Upload to S3
```

---

### 22. Component Architecture (Version 2.0)

#### 22.1 Updated Component Hierarchy
```
AppComponent (Root)
│
├── HeaderComponent
│
├── HomeComponent
│   └── Product Type Selection
│
├── CalculationComponent (Updated)
│   ├── Product Type Dropdown (NEW)
│   ├── Form Controls (Updated logic)
│   ├── Calculate Button
│   └── Create Order Button (NEW)
│
├── OrderFormModalComponent (NEW)
│   ├── Customer Selection
│   ├── New Customer Form
│   └── Order Notes
│
├── CustomerManagementComponent (NEW)
│   ├── Customer List Table
│   ├── Add Customer Form
│   ├── Edit Customer Modal
│   └── Delete Confirmation
│
├── OrderManagementComponent (NEW)
│   ├── Order List Table
│   ├── Status Filter
│   ├── Date Range Filter
│   ├── Order Details Modal
│   └── Update Status Modal
│
├── ReportDashboardComponent (NEW)
│   ├── Month/Year Selector
│   ├── Generate Report Button
│   ├── Summary Cards
│   ├── Charts Container
│   │   ├── AyarDistributionChart
│   │   ├── ProductTypeChart
│   │   ├── MonthlyTrendChart
│   │   └── TopModelsChart
│   ├── Top Customers Table
│   └── Export Buttons (PDF/Excel)
│
└── Admin Panel
    ├── Model Management (Existing)
    ├── Product Management (Existing)
    ├── Customer Management (NEW)
    ├── Order Management (NEW)
    └── Reports (NEW)
```

---

### 23. Service Architecture (Version 2.0)

#### 23.1 New Services

**CustomerService:**
```typescript
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = environment.apiUrl + '/customers';
  
  create(customer: Partial<Customer>): Observable<Customer>
  getAll(): Observable<Customer[]>
  getById(id: string): Observable<Customer>
  update(id: string, customer: Partial<Customer>): Observable<Customer>
  delete(id: string): Observable<void>
  checkPhoneUnique(phone: string): Observable<boolean>
}
```

**OrderService:**
```typescript
@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';
  
  create(order: Partial<Order>): Observable<Order>
  getAll(filters?: OrderFilters): Observable<Order[]>
  getById(id: string): Observable<Order>
  update(id: string, order: Partial<Order>): Observable<Order>
  updateStatus(id: string, status: OrderStatus): Observable<Order>
  delete(id: string): Observable<void>
}
```

**ReportService:**
```typescript
@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = environment.apiUrl + '/reports';
  
  generate(month: string): Observable<MonthlyReport>
  getByMonth(month: string): Observable<MonthlyReport>
  getAll(): Observable<MonthlyReport[]>
  exportPDF(month: string): Observable<Blob>
  exportExcel(month: string): Observable<Blob>
  uploadToS3(reportId: string): Observable<S3UploadResult>
}
```

#### 23.2 Updated Services

**CalculationService (Updated):**
```typescript
@Injectable({ providedIn: 'root' })
export class CalculationService {
  calculateGram(params: CalculationParams): number {
    if (params.productType === 'Kolye/Bilezik') {
      return this.calculateKolyeBilezik(params);
    } else {
      return this.calculateYuzukKupe(params);
    }
  }
  
  private calculateKolyeBilezik(params): number {
    // ((Uzunluk + Pay) * 1cm Tel) + Diğer Ağırlıklar - Kesilen Parça
    return ((params.uzunluk + params.pay) * params.birimCmTel) 
           + params.digerAgirliklar - params.kesilenParca;
  }
  
  private calculateYuzukKupe(params): number {
    // (Sıra * 1cm Tel) + Diğer Ağırlıklar
    return (params.sira * params.birimCmTel) + params.digerAgirliklar;
  }
}
```

---

### 24. Data Flow (Version 2.0)

#### 24.1 Order Creation Flow
```
User completes calculation
     ↓
Clicks "Sipariş Oluştur" button
     ↓
OrderFormModalComponent opens
     ↓
User selects/creates customer
     ↓
User fills order notes
     ↓
OrderService.create()
     ↓
POST /api/orders → Lambda
     ↓
DynamoDB Orders table (PUT)
     ↓
Success response
     ↓
Notification displayed
     ↓
Modal closes
```

#### 24.2 Report Generation Flow
```
Admin selects month/year
     ↓
Clicks "Rapor Oluştur"
     ↓
ReportService.generate(month)
     ↓
POST /api/reports/generate → Lambda
     ↓
DynamoDB Orders query (all orders for month)
     ↓
Calculate aggregations
     ↓
DynamoDB Reports table (PUT)
     ↓
Return report data
     ↓
ReportDashboardComponent displays charts
     ↓
User clicks "PDF İndir"
     ↓
ReportService.exportPDF(month)
     ↓
Lambda generates PDF
     ↓
Upload to S3
     ↓
Return download URL
     ↓
Browser downloads file
```

---

### 25. Chart Architecture (ng2-charts)

#### 25.1 Chart Components

**AyarDistributionChart:**
```typescript
@Component({
  selector: 'app-ayar-distribution-chart',
  template: '<canvas baseChart [data]="chartData" [type]="chartType"></canvas>'
})
export class AyarDistributionChartComponent {
  chartType: ChartType = 'bar';
  chartData: ChartData = {
    labels: ['14 Ayar', '22 Ayar'],
    datasets: [{
      label: 'Sipariş Sayısı',
      data: [ayar14Count, ayar22Count],
      backgroundColor: ['#FFD700', '#B8860B']
    }]
  };
}
```

**ProductTypeChart:**
```typescript
@Component({
  selector: 'app-product-type-chart',
  template: '<canvas baseChart [data]="chartData" [type]="chartType"></canvas>'
})
export class ProductTypeChartComponent {
  chartType: ChartType = 'pie';
  chartData: ChartData = {
    labels: ['Kolye/Bilezik', 'Yüzük/Küpe'],
    datasets: [{
      data: [kolyeBilezikCount, yuzukKupeCount],
      backgroundColor: ['#4A90E2', '#9B59B6']
    }]
  };
}
```

---

### 26. S3 Integration Architecture

#### 26.1 S3 Bucket Structure
```
gramfiyat-reports/
├── 2026/
│   ├── 01/
│   │   ├── report-2026-01-20260201T120000Z.pdf
│   │   └── report-2026-01-20260201T120000Z.xlsx
│   ├── 02/
│   └── 03/
└── 2027/
```

#### 26.2 Lifecycle Configuration
```json
{
  "Rules": [
    {
      "Id": "MoveToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

---

### 27. Security Architecture (Version 2.0)

#### 27.1 Authentication Flow (Existing)
```
User login → POST /api/auth/login
     ↓
Lambda validates credentials
     ↓
Generate JWT token
     ↓
Return token to client
     ↓
Store in sessionStorage
     ↓
Include in all API requests (Authorization header)
     ↓
Lambda validates token on each request
```

#### 27.2 Authorization Levels
```
Guest:
  - View calculation page only

User (Authenticated):
  - All Guest permissions
  - Create orders
  - View own order history

Admin:
  - All User permissions
  - Manage customers
  - Manage all orders
  - Generate reports
  - Export reports
  - Manage models/products
```

#### 27.3 Data Security
- Customer PII encrypted at rest (DynamoDB encryption)
- HTTPS only (API Gateway + Amplify)
- JWT tokens expire after 24 hours
- Phone numbers hashed for uniqueness checks
- S3 bucket private (presigned URLs for downloads)

---

### 28. Cost Optimization Architecture

#### 28.1 DynamoDB Optimization
```
Strategy:
1. Start with On-Demand billing
2. Monitor read/write patterns (CloudWatch)
3. Switch to Provisioned when traffic predictable
4. Use Auto Scaling for Provisioned capacity
5. Optimize query patterns with GSIs
6. Implement caching in application layer
```

#### 28.2 Lambda Optimization
```
Strategy:
1. Right-size memory allocation (1024MB start)
2. Minimize cold starts (Provisioned Concurrency if needed)
3. Reuse connections (database, S3)
4. Optimize bundle size
5. Use Lambda Layers for shared dependencies
```

#### 28.3 S3 Optimization
```
Strategy:
1. Implement lifecycle policies (Standard → IA → Glacier)
2. Compress PDF/Excel files
3. Use CloudFront for frequent access (optional)
4. Delete old reports after retention period
5. Use Intelligent-Tiering for unpredictable access
```

---

### 29. Monitoring & Logging Architecture

#### 29.1 CloudWatch Metrics
```
Custom Metrics:
- Order creation rate
- Report generation time
- Customer registration rate
- API error rates
- Lambda execution duration
- DynamoDB throttling events
```

#### 29.2 Alarms
```
Critical Alarms:
- Lambda error rate > 5%
- API Gateway 5xx errors
- DynamoDB read/write throttling
- S3 upload failures
- High AWS cost (> budget threshold)
```

#### 29.3 Logging Strategy
```
Logs to Capture:
- All API requests/responses
- Order creation events
- Report generation events
- Authentication failures
- DynamoDB query performance
- Error stack traces
```

---

### 30. Performance Architecture

#### 30.1 Frontend Performance
```
Optimizations:
- OnPush change detection
- Virtual scrolling for large lists
- Lazy loading for admin modules
- Image optimization
- Chart data memoization
- API response caching (5-10 minutes)
```

#### 30.2 Backend Performance
```
Optimizations:
- DynamoDB GSI for efficient queries
- Batch operations for bulk reads/writes
- Connection pooling
- Lambda warm starts (scheduled pings)
- Async processing for reports
- Pagination for large result sets
```

---

**Last Updated:** 2026-02-10  
**Version:** 2.0  
**Status:** Planning Complete
