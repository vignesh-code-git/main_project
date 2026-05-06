const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  price: z.preprocess((val) => parseFloat(val), z.number().positive("Price must be positive")),
  originalPrice: z.preprocess((val) => val ? parseFloat(val) : undefined, z.number().positive().optional()),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.preprocess((val) => parseInt(val), z.number().int().positive()),
  brand: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  rating: z.preprocess((val) => val ? parseFloat(val) : 4.5, z.number().min(0).max(5).optional()),
  stock: z.preprocess((val) => val ? parseInt(val) : 0, z.number().int().min(0).optional()),
  sku: z.string().optional().nullable(),
  deliveryDays: z.string().optional().nullable(),
  isFreeDelivery: z.preprocess((val) => String(val) === 'true', z.boolean().optional()),
  isNewArrival: z.preprocess((val) => String(val) === 'true', z.boolean().optional()),
  isTopSelling: z.preprocess((val) => String(val) === 'true', z.boolean().optional()),
  videoUrl: z.string().optional().nullable(),
}).passthrough();

const validateProduct = (req, res, next) => {
  try {
    productSchema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: Array.isArray(error.errors) ? error.errors.map(err => ({ field: err.path[0], message: err.message })) : [{ message: error.message }]
    });
  }
};

module.exports = {
  validateProduct
};
