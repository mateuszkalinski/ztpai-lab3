const { createApp } = require("./app");

// JEDYNE miejsce wyboru implementacji repositories:
//   domyślnie PostgreSQL (Knex), REPOSITORY=memory -> tablice w pamięci
function createUnitOfWork() {
  if (process.env.REPOSITORY === "memory") {
    const { createMemoryUnitOfWork } = require("./db/unitOfWork.memory");
    console.log("Repositories: in-memory");
    return createMemoryUnitOfWork();
  }

  const db = require("./db/knex");
  const { createKnexUnitOfWork } = require("./db/unitOfWork.knex");
  console.log("Repositories: PostgreSQL (Knex)");
  return createKnexUnitOfWork(db);
}

const { runInTransaction } = createUnitOfWork();

const app = createApp({
  runInTransaction,
  now: () => new Date()
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
