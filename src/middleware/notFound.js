const { NotFoundError } = require("../errors/AppError");

function notFound(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;