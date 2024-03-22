import CustomerService from "../services/customer-service.js";
import { authMiddleware } from "./middlewares/auth.js";
import { SubscribeMessage } from "../utils/index.js";

export default async function setupCustomerRoutes(app, channel) {
  const service = new CustomerService();

  await SubscribeMessage(channel, service)

  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      const { data } = await service.signUp({ email, password, phone });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { data } = await service.signIn({ email, password });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/address", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
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

  app.get("/profile", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.getProfile(_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/shopping-details", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.getShoppingDetails(_id);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/wishlist", authMiddleware, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.getWishList(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
}
