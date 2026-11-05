try {
  process.loadEnvFile();
} catch {
  // brak pliku .env - zmienne mogą przyjść z zewnątrz (np. z Dockera)
}

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  migrations: { directory: "./src/db/migrations" },
  seeds: { directory: "./src/db/seeds" }
};
