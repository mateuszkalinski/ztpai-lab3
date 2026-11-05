const { ConflictError } = require("../../errors/AppError");

const DEFAULT_ROOMS = [
  { id: 1, buildingId: 1, name: "A101", capacity: 30 },
  { id: 2, buildingId: 1, name: "A102", capacity: 35 },
  { id: 3, buildingId: 1, name: "A103", capacity: 40 },
  { id: 4, buildingId: 1, name: "A104", capacity: 45 }
];

function createRoomsRepository(seed = DEFAULT_ROOMS) {
  const rooms = structuredClone(seed);
  let nextId = Math.max(0, ...rooms.map(r => r.id)) + 1;

  return {
    async findAll() {
      return rooms;
    },

    async findById(id) {
      return rooms.find(room => room.id === id) ?? null;
    },

    async create({ buildingId, name, capacity }) {
      // odpowiednik UNIQUE (building_id, name) z bazy
      if (rooms.some(r => r.buildingId === buildingId && r.name === name)) {
        throw new ConflictError("Resource already exists", "UNIQUE_VIOLATION");
      }
      const room = { id: nextId++, buildingId, name, capacity };
      rooms.push(room);
      return room;
    }
  };
}

module.exports = { createRoomsRepository };
