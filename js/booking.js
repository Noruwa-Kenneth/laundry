// Laundry Services Dataset
const services = [
  {
    id: 1,
    name: "Service Wash",
    price: 35,
    duration: "2 hr",
    desc: "Wash, dry and fold.",
    img: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Ironing",
    price: 45,
    duration: "1.5 hr",
    desc: "Professional ironing and pressing.",
    img: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Dry Cleaning",
    price: 60,
    duration: "3 hr",
    desc: "Special care for delicate garments.",
    img: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Houseware",
    price: 75,
    duration: "2.5 hr",
    desc: "Curtains, cushions and household textiles.",
    img: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Bedlinen",
    price: 50,
    duration: "2 hr",
    desc: "Duvets, sheets and bedding care.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&auto=format&fit=crop",
  },
];

const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

let calendarDate = new Date();

// Store the current month as the earliest month customers can view
const minimumCalendarDate = new Date();
minimumCalendarDate.setDate(1);
minimumCalendarDate.setHours(0, 0, 0, 0);
// Latest date customers can book (60 days ahead)
const maximumBookingDate = new Date();
maximumBookingDate.setDate(maximumBookingDate.getDate() + 60);
maximumBookingDate.setHours(23, 59, 59, 999);

const bookingState = {
  service: null,
  date: null,
  time: null,
  name: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
};

// Application Setup

function init() {
  renderServices();
  renderTimes();
  renderCalendar();
}

function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleString("en-US", {
    month: "long",
  });

  calendarMonth.textContent = `${monthName} ${year}`;

  const previousMonthButton = document.getElementById("previous-month");
  const nextMonthButton = document.getElementById("next-month");
  const currentMonth = new Date(year, month, 1);

  if (currentMonth <= minimumCalendarDate) {
    previousMonthButton.disabled = true;
  } else {
    previousMonthButton.disabled = false;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = `
    <div class="day-name">SUN</div>
    <div class="day-name">MON</div>
    <div class="day-name">TUE</div>
    <div class="day-name">WED</div>
    <div class="day-name">THU</div>
    <div class="day-name">FRI</div>
    <div class="day-name">SAT</div>
  `;

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "date-cell disabled";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateCell = document.createElement("div");

    dateCell.className = "date-cell";
    dateCell.textContent = day;

    const selectedDate = new Date(year, month, day);

    // Remove the time portion so we compare dates only
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today || selectedDate > maximumBookingDate) {
      dateCell.classList.add("disabled");
    } else {
      dateCell.onclick = function () {
        selectDate(dateCell, selectedDate);
      };
    }

    calendarGrid.appendChild(dateCell);
  }
}

function continueToStep3() {
  // Check if a date has been selected
  if (!bookingState.date) {
    alert("Please select a date first.");
    return;
  }

  // Check if a time has been selected
  if (!bookingState.time) {
    alert("Please select a time first.");
    return;
  }

  // Everything is selected, so continue
  goToStep(3);
}


function continueToStep4() {
  // Get the values from the form
  const name = document.getElementById("input-name").value.trim();
  const phone = document.getElementById("input-phone").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const location = document.getElementById("input-location").value.trim();

  // Check the customer's name
  if (!name) {
    alert("Please enter your full name.");
    return;
  }

  // Check the phone number
  if (!phone) {
    alert("Please enter your phone number.");
    return;
  }

  // Check the email
  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  // Check the location
  if (!location) {
    alert("Please enter your pickup location.");
    return;
  }

  // Save the information
  bookingState.name = name;
  bookingState.phone = phone;
  bookingState.email = email;
  bookingState.location = location;
  bookingState.notes = document.getElementById("input-notes").value.trim();

  // Update the summary
  updateSummary();

  // Move to Step 4
  goToStep(4);
}

async function finalConfirmBooking() {
  const { error } = await supabaseClient
    .from("bookings")
    .insert({
      customer_name: bookingState.name,
      customer_email: bookingState.email,
      customer_phone: bookingState.phone,
      location: bookingState.location,
      service: bookingState.service.name,
      booking_date: bookingState.date
        .toISOString()
        .split("T")[0],
      booking_time: bookingState.time,
      notes: bookingState.notes || null,
      status: "pending",
    });

  if (error) {
    console.error("Booking error:", error);
    alert("Sorry, we could not save your booking. Please try again.");
    return;
  }

  // Booking successfully saved
  const firstName = bookingState.name.split(" ")[0];

  document.getElementById("conf-name-title").innerText = firstName;
  document.getElementById("confirmation-review").style.display = "none";
  document.getElementById("confirmation-success").style.display = "block";

  goToStep(4);

  const step4 = document.getElementById("step-nav-4");

  step4.classList.remove("active");
  step4.classList.add("completed");

  step4.querySelector(".step-number").innerHTML = `
    <span class="checkmark">&#10003;</span>
  `;
}



function changeMonth(direction) {
  const newMonth = new Date(calendarDate);

  newMonth.setMonth(newMonth.getMonth() + direction);
  const maximumMonth = new Date(
    maximumBookingDate.getFullYear(),
    maximumBookingDate.getMonth(),
    1,
  );

  const newMonthStart = new Date(
    newMonth.getFullYear(),
    newMonth.getMonth(),
    1,
  );

  if (newMonthStart > maximumMonth) {
    return;
  }
  // Don't allow navigation before the current month
  if (newMonth < minimumCalendarDate) {
    return;
  }

  calendarDate = newMonth;

  renderCalendar();
}

function selectDate(dateCell, selectedDate) {
  document.querySelectorAll(".date-cell").forEach(function (cell) {
    cell.classList.remove("selected");
  });

  dateCell.classList.add("selected");

  bookingState.date = selectedDate;

  updateSummary();
}

function renderServices() {
  const container = document.getElementById("services-grid");

  container.innerHTML = services
    .map(
      (s) => `
    <div class="service-card" onclick="selectService(${s.id})">
      <img src="${s.img}" class="service-img" alt="${s.name}"/>

      <div class="service-info">
        <div class="service-header">
          <span class="service-title">${s.name}</span>
        </div>

        <div class="service-desc">
          ${s.desc}
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderTimes() {
  const container = document.getElementById("times-grid");
  container.innerHTML = timeSlots
    .map(
      (t) => `
    <div class="time-slot ${t === bookingState.time ? "selected" : ""}" onclick="selectTime(this, '${t}')">${t}</div>
  `,
    )
    .join("");
}

function selectService(id) {
  bookingState.service = services.find((s) => s.id === id);

  document.querySelectorAll(".service-card").forEach((card, index) => {
    card.classList.toggle("selected", services[index].id === id);
  });

  updateSummary();
}

function continueToStep2() {
  if (!bookingState.service) {
    alert("Please select a service first.");
    return;
  }

  goToStep(2);
}

function selectTime(element, timeStr) {
  document
    .querySelectorAll(".time-slot")
    .forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");
  bookingState.time = timeStr;
  updateSummary();
}

function updateSummary() {
  bookingState.name = document.getElementById("input-name").value;
  bookingState.email = document.getElementById("input-email").value;
  bookingState.phone = document.getElementById("input-phone").value;
  bookingState.location = document.getElementById("input-location").value;
  bookingState.notes = document.getElementById("input-notes").value;
  const s = bookingState.service;

  // Format the selected date
  const formattedDate = bookingState.date
    ? bookingState.date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // Update Dynamic Dark Sidebar
  document.getElementById("sb-title").innerText = s
    ? s.name
    : "Select a service to begin";

  document.getElementById("sb-service").innerText = s ? s.name : "—";

  document.getElementById("sb-date").innerText = formattedDate;

  document.getElementById("sb-time").innerText = bookingState.time || "—";

  document.getElementById("sb-name").innerText = bookingState.name || "—";

  document.getElementById("sb-email").innerText = bookingState.email || "—";

  document.getElementById("sb-phone").innerText = bookingState.phone || "—";

  document.getElementById("sb-location").innerText =
    bookingState.location || "—";

  // Update Confirmation Screen
  if (s) {
    document.getElementById("conf-name-title").innerText =
      bookingState.name.split(" ")[0] || "";

    document.getElementById("conf-service").innerText = s.name;

    document.getElementById("conf-location").innerText =
      bookingState.location || "—";

    document.getElementById("conf-date").innerText = formattedDate;

    document.getElementById("conf-time").innerText = bookingState.time || "—";

    document.getElementById("conf-name").innerText = bookingState.name;

    document.getElementById("conf-email").innerText = bookingState.email;

    document.getElementById("conf-phone").innerText = bookingState.phone;

    document.getElementById("conf-notes").innerText = bookingState.notes || "—";
  }
}


function goToStep(step) {
  // Hide all step panels
  document.querySelectorAll(".step-panel").forEach(function (panel) {
    panel.classList.remove("active");
  });

  // Show the selected panel
  document.getElementById(`panel-${step}`).classList.add("active");

  // Reset all step navigation states
  document.querySelectorAll(".step-item").forEach(function (item) {
    item.classList.remove("active");
    item.classList.remove("completed");
  });

  // Mark previous steps as completed
// Mark previous steps as completed
// Mark previous steps as completed
for (let i = 1; i < step; i++) {
  const completedStep = document.getElementById(`step-nav-${i}`);

  completedStep.classList.add("completed");

  // Change the number to a check mark
  completedStep.querySelector(".step-number").innerHTML = `
  <span class="checkmark">&#10003;</span>
`;

  // Highlight the divider after the completed step
  document.getElementById(`div-${i}`).classList.add("completed");
}

  // Mark the current step as active
  document
    .getElementById(`step-nav-${step}`)
    .classList.add("active");
}



function resetForm() {
  // Reset all booking data
  bookingState.service = null;
  bookingState.date = null;
  bookingState.time = null;
  bookingState.name = "";
  bookingState.email = "";
  bookingState.phone = "";
  bookingState.location = "";
  bookingState.notes = "";

  // Clear all form inputs
  document.getElementById("input-name").value = "";
  document.getElementById("input-email").value = "";
  document.getElementById("input-phone").value = "";
  document.getElementById("input-location").value = "";
  document.getElementById("input-notes").value = "";

  // Remove selected service
  document
    .querySelectorAll(".service-card")
    .forEach((card) => card.classList.remove("selected"));

  // Remove selected date
  document
    .querySelectorAll(".date-cell")
    .forEach((cell) => cell.classList.remove("selected"));

  // Remove selected time
  document
    .querySelectorAll(".time-slot")
    .forEach((slot) => slot.classList.remove("selected"));

  // Show confirmation review again
  document.getElementById("confirmation-review").style.display = "block";

  // Hide booking success message
  document.getElementById("confirmation-success").style.display = "none";

  // Reset the stepper and return to Step 1
  goToStep(1);

  // Reset Step 1 number
  document.getElementById("step-nav-1").querySelector(".step-number").innerText = "1";

  // Reset Steps 2–4 numbers
  document.getElementById("step-nav-2").querySelector(".step-number").innerText = "2";
  document.getElementById("step-nav-3").querySelector(".step-number").innerText = "3";
  document.getElementById("step-nav-4").querySelector(".step-number").innerText = "4";

  // Remove completed state from dividers
  document
    .querySelectorAll(".step-divider")
    .forEach((divider) => divider.classList.remove("completed"));

  // Update sidebar
  updateSummary();
}

window.onload = init;
