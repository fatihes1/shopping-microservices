import {Address, Customer} from "../models/index.js";
import {APIError, STATUS_CODES} from "../../utils/app-errors.js";

class CustomerRepository {
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

  async createAddress({ _id, street, postalCode, city, country }) {
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

  async wishlist(customerId) {
    try {
      const profile = await Customer.findById(customerId).populate("wishlist");
      return profile.wishlist;
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Get Wishlist"
      );
    }
  }

  async addWishlistItem(customerId, { _id, name, desc, price, available, banner }) {
    const product = {
      _id,
      name,
      desc,
      price,
      available,
      banner,
    };

    try {
      const profile = await Customer.findById(customerId).populate("wishlist");

      if (profile) {
        let wishlist = profile.wishlist;

        if (wishlist.length > 0) {
          let isExist = false;
          wishlist.forEach((item) => {
            if (item._id.toString() === product._id.toString()) {
              const index = wishlist.indexOf(item);
              wishlist.splice(index, 1);
              isExist = true;
            }
          });

          if (!isExist) {
            wishlist.push(product);
          }
        } else {
          wishlist.push(product);
        }

        profile.wishlist = wishlist;
      }

      const profileResult = await profile.save();
      return profileResult.wishlist;
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Add to Wishlist"
      );
    }
  }

  async addCartItem(customerId, { _id, name, price, banner }, qty, isRemove) {
    try {
      const profile = await Customer.findById(customerId).populate("cart");

      if (profile) {
        const cartItem = {
          product: {
            _id,
            name,
            price,
            banner,
          },
          unit: qty,
        };

        let cartItems = profile.cart;

        if (cartItems.length > 0) {
          let isExist = false;
          cartItems.forEach((item) => {
            if (item.product._id.toString() === _id.toString()) {
              if (isRemove) {
                cartItems.splice(cartItems.indexOf(item), 1);
              } else {
                item.unit = qty;
              }
              isExist = true;
            }
          });

          if (!isExist) {
            cartItems.push(cartItem);
          }
        } else {
          cartItems.push(cartItem);
        }

        profile.cart = cartItems;
        return await profile.save();
      }

      throw new Error("Unable to add to cart!");
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Add to Cart"
      );
    }
  }

  async addOrderToProfile(customerId, order) {
    try {
      const profile = await Customer.findById(customerId);

      if (profile) {
        if (!profile.orders) {
          profile.orders = [];
        }
        profile.orders.push(order);

        profile.cart = [];

        return await profile.save();
      }

      throw new Error("Unable to add order!");
    } catch (err) {
      throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to Add Order"
      );
    }
  }
}

export default CustomerRepository;
