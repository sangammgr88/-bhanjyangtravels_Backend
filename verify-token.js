const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJoYW5qeWFuZ0BnbWFpbC5jb20iLCJzdWIiOiI2ODY3NjY3ZDRkYjc0ZGJiZjAzYTA3MmQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODIwMTkxMDIsImV4cCI6MTc4MjAyMDAwMn0.T-XltWD8EYgbh28GG6Gd_Zpkp0X8nlYdzHa3Kr8meqQ";

try {
  const decoded = jwt.verify(token, 'your-secret-key');
  console.log("Valid token with fallback secret!", decoded);
} catch (e) {
  console.error("Invalid token:", e.message);
}
