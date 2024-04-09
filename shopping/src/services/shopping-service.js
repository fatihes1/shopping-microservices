import { ShoppingRepository } from '../database/index.js';
import { APIError, NotFoundError } from '../utils/app-errors.js';
import { FormatData, RPCRequest } from '../utils/index.js';

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  /**
   * Serves RPC requests.
   *
   * @param {Object} payload - The RPC request payload.
   * @returns {Promise<Object>} The response to the RPC request.
   */
  async GetCart(_id) {
    const cartItems = await this.repository.Cart(_id);
    if (!cartItems) throw new NotFoundError('Cart is empty');
    return FormatData(cartItems);
  }

  /**
   * Creates a new order for a customer.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} txnNumber - The transaction number.
   * @returns {Promise<Object>} The created order.
   * @throws {NotFoundError} When the order is not created.
   */
  async CreateOrder(customerId, txnNumber) {
    const orderResult = await this.repository.CreateNewOrder(customerId, txnNumber);
    if (!orderResult) throw new NotFoundError('Order not created');
    return FormatData(orderResult);
  }

  /**
   * Retrieves a specific order for a customer.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} orderId - The ID of the order.
   * @returns {Promise<Object>} The order.
   * @throws {NotFoundError} When the order is not found.
   */
  async GetOrder(customerId, orderId) {
    const order = await this.repository.Orders(customerId, orderId);
    if (!order) throw new NotFoundError('Order not found');
    return FormatData(order);
  }

  /**
   * Retrieves all orders for a customer.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The orders.
   * @throws {NotFoundError} When no orders are found.
   */
  async GetOrders(customerId) {
    const orders = await this.repository.Orders(customerId);
    if (!orders) throw new NotFoundError('No Orders found');
    return FormatData(orders);
  }

  /**
   * Manages a customer's cart.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {Object} item - The item to be added or removed.
   * @param {number} qty - The quantity of the item.
   * @param {boolean} isRemove - Whether the item is to be removed.
   * @returns {Promise<Object>} The updated cart.
   */
  async ManageCart(customerId, item, qty, isRemove) {
    const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove);
    return FormatData(cartResult);
  }

  /**
   * Adds an item to a customer's cart.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} productId - The ID of the product.
   * @param {number} qty - The quantity of the product.
   * @returns {Promise<Object>} The updated cart.
   */
  async AddToCart(customerId, productId, qty) {
    const productResponse = await RPCRequest('PRODUCT_RPC', { type: 'VIEW_PRODUCT', data: productId });
    if (productResponse && productResponse._id) {
      const data = await this.repository.ManageCart(customerId, productResponse, qty, false);
      return FormatData(data);
    }
  }

  /**
   * Removes an item from a customer's cart.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} productId - The ID of the product.
   * @returns {Promise<Object>} The updated cart.
   */
  async RemoveFromCart(customerId, productId) {
    const cartResult = await this.repository.ManageCart(customerId, { _id: productId }, 0, true);
    return FormatData(cartResult);
  }

  /**
   * Adds an item to a customer's wishlist.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} productId - The ID of the product.
   * @returns {Promise<Object>} The updated wishlist.
   */
  async AddToWishlist(customerId, productId) {
    const wishlistResult = await this.repository.ManageWishlist(customerId, productId);
    return FormatData(wishlistResult);
  }

  /**
   * Retrieves a customer's wishlist.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The customer's wishlist.
   */
  async GetWishlist(customerId) {
    const wishlist = await this.repository.GetWishlistByCustomerId(customerId);
    if (!wishlist) {
      return {};
    }
    const { products } = wishlist;
    if (Array.isArray(products)) {
      const productIds = products.map((product) => product._id);
      // RPC call to get product details
      const productResponse = await RPCRequest('PRODUCT_RPC', { type: 'VIEW_PRODUCTS', data: productIds });
      if (productResponse) {
        return FormatData(productResponse);
      }
    }
    return {};
  }

  /**
   * Removes an item from a customer's wishlist.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} productId - The ID of the product.
   * @returns {Promise<Object>} The updated wishlist.
   */
  async RemoveFromWishlist(customerId, productId) {
    const wishlistResult = await this.repository.ManageWishlist(customerId, productId, true);
    return FormatData(wishlistResult);
  }

  /**
   * Deletes a customer's profile data.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The result of the deletion.
   */
  async deleteProfileData(customerId) {
    const cartResult = await this.repository.DeleteProfileData(customerId);
    return FormatData(cartResult);
  }

  /**
   * Subscribes to events.
   *
   * @param {Object} payload - The event payload.
   */
  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    console.log('EVENT RECIVED:', event, data);
    const { userId, product, qty } = data;

    switch (event) {
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

  /**
   * Generates a payload for an order.
   *
   * @param {string} userId - The ID of the user.
   * @param {Object} order - The order.
   * @param {string} event - The event for which the payload is being generated.
   * @returns {Promise<Object>} The generated payload.
   */
  async GetOrderPayload(userId, order, event) {
    if (order) {
      return {
        event: event,
        data: { userId, order },
      };
    } else {
      return FormatData({ error: 'No Order Available' });
    }
  }
}

export default ShoppingService;
