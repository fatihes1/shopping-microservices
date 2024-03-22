import CustomerService from '../services/customer-service.js';

const customerService = new CustomerService();

export default function setupAppEvents(app) {
    app.use('/app-events', (req, res, next) => {
        const { payload } = req.body;

        customerService.subscribeEvents(payload).then(r => {
            console.log("============ Customer Subscribed the Events ============");
        });

        console.log("============ Customer Service Received Event ============");
        return res.status(200).json(payload);
    });
}
