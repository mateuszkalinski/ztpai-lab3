const { createBuildingsRepository } = require("../modules/buildings/buildings.repository.memory");
const { createRoomsRepository } = require("../modules/rooms/rooms.repository.memory");
const { createReservationsRepository } = require("../modules/reservations/reservations.repository.memory");

function createMemoryUnitOfWork() {
  // repositories in-memory odwołują się do siebie nawzajem (odpowiednik JOIN-ów w bazie)
  const repositories = {};
  repositories.buildings = createBuildingsRepository(undefined, {
    countRooms: buildingId => repositories.rooms.countByBuildingId(buildingId)
  });
  repositories.rooms = createRoomsRepository(undefined, {
    findBuilding: id => repositories.buildings.findById(id)
  });
  repositories.reservations = createReservationsRepository(undefined, {
    findRoom: id => repositories.rooms.findById(id)
  });

  // w pamięci nie ma czego cofać - po prostu wywołujemy funkcję
  return { runInTransaction: fn => fn(repositories) };
}

module.exports = { createMemoryUnitOfWork };
