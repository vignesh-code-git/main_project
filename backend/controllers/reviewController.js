const { Review, User, Product, ProductImage, Notification } = require('../models/associations');

exports.createReview = async (req, res) => {
    try {
        const { rating, content, productId, userId } = req.body;
        
        if (!rating || !content || !productId || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const review = await Review.create({
            rating,
            content,
            productId: productId,
            userId: userId
        });

        // Recalculate average rating for the product
        const allReviews = await Review.findAll({ where: { productId: productId } });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await Product.update(
            { rating: parseFloat(avgRating.toFixed(1)) },
            { where: { id: productId } }
        );

        // Notify Seller
        try {
            const product = await Product.findByPk(productId, {
                include: [{ model: ProductImage, as: 'images', limit: 1 }]
            });
            
            if (product && product.sellerId) {
                await Notification.create({
                    userId: product.sellerId,
                    role: 'seller',
                    title: 'New Product Review',
                    message: `Someone reviewed "${product.name}" with ${rating} stars.`,
                    type: 'review',
                    actorId: userId,
                    metadata: {
                        imageUrl: product.images?.[0]?.url,
                        productId: product.id,
                        rating: rating
                    }
                });
            }
        } catch (notifErr) {
            console.error('Failed to create review notification:', notifErr);
        }

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
            where: { productId: productId },
            include: [{ model: User, attributes: ['name', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
