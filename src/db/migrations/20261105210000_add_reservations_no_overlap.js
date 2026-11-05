// Druga linia obrony przed double booking: baza sama nie pozwoli na dwie nakładające się
// rezerwacje CONFIRMED tej samej sali - niezależnie od kodu aplikacji i liczby instancji.
exports.up = async function (knex) {
  // btree_gist pozwala użyć zwykłej równości (room_id WITH =) w indeksie GiST
  await knex.raw("CREATE EXTENSION IF NOT EXISTS btree_gist");
  await knex.raw(`
    ALTER TABLE reservations ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (
      room_id WITH =,
      tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status = 'CONFIRMED')
  `);
};

exports.down = async function (knex) {
  await knex.raw("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_no_overlap");
  await knex.raw("DROP EXTENSION IF EXISTS btree_gist");
};
