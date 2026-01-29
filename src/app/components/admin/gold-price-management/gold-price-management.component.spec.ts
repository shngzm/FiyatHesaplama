import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldPriceManagementComponent } from './gold-price-management.component';

describe('GoldPriceManagementComponent', () => {
  let component: GoldPriceManagementComponent;
  let fixture: ComponentFixture<GoldPriceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldPriceManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoldPriceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
