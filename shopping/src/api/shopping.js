import ShoppingService from "../services/shopping-service.js";
import { authMiddleware } from "./middlewares/auth.js";
import { PublishMessage, SubscribeMessage } from "../utils/index.js";
import config from '../config/index.js';

export default async  function(app, channel){
    
    const service = new ShoppingService();
    await SubscribeMessage(channel, service);


    app.post('/order',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;

        try {
            const { data } = await service.PlaceOrder({_id, txnNumber});

            const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');

            // PublishCustomerEvent(payload);
            await PublishMessage(channel, config.CUSTOMER_SERVICE, JSON.stringify(payload));

            return res.status(200).json(data);
            
        } catch (err) {
            next(err)
        }

    });

    app.get('/orders',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;

        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }

    });

    app.post('/cart', authMiddleware, async  (req, res, next) => {
            const { _id } = req.user;
            const { product_id: productId, qty: productQty } = req.body;

            try {
                const { data } = await service.AddToCart(_id, productId, productQty);
                return res.status(200).json(data);
            } catch (err) {
                next(err);
            }
    })

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

    app.get('/cart', authMiddleware, async (req,res,next) => {

        const { _id } = req.user;
        try {
            const { data } = await service.GetCart(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get('/whoami', async (req, res, next) => {
        return res.status(200).json({message: 'I am shopping service'});
    })
}