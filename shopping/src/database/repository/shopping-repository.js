import {Cart, Order} from '../models/index.js';
import {v4 as uuidv4} from 'uuid';
import {APIError, STATUS_CODES} from "../../utils/app-errors.js";


//Dealing with database operations
class ShoppingRepository {

    // payment

    async Orders(customerId){
        try{
            return await Order.find({customerId});
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async Cart(customerId) {
        try {
            const cartItems = await Cart.find({
                customerId: customerId
            })
            console.log(cartItems)

            if (cartItems) {
                return cartItems;
            }
        } catch (err) {
            throw err;
        }
    }

    async AddCartItem(customerId,item,qty,isRemove){

        const cart = await Cart.findOne({ customerId: customerId })
        const { _id } = item;

        if(cart){
            let isExist = false;
            let cartItems = cart.items;

            if(cartItems.length > 0){
                cartItems.map(item => {
                    if(item.product._id.toString() === _id.toString()){
                        if(isRemove){
                            cartItems.splice(cartItems.indexOf(item), 1);
                        }else{
                            item.unit = qty;
                        }
                        isExist = true;
                    }
                });
            }

            if(!isExist && !isRemove){
                cartItems.push({product: { ...item}, unit: qty });
            }
            cart.items = cartItems;

            return await cart.save()
        }else{
            return await Cart.create({
                customerId,
                items:[{product: { ...item}, unit: qty }]
            })
        }
    }


    async CreateNewOrder(customerId, txnId){

        //required to verify payment through TxnId
        const cart = await Cart.findOne({ customerId: customerId })
        if(cart){
            let amount = 0;
            let cartItems = cart.items;

            if(cartItems.length > 0){
                //process Order

                cartItems.map(item => {
                    amount += parseInt(item.product.price) *  parseInt(item.unit);
                });

                const orderId = uuidv4();

                const order = new Order({
                    orderId,
                    customerId,
                    amount,
                    txnId,
                    status: 'received',
                    items: cartItems
                })
                cart.items = [];
                const orderResult = await order.save();
                await cart.save();
                return orderResult;
            }
        }
        return {}
    }
}

export default ShoppingRepository;