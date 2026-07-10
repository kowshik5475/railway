/**
 * demo-admin.js — DEMO ONLY
 * Remove this file and its <script> tag when connecting to a PHP/MySQL backend.
 * Production data flows through api/getAdminObjects.php, api/getAnalytics.php,
 * and api/getActivity.php instead.
 */

const DEMO_OBJECTS = {
  Trains: {
    type: 'table',
    columns: ['Train ID', 'Name', 'Source', 'Destination', 'Departure', 'Total Seats'],
    rows: [
      [12345, 'Vande Bharat',     'Vijayawada', 'Hyderabad', '06:00 AM', 120],
      [22691, 'Shatabdi Express', 'Chennai',    'Bengaluru', '07:15 AM', 80]
    ]
  },
  Passengers: {
    type: 'table',
    columns: ['Passenger ID', 'Name', 'Phone', 'Registered On'],
    rows: [
      [1001, 'Ravi Kumar',   '9876543210', '2025-01-10'],
      [1002, 'Priya Sharma', '9123456780', '2025-02-14'],
      [1003, 'Arjun Mehta',  '9000011122', '2025-03-01']
    ]
  },
  Tickets: {
    type: 'table',
    columns: ['Ticket ID', 'Passenger ID', 'Train ID', 'Class', 'Seat', 'Status'],
    rows: [
      [5001, 1001, 12345, 'SL', 'B2-12', 'Confirmed'],
      [5002, 1002, 22691, '3A', 'A1-05', 'Cancelled'],
      [5003, 1003, 22691, '2A', 'A2-18', 'Confirmed']
    ]
  },
  Seats: {
    type: 'table',
    columns: ['Seat No', 'Train ID', 'Class', 'Is Booked'],
    rows: [
      ['B2-12', 12345, 'SL', 1],
      ['B2-13', 12345, 'SL', 0],
      ['A1-05', 22691, '3A', 1],
      ['A1-06', 22691, '3A', 0],
      ['A2-18', 22691, '2A', 1]
    ]
  },
  CancellationLog: {
    type: 'table',
    columns: ['Log ID', 'Ticket ID', 'Passenger ID', 'Cancelled At'],
    rows: [
      [201, 5002, 1002, '2025-06-20 08:52:00']
    ]
  },
  ConfirmationLog: {
    type: 'table',
    columns: ['Log ID', 'Ticket ID', 'Confirmed At'],
    rows: [
      [301, 5001, '2025-06-19 09:14:00'],
      [302, 5003, '2025-06-19 08:30:00']
    ]
  },
  TrainSchedule: {
    type: 'view',
    columns: ['Train ID', 'Name', 'Source', 'Destination', 'Departure', 'Available Seats'],
    rows: [
      [12345, 'Vande Bharat',     'Vijayawada', 'Hyderabad', '06:00 AM', 34],
      [22691, 'Shatabdi Express', 'Chennai',    'Bengaluru', '07:15 AM', 22]
    ]
  },
  ActiveBookings: {
    type: 'view',
    columns: ['Ticket ID', 'Passenger', 'Train', 'Class', 'Seat'],
    rows: [
      [5001, 'Ravi Kumar',  'Vande Bharat',     'SL', 'B2-12'],
      [5003, 'Arjun Mehta', 'Shatabdi Express', '2A', 'A2-18']
    ]
  },
  SeatOccupancy: {
    type: 'view',
    columns: ['Train', 'Total Seats', 'Booked', 'Occupancy %'],
    rows: [
      ['Vande Bharat',     120, 86, '71.7%'],
      ['Shatabdi Express', 80,  58, '72.5%']
    ]
  },
  BookTicket: {
    type: 'procedure',
    definition:
`CREATE PROCEDURE BookTicket(
  IN  p_passenger_id INT,
  IN  p_train_id     INT,
  IN  p_class        VARCHAR(4),
  OUT p_ticket_id    INT,
  OUT p_seat         VARCHAR(10)
)
BEGIN
  -- Find next available seat for the given train and class
  SELECT seat_no INTO p_seat
    FROM Seats
    WHERE train_id = p_train_id
      AND class = p_class
      AND is_booked = 0
    LIMIT 1;

  -- Insert ticket record
  INSERT INTO Tickets (passenger_id, train_id, class, seat, status)
    VALUES (p_passenger_id, p_train_id, p_class, p_seat, 'Confirmed');

  SET p_ticket_id = LAST_INSERT_ID();

  -- Mark seat as booked (fires SeatAvailability trigger)
  UPDATE Seats SET is_booked = 1
    WHERE train_id = p_train_id AND seat_no = p_seat;
END`
  },
  CancelTicket: {
    type: 'procedure',
    definition:
`CREATE PROCEDURE CancelTicket(
  IN p_ticket_id INT
)
BEGIN
  UPDATE Tickets SET status = 'Cancelled'
    WHERE ticket_id = p_ticket_id;

  -- Free the seat
  UPDATE Seats s
    JOIN Tickets t ON s.seat_no = t.seat AND s.train_id = t.train_id
    SET s.is_booked = 0
    WHERE t.ticket_id = p_ticket_id;
END`
  },
  BookingHistory: {
    type: 'procedure',
    definition:
`CREATE PROCEDURE BookingHistory(
  IN p_passenger_id INT
)
BEGIN
  SELECT t.ticket_id, tr.name AS train, t.class,
         t.seat, t.status
    FROM Tickets t
    JOIN Trains tr ON t.train_id = tr.train_id
    WHERE t.passenger_id = p_passenger_id
    ORDER BY t.ticket_id DESC;
END`
  },
  SeatAvailability: {
    type: 'trigger',
    definition:
`CREATE TRIGGER SeatAvailability
AFTER UPDATE ON Seats
FOR EACH ROW
BEGIN
  -- Recalculate available seat count on the train
  UPDATE Trains
    SET available_seats = (
      SELECT COUNT(*) FROM Seats
        WHERE train_id = NEW.train_id AND is_booked = 0
    )
    WHERE train_id = NEW.train_id;
END`
  },
  BookingConfirmation: {
    type: 'trigger',
    definition:
`CREATE TRIGGER BookingConfirmation
AFTER INSERT ON Tickets
FOR EACH ROW
BEGIN
  INSERT INTO ConfirmationLog (ticket_id, confirmed_at)
    VALUES (NEW.ticket_id, NOW());
END`
  },
  CancellationLogTrigger: {
    type: 'trigger',
    definition:
`CREATE TRIGGER CancellationLogTrigger
AFTER UPDATE ON Tickets
FOR EACH ROW
BEGIN
  IF NEW.status = 'Cancelled' AND OLD.status <> 'Cancelled' THEN
    INSERT INTO CancellationLog (ticket_id, passenger_id, cancelled_at)
      VALUES (NEW.ticket_id, NEW.passenger_id, NOW());
  END IF;
END`
  }
};

const DEMO_ANALYTICS = {
  occRate: 80, topTrainScore: 60, cancelRate: 4.6
};

const DEMO_ACTIVITY = [
  { event: '🎟️ Booking',      train: 'Vande Bharat',     passenger: 'Ravi Kumar',   time: '09:14 AM', status: 'Confirmed',    badge: 'badge-green' },
  { event: '❌ Cancellation', train: 'Shatabdi Express', passenger: 'Priya Sharma', time: '08:52 AM', status: 'Cancelled',    badge: 'badge-red'   },
  { event: '🎟️ Booking',      train: 'Shatabdi Express', passenger: 'Arjun Mehta',  time: '08:30 AM', status: 'Confirmed',    badge: 'badge-green' },
  { event: '⚡ Trigger',      train: 'Vande Bharat',     passenger: '—',            time: '08:00 AM', status: 'Seat Updated', badge: 'badge-blue'  }
];
