import {ProductRepository} from "../database/index.js";
import { FormatData } from "../utils/index.js";
import {APIError, NotFoundError} from '../utils/app-errors.js';


// All Business logic will be here
class ProductService {

    /**
     * ProductService constructor.
     * Initializes a new instance of the ProductRepository.
     */
    constructor(){
        this.repository = new ProductRepository();
    }

    /**
     * Creates a new product.
     *
     * @param {Object} productInputs - An object containing the product details.
     * @returns {Promise<Object>} The created product object.
     * @throws {APIError} When there is an error creating the product.
     */
    async CreateProduct(productInputs){
        const productResult = await this.repository.CreateProduct(productInputs)
        return FormatData(productResult);
    }

    /**
     * Retrieves all products and their categories.
     *
     * @returns {Promise<Object>} An object containing all products and their categories.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetProducts(){
        const products = await this.repository.Products();
        if (!products) throw new NotFoundError('There is no product available.')
        let categories = {};
        products.map(({ type }) => {categories[type] = type;});
        return FormatData({products, categories:  Object.keys(categories) ,})
    }

    /**
     * Retrieves the description of a specific product.
     *
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Object>} The product object.
     * @throws {APIError} When there is an error retrieving the product.
     */
    async GetProductDescription(productId){

       const product = await this.repository.FindById(productId);
       if (!product) throw new NotFoundError('Product not found')
       return FormatData(product)
    }

    /**
     * Retrieves products of a specific category.
     *
     * @param {string} category - The category of the products.
     * @returns {Promise<Object>} The products of the specified category.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetProductsByCategory(category){

        const products = await this.repository.FindByCategory(category);
        if (!products) throw new NotFoundError('No product available in this category')
        return FormatData(products)
    }

    /**
     * Retrieves selected products.
     *
     * @param {Array<string>} selectedIds - An array of product IDs.
     * @returns {Promise<Object>} The selected products.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetSelectedProducts(selectedIds){

       const products = await this.repository.FindSelectedProducts(selectedIds);
         if (!products) throw new NotFoundError('No product available')
       return FormatData(products);

    }

    /**
     * Retrieves a product by ID.
     *
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Object>} The product object.
     * @throws {APIError} When there is an error retrieving the product.
     */
    async GetProductById(productId){
        return await this.repository.FindById(productId);
    }

    /**
     * Generates a payload for a product.
     *
     * @param {string} userId - The ID of the user.
     * @param {Object} param1 - An object containing the product ID and quantity.
     * @param {string} param1.productId - The ID of the product.
     * @param {number} param1.qty - The quantity of the product.
     * @param {string} event - The event for which the payload is being generated.
     * @returns {Promise<Object>} The generated payload.
     */
    async GerProductPayload(userId, { productId, qty }, event){

       const product = await this.GetProductById(productId);

       if (!product) throw new NotFoundError('Product not found')

       const payload = {
           event: event,
           data: { userId, product, qty }
       }
       return FormatData(payload);
    }

    /**
     * Serves RPC requests.
     *
     * @param {Object} payload - The RPC request payload.
     * @returns {Promise<Object>} The response to the RPC request.
     */
    async serveRPCRequest(payload) {
        const { type, data } = payload;

        switch (type) {
            case 'VIEW_PRODUCT':
                return this.repository.FindById(data)
            case 'VIEW_PRODUCTS':
                return this.repository.FindSelectedProducts(data)
            default:
                return FormatData({ error: "Invalid Request" });
        }
    }
     
}

export default ProductService;