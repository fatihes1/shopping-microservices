import ProductService from '../services/product-service.js';

const productService = new ProductService();

export default function setupAppEvents(app) {
    app.use('/app-events', (req, res, next) => {
        const { payload } = req.body;

        productService.subscribeEvents(payload).then(r => {
            console.log("============ Product Subscribed the Events ============");
        });

        console.log("============ Product Service Received Event ============");
        return res.status(200).json(payload);
    });
}
