const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
    try {
        const { rating, content, productId, userId } = req.body;
        
        if (!rating || !content || !productId || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const review = await Review.create({
            rating,
            content,
            ProductId: productId,
            UserId: userId
        });

        // Recalculate average rating for the product
        const Product = require('../models/Product');
        const allReviews = await Review.findAll({ where: { ProductId: productId } });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await Product.update(
            { rating: parseFloat(avgRating.toFixed(1)) },
            { where: { id: productId } }
        );

        // Fetch the review with user info to return to frontend
        const reviewWithUser = await Review.findByPk(review.id, {
            include: [{ model: User, attributes: ['name', 'avatar'] }]
        });

        res.status(201).json(reviewWithUser);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { ProductId: productId },
            include: [{ model: User, attributes: ['name', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
