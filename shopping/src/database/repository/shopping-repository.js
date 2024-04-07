import {Cart, Order} from '../models/index.js';
import {v4 as uuidv4} from 'uuid';
import {APIError, STATUS_CODES} from "../../utils/app-errors.js";
import loadash from 'lodash';

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
            const cartItems = await Cart.findOne({
                customerId: customerId
            })
            if (cartItems) {
                return cartItems;
            }
        } catch (err) {
            throw err;
        }
    }

    async ManageCart(customerId, product, qty, isRemove){
        const cart = await Cart.findOne({ customerId });

        if (cart) {
            if (isRemove) {
                cart.items = loadash.filter(
                    cart.items,
                    (item) => item.product._id !== product._id
                );
            } else {
                const cartIndex = loadash.findIndex(cart.items,
                    { product: { _id: product._id }
                    });

                if (cartIndex > -1) {
                    // May be cart.items[cartIndex].unit += qty too
                    cart.items[cartIndex].unit = qty;
                } else {
                    cart.items.push({
                        product: { ...product },
                        unit: qty
                    })
                }
            }
            return await cart.save();
        }  else {
            return await Cart.create({
                customerId,
                items: [{
                    product,
                    unit: qty
                }]
            })
        }

    }


    async ManageWishlist(customerId, product, qty, isRemove){
        const cart = await Cart.findOne({ customerId });

        if (cart) {
            if (isRemove) {
                cart.items = loadash.filter(
                    cart.items,
                    (item) => item.product._id !== product._id
                );
            } else {
                const cartIndex = loadash.findIndex(cart.items,
                    { product: { _id: product._id }
                    });

                if (cartIndex > -1) {
                    // May be cart.items[cartIndex].unit += qty too
                    cart.items[cartIndex].unit = qty;
                } else {
                    cart.items.push({
                        product: { ...product },
                        unit: qty
                    })
                }
            }
            return await cart.save();
        }  else {
            return await Cart.create({
                customerId,
                items: [{
                    product,
                    unit: qty
                }]
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