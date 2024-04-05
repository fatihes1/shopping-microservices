import { CustomerRepository } from "../database/index.js";
import { FormatData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utils/index.js';
import { APIError } from '../utils/app-errors.js';

class CustomerService {
    constructor() {
        this.repository = new CustomerRepository();
    }

    /**
     * Deletes a customer by ID.
     *
     * @param {Object} userInputs - An object containing the email, password, and phone of the customer.
     * @returns {Promise<Object>} The deleted customer object.
     * @throws {APIError} When there is an error deleting the customer.
     */
    async signIn(userInputs) {
        const { email, password } = userInputs;
        try {
            const existingCustomer = await this.repository.findCustomer({ email });

            if (existingCustomer) {
                const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);

                if (validPassword) {
                    const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id });
                    return FormatData({ id: existingCustomer._id, token });
                }
            }

            return FormatData(null);

        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    /**
     * Signs up a new customer.
     *
     * @param {Object} userInputs - An object containing the email, password, and phone of the customer.
     * @param {string} userInputs.email - The email of the customer.
     * @param {string} userInputs.password - The password of the customer.
     * @param {string} userInputs.phone - The phone number of the customer.
     * @returns {Promise<Object>} The signed up customer object and token.
     * @throws {APIError} When there is an error signing up the customer.
     */
    async signUp(userInputs) {
        const { email, password, phone } = userInputs;
        try {
            let salt = await GenerateSalt();
            let userPassword = await GeneratePassword(password, salt);
            const existingCustomer = await this.repository.createCustomer({ email, password: userPassword, phone, salt });
            const token = await GenerateSignature({ email, _id: existingCustomer._id });
            return FormatData({ id: existingCustomer._id, token });

        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    /**
     * Adds a new address for a customer.
     *
     * @param {string} _id - The ID of the customer.
     * @param {Object} userInputs - An object containing the address details.
     * @param {string} userInputs.street - The street of the address.
     * @param {string} userInputs.postalCode - The postal code of the address.
     * @param {string} userInputs.city - The city of the address.
     * @param {string} userInputs.country - The country of the address.
     * @returns {Promise<Object>} The saved customer object with the new address.
     * @throws {APIError} When there is an error adding the address.
     */
    async addNewAddress(_id, userInputs) {
        const { street, postalCode, city, country } = userInputs;
        try {
            const addressResult = await this.repository.createAddress({ _id, street, postalCode, city, country });
            return FormatData(addressResult);

        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    async getProfile(id) {
        try {
            const existingCustomer = await this.repository.findCustomerById({ id });
            return FormatData(existingCustomer);
        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    async deleteProfile(id) {
        try {
            const deletedCustomer = await this.repository.deleteCustomerById({ id });
            const payload = {
                event: 'DELETE_PROFILE',
                data: { userId: id }
            }
            return { deletedCustomer, payload };
        } catch (err) {
            throw new APIError('Data Not found', err);
        }
    }

    // async getShoppingDetails(id) {
    //     try {
    //         const existingCustomer = await this.repository.findCustomerById({ id });
    //
    //         if (existingCustomer) {
    //             return FormatData(existingCustomer);
    //         }
    //         return FormatData({ msg: 'Error' });
    //
    //     } catch (err) {
    //         throw new APIError('Data Not found', err);
    //     }
    // }
    //
    // async getWishList(customerId) {
    //     try {
    //         const wishListItems = await this.repository.wishlist(customerId);
    //         return FormatData(wishListItems);
    //     } catch (err) {
    //         throw new APIError('Data Not found', err);
    //     }
    // }
    //
    // async addToWishlist(customerId, product) {
    //     try {
    //         const wishlistResult = await this.repository.addWishlistItem(customerId, product);
    //         return FormatData(wishlistResult);
    //     } catch (err) {
    //         throw new APIError('Data Not found', err);
    //     }
    // }
    //
    // async manageCart(customerId, product, qty, isRemove) {
    //     try {
    //         const cartResult = await this.repository.addCartItem(customerId, product, qty, isRemove);
    //         return FormatData(cartResult);
    //     } catch (err) {
    //         throw new APIError('Data Not found bree!', err);
    //     }
    // }
    //
    // async manageOrder(customerId, order) {
    //     try {
    //         const orderResult = await this.repository.addOrderToProfile(customerId, order);
    //         return FormatData(orderResult);
    //     } catch (err) {
    //         throw new APIError('Data Not found', err);
    //     }
    // }
    //
    // async subscribeEvents(payload) {
    //
    //     payload = JSON.parse(payload);
    //     const { event, data } = payload;
    //
    //     const { userId, product, order, qty } = data;
    //
    //     switch (event) {
    //         case 'ADD_TO_WISHLIST':
    //         case 'REMOVE_FROM_WISHLIST':
    //             await this.addToWishlist(userId, product);
    //             break;
    //         case 'ADD_TO_CART':
    //             await this.manageCart(userId, product, qty, false);
    //             break;
    //         case 'REMOVE_FROM_CART':
    //             await this.manageCart(userId, product, qty, true);
    //             break;
    //         case 'CREATE_ORDER':
    //             await this.manageOrder(userId, order);
    //             break;
    //         default:
    //             break;
    //     }
    // }
}

export default CustomerService;
