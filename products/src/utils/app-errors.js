const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class BaseError extends Error {
  constructor(
      name,
      statusCode,
      description,
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

//api Specific Errors
class APIError extends BaseError {
  constructor(description = "API Error") {
    super("API Internal Error", STATUS_CODES.INTERNAL_ERROR, description);
  }
}


//400
class ValidationError extends BaseError {
  constructor(description = "Validation Error") {
    super("VALIDATION ERROR", STATUS_CODES.BAD_REQUEST, description);
  }
}

//403
class AuthorizationError extends BaseError {
  constructor(description = "Authorization Error") {
    super("Authorization Error", STATUS_CODES.UN_AUTHORISED, description);
  }
}

//404
class NotFoundError extends BaseError {
  constructor(description = "Not Found Error") {
    super("Not Found Error", STATUS_CODES.NOT_FOUND, description);
  }
}

export { BaseError, APIError, ValidationError, NotFoundError, AuthorizationError, STATUS_CODES };
