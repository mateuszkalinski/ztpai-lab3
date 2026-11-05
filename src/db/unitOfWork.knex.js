const { createBuildingsRepository } = require("../modules/buildings/buildings.repository.knex");
const { createRoomsRepository } = require("../modules/rooms/rooms.repository.knex");
const { createReservationsRepository } = require("../modules/reservations/reservations.repository.knex");

// te same repositories, raz na "db", raz na obiekcie transakcji "trx" (ma to samo API)
function createKnexRepositories(db) {
  return {
    buildings: createBuildingsRepository(db),
    rooms: createRoomsRepository(db),
    reservations: createReservationsRepository(db)
  };
}

function createKnexUnitOfWork(db) {
  return {
    // COMMIT gdy fn zakończy się normalnie, ROLLBACK gdy rzuci wyjątek
    runInTransaction: fn => db.transaction(trx => fn(createKnexRepositories(trx)))
  };
}

module.exports = { createKnexRepositories, createKnexUnitOfWork };
