import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapCalculatorComponent } from './scrap-calculator.component';

describe('ScrapCalculatorComponent', () => {
  let component: ScrapCalculatorComponent;
  let fixture: ComponentFixture<ScrapCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrapCalculatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScrapCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
