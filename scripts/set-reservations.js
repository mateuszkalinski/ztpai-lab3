// Ustawia w bazie dokładnie N rezerwacji (do pokazania braku N+1).
// Użycie: node scripts/set-reservations.js 5   |   node scripts/set-reservations.js 20
const db = require("../src/db/knex");
const { seed } = require("../src/db/seeds/01_demo_data");

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const n = Number(process.argv[2]);
  if (!Number.isInteger(n) || n < 1) throw new Error("Podaj liczbę rezerwacji, np. 5 albo 20");

  await seed(db); // stan z seeda: 6 rezerwacji

  await db("reservations").where("id", ">", n).del();

  const { count } = await db("reservations").count({ count: "*" }).first();
  const missing = n - Number(count);
  const names = ["Jan Kowalski", "Anna Wiśniewska", "Piotr Mazur", "Ewa Krawczyk", "Michał Kaczmarek"];

  const rows = [];
  for (let i = 0; i < missing; i++) {
    const start = new Date(Date.now() + (10 + i) * DAY);
    start.setHours(10, 0, 0, 0);
    rows.push({
      room_id: (i % 6) + 1,
      reserved_by: names[i % names.length],
      participants: 10 + (i % 10),
      start_time: start,
      end_time: new Date(start.getTime() + 90 * 60 * 1000),
      status: "CONFIRMED"
    });
  }
  if (rows.length) await db("reservations").insert(rows);

  const { count: total } = await db("reservations").count({ count: "*" }).first();
  console.log(`Rezerwacji w bazie: ${total}`);
}

main()
  .catch(err => { console.error(err.message); process.exitCode = 1; })
  .finally(() => db.destroy());
