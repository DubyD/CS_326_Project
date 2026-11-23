export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // service errors carry the status they want (401, 403, 404, ...)
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  });
