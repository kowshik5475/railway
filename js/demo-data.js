/**
 * demo-data.js — DEMO ONLY
 * Remove this file and its <script> tag when connecting to a PHP/MySQL backend.
 * Production data flows through api/getStats.php and api/getTrains.php instead.
 */

const DEMO_STATS = {
  totalTrains:       125,
  totalPassengers:   530,
  totalTickets:      980,
  totalCancellations: 45
};

// value = train ID (passed to BookTicket stored procedure), label = display name
const DEMO_TRAINS = [
  { id: 12345, name: 'Vande Bharat',     source: 'Vijayawada', destination: 'Hyderabad', departure: '06:00 AM', duration: '3h 30m', seats: 34, status: 'On Time' },
  { id: 22691, name: 'Shatabdi Express', source: 'Chennai',    destination: 'Bengaluru', departure: '07:15 AM', duration: '5h 00m', seats: 22, status: 'Delayed'  }
];
