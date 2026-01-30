import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GramPriceCalculatorComponent } from './gram-price-calculator.component';

describe('GramPriceCalculatorComponent', () => {
  let component: GramPriceCalculatorComponent;
  let fixture: ComponentFixture<GramPriceCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GramPriceCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GramPriceCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
