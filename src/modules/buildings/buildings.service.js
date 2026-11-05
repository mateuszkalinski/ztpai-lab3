const { NotFoundError } = require("../../errors/AppError");

function createBuildingsService({ runInTransaction }) {
  async function listBuildings() {
    return runInTransaction(({ buildings }) => buildings.findAll());
  }

  async function getBuilding(id) {
    return runInTransaction(async ({ buildings }) => {
      const building = await buildings.findById(id);
      if (!building) throw new NotFoundError("Building");
      return building;
    });
  }

  async function createBuilding(input) {
    // duplikat nazwy -> UNIQUE w bazie (23505) -> 409 w errorHandlerze
    return runInTransaction(({ buildings }) => buildings.create(input));
  }

  async function listBuildingRooms(id) {
    return runInTransaction(async ({ buildings, rooms }) => {
      // nieistniejący budynek -> 404, budynek bez sal -> []
      const building = await buildings.findById(id);
      if (!building) throw new NotFoundError("Building");
      return rooms.findByBuildingId(id);
    });
  }

  return { listBuildings, getBuilding, createBuilding, listBuildingRooms };
}

module.exports = { createBuildingsService };
