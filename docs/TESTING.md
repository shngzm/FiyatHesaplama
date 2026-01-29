# Testing Strategy
## Elizi GoldTool - Trabzon Hasırı Gram Hesaplama Uygulaması

**Version:** 1.0  
**Last Updated:** 2026-01-26

---

## 1. Testing Overview

Bu dokümantasyon, Elizi GoldTool için kapsamlı test stratejisini tanımlar. Amaç, yüksek kaliteli, güvenilir ve sürdürülebilir kod sağlamaktır.

### 1.1 Testing Goals
- Minimum %80 code coverage
- Zero critical bugs in production
- Fast feedback during development
- Regression prevention
- Documentation through tests

### 1.2 Testing Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (10%)
        └─────────────┘
       ┌───────────────┐
       │ Integration   │   (20%)
       │    Tests      │
       └───────────────┘
      ┌──────────────────┐
      │   Unit Tests     │    (70%)
      └──────────────────┘
```

---

## 2. Unit Testing

### 2.1 Scope
Unit tests, bağımsız kod birimlerini (fonksiyonlar, metodlar, classes) test eder.

### 2.2 Tools
- **Framework:** Jasmine
- **Runner:** Karma
- **Coverage:** Istanbul (karma-coverage)

### 2.3 Testing Patterns

#### 2.3.1 Component Testing
```typescript
describe('PriceCalculatorComponent', () => {
  let component: PriceCalculatorComponent;
  let fixture: ComponentFixture<PriceCalculatorComponent>;
  let mockPriceService: jasmine.SpyObj<PriceService>;

  beforeEach(async () => {
    mockPriceService = jasmine.createSpyObj('PriceService', ['create']);
    
    await TestBed.configureTestingModule({
      imports: [PriceCalculatorComponent],
      providers: [
        { provide: PriceService, useValue: mockPriceService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceCalculatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total correctly', () => {
    // Test implementation
  });
});
```

#### 2.3.2 Service Testing
```typescript
describe('CalculationService', () => {
  let service: CalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateTotal', () => {
    it('should multiply unit price by quantity', () => {
      const result = service.calculateTotal(10, 5);
      expect(result).toBe(50);
    });

    it('should handle decimal numbers', () => {
      const result = service.calculateTotal(10.99, 3);
      expect(result).toBeCloseTo(32.97, 2);
    });
  });
});
```

### 2.4 Unit Test Coverage Goals

| Component/Service | Target Coverage |
|-------------------|----------------|
| Components        | 80%            |
| Services          | 90%            |
| Models            | 100%           |
| Validators        | 90%            |
| Pipes             | 90%            |

### 2.5 What to Test (Unit Tests)

#### Components
- ✅ Component initialization
- ✅ Input/Output bindings
- ✅ Event handlers
- ✅ Conditional rendering logic
- ✅ Form validation
- ✅ User interactions
- ❌ Template rendering (integration test)
- ❌ CSS styling

#### Services
- ✅ Method return values
- ✅ State management
- ✅ Error handling
- ✅ Data transformations
- ✅ Observable emissions
- ✅ Side effects

#### Validators
- ✅ Valid inputs return null
- ✅ Invalid inputs return error objects
- ✅ Edge cases (empty, null, undefined)

---

## 3. Integration Testing

### 3.1 Scope
Integration tests, birden fazla birimin birlikte çalışmasını test eder.

### 3.2 Focus Areas
- Component ↔ Service interactions
- Form submissions
- Data flow through application
- Router navigation
- Event propagation

### 3.3 Example Integration Test

```typescript
describe('PriceCalculator Integration', () => {
  let component: PriceCalculatorComponent;
  let priceService: PriceService;
  let calculationService: CalculationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PriceCalculatorComponent,
        ReactiveFormsModule
      ],
      providers: [
        PriceService,
        CalculationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceCalculatorComponent);
    component = fixture.componentInstance;
    priceService = TestBed.inject(PriceService);
    calculationService = TestBed.inject(CalculationService);
  });

  it('should save calculated price to service', fakeAsync(() => {
    // Setup
    component.form.patchValue({
      productName: 'Test Product',
      unitPrice: 100,
      quantity: 2,
      taxRate: 20
    });

    // Spy on service
    spyOn(priceService, 'create');

    // Act
    component.onSubmit();
    tick();

    // Assert
    expect(priceService.create).toHaveBeenCalled();
  }));
});
```

---

## 4. End-to-End (E2E) Testing

### 4.1 Scope
E2E tests, kullanıcı perspektifinden tüm uygulamayı test eder.

### 4.2 Tools
- **Framework:** Cypress (önerilen) veya Protractor
- **Browser:** Chrome (headless)

### 4.3 E2E Test Scenarios

#### Scenario 1: Calculate and Save Price
```typescript
describe('Price Calculation Flow', () => {
  it('should calculate and save a price', () => {
    cy.visit('/calculator');
    
    cy.get('[data-testid="product-name"]').type('Test Product');
    cy.get('[data-testid="unit-price"]').type('100');
    cy.get('[data-testid="quantity"]').type('2');
    cy.get('[data-testid="tax-rate"]').select('20');
    
    cy.get('[data-testid="calculate-btn"]').click();
    
    cy.get('[data-testid="total"]').should('contain', '240');
    
    cy.get('[data-testid="save-btn"]').click();
    
    cy.visit('/list');
    cy.get('[data-testid="price-table"]')
      .should('contain', 'Test Product');
  });
});
```

#### Scenario 2: Edit Existing Price
```typescript
describe('Edit Price Flow', () => {
  it('should edit an existing price', () => {
    // Prerequisites: Create a price first
    cy.createPrice({ name: 'Test', price: 100, qty: 2 });
    
    cy.visit('/list');
    cy.get('[data-testid="edit-btn"]').first().click();
    
    cy.get('[data-testid="quantity"]').clear().type('3');
    cy.get('[data-testid="save-btn"]').click();
    
    cy.get('[data-testid="price-table"]')
      .should('contain', '360'); // 100 * 3 * 1.2
  });
});
```

#### Scenario 3: Delete Price
```typescript
describe('Delete Price Flow', () => {
  it('should delete a price with confirmation', () => {
    cy.createPrice({ name: 'Test', price: 100, qty: 2 });
    
    cy.visit('/list');
    cy.get('[data-testid="delete-btn"]').first().click();
    
    cy.get('[data-testid="confirm-delete"]').click();
    
    cy.get('[data-testid="price-table"]')
      .should('not.contain', 'Test');
  });
});
```

---

## 5. Test Data Management

### 5.1 Test Data Strategy
- Use factories for creating test objects
- Mock external dependencies
- Isolated test data (no shared state)

### 5.2 Test Data Factory Example

```typescript
// test-helpers/price-calculation.factory.ts
export class PriceCalculationFactory {
  static create(overrides?: Partial<PriceCalculation>): PriceCalculation {
    return {
      id: generateId(),
      productName: 'Test Product',
      unitPrice: 100,
      quantity: 1,
      taxRate: TaxRate.TWENTY,
      subtotal: 100,
      taxAmount: 20,
      total: 120,
      createdAt: new Date(),
      ...overrides
    };
  }

  static createMany(count: number): PriceCalculation[] {
    return Array.from({ length: count }, (_, i) => 
      this.create({ productName: `Product ${i + 1}` })
    );
  }
}
```

---

## 6. Mocking Strategy

### 6.1 Service Mocks

```typescript
// mocks/price.service.mock.ts
export class MockPriceService {
  private mockData$ = new BehaviorSubject<PriceCalculation[]>([]);
  
  prices$ = this.mockData$.asObservable();

  create(price: PriceCalculation): void {
    const current = this.mockData$.value;
    this.mockData$.next([...current, price]);
  }

  update(id: string, price: PriceCalculation): void {
    const current = this.mockData$.value;
    const index = current.findIndex(p => p.id === id);
    current[index] = price;
    this.mockData$.next([...current]);
  }

  delete(id: string): void {
    const current = this.mockData$.value;
    this.mockData$.next(current.filter(p => p.id !== id));
  }

  reset(): void {
    this.mockData$.next([]);
  }
}
```

### 6.2 Using Mocks in Tests

```typescript
beforeEach(() => {
  mockPriceService = new MockPriceService();
  
  TestBed.configureTestingModule({
    providers: [
      { provide: PriceService, useValue: mockPriceService }
    ]
  });
});

afterEach(() => {
  mockPriceService.reset();
});
```

---

## 7. Test Organization

### 7.1 File Structure
```
src/app/
  ├── components/
  │   ├── price-calculator/
  │   │   ├── price-calculator.component.ts
  │   │   ├── price-calculator.component.spec.ts
  │   │   └── price-calculator.component.integration.spec.ts
  │   └── price-list/
  │       ├── price-list.component.ts
  │       └── price-list.component.spec.ts
  ├── services/
  │   ├── price.service.ts
  │   └── price.service.spec.ts
  └── test-helpers/
      ├── factories/
      ├── mocks/
      └── utils/
```

### 7.2 Naming Conventions
- Unit tests: `*.spec.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e-spec.ts`

---

## 8. Running Tests

### 8.1 Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run specific test file
npm test -- --include='**/price.service.spec.ts'
```

### 8.2 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run e2e
```

---

## 9. Code Coverage

### 9.1 Coverage Thresholds

```javascript
// karma.conf.js
coverageReporter: {
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcovonly' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

### 9.2 Viewing Coverage

```bash
# Generate and view coverage report
npm run test:coverage
open coverage/index.html
```

---

## 10. Testing Best Practices

### 10.1 Do's
✅ Write tests before or alongside code (TDD)  
✅ Test behavior, not implementation  
✅ Use descriptive test names  
✅ Follow AAA pattern (Arrange, Act, Assert)  
✅ Keep tests simple and focused  
✅ Mock external dependencies  
✅ Test edge cases and error scenarios  
✅ Keep test data isolated  

### 10.2 Don'ts
❌ Don't test framework code  
❌ Don't test third-party libraries  
❌ Don't share state between tests  
❌ Don't write overly complex tests  
❌ Don't skip tests (fix or remove)  
❌ Don't test implementation details  
❌ Don't ignore failing tests  

---

## 11. Test Maintenance

### 11.1 Review Process
- All PRs must include tests
- Coverage must not decrease
- Failing tests block merges
- Regular test suite refactoring

### 11.2 Test Debt Management
- Track slow tests
- Remove obsolete tests
- Refactor brittle tests
- Update tests with code changes

---

## 12. Performance Testing

### 12.1 Performance Benchmarks
- Component render time < 100ms
- Service method execution < 10ms
- Full calculation flow < 200ms

### 12.2 Performance Test Example

```typescript
it('should calculate 1000 prices in under 1 second', () => {
  const start = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    service.calculateTotal(100, 5);
  }
  
  const end = performance.now();
  const duration = end - start;
  
  expect(duration).toBeLessThan(1000);
});
```

---

## 13. Accessibility Testing

### 13.1 A11y Testing
- Use axe-core for automated testing
- Manual keyboard navigation testing
- Screen reader testing

### 13.2 Example A11y Test

```typescript
it('should be accessible', async () => {
  const results = await axe(fixture.nativeElement);
  expect(results.violations.length).toBe(0);
});
```

---

## 14. Test Metrics & Monitoring

### 14.1 Key Metrics
- Test coverage percentage
- Test execution time
- Number of failing tests
- Flaky test count
- Time to fix broken tests

### 14.2 Monitoring
- Daily coverage reports
- Weekly test suite health check
- Monthly test performance review

---

## 15. Future Testing Enhancements

- Visual regression testing (Percy/Chromatic)
- Load testing
- Security testing
- Cross-browser testing
- Mobile device testing
- API contract testing (when backend added)

---

## Appendix: Test Checklist

### Before Committing
- [ ] All tests pass
- [ ] Coverage meets threshold
- [ ] No skipped tests without reason
- [ ] Test names are descriptive
- [ ] No console errors in tests

### Before Release
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Coverage ≥ 80%
- [ ] Performance tests pass
- [ ] Accessibility tests pass
- [ ] Manual testing completed
