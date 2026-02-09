import GoldPrice from '../models/GoldPrice.js';

export const getGoldPrice = async (req, res) => {
  try {
    // Get the most recent gold price
    const goldPrice = await GoldPrice.findOne();
    if (!goldPrice) {
      // Return default if no price exists
      return res.json({ 
        success: true, 
        data: { currency: 'TRY', buying: 7000, selling: 7000 } 
      });
    }
    res.json({ success: true, data: goldPrice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGoldPrice = async (req, res) => {
  try {
    const { buying, selling, currency } = req.body;
    
    // Create new gold price entry
    const goldPrice = await GoldPrice.create({
      buying,
      selling,
      currency: currency || 'TRY'
    });
    
    res.json({ success: true, data: goldPrice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getGoldPriceHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await GoldPrice.find({ limit });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
