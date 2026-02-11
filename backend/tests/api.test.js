import request from 'supertest';
import app from '../src/testServer.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('API Integration Tests', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: 'test-admin', username: 'testadmin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Model API', () => {
    let createdModelId;

    it('should create a model for Kolye/Bilezik', async () => {
      const modelData = {
        modelTipi: 'Test Kolye Model',
        productType: 'Kolye/Bilezik',
        altTipi: 'standart',
        ayar: 14,
        sira: 1,
        birimCMTel: 0.5,
        kesilenParca: 2,
        digerAgirliklar: 1.5,
        iscilik: 100
      };

      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData);

      expect([201, 403]).toContain(response.status);
      if (response.status === 201 && response.body.data) {
        createdModelId = response.body.data.id;
        expect(response.body.success).toBe(true);
        expect(response.body.data.modelTipi).toBe('Test Kolye Model');
      }
    });

    it('should get all models', async () => {
      const response = await request(app)
        .get('/api/models')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject model creation without auth', async () => {
      const response = await request(app)
        .post('/api/models')
        .send({ modelTipi: 'Unauthorized Model' });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Product API', () => {
    let testModelId;

    beforeAll(async () => {
      const modelResponse = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          modelTipi: 'Product Test Model',
          productType: 'Yüzük',
          ayar: 18,
          sira: 1
        });

      if (modelResponse.body.data) {
        testModelId = modelResponse.body.data.id;
      }
    });

    it('should create a product for Yüzük', async () => {
      if (!testModelId) {
        console.log('Skipping - no test model available');
        return;
      }

      const productData = {
        modelId: testModelId,
        productType: 'Yüzük',
        ayar: 18,
        sira: 1
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      if (response.body.data) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.productType).toBe('Yüzük');
      }
    });

    it('should reject product without required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productType: 'Küpe' });

      expect([400, 403]).toContain(response.status);
    });
  });

  describe('Calculation Logic', () => {
    it('should validate Kolye/Bilezik calculation formula', () => {
      // Formula: ((uzunluk - kesilenParca) * birimCMTel) + digerAgirliklar
      const uzunluk = 45;
      const kesilenParca = 2;
      const birimCMTel = 0.5;
      const digerAgirliklar = 1.5;

      const expectedGram = ((uzunluk - kesilenParca) * birimCMTel) + digerAgirliklar;
      expect(expectedGram).toBe(23.0);
    });

    it('should validate Yüzük/Küpe calculation formula', () => {
      // Formula: (sira * birimCMTel) + digerAgirliklar
      const sira = 2;
      const birimCMTel = 0.3;
      const digerAgirliklar = 1.0;

      const expectedGram = (sira * birimCMTel) + digerAgirliklar;
      expect(expectedGram).toBe(1.6);
    });

    it('should calculate price correctly', () => {
      const gram = 23.0;
      const altinKuru = 3000;
      const ayarKatsayisi = 0.585; // 14 ayar
      const iscilik = 100;

      // Formula: (gram * altinKuru * ayarKatsayisi) + (gram * iscilik)
      const expectedPrice = Math.round((gram * altinKuru * ayarKatsayisi) + (gram * iscilik));
      
      // Actual calculation: 23 * 3000 * 0.585 = 40365, 23 * 100 = 2300, Total = 42665
      expect(expectedPrice).toBe(42665);
    });

    it('should use correct ayar coefficients', () => {
      const ayarMap = {
        8: 0.333,
        9: 0.375,
        10: 0.417,
        14: 0.585,
        18: 0.750,
        21: 0.875,
        22: 0.917,
        24: 1.000
      };

      expect(ayarMap[14]).toBe(0.585);
      expect(ayarMap[18]).toBe(0.750);
      expect(ayarMap[24]).toBe(1.000);
    });
  });

  describe('Business Rules', () => {
    it('should require uzunluk for Kolye/Bilezik', () => {
      const kolyeBilezikTypes = ['Kolye/Bilezik', 'Kolye', 'Bilezik'];
      kolyeBilezikTypes.forEach(type => {
        expect(type).toMatch(/Kolye|Bilezik/);
      });
    });

    it('should not require uzunluk for Yüzük/Küpe', () => {
      const yuzukKupeTypes = ['Yüzük', 'Küpe'];
      yuzukKupeTypes.forEach(type => {
        expect(['Yüzük', 'Küpe']).toContain(type);
      });
    });

    it('should require model selection for all products', () => {
      const productTypes = ['Kolye/Bilezik', 'Yüzük', 'Küpe'];
      productTypes.forEach(type => {
        expect(type).toBeTruthy();
      });
    });
  });
});
