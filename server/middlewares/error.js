// ✅ NAMED export
export class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

// ✅ DEFAULT export (middleware)
const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        err = new ErrorHandler(
            `Duplicate ${Object.keys(err.keyValue)} entered`,
            400
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

export default errorMiddleware;
