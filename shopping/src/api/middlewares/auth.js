import { ValidateSignature } from '../../utils/index.js';
import {AuthorizationError} from "../../utils/app-errors.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const isAuthorized = await ValidateSignature(req);

        if (isAuthorized) {
            return next();
        }
        throw new AuthorizationError('User not authorized');
    } catch (error) {
        next(error);
    }
};

