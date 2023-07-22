const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// In-memory data structure to store booked facilities
const bookedFacilities = [];

// Function to calculate booking amount based on facility and time slot
function calculateBookingAmount(facility, startTime, endTime) {
  const duration =
    (new Date(`2000-01-01 ${endTime}`) - new Date(`2000-01-01 ${startTime}`)) /
    3600000;

  /* 
   This time is for Clubhouse when slot is such that is contains both booking amount i.e. 100Rs and 500Rs
   For example if input is - startTime : 10:00 & endTime : 20:00.
   then calculation will be (16:00 - 10:00)*100 + (20:00 - 16:00)*500 = 2600Rs.
*/
  const overLappingTimeZone =
    ((new Date(`2000-01-01 16:00:000`) - new Date(`2000-01-01 ${startTime}`)) /
      3600000) *
      100 +
    ((new Date(`2000-01-01 ${endTime}`) - new Date(`2000-01-01 16:00:000`)) /
      3600000) *
      500;

  if (facility === "Clubhouse") {
    if (startTime < "16:00" && endTime > "16:00") {
      return overLappingTimeZone;
    } else if (startTime >= "10:00" && endTime <= "16:00") {
      return 100 * duration;
    } else if (startTime >= "16:00" && endTime <= "22:00") {
      return 500 * duration;
    }
  } else if (facility === "TennisCourt") {
    return 50 * duration;
  }
}

// Endpoint to handle facility booking requests
app.post("/book", (req, res) => {
  console.log("Received a booking request:", req.body);
  const { facility, date, startTime, endTime } = req.body;

  if (!facility || !date || !startTime || !endTime) {
    return res.status(400).json({
      message: "Invalid booking data. Please provide all required fields.",
    });
  }

  // Check if the facility is already booked for the given date and time slot
  const isAlreadyBooked = bookedFacilities.some(
    (booking) =>
      booking.facility === facility &&
      booking.date === date &&
      ((booking.startTime <= startTime && startTime < booking.endTime) ||
        (booking.startTime < endTime && endTime <= booking.endTime))
  );

  if (isAlreadyBooked) {
    return res
      .status(400)
      .json({ message: `Booking Failed, ${facility} is Already Booked` });
  }

  // Calculate the booking amount based on the facility and time slot
  const bookingAmount = calculateBookingAmount(facility, startTime, endTime);
  if (bookingAmount === 0) {
    return res
      .status(400)
      .json({ message: "Booking Failed, Invalid Facility or Time Slot" });
  }

  // Save the booking and return the booking amount
  bookedFacilities.push({ facility, date, startTime, endTime });
  return res.json({
    message: `Booked - booking amount is ${bookingAmount}`,
    amount: bookingAmount,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
