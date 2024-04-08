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
      throw new APIError("Unable to Create Customer");
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
    const profile = await Customer.findById(_id);

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
  async findCustomerById({ id }) {
    try {
      return await Customer.findById(id).populate("address");
    } catch (err) {
      throw new APIError(
          "Unable to Find Customer"
      );
    }
  }

  /**
   * Deletes a customer by ID.
   *
   * @param {Object} param0 - An object containing the ID of the customer.
   * @param {string} param0.id - The ID of the customer.
   * @returns {Promise<Object>} The deleted customer object.
   * @throws {APIError} When there is an error deleting the customer.
   */
  async deleteCustomerById({ id }) {
    try {
      return await Customer.findByIdAndDelete(id);
    } catch (err) {
      console.log('ERROR', err)
      throw new APIError(
          "Unable to Delete Customer"
      );
    }
  }

}


export default CustomerRepository;
