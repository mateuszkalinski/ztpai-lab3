function toRoom(row) {
  if (!row) return null;
  return {
    id: row.id,
    buildingId: row.building_id,
    name: row.name,
    capacity: row.capacity,
    createdAt: row.created_at
  };
}

function createRoomsRepository(db) {
  return {
    async findAll() {
      const rows = await db("rooms").select("*").orderBy("id");
      return rows.map(toRoom);
    },

    async findById(id) {
      return toRoom(await db("rooms").where({ id }).first());
    },

    async create({ buildingId, name, capacity }) {
      const [row] = await db("rooms")
        .insert({ building_id: buildingId, name, capacity })
        .returning("*");
      return toRoom(row);
    }
  };
}

module.exports = { createRoomsRepository };
