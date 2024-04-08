import {ShoppingRepository} from "../database/index.js";
import {APIError, NotFoundError} from '../utils/app-errors.js';
import {FormatData, RPCRequest} from "../utils/index.js";

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async GetCart (_id){
     const cartItems = await this.repository.Cart(_id);
     if (!cartItems) throw new NotFoundError('Cart is empty')
     return FormatData(cartItems);
  }

  async CreateOrder(customerId, txnNumber) {
     const orderResult = await this.repository.CreateNewOrder(customerId, txnNumber);
     if (!orderResult) throw new NotFoundError('Order not created')
     return FormatData(orderResult);
  }

  async GetOrder(customerId, orderId){
      const order = await this.repository.Orders(customerId, orderId);
      if (!order) throw new NotFoundError('Order not found')
      return FormatData(order);
  }

  async GetOrders(customerId) {
     const orders = await this.repository.Orders(customerId);
        if (!orders) throw new NotFoundError('No Orders found')
     return FormatData(orders);
  }

  async ManageCart(customerId, item,qty, isRemove){
    const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove);
    return FormatData(cartResult);
  }

  async AddToCart(customerId, productId, qty){
    const productResponse = await RPCRequest('PRODUCT_RPC', { type: 'VIEW_PRODUCT', data: productId });
    if(productResponse && productResponse._id){
      const data = await this.repository.ManageCart(customerId, productResponse, qty, false);
      return FormatData(data);
    }
  }

  async RemoveFromCart(customerId, productId){
     const cartResult = await this.repository.ManageCart(customerId, { _id: productId }, 0, true);
     return FormatData(cartResult);
  }

  // Wishlist
  async AddToWishlist(customerId, productId){
      const wishlistResult = await this.repository.ManageWishlist(customerId, productId);
      return FormatData(wishlistResult);
  }

  async GetWishlist(customerId){
      const wishlist = await this.repository.GetWishlistByCustomerId(customerId);
      if (!wishlist) {
        return {};
      }
      const { products } = wishlist;
      if (Array.isArray(products)) {
        const productIds = products.map(product => product._id);
        // RPC call to get product details
        const productResponse = await RPCRequest('PRODUCT_RPC', { type: 'VIEW_PRODUCTS', data: productIds });
        if (productResponse) {
            return FormatData(productResponse);
        }
      }
      return {};
  }

  async RemoveFromWishlist(customerId, productId){
      const wishlistResult = await this.repository.ManageWishlist(customerId, productId, true);
      return FormatData(wishlistResult);
  }

  async deleteProfileData(customerId) {
      const cartResult = await this.repository.DeleteProfileData(customerId);
      return FormatData(cartResult);
  }

  async SubscribeEvents(payload){
    payload = JSON.parse(payload);
    const { event, data } = payload;
    console.log('EVENT RECIVED:', event, data)
    const { userId, product, qty } = data;

    switch(event){
      case 'ADD_TO_CART':
        await this.ManageCart(userId, product, qty, false);
        break;
      case 'REMOVE_FROM_CART':
        await this.ManageCart(userId, product, qty, true);
        break;
      case 'DELETE_PROFILE':
        await this.deleteProfileData(userId);
        break;
      default:
        break;
    }

  }

  async GetOrderPayload(userId, order, event){

    if(order){
      return {
        event: event,
        data: {userId, order}
      }
    }else{
      return FormatData({error: 'No Order Available'});
    }

  }
}

export default ShoppingService;
