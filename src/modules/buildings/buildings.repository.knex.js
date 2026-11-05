function toBuilding(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    roomsCount: Number(row.rooms_count ?? 0), // COUNT zwraca bigint jako string
    createdAt: row.created_at
  };
}

// budynki razem z liczbą sal - jedno zapytanie.
// LEFT JOIN, bo INNER JOIN "zgubiłby" budynki bez sal; COUNT(r.id) liczy tylko dopasowane sale -> 0
function buildingsWithRoomsCount(db) {
  return db("buildings as b")
    .leftJoin("rooms as r", "r.building_id", "b.id")
    .select("b.id", "b.name", "b.address", "b.created_at")
    .count({ rooms_count: "r.id" })
    .groupBy("b.id");
}

function createBuildingsRepository(db) {
  return {
    async findAll() {
      const rows = await buildingsWithRoomsCount(db).orderBy("b.id");
      return rows.map(toBuilding);
    },

    async findById(id) {
      return toBuilding(await buildingsWithRoomsCount(db).where("b.id", id).first());
    },

    async create({ name, address }) {
      const [row] = await db("buildings").insert({ name, address }).returning("*");
      return toBuilding(row); // nowy budynek nie ma sal -> roomsCount 0
    }
  };
}

module.exports = { createBuildingsRepository };
