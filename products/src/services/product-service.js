import {ProductRepository} from "../database/index.js";
import { FormatData } from "../utils/index.js";
import { APIError } from '../utils/app-errors.js';


// All Business logic will be here
class ProductService {

    constructor(){
        this.repository = new ProductRepository();
    }

    async CreateProduct(productInputs){
        try{
            const productResult = await this.repository.CreateProduct(productInputs)
            return FormatData(productResult);
        }catch(err){
            throw new APIError('Data Not found')
        }
    }
    
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


    async GetProductDescription(productId){
        try {
            const product = await this.repository.FindById(productId);
            return FormatData(product)
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async GetProductsByCategory(category){
        try {
            const products = await this.repository.FindByCategory(category);
            return FormatData(products)
        } catch (err) {
            throw new APIError('Data Not found')
        }

    }

    async GetSelectedProducts(selectedIds){
        try {
            const products = await this.repository.FindSelectedProducts(selectedIds);
            return FormatData(products);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    async GetProductById(productId){
        try {
            return await this.repository.FindById(productId);
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

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
     
}

export default ProductService;