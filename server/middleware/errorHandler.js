export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[Error Handler] URL: ${req.originalUrl} | Method: ${req.method}`);
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
