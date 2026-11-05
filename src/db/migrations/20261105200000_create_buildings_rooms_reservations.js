exports.up = async function (knex) {
  await knex.schema.createTable("buildings", table => {
    table.increments("id").primary();
    table.string("name", 100).notNullable().unique();
    table.string("address", 255).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("rooms", table => {
    table.increments("id").primary();
    // RESTRICT: nie da się usunąć budynku, który ma sale
    table.integer("building_id").notNullable()
      .references("id").inTable("buildings").onDelete("RESTRICT");
    table.string("name", 50).notNullable();
    table.integer("capacity").notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // ta sama nazwa sali może wystąpić w dwóch budynkach, ale nie w jednym
    table.unique(["building_id", "name"], { indexName: "rooms_building_id_name_unique" });
  });

  await knex.schema.createTable("reservations", table => {
    table.increments("id").primary();
    // RESTRICT: rezerwacje to historia - sali z rezerwacjami nie usuwamy
    table.integer("room_id").notNullable()
      .references("id").inTable("rooms").onDelete("RESTRICT");
    table.string("reserved_by", 100).notNullable();
    table.integer("participants").notNullable();
    table.timestamp("start_time", { useTz: true }).notNullable();
    table.timestamp("end_time", { useTz: true }).notNullable();
    table.string("status", 20).notNullable().defaultTo("CONFIRMED");
    table.timestamp("cancelled_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // indeks pod sprawdzanie kolizji: WHERE room_id = ? AND start_time < ? AND end_time > ?
    table.index(["room_id", "start_time", "end_time"], "reservations_room_time_idx");
  });

  await knex.raw(`ALTER TABLE rooms ADD CONSTRAINT rooms_capacity_check CHECK (capacity > 0)`);
  await knex.raw(`ALTER TABLE reservations ADD CONSTRAINT reservations_time_check CHECK (end_time > start_time)`);
  await knex.raw(`ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ('CONFIRMED', 'CANCELLED'))`);
  await knex.raw(`ALTER TABLE reservations ADD CONSTRAINT reservations_participants_check CHECK (participants > 0)`);
};

exports.down = async function (knex) {
  // odwrotna kolejność - najpierw tabele z FK
  await knex.schema.dropTable("reservations");
  await knex.schema.dropTable("rooms");
  await knex.schema.dropTable("buildings");
};
