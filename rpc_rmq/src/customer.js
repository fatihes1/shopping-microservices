import express from 'express';
import {RPCObserver, RPCRequest} from "./rpc.js";

const PORT = 9000;

const app = express();

app.use(express.json());

const fakeCustomerResponse = {
    _id: "yt686tu8763tyyr98734",
    name: "Mike",
    country: "Poland",
};


RPCObserver("CUSTOMER_RPC", fakeCustomerResponse);

app.get('/wishlist', async (req, res) => {
    const requestPayload = {
        productId: "123",
        customerId: "yt686tu8763tyyr98734",
    };
    try {
        const responseData = await RPCRequest("PRODUCT_RPC", requestPayload);
        console.log(responseData);
        return res.status(200).json(responseData);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
})

app.get('/', (req, res) => {
    return res.json({ message: 'Hello from customer service' });
})

app.listen(PORT, () => {
    console.log(`Customer service is running on port ${PORT}`);
    console.clear();
});