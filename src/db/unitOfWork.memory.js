const { createBuildingsRepository } = require("../modules/buildings/buildings.repository.memory");
const { createRoomsRepository } = require("../modules/rooms/rooms.repository.memory");
const { createReservationsRepository } = require("../modules/reservations/reservations.repository.memory");

function createMemoryUnitOfWork() {
  const repositories = {
    buildings: createBuildingsRepository(),
    rooms: createRoomsRepository(),
    reservations: createReservationsRepository()
  };

  // w pamięci nie ma czego cofać - po prostu wywołujemy funkcję
  return { runInTransaction: fn => fn(repositories) };
}

module.exports = { createMemoryUnitOfWork };
