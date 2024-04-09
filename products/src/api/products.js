import ProductService from '../services/product-service.js';
import { RPCObserver } from '../utils/index.js';

export default async function (app, channel) {
  // Initialize a new instance of ProductService
  const service = new ProductService();

  // Start observing for RPC calls with the topic "PRODUCT_RPC"
  await RPCObserver('PRODUCT_RPC', service);

  /**
   * POST /product/create
   * This endpoint allows a new product to be created.
   * It expects name, desc, type, unit, price, available, supplier, and banner in the request body.
   *
   * @param {Object} req - The request object, expected to contain product details in req.body.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the CreateProduct service method.
   */
  app.post('/product/create', async (req, res, next) => {
    try {
      const { name, desc, type, unit, price, available, supplier, banner } = req.body;
      const { data } = await service.CreateProduct({ name, desc, type, unit, price, available, supplier, banner });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /category/:type
   * This endpoint retrieves products of a specific category.
   * It expects a type in the request parameters.
   *
   * @param {Object} req - The request object, expected to contain type in req.params.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the GetProductsByCategory service method.
   */
  app.get('/category/:type', async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /:id
   * This endpoint retrieves the description of a specific product.
   * It expects a product ID in the request parameters.
   *
   * @param {Object} req - The request object, expected to contain product ID in req.params.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the GetProductDescription service method.
   */
  app.get('/:id', async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /ids
   * This endpoint retrieves selected products.
   * It expects an array of product IDs in the request body.
   *
   * @param {Object} req - The request object, expected to contain product IDs in req.body.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the GetSelectedProducts service method.
   */
  app.post('/ids', async (req, res, next) => {
    try {
      const { ids } = req.body;
      const products = await service.GetSelectedProducts(ids);
      return res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /whoami
   * This endpoint returns a message indicating the service identity.
   * It does not require any authentication or parameters.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} A JSON object containing a message about the service identity.
   */
  app.get('/whoami', (req, res, next) => {
    return res.status(200).json({ message: '/ or /products : I am Products Service!' });
  });

  /**
   * GET /
   * This endpoint retrieves all products.
   * It does not require any authentication or parameters.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the GetProducts service method.
   */
  app.get('/', async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
}
