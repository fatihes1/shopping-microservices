import ShoppingService from "../services/shopping-service.js";

const shoppingService = new ShoppingService();

export default function setupAppEvents(app) {
    app.use('/app-events', (req, res, next) => {
        const { payload } = req.body;

        shoppingService.SubscribeEvents(payload).then(r => {
            console.log("============ Product Subscribed the Events ============");
        });

        console.log("============ Product Service Received Event ============");
        return res.status(200).json(payload);
    });
}
