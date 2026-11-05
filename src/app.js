const express = require("express");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const { createRoomsService } = require("./modules/rooms/rooms.service");
const { createRoomsController } = require("./modules/rooms/rooms.controller");
const { createRoomsRouter } = require("./modules/rooms/rooms.routes");

const { createReservationsService } = require("./modules/reservations/reservations.service");
const { createReservationsController } = require("./modules/reservations/reservations.controller");
const { createReservationsRouter } = require("./modules/reservations/reservations.routes");

function createApp({ roomsRepository, reservationsRepository, now }) {
  const app = express();
  app.set("json spaces", 2);

  app.use(requestLogger);
  app.use(express.json());

  // składamy moduły: repository -> service -> controller -> router
  const roomsService = createRoomsService({ roomsRepository });
  const reservationsService = createReservationsService({ reservationsRepository, roomsRepository, now });

  app.use("/api/rooms", createRoomsRouter(createRoomsController(roomsService)));
  app.use("/api/reservations", createReservationsRouter(createReservationsController(reservationsService)));

  // tymczasowy endpoint do pokazania obsługi 500
  app.get("/api/debug/crash", () => {
    throw new Error("boom");
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };