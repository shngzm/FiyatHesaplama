import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // Populate modelId for each product
    const populatedProducts = await Promise.all(
      products.map(product => Product.populate(product, 'modelId'))
    );
    // Sort by createdAt descending
    populatedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: populatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const populatedProduct = await Product.populate(product, 'modelId');
    res.json({ success: true, data: populatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductByModelAyarSira = async (req, res) => {
  try {
    const { modelId, ayar, sira } = req.query;
    const product = await Product.findOne({ modelId, ayar: Number(ayar), sira: Number(sira) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const populatedProduct = await Product.populate(product, 'modelId');
    res.json({ success: true, data: populatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    // Validate required fields
    const { modelId, ayar, sira, birimCmTel, kesilenParca, digerAgirliklar, iscilik } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ success: false, message: 'Model ID is required' });
    }
    if (ayar === undefined || ayar === null) {
      return res.status(400).json({ success: false, message: 'Ayar is required' });
    }
    if (sira === undefined || sira === null) {
      return res.status(400).json({ success: false, message: 'Sıra is required' });
    }
    if (birimCmTel === undefined || birimCmTel === null) {
      return res.status(400).json({ success: false, message: 'Birim CM Tel is required' });
    }
    if (kesilenParca === undefined || kesilenParca === null) {
      return res.status(400).json({ success: false, message: 'Kesilen Parça is required' });
    }
    if (digerAgirliklar === undefined || digerAgirliklar === null) {
      return res.status(400).json({ success: false, message: 'Diğer Ağırlıklar is required' });
    }
    if (iscilik === undefined || iscilik === null) {
      return res.status(400).json({ success: false, message: 'İşçilik is required' });
    }

    console.log('Creating product with data:', req.body);
    const product = await Product.create(req.body);
    const populatedProduct = await Product.populate(product, 'modelId');
    res.status(201).json({ success: true, data: populatedProduct });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const populatedProduct = await Product.populate(product, 'modelId');
    res.json({ success: true, data: populatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
