import {ProductRepository} from "../database/index.js";
import { FormatData } from "../utils/index.js";
import { APIError } from '../utils/app-errors.js';


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
        try{
            const productResult = await this.repository.CreateProduct(productInputs)
            return FormatData(productResult);
        }catch(err){
            throw new APIError('Data Not found')
        }
    }

    /**
     * Retrieves all products and their categories.
     *
     * @returns {Promise<Object>} An object containing all products and their categories.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetProducts(){
        try{
            const products = await this.repository.Products();
    
            let categories = {};
    
            products.map(({ type }) => {
                categories[type] = type;
            });
            
            return FormatData({
                products,
                categories:  Object.keys(categories) ,
            })

        }catch(err){
            throw new APIError('Data Not found')
        }
    }

    /**
     * Retrieves the description of a specific product.
     *
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Object>} The product object.
     * @throws {APIError} When there is an error retrieving the product.
     */
    async GetProductDescription(productId){
        try {
            const product = await this.repository.FindById(productId);
            return FormatData(product)
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    /**
     * Retrieves products of a specific category.
     *
     * @param {string} category - The category of the products.
     * @returns {Promise<Object>} The products of the specified category.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetProductsByCategory(category){
        try {
            const products = await this.repository.FindByCategory(category);
            return FormatData(products)
        } catch (err) {
            throw new APIError('Data Not found')
        }

    }

    /**
     * Retrieves selected products.
     *
     * @param {Array<string>} selectedIds - An array of product IDs.
     * @returns {Promise<Object>} The selected products.
     * @throws {APIError} When there is an error retrieving the products.
     */
    async GetSelectedProducts(selectedIds){
        try {
            const products = await this.repository.FindSelectedProducts(selectedIds);
            return FormatData(products);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    /**
     * Retrieves a product by ID.
     *
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Object>} The product object.
     * @throws {APIError} When there is an error retrieving the product.
     */
    async GetProductById(productId){
        try {
            return await this.repository.FindById(productId);
        } catch (err) {
            throw new APIError('Data Not found')
        }
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
            console.log('GerProductPayload', productId, qty, event, userId)
            const product = await this.GetProductById(productId);
        console.log('GerProductPayload', product)
            if (product) {
                const payload = {
                    event: event,
                    data: { userId, product, qty }
                }
                return FormatData(payload);
            } else {
                return FormatData({ error: "No product available" })
            }
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