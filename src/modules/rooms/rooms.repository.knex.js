function toRoom(row) {
  if (!row) return null;
  return {
    id: row.id,
    buildingId: row.building_id,
    name: row.name,
    capacity: row.capacity,
    createdAt: row.created_at,
    building: { id: row.building_id, name: row.building_name }
  };
}

// sala razem z budynkiem - jedno zapytanie z JOIN zamiast osobnego zapytania o budynek
function roomsWithBuilding(db) {
  return db("rooms as r")
    .join("buildings as b", "b.id", "r.building_id")
    .select("r.id", "r.building_id", "r.name", "r.capacity", "r.created_at", "b.name as building_name");
}

function createRoomsRepository(db) {
  async function findById(id) {
    return toRoom(await roomsWithBuilding(db).where("r.id", id).first());
  }

  return {
    async findAll() {
      const rows = await roomsWithBuilding(db).orderBy("r.id");
      return rows.map(toRoom);
    },

    findById,

    async findByBuildingId(buildingId) {
      const rows = await roomsWithBuilding(db).where("r.building_id", buildingId).orderBy("r.id");
      return rows.map(toRoom);
    },

    async create({ buildingId, name, capacity }) {
      const [{ id }] = await db("rooms")
        .insert({ building_id: buildingId, name, capacity })
        .returning("id");
      return findById(id);
    }
  };
}

module.exports = { createRoomsRepository };
