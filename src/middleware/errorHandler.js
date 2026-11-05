const { AppError } = require("../errors/AppError");

function errorHandler(err, req, res, next) {
  // 1. błąd, który sami rzuciliśmy (400, 404, 409)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.id
      }
    });
  }

  // 2. niepoprawny JSON w body (rzuca go express.json())
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body is not valid JSON",
        requestId: req.id
      }
    });
  }

  // 3. wszystko inne -> 500, szczegóły tylko w logach
  console.error(`[${req.id}]`, err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected error",
      requestId: req.id
    }
  });
}

module.exports = errorHandler;