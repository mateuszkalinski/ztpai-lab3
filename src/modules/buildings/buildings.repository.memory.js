const { ConflictError } = require("../../errors/AppError");

const DEFAULT_BUILDINGS = [
  { id: 1, name: "Budynek A - Informatyka", address: "ul. Kampusowa 12, Kraków", createdAt: new Date() },
  { id: 2, name: "Budynek B - Elektrotechnika", address: "ul. Kampusowa 14, Kraków", createdAt: new Date() }
];

// countRooms(buildingId) - podawane przez unit of work (sale są w innym repository)
function createBuildingsRepository(seed = DEFAULT_BUILDINGS, { countRooms = async () => 0 } = {}) {
  const buildings = structuredClone(seed);
  let nextId = Math.max(0, ...buildings.map(b => b.id)) + 1;

  async function withRoomsCount(building) {
    return building ? { ...building, roomsCount: await countRooms(building.id) } : null;
  }

  return {
    async findAll() {
      return Promise.all(buildings.map(withRoomsCount));
    },

    async findById(id) {
      return withRoomsCount(buildings.find(b => b.id === id));
    },

    async create({ name, address }) {
      // odpowiednik UNIQUE (name) z bazy
      if (buildings.some(b => b.name === name)) {
        throw new ConflictError("Resource already exists", "UNIQUE_VIOLATION");
      }
      const building = { id: nextId++, name, address, createdAt: new Date() };
      buildings.push(building);
      return withRoomsCount(building);
    }
  };
}

module.exports = { createBuildingsRepository };
