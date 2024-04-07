import {Product} from "../models/index.js";
import {APIError, STATUS_CODES} from "../../utils/app-errors.js";

/**
 * Serves RPC requests.
 *
 * @param {Object} payload - The RPC request payload.
 * @returns {Promise<Object>} The response to the RPC request.
 */
class ProductRepository {

  /**
   * Creates a new product.
   *
   * @param {Object} productInputs - An object containing the product details.
   * @returns {Promise<Object>} The created product object.
   * @throws {APIError} When there is an error creating the product.
   */
  async CreateProduct({
    name,
    desc,
    type,
    unit,
    price,
    available,
    suplier,
    banner,
  }) {
    try {
      const product = new Product({
        name,
        desc,
        type,
        unit,
        price,
        available,
        suplier,
        banner,
      });

      return await product.save();
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Product"
      );
    }
  }

  /**
   * Retrieves all products.
   *
   * @returns {Promise<Array>} An array of all product objects.
   * @throws {APIError} When there is an error retrieving the products.
   */
  async Products() {
    try {
      return await Product.find();
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Get Products"
      );
    }
  }

  /**
   * Retrieves a product by ID.
   *
   * @param {string} id - The ID of the product.
   * @returns {Promise<Object>} The product object.
   * @throws {APIError} When there is an error retrieving the product.
   */
  async FindById(id) {
    try {
      return await Product.findById(id);
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Product"
      );
    }
  }

  /**
   * Retrieves products of a specific category.
   *
   * @param {string} category - The category of the products.
   * @returns {Promise<Array>} An array of product objects of the specified category.
   * @throws {APIError} When there is an error retrieving the products.
   */
  async FindByCategory(category) {
    try {
      const products = await Product.find({ type: category });
      return products;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Category"
      );
    }
  }

  /**
   * Retrieves selected products.
   *
   * @param {Array<string>} selectedIds - An array of product IDs.
   * @returns {Promise<Array>} An array of the selected product objects.
   * @throws {APIError} When there is an error retrieving the products.
   */
  async FindSelectedProducts(selectedIds) {
    try {
      return await Product.find()
          .where("_id")
          .in(selectedIds.map((_id) => _id))
          .exec();
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Product"
      );
    }
  }
}

export default ProductRepository;
