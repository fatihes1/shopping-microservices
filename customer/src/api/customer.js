import CustomerService from "../services/customer-service.js";
import { authMiddleware } from "./middlewares/auth.js";
import { PublishMessage } from "../utils/index.js";
import config from "../config/index.js";

export default async function setupCustomerRoutes(app, channel) {
  const service = new CustomerService();

  // await SubscribeMessage(channel, service)

  /**
   * POST /signup
   * This endpoint allows a new user to sign up.
   * It expects an email, password, and phone number in the request body.
   *
   * @param {Object} req - The request object, expected to contain email, password, and phone in req.body.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the signUp service method.
   */
  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      const { data } = await service.signUp({ email, password, phone });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /login
   * This endpoint allows a user to log in.
   * It expects an email and password in the request body.
   *
   * @param {Object} req - The request object, expected to contain email and password in req.body.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the signIn service method.
   */
  app.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { data } = await service.signIn({ email, password });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /address
   * This endpoint allows an authenticated user to add a new address.
   * It uses the authMiddleware to ensure that the request is authenticated.
   * It expects a street, postal code, city, and country in the request body.
   *
   * @param {Object} req - The request object, expected to contain the authenticated user in req.user and the address details in req.body.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the addNewAddress service method.
   */
  app.post("/address", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      console.log('ADDRESS CUSTOMERJS', _id,)
      const { street, postalCode, city, country } = req.body;
      const { data } = await service.addNewAddress(_id, {
        street,
        postalCode,
        city,
        country,
      });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /profile
   * This endpoint retrieves the profile of the authenticated user.
   * It uses the authMiddleware to ensure that the request is authenticated.
   *
   * @param {Object} req - The request object, expected to contain the authenticated user in req.user.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The profile of the authenticated user.
   */
  app.get("/profile", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.getProfile(_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  /**
   * DELETE /profile
   * This endpoint allows an authenticated user to delete their profile.
   * It uses the authMiddleware to ensure that the request is authenticated.
   *
   * @param {Object} req - The request object, expected to contain the authenticated user in req.user.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @returns {Object} The data returned from the deleteProfile service method.
   */
  app.delete("/profile", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data, payload } = await service.deleteProfile(_id);

      // Publish message to shopping service
      await PublishMessage(channel, config.SHOPPING_SERVICE, JSON.stringify(payload));

      return res.json(data);
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
  app.get("/whoami", (req, res, next) => {
    return res.status(200).json({
      msg: '/customer: I am a customer service'
    })
  })
}
