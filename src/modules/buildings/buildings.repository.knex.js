function toBuilding(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    createdAt: row.created_at
  };
}

function createBuildingsRepository(db) {
  return {
    async findAll() {
      const rows = await db("buildings").select("*").orderBy("id");
      return rows.map(toBuilding);
    },

    async findById(id) {
      return toBuilding(await db("buildings").where({ id }).first());
    },

    async create({ name, address }) {
      const [row] = await db("buildings").insert({ name, address }).returning("*");
      return toBuilding(row);
    }
  };
}

module.exports = { createBuildingsRepository };
