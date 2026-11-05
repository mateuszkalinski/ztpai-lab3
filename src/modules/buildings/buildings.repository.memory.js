const { ConflictError } = require("../../errors/AppError");

const DEFAULT_BUILDINGS = [
  { id: 1, name: "Budynek A - Informatyka", address: "ul. Kampusowa 12, Kraków", createdAt: new Date() },
  { id: 2, name: "Budynek B - Elektrotechnika", address: "ul. Kampusowa 14, Kraków", createdAt: new Date() }
];

function createBuildingsRepository(seed = DEFAULT_BUILDINGS) {
  const buildings = structuredClone(seed);
  let nextId = Math.max(0, ...buildings.map(b => b.id)) + 1;

  return {
    async findAll() {
      return buildings;
    },

    async findById(id) {
      return buildings.find(b => b.id === id) ?? null;
    },

    async create({ name, address }) {
      // odpowiednik UNIQUE (name) z bazy
      if (buildings.some(b => b.name === name)) {
        throw new ConflictError("Resource already exists", "UNIQUE_VIOLATION");
      }
      const building = { id: nextId++, name, address, createdAt: new Date() };
      buildings.push(building);
      return building;
    }
  };
}

module.exports = { createBuildingsRepository };
