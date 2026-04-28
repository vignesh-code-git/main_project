const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  price: z.preprocess((val) => parseFloat(val), z.number().positive("Price must be positive")),
  originalPrice: z.preprocess((val) => val ? parseFloat(val) : undefined, z.number().positive().optional()),
  description: z.string().min(10, "Description must be at least 10 characters"),
  CategoryId: z.preprocess((val) => parseInt(val), z.number().int().positive()),
  brand: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  rating: z.preprocess((val) => val ? parseFloat(val) : 4.5, z.number().min(0).max(5).optional()),
});

const validateProduct = (req, res, next) => {
  try {
    productSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: error.errors.map(err => ({ field: err.path[0], message: err.message }))
    });
  }
};

module.exports = {
  validateProduct
};
