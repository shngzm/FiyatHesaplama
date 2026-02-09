import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CalculationService } from './calculation.service';
import { ProductService } from './product.service';
import { ModelService } from './model.service';
import { GoldPriceService } from './gold-price.service';

describe('CalculationService', () => {
  let service: CalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CalculationService,
        ProductService,
        ModelService,
        GoldPriceService
      ]
    });

    service = TestBed.inject(CalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have history observable', (done) => {
    service.history$.subscribe(history => {
      expect(Array.isArray(history)).toBe(true);
      done();
    });
  });

  it('should clear history', (done) => {
    let historyCount = 0;
    service.history$.subscribe(history => {
      historyCount = history.length;
    });

    service.clearHistory();

    setTimeout(() => {
      expect(historyCount).toBe(0);
      done();
    }, 100);
  });
});
