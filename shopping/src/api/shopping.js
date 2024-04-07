import ShoppingService from "../services/shopping-service.js";
import { authMiddleware } from "./middlewares/auth.js";
import { PublishMessage, SubscribeMessage } from "../utils/index.js";
import config from '../config/index.js';

/**
 * Sets up the shopping API routes.
 *
 * @param {Object} app - The Express application instance.
 * @param {Object} channel - The AMQP channel.
 */
export default async  function(app, channel){
    
    const service = new ShoppingService();
    await SubscribeMessage(channel, service);

    // ORDER
    /**
     * POST /order
     * Places an order for the authenticated user.
     *
     * @param {Object} req - The request object, expected to contain user and transaction number in req.body.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.post('/order',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;

        try {
            const { data } = await service.CreateOrder(_id, txnNumber);

            const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');

            return res.status(200).json(data);
            
        } catch (err) {
            next(err)
        }

    });

    app.get('/order/:id',authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        const orderId = req.params.id;
        try {
            const { data } = await service.GetOrder(_id, orderId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    /**
     * GET /orders
     * Retrieves all orders for the authenticated user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.get('/orders',authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });





    // WISHLIST
    /**
     * POST /wishlist
     * Adds a product to the wishlist for the authenticated user.
     *
     * @param {Object} req - The request object, expected to contain user and product ID in req.body.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.post('/wishlist', authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        const { product_id: productId } = req.body;

        try {
            const { data } = await service.AddToWishlist(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    /**
     * GET /wishlist
     * Retrieves the wishlist for the authenticated user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.get('/wishlist', authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        try {
            const response = await service.GetWishlist(_id);
            if (response && response.data) {
                const { data } = response;
                return res.status(200).json(data);
            }
            return res.status(200).json({ data: [] });
        } catch (err) {
            next(err);
        }
    });

    /**
     * DELETE /wishlist/:id
     * Removes a product from the wishlist for the authenticated user.
     *
     * @param {Object} req - The request object, expected to contain product ID in req.params.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.delete('/wishlist/:id', authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.RemoveFromWishlist(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });


    // CART
    /**
     * POST /cart
     * Adds a product to the cart for the authenticated user.
     *
     * @param {Object} req - The request object, expected to contain user and product details in req.body.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.post('/cart', authMiddleware, async  (req, res, next) => {
            const { _id } = req.user;
            const { product_id: productId, qty: productQty } = req.body;
            console.log('INSIDE CART API PRODUCT ID:', productId, 'QTY:', productQty, 'USER ID:', _id);
            try {
                const { data } = await service.AddToCart(_id, productId, productQty);
                return res.status(200).json(data);
            } catch (err) {
                next(err);
            }
    })

    /**
     * DELETE /cart/:id
     * Removes a product from the cart for the authenticated user.
     *
     * @param {Object} req - The request object, expected to contain product ID in req.params.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.delete('/cart/:id', authMiddleware, async  (req, res, next) => {
        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.RemoveFromCart(_id, productId);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    })

    /**
     * GET /cart
     * Retrieves the cart for the authenticated user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.get('/cart', authMiddleware, async (req,res,next) => {
        const { _id } = req.user;
        try {
            const { data } = await service.GetCart(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    /**
     * GET /whoami
     * Returns a message indicating the service identity.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     */
    app.get('/whoami', async (req, res, next) => {
        return res.status(200).json({message: 'I am shopping service'});
    })
}