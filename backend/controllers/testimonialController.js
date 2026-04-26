const Review = require('../models/Review');
const User = require('../models/User');

exports.getTestimonials = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10 // Limiting to latest 10 testimonials
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
