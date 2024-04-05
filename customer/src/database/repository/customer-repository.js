import {Address, Customer} from "../models/index.js";
import {APIError, STATUS_CODES} from "../../utils/app-errors.js";

class CustomerRepository {

  /**
   * Creates a new customer.
   *
   * @param {Object} param0 - An object containing the customer details.
   * @param {string} param0.email - The email of the customer.
   * @param {string} param0.password - The password of the customer.
   * @param {string} param0.phone - The phone number of the customer.
   * @param {string} param0.salt - The salt used for password hashing.
   * @returns {Promise<Object>} The saved customer object.
   * @throws {APIError} When there is an error creating the customer.
   */
  async createCustomer({ email, password, phone, salt }) {
    try {
      const customer = new Customer({
        email,
        password,
        salt,
        phone,
        address: [],
      });
      return await customer.save();
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Create Customer"
      );
    }
  }

  /**
   * Creates a new address for a customer.
   *
   * @param {Object} param0 - An object containing the address details.
   * @param {string} param0._id - The ID of the customer.
   * @param {string} param0.street - The street of the address.
   * @param {string} param0.postalCode - The postal code of the address.
   * @param {string} param0.city - The city of the address.
   * @param {string} param0.country - The country of the address.
   * @returns {Promise<Object>} The saved customer object with the new address.
   * @throws {APIError} When there is an error creating the address.
   */
  async createAddress({ _id, street, postalCode, city, country }) {
    console.log('CREATE ADDRESS', _id, street, postalCode, city, country)
    const profile = await Customer.findById(_id);
    console.log('PROFILE', profile)
    try {
      const profile = await Customer.findById(_id);

      if (profile) {
        const newAddress = new Address({
          street,
          postalCode,
          city,
          country,
        });

        await newAddress.save();

        profile.address.push(newAddress);
      }

      return await profile.save();
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Error on Create Address"
      );
    }
  }

  /**
   * Finds a customer by email.
   *
   * @param {Object} param0 - An object containing the email of the customer.
   * @param {string} param0.email - The email of the customer.
   * @returns {Promise<Object>} The customer object.
   * @throws {APIError} When there is an error finding the customer.
   */
  async findCustomer({ email }) {
    try {
      return await Customer.findOne({email});
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Find Customer"
      );
    }
  }

  /**
   * Finds a customer by ID.
   *
   * @param {Object} param0 - An object containing the ID of the customer.
   * @param {string} param0.id - The ID of the customer.
   * @returns {Promise<Object>} The customer object.
   * @throws {APIError} When there is an error finding the customer.
   */

  /**
   * Deletes a customer by ID.
   *
   * @param {Object} param0 - An object containing the ID of the customer.
   * @param {string} param0.id - The ID of the customer.
   * @returns {Promise<Object>} The deleted customer object.
   * @throws {APIError} When there is an error deleting the customer.
   */
  async findCustomerById({ id }) {
    try {
      return await Customer.findById(id).populate("address");
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Find Customer"
      );
    }
  }

  async deleteCustomerById({ id }) {
    try {
      return await Customer.findByIdAndDelete(id);
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Delete Customer"
      );
    }
  }

  // async wishlist(customerId) {
  //   try {
  //     const profile = await Customer.findById(customerId).populate("wishlist");
  //     return profile.wishlist;
  //   } catch (err) {
  //     throw new APIError(
  //         "API Error",
  //         STATUS_CODES.INTERNAL_ERROR,
  //         "Unable to Get Wishlist"
  //     );
  //   }
  // }
  //
  // async addWishlistItem(customerId, { _id, name, desc, price, available, banner }) {
  //   const product = {
  //     _id,
  //     name,
  //     desc,
  //     price,
  //     available,
  //     banner,
  //   };
  //
  //   try {
  //     const profile = await Customer.findById(customerId).populate("wishlist");
  //
  //     if (profile) {
  //       let wishlist = profile.wishlist;
  //
  //       if (wishlist.length > 0) {
  //         let isExist = false;
  //         wishlist.forEach((item) => {
  //           if (item._id.toString() === product._id.toString()) {
  //             const index = wishlist.indexOf(item);
  //             wishlist.splice(index, 1);
  //             isExist = true;
  //           }
  //         });
  //
  //         if (!isExist) {
  //           wishlist.push(product);
  //         }
  //       } else {
  //         wishlist.push(product);
  //       }
  //
  //       profile.wishlist = wishlist;
  //     }
  //
  //     const profileResult = await profile.save();
  //     return profileResult.wishlist;
  //   } catch (err) {
  //     throw new APIError(
  //         "API Error",
  //         STATUS_CODES.INTERNAL_ERROR,
  //         "Unable to Add to Wishlist"
  //     );
  //   }
  // }
  //
  // async addCartItem(customerId, { _id, name, price, banner }, qty, isRemove) {
  //   try {
  //     const profile = await Customer.findById(customerId).populate("cart");
  //
  //     if (profile) {
  //       const cartItem = {
  //         product: {
  //           _id,
  //           name,
  //           price,
  //           banner,
  //         },
  //         unit: qty,
  //       };
  //
  //       let cartItems = profile.cart;
  //
  //       if (cartItems.length > 0) {
  //         let isExist = false;
  //         cartItems.forEach((item) => {
  //           if (item.product._id.toString() === _id.toString()) {
  //             if (isRemove) {
  //               cartItems.splice(cartItems.indexOf(item), 1);
  //             } else {
  //               item.unit = qty;
  //             }
  //             isExist = true;
  //           }
  //         });
  //
  //         if (!isExist) {
  //           cartItems.push(cartItem);
  //         }
  //       } else {
  //         cartItems.push(cartItem);
  //       }
  //
  //       profile.cart = cartItems;
  //       return await profile.save();
  //     }
  //
  //     throw new Error("Unable to add to cart!");
  //   } catch (err) {
  //     throw new APIError(
  //         "API Error",
  //         STATUS_CODES.INTERNAL_ERROR,
  //         "Unable to Add to Cart"
  //     );
  //   }
  // }
  //
  // async addOrderToProfile(customerId, order) {
  //   try {
  //     const profile = await Customer.findById(customerId);
  //
  //     if (profile) {
  //       if (!profile.orders) {
  //         profile.orders = [];
  //       }
  //       profile.orders.push(order);
  //
  //       profile.cart = [];
  //
  //       return await profile.save();
  //     }
  //
  //     throw new Error("Unable to add order!");
  //   } catch (err) {
  //     throw new APIError(
  //         "API Error",
  //         STATUS_CODES.INTERNAL_ERROR,
  //         "Unable to Add Order"
  //     );
  //   }
  // }
}


export default CustomerRepository;
