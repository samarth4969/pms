// ✅ NAMED export
export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
// The ErrorHandler class extends the default JavaScript Error object and allows me to attach a custom
// status code along with the error message.

// ✅ DEFAULT export (middleware)
const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    err = new ErrorHandler(
      `Duplicate ${Object.keys(err.keyValue)} entered`,
      400,
    );
  }

  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("JSON Web Token is invalid", 400);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token expired, try again", 400);
  }

  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found: ${err.path}`, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

// The errorMiddleware catches all errors passed using next() and standardizes the response format.
// It also handles specific cases like duplicate key errors, invalid JWT tokens, expired tokens, and
// invalid MongoDB ObjectIds, converting them into meaningful client-friendly error messages.
// This approach ensures consistent error responses and cleaner controller logic.

export default errorMiddleware;
