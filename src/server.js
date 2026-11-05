const { createApp } = require("./app");
const { createRoomsRepository } = require("./modules/rooms/rooms.repository.memory");
const { createReservationsRepository } = require("./modules/reservations/reservations.repository.memory");

const roomsRepository = createRoomsRepository();
const reservationsRepository = createReservationsRepository();

const app = createApp({
  roomsRepository,
  reservationsRepository,
  now: () => new Date()
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});