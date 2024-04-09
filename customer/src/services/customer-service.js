import { CustomerRepository } from '../database/index.js';
import { FormatData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utils/index.js';
import { NotFoundError, ValidationError } from '../utils/app-errors.js';

class CustomerService {
  constructor() {
    this.repository = new CustomerRepository();
  }

  /**
   * Signs in a customer.
   *
   * @param {Object} userInputs - An object containing the customer's email and password.
   * @returns {Promise<Object>} The signed in customer's ID and token.
   * @throws {NotFoundError} When the customer is not found.
   * @throws {ValidationError} When the provided credentials are invalid.
   */
  async signIn(userInputs) {
    const { email, password } = userInputs;
    const existingCustomer = await this.repository.findCustomer({ email });

    if (!existingCustomer) {
      throw new NotFoundError('User not found with provided credentials');
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
   * @param {Object} userInputs - An object containing the customer's email, password, and phone.
   * @returns {Promise<Object>} The signed up customer's ID and token.
   */
  async signUp(userInputs) {
    const { email, password, phone } = userInputs;
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);
    const existingCustomer = await this.repository.createCustomer({
      email,
      password: userPassword,
      phone,
      salt,
    });
    const token = await GenerateSignature({ email, _id: existingCustomer._id });
    return FormatData({ id: existingCustomer._id, token });
  }

  /**
   * Adds a new address for a customer.
   *
   * @param {string} _id - The ID of the customer.
   * @param {Object} userInputs - An object containing the customer's street, postal code, city, and country.
   * @returns {Promise<Object>} The added address.
   */
  async addNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;
    const addressResult = await this.repository.createAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });
    return FormatData(addressResult);
  }

  /**
   * Retrieves a customer's profile.
   *
   * @param {string} id - The ID of the customer.
   * @returns {Promise<Object>} The customer's profile.
   * @throws {NotFoundError} When the customer is not found.
   */
  async getProfile(id) {
    const existingCustomer = await this.repository.findCustomerById({ id });
    if (!existingCustomer) {
      throw new NotFoundError('User not found');
    }
    return FormatData(existingCustomer);
  }

  /**
   * Deletes a customer's profile.
   *
   * @param {string} id - The ID of the customer.
   * @returns {Promise<Object>} The deleted customer's profile and a payload for the 'DELETE_PROFILE' event.
   */
  async deleteProfile(id) {
    const deletedCustomer = await this.repository.deleteCustomerById({ id });
    const payload = {
      event: 'DELETE_PROFILE',
      data: { userId: id },
    };
    return { data: deletedCustomer, payload };
  }
}

export default CustomerService;
