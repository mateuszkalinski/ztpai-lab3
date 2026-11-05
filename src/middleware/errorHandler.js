const { AppError } = require("../errors/AppError");

// błędy constraintów PostgreSQL (SQLSTATE) -> status HTTP
// celowo bez err.detail - zawiera nazwy tabel, kolumn i wartości z bazy
const PG_ERRORS = {
  "23505": { status: 409, code: "UNIQUE_VIOLATION", message: "Resource already exists" },
  "23503": { status: 409, code: "FOREIGN_KEY_VIOLATION", message: "Related resource does not exist or is still in use" },
  "23514": { status: 400, code: "CHECK_VIOLATION", message: "Data violates a database rule" },
  "23P01": { status: 409, code: "ROOM_ALREADY_BOOKED", message: "Sala jest juz zarezerwowana w tym czasie" }
};

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

  // 3. naruszenie constraintu w bazie
  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({
      error: {
        code: pgError.code,
        message: pgError.message,
        requestId: req.id
      }
    });
  }

  // 4. wszystko inne -> 500, szczegóły tylko w logach
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
