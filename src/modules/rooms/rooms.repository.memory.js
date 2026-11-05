const { ConflictError } = require("../../errors/AppError");

const DEFAULT_ROOMS = [
  { id: 1, buildingId: 1, name: "A101", capacity: 30 },
  { id: 2, buildingId: 1, name: "A102", capacity: 35 },
  { id: 3, buildingId: 1, name: "A103", capacity: 40 },
  { id: 4, buildingId: 1, name: "A104", capacity: 45 }
];

// findBuilding(id) - podawane przez unit of work, żeby zwracać salę razem z budynkiem
function createRoomsRepository(seed = DEFAULT_ROOMS, { findBuilding = async () => null } = {}) {
  const rooms = structuredClone(seed);
  let nextId = Math.max(0, ...rooms.map(r => r.id)) + 1;

  async function withBuilding(room) {
    if (!room) return null;
    const building = await findBuilding(room.buildingId);
    return { ...room, building: building ? { id: building.id, name: building.name } : null };
  }

  return {
    async findAll() {
      return Promise.all(rooms.map(withBuilding));
    },

    async findById(id) {
      return withBuilding(rooms.find(room => room.id === id));
    },

    // w pamięci nie ma równoległych transakcji - blokada niepotrzebna (ten sam interfejs co Knex)
    async lockById() {},

    async findByBuildingId(buildingId) {
      return Promise.all(rooms.filter(r => r.buildingId === buildingId).map(withBuilding));
    },

    async countByBuildingId(buildingId) {
      return rooms.filter(r => r.buildingId === buildingId).length;
    },

    async create({ buildingId, name, capacity }) {
      // odpowiednik UNIQUE (building_id, name) z bazy
      if (rooms.some(r => r.buildingId === buildingId && r.name === name)) {
        throw new ConflictError("Resource already exists", "UNIQUE_VIOLATION");
      }
      const room = { id: nextId++, buildingId, name, capacity };
      rooms.push(room);
      return withBuilding(room);
    }
  };
}

module.exports = { createRoomsRepository };
