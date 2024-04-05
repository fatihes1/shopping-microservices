import {ShoppingRepository} from "../database/index.js";
import {APIError} from '../utils/app-errors.js';
import {FormatData} from "../utils/index.js";

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async GetCart (_id){
      try {
        const cartItems = await this.repository.Cart(_id);
        return FormatData(cartItems);
      } catch (e) {
        throw e;
      }
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    // Verify the txn number with payment logs

    try {
      const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
      return FormatData(orderResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId);
      return FormatData(orders);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ManageCart(customerId, item,qty, isRemove){

    const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove);
    return FormatData(cartResult);
  }

  async AddToCart(customerId, productId, qty){
    // Grab product info from product service through RPC
    const productResponse = {}; // TODO: add RPC code here
    if(productResponse && productResponse._id){
      //
    }

    throw new Error('Product not found')

    const cartResult = await this.repository.AddCartItem(customerId, productId, qty, false);
    return FormatData(cartResult);
  }

  async RemoveFromCart(customerId, productId){
    const cartResult = await this.repository.AddCartItem(customerId, productId );
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
