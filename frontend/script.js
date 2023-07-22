document
  .getElementById("bookingForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const facility = document.getElementById("facility").value;
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const table = document.getElementById("outputTable");

    // Call the backend API to check availability and make the booking
    fetch("http://localhost:3000/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ facility, date, startTime, endTime }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Dynamically created row & column and displayed the status of Amenities.
        const row = document.createElement("tr");
        const col1 = document.createElement("td");
        col1.innerText = facility;
        const col2 = document.createElement("td");
        col2.innerText = data.message;
        table.appendChild(row);
        row.appendChild(col1);
        row.appendChild(col2);
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("output").innerText =
          "An error occurred. Please try again later.";
      });
  });
