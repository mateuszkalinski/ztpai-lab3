-- Test exclusion constraint reservations_no_overlap (sala 1, 1 lutego 2027)
-- OK: rezerwacja 10:00-12:00
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Karolina Nowak', 20, '2027-02-01 10:00+00', '2027-02-01 12:00+00');

-- OK: 12:00-13:00 tylko się styka z 10:00-12:00 (przedział [) - koniec nie należy do przedziału)
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Tomasz Zając', 15, '2027-02-01 12:00+00', '2027-02-01 13:00+00');

-- BŁĄD 23P01: 11:00-12:30 nakłada się na obie powyższe
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Paweł Lewandowski', 10, '2027-02-01 11:00+00', '2027-02-01 12:30+00');

-- OK: ta sama godzina w innej sali
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (2, 'Paweł Lewandowski', 10, '2027-02-01 11:00+00', '2027-02-01 12:30+00');

-- anulujemy rezerwację 10:00-12:00 w sali 1
UPDATE reservations SET status = 'CANCELLED', cancelled_at = now() WHERE room_id = 1 AND start_time = '2027-02-01 10:00+00' AND reserved_by = 'Karolina Nowak';

-- OK: anulowana rezerwacja nie blokuje - znowu 10:00-12:00 w sali 1
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Agnieszka Wójcik', 25, '2027-02-01 10:00+00', '2027-02-01 12:00+00');

SELECT id, room_id, reserved_by, start_time, end_time, status FROM reservations WHERE start_time >= '2027-02-01' AND start_time < '2027-02-02' ORDER BY room_id, start_time, id;
