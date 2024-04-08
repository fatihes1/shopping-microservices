import { CustomerRepository } from "../database/index.js";
import { FormatData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utils/index.js';
import {APIError, NotFoundError, ValidationError} from '../utils/app-errors.js';

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
            const existingCustomer = await this.repository.findCustomer({ email });

            if (!existingCustomer) {
                throw new NotFoundError('User not found with provided credentials')
            }

            const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);

            if (!validPassword) {
                throw new ValidationError('User not found with provided credentials');
            }

            const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id });
            return FormatData({ id: existingCustomer._id, token });
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
        let salt = await GenerateSalt();
        let userPassword = await GeneratePassword(password, salt);
        const existingCustomer = await this.repository.createCustomer({ email, password: userPassword, phone, salt });
        const token = await GenerateSignature({ email, _id: existingCustomer._id });
        return FormatData({ id: existingCustomer._id, token });
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
        const addressResult = await this.repository.createAddress({ _id, street, postalCode, city, country });
        return FormatData(addressResult);
    }

    async getProfile(id) {
        const existingCustomer = await this.repository.findCustomerById({ id });
        if (!existingCustomer) {
            throw new NotFoundError('User not found')
        }
        return FormatData(existingCustomer);
    }

    async deleteProfile(id) {
        const deletedCustomer = await this.repository.deleteCustomerById({ id });
        const payload = {
            event: 'DELETE_PROFILE',
            data: { userId: id }
        }
        return { data: deletedCustomer, payload };
    }

}

export default CustomerService;
