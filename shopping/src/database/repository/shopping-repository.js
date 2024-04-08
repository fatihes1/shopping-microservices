import {Cart, Order, Wishlist} from '../models/index.js';
import {v4 as uuidv4} from 'uuid';
import {APIError} from "../../utils/app-errors.js";
import loadash from 'lodash';

//Dealing with database operations
class ShoppingRepository {

    // payment

    async Orders(customerId, orderId=null){
        try{
            if(orderId){
                return await Order.findOne({ _id: orderId });
            }
            return await Order.find({customerId});
        }catch(err){
            throw APIError('Unable to Find Orders')
        }
    }

    async Cart(customerId) {
        console.log('CHECKING LOG')
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
        console.log('REPOSTIORY CART: ', cart, 'PRODUCT:', product, 'QTY:', qty, 'ISREMOVE:', isRemove)
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
            console.log('CREATED CART HERE')
            return await Cart.create({
                customerId,
                items: [{
                    product,
                    unit: qty
                }]
            })
        }

    }


    async ManageWishlist(customerId, productId, isRemove = false){
        const wishlist = await Wishlist.findOne({ customerId });

        if (wishlist) {
            if (isRemove) {
                wishlist.products = loadash.filter(
                    wishlist.products,
                    (product) => product._id !== productId
                );
            } else {
                const wishlistIndex = loadash.findIndex(wishlist.products, { _id: productId });

                if (wishlistIndex < 0) {
                    wishlist.products.push({ _id: productId })
                }
            }
            return await wishlist.save();
        }  else {
            return await Wishlist.create({
                customerId,
                products: [{
                    _id: productId,
                }]
            })
        }

    }

    async GetWishlistByCustomerId(customerId){
        return Wishlist.findOne({customerId});
    }

    async CreateNewOrder(customerId, txnId){

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

    async DeleteProfileData(customerId){
        console.log('DELETING')
        return await Promise.all([
            Cart.findOneAndDelete({ customerId }),
            Wishlist.findOneAndDelete({ customerId }),
        ])
    }
}

export default ShoppingRepository;