// export const errorHandler = (err, req, res, next) => {
//     // Determine status code
//     const statusCode = err.statusCode || err.status || 500;

//     // In production, don't leak stack traces
//     const isProduction = process.env.NODE_ENV === "production";
//     const showStack = !isProduction;

//     // Structured log (safe — no sensitive data)
//     console.error(`[${req.method} ${req.originalUrl}] Error ${statusCode}: ${err.message}`);
//     if (showStack) {
//         console.error(err.stack);
//     }

//     // Standard response format
//     res.status(statusCode).json({
//         success: false,
//         message: isProduction ? "Internal server error" : err.message,
//         // Only include stack in development
//         ...(showStack && { stack: err.stack }),
//     });
// };



// middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;

    // Log only in development or with a proper logger in production
    if (process.env.NODE_ENV !== "production") {
        console.error(`[${req.method} ${req.originalUrl}] ${statusCode} - ${err.message}`);
        console.error(err.stack);
    } else {
        // In production, use structured logging (Winston, Pino, etc.)
        console.error(`Error ${statusCode}: ${err.message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message,
    });
};