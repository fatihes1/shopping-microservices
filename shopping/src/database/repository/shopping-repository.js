import { Cart, Order, Wishlist } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { APIError } from '../../utils/app-errors.js';
import loadash from 'lodash';

class ShoppingRepository {
  /**
   * Generates a payload for an order.
   *
   * @param {string} userId - The ID of the user.
   * @param {Object} order - The order.
   * @param {string} event - The event for which the payload is being generated.
   * @returns {Promise<Object>} The generated payload.
   */
  async Orders(customerId, orderId = null) {
    try {
      if (orderId) {
        return await Order.findOne({ _id: orderId });
      }
      return await Order.find({ customerId });
    } catch (err) {
      throw APIError('Unable to Find Orders');
    }
  }

  /**
   * Retrieves a customer's cart.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The customer's cart.
   * @throws {Error} When there is an error retrieving the cart.
   */
  async Cart(customerId) {
    console.log('CHECKING LOG');
    try {
      const cartItems = await Cart.findOne({
        customerId: customerId,
      });
      if (cartItems) {
        return cartItems;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Manages a customer's cart.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {Object} product - The product to be added or removed.
   * @param {number} qty - The quantity of the product.
   * @param {boolean} isRemove - Whether the product is to be removed.
   * @returns {Promise<Object>} The updated cart.
   */
  async ManageCart(customerId, product, qty, isRemove) {
    const cart = await Cart.findOne({ customerId });
    console.log('REPOSTIORY CART: ', cart, 'PRODUCT:', product, 'QTY:', qty, 'ISREMOVE:', isRemove);
    if (cart) {
      if (isRemove) {
        cart.items = loadash.filter(cart.items, (item) => item.product._id !== product._id);
      } else {
        const cartIndex = loadash.findIndex(cart.items, { product: { _id: product._id } });

        if (cartIndex > -1) {
          // May be cart.items[cartIndex].unit += qty too
          cart.items[cartIndex].unit = qty;
        } else {
          cart.items.push({
            product: { ...product },
            unit: qty,
          });
        }
      }
      return await cart.save();
    } else {
      console.log('CREATED CART HERE');
      return await Cart.create({
        customerId,
        items: [
          {
            product,
            unit: qty,
          },
        ],
      });
    }
  }

  /**
   * Manages a customer's wishlist.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} productId - The ID of the product.
   * @param {boolean} [isRemove=false] - Whether the product is to be removed.
   * @returns {Promise<Object>} The updated wishlist.
   */
  async ManageWishlist(customerId, productId, isRemove = false) {
    const wishlist = await Wishlist.findOne({ customerId });

    if (wishlist) {
      if (isRemove) {
        wishlist.products = loadash.filter(wishlist.products, (product) => product._id !== productId);
      } else {
        const wishlistIndex = loadash.findIndex(wishlist.products, { _id: productId });

        if (wishlistIndex < 0) {
          wishlist.products.push({ _id: productId });
        }
      }
      return await wishlist.save();
    } else {
      return await Wishlist.create({
        customerId,
        products: [
          {
            _id: productId,
          },
        ],
      });
    }
  }

  /**
   * Retrieves a customer's wishlist by customer ID.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The customer's wishlist.
   */
  async GetWishlistByCustomerId(customerId) {
    return Wishlist.findOne({ customerId });
  }

  /**
   * Creates a new order for a customer.
   *
   * @param {string} customerId - The ID of the customer.
   * @param {string} txnId - The transaction ID.
   * @returns {Promise<Object>} The created order.
   */
  async CreateNewOrder(customerId, txnId) {
    const cart = await Cart.findOne({ customerId: customerId });
    if (cart) {
      let amount = 0;
      let cartItems = cart.items;

      if (cartItems.length > 0) {
        //process Order

        cartItems.map((item) => {
          amount += parseInt(item.product.price) * parseInt(item.unit);
        });

        const orderId = uuidv4();

        const order = new Order({
          orderId,
          customerId,
          amount,
          txnId,
          status: 'received',
          items: cartItems,
        });
        cart.items = [];
        const orderResult = await order.save();
        await cart.save();
        return orderResult;
      }
    }
    return {};
  }

  /**
   * Deletes a customer's profile data.
   *
   * @param {string} customerId - The ID of the customer.
   * @returns {Promise<Object>} The result of the deletion.
   */
  async DeleteProfileData(customerId) {
    console.log('DELETING');
    return await Promise.all([Cart.findOneAndDelete({ customerId }), Wishlist.findOneAndDelete({ customerId })]);
  }
}

export default ShoppingRepository;
