import Model from '../models/Model.js';

export const getAllModels = async (req, res) => {
  try {
    const models = await Model.find();
    // Sort by createdAt descending
    models.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    res.json({ success: true, data: model });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createModel = async (req, res) => {
  try {
    const model = await Model.create(req.body);
    res.status(201).json({ success: true, data: model });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateModel = async (req, res) => {
  try {
    const model = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    res.json({ success: true, data: model });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteModel = async (req, res) => {
  try {
    const model = await Model.findByIdAndDelete(req.params.id);
    if (!model) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
