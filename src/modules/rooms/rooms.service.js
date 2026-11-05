const { NotFoundError } = require("../../errors/AppError");

function createRoomsService({ runInTransaction }) {
  async function listRooms() {
    return runInTransaction(({ rooms }) => rooms.findAll());
  }

  async function getRoom(id) {
    return runInTransaction(async ({ rooms }) => {
      const room = await rooms.findById(id);
      if (!room) throw new NotFoundError("Room");
      return room;
    });
  }

  async function createRoom(input) {
    return runInTransaction(async ({ buildings, rooms }) => {
      // budynek musi istnieć -> 404
      const building = await buildings.findById(input.buildingId);
      if (!building) throw new NotFoundError("Building");

      // duplikat nazwy w budynku -> UNIQUE w bazie (23505) -> 409 w errorHandlerze
      return rooms.create(input);
    });
  }

  return { listRooms, getRoom, createRoom };
}

module.exports = { createRoomsService };
