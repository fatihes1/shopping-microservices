import ProductService from '../services/product-service.js';
import { PublishMessage } from "../utils/index.js";
import { authMiddleware } from "./middlewares/auth.js";
import config from '../config/index.js';

export default async function (app, channel){
    
    const service = new ProductService();

    app.post('/product/create', async(req,res,next) => {
        
        try {
            const { name, desc, type, unit,price, available, suplier, banner } = req.body; 
            // validation
            const { data } =  await service.CreateProduct({ name, desc, type, unit,price, available, suplier, banner });
            return res.json(data);
            
        } catch (err) {
            next(err)    
        }
        
    });

    app.get('/category/:type', async(req,res,next) => {
        
        const type = req.params.type;
        
        try {
            const { data } = await service.GetProductsByCategory(type)
            return res.status(200).json(data);

        } catch (err) {
            next(err)
        }

    });

    app.get('/:id', async(req,res,next) => {
        
        const productId = req.params.id;

        try {
            const { data } = await service.GetProductDescription(productId);
            return res.status(200).json(data);

        } catch (err) {
            next(err)
        }

    });

    app.post('/ids', async(req,res,next) => {

        try {
            const { ids } = req.body;
            const products = await service.GetSelectedProducts(ids);
            return res.status(200).json(products);
            
        } catch (err) {
            next(err)
        }
       
    });
     
    app.put('/wishlist',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;

        try {
            // get payload to send customer service
            const { data } = await service.GerProductPayload(_id, { productId : req.body._id }, 'ADD_TO_WISHLIST');
            // PublishCustomerEvent(data);
            await PublishMessage(channel, config.CUSTOMER_SERVICE, JSON.stringify(data));

            return res.status(200).json(data.data.product);
        } catch (err) {
            
        }
    });
    
    app.delete('/wishlist/:id',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.GerProductPayload(_id, { productId }, 'REMOVE_FROM_WISHLIST');
            //PublishCustomerEvent(data);
            await PublishMessage(channel, config.CUSTOMER_SERVICE, JSON.stringify(data));

            return res.status(200).json(data.data.product);
        } catch (err) {
            next(err)
        }
    });


    app.put('/cart',authMiddleware, async (req, res, next) => {
        
        const { _id } = req.user;
        try {
            const { data } = await service.GerProductPayload(_id, { productId: req.body._id, qty: req.body.qty }, 'ADD_TO_CART');

            //PublishCustomerEvent(data);
            await PublishMessage(channel, config.CUSTOMER_SERVICE, JSON.stringify(data));

            //PublishShoppingEvent(data);
            await PublishMessage(channel, config.SHOPPING_SERVICE, JSON.stringify(data));


            const response = {
                product: data.data.product,
                qty: data.data.qty
            }

            return res.status(200).json(response);
            
        } catch (err) {
            next(err)
        }
    });
    
    app.delete('/cart/:id',authMiddleware, async (req,res,next) => {

        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.GerProductPayload(_id, { productId: productId, qty: 1 }, 'REMOVE_FROM_CART');
            //PublishCustomerEvent(data);
            await PublishMessage(channel, config.CUSTOMER_SERVICE, JSON.stringify(data));

            //PublishShoppingEvent(data);
            await PublishMessage(channel, config.SHOPPING_SERVICE, JSON.stringify(data));


            const response = {
                product: data.data.product,
                qty: data.data.qty
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err)
        }
    });

    //get Top products and category
    app.get('/', async (req,res,next) => {
        //check validation
        try {
            const { data} = await service.GetProducts();        
            return res.status(200).json(data);
        } catch (err) {
            next(err)
        }
        
    });
    
}