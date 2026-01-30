import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ScrapCalculatorComponent } from './scrap-calculator.component';

describe('ScrapCalculatorComponent', () => {
  let component: ScrapCalculatorComponent;
  let fixture: ComponentFixture<ScrapCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrapCalculatorComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScrapCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Ayar Katsayıları Testi', () => {
    it('Elizi ürünü - 8 ayar için 0.333 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 8;
      expect(component.getKatsayi()).toBe(0.333);
    });

    it('Elizi ürünü - 10 ayar için 0.417 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 10;
      expect(component.getKatsayi()).toBe(0.417);
    });

    it('Elizi ürünü - 14 ayar için 0.585 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 14;
      expect(component.getKatsayi()).toBe(0.585);
    });

    it('Elizi ürünü - 18 ayar için 0.750 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 18;
      expect(component.getKatsayi()).toBe(0.750);
    });

    it('Elizi ürünü - 21 ayar için 0.875 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 21;
      expect(component.getKatsayi()).toBe(0.875);
    });

    it('Elizi ürünü - 22 ayar için 0.916 döndürmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = 22;
      expect(component.getKatsayi()).toBe(0.916);
    });

    it('Diğer ürün - 8 ayar için 0.330 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 8;
      expect(component.getKatsayi()).toBe(0.330);
    });

    it('Diğer ürün - 10 ayar için 0.415 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 10;
      expect(component.getKatsayi()).toBe(0.415);
    });

    it('Diğer ürün - 14 ayar için 0.575 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 14;
      expect(component.getKatsayi()).toBe(0.575);
    });

    it('Diğer ürün - 18 ayar için 0.745 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 18;
      expect(component.getKatsayi()).toBe(0.745);
    });

    it('Diğer ürün - 21 ayar için 0.870 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 21;
      expect(component.getKatsayi()).toBe(0.870);
    });

    it('Diğer ürün - 22 ayar için 0.912 döndürmeli', () => {
      component.productType = 'diger';
      component.quickAyar = 22;
      expect(component.getKatsayi()).toBe(0.912);
    });

    it('String olarak gelen ayar değerini number\'a çevirmeli', () => {
      component.productType = 'elizi';
      component.quickAyar = '14' as any;
      expect(component.getKatsayi()).toBe(0.585);
    });

    it('Tanımlanmamış ayar için ayar/24 formülünü kullanmalı', () => {
      component.productType = 'elizi';
      component.quickAyar = 20 as any; // Test için
      expect(component.getKatsayi()).toBeCloseTo(20/24, 3);
    });
  });
});
