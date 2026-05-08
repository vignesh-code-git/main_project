const { Review, User, Product, ProductImage, Notification } = require('../models/associations');

exports.createReview = async (req, res) => {
    try {
        const { rating, content, comment, productId } = req.body;
        const reviewContent = content || comment;
        const userId = req.user.id;
        
        if (!rating || !reviewContent || !productId) {
            return res.status(400).json({ message: 'All fields are required (rating, content, productId)' });
        }

        const review = await Review.create({
            rating,
            content: reviewContent,
            productId: productId,
            userId: userId
        });

        // Recalculate average rating for the product
        const allReviews = await Review.findAll({ where: { productId: productId } });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await Product.update(
            { 
                rating: parseFloat(avgRating.toFixed(1)),
                numReviews: allReviews.length
            },
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

exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { userId: req.user.id },
            include: [{ 
                model: Product, 
                attributes: ['id', 'name'],
                include: [{ model: ProductImage, as: 'images', limit: 1 }]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, content } = req.body;
        const review = await Review.findByPk(id);

        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await review.update({ rating, content });

        // Recalculate average rating
        const allReviews = await Review.findAll({ where: { productId: review.productId } });
        const avgRating = allReviews.length > 0 
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
            : 0;
        
        await Product.update(
            { 
                rating: parseFloat(avgRating.toFixed(1)),
                numReviews: allReviews.length
            },
            { where: { id: review.productId } }
        );

        res.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const productId = review.productId;
        await review.destroy();

        // Recalculate average rating
        const allReviews = await Review.findAll({ where: { productId } });
        const avgRating = allReviews.length > 0 
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
            : 0;
        
        await Product.update(
            { 
                rating: parseFloat(avgRating.toFixed(1)),
                numReviews: allReviews.length
            },
            { where: { id: productId } }
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
