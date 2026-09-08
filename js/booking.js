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
let bookingSettings = null;
let blockedDatesCache = [];
let businessHoursCache = [];
let todayBookingCount = 0;
let bookingCountdownInterval = null;
// Store the current month as the earliest month customers can view
const minimumCalendarDate = new Date();
minimumCalendarDate.setDate(1);
minimumCalendarDate.setHours(0, 0, 0, 0);

// Latest date customers can book
let maximumBookingDate = new Date();
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

async function init() {
  renderServices();
  await loadCalendarData();

  updateBookingAvailability();

  if (!checkBookingAvailability()) {
    return;
  }

  await renderCalendar();
  renderTimes();
}

async function loadCalendarData() {
  const [
    blockedDatesResult,
    businessHoursResult,
    settingsResult,
    bookingsResult,
  ] = await Promise.all([
    supabaseClient.from("blocked_dates").select("blocked_date"),

    supabaseClient
      .from("business_hours")
      .select("day_of_week, is_open, opening_time, closing_time"),

    supabaseClient
      .from("booking_settings")
      .select("daily_booking_limit, max_booking_days")
      .limit(1)
      .maybeSingle(),

    (() => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      return supabaseClient
        .from("bookings")
        .select("id, created_at, status")
        .gte("created_at", startOfToday.toISOString())
        .lt("created_at", startOfTomorrow.toISOString())
        .neq("status", "cancelled");
    })(),
  ]);

  if (blockedDatesResult.error) {
    console.error("Error loading blocked dates:", blockedDatesResult.error);
    return false;
  }

  if (businessHoursResult.error) {
    console.error("Error loading business hours:", businessHoursResult.error);
    return false;
  }

  if (settingsResult.error) {
    console.error("Error loading booking settings:", settingsResult.error);
    return false;
  }

  if (bookingsResult.error) {
    console.error("Error loading today's bookings:", bookingsResult.error);
    return false;
  }

  blockedDatesCache = blockedDatesResult.data || [];
  businessHoursCache = businessHoursResult.data || [];
  bookingSettings = settingsResult.data;
  todayBookingCount = bookingsResult.data.length;

  maximumBookingDate = new Date();
  maximumBookingDate.setDate(
    maximumBookingDate.getDate() + bookingSettings.max_booking_days,
  );
  maximumBookingDate.setHours(23, 59, 59, 999);

  return true;
}

function updateBookingAvailability() {
  const availabilityElement = document.getElementById("booking-availability");

  if (!availabilityElement || !bookingSettings) {
    return;
  }

  const dailyLimit = bookingSettings.daily_booking_limit;

  const remainingBookings = Math.max(0, dailyLimit - todayBookingCount);

  if (remainingBookings === 0) {
    availabilityElement.textContent = "No bookings remaining today.";
    return;
  }

  availabilityElement.textContent = `${remainingBookings} booking${
    remainingBookings === 1 ? "" : "s"
  } remaining today.`;
}

function openBookingLimitModal() {
  const modal = document.getElementById("booking-limit-modal");

  if (!modal) {
    return;
  }

  modal.classList.add("active");

  startBookingCountdown();
}

function closeBookingLimitModal() {
  const modal = document.getElementById("booking-limit-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("active");

  if (bookingCountdownInterval) {
    clearInterval(bookingCountdownInterval);
    bookingCountdownInterval = null;
  }
}

function startBookingCountdown() {
  const countdownElement = document.getElementById("booking-countdown");

  if (!countdownElement) {
    return;
  }

  // Stop any previous countdown
  if (bookingCountdownInterval) {
    clearInterval(bookingCountdownInterval);
  }

  async function updateCountdown() {
    const now = new Date();

    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const remaining = midnight - now;

    if (remaining <= 0) {
      countdownElement.textContent = "00:00:00";

      clearInterval(bookingCountdownInterval);
      bookingCountdownInterval = null;

      // Reload today's booking count
      await refreshBookingAvailability();

      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    countdownElement.textContent =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;
  }

  updateCountdown();

  bookingCountdownInterval = setInterval(updateCountdown, 1000);
}

async function refreshBookingAvailability() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("id, created_at, status")
    .gte("created_at", startOfToday.toISOString())
    .lt("created_at", startOfTomorrow.toISOString())
    .neq("status", "cancelled");

  if (error) {
    console.error("Error refreshing booking availability:", error);
    return;
  }

  todayBookingCount = data.length;

  updateBookingAvailability();

  // If the new day has available capacity,
  // close the limit modal.
  if (
    bookingSettings &&
    todayBookingCount < bookingSettings.daily_booking_limit
  ) {
    closeBookingLimitModal();

    await renderCalendar();
  }
}

function checkBookingAvailability() {
  if (!bookingSettings) {
    return true;
  }

  const dailyLimit = bookingSettings.daily_booking_limit;

  const remainingBookings = Math.max(0, dailyLimit - todayBookingCount);

  if (remainingBookings <= 0) {
    openBookingLimitModal();
    return false;
  }

  return true;
}

async function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");

  // Use the data already loaded by loadCalendarData()
  const blockedDates = blockedDatesCache;
  const businessHours = businessHoursCache;
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

  const maximumMonth = new Date(
    maximumBookingDate.getFullYear(),
    maximumBookingDate.getMonth(),
    1,
  );

  if (currentMonth >= maximumMonth) {
    nextMonthButton.disabled = true;
  } else {
    nextMonthButton.disabled = false;
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateCell = document.createElement("div");

    dateCell.className = "date-cell";
    dateCell.textContent = day;

    const selectedDate = new Date(year, month, day);

    selectedDate.setHours(0, 0, 0, 0);

    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    const isBlocked = blockedDates.some(function (blocked) {
      return blocked.blocked_date === dateString;
    });

    const dayOfWeek = selectedDate.getDay();

    const businessDay = businessHours.find(function (day) {
      return day.day_of_week === dayOfWeek;
    });

    const isClosed = !businessDay || !businessDay.is_open;

    if (
      selectedDate < today ||
      selectedDate > maximumBookingDate ||
      isBlocked ||
      isClosed
    ) {
      dateCell.classList.add("disabled");

      if (isBlocked) {
        dateCell.title = "This date is unavailable";
      }
    } else {
      dateCell.onclick = function () {
        selectDate(dateCell, selectedDate);
      };
    }

    calendarGrid.appendChild(dateCell);
  }
}

async function continueToStep3() {
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

  // Check the maximum booking date
  if (bookingSettings) {
    const maxBookingDays = bookingSettings.max_booking_days;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maximumAllowedDate = new Date(today);
    maximumAllowedDate.setDate(maximumAllowedDate.getDate() + maxBookingDays);
    maximumAllowedDate.setHours(23, 59, 59, 999);

    if (bookingState.date > maximumAllowedDate) {
      alert(
        `Sorry, bookings can only be made up to ${maxBookingDays} days ahead.`,
      );
      return;
    }
  }

  // Check today's booking capacity
  if (!checkBookingAvailability()) {
    return;
  }

  // Everything is available, so continue
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

  if (name.length < 2) {
    alert("Please enter a valid name.");
    return;
  }

  // Check the phone number
  if (!phone) {
    alert("Please enter your phone number.");
    return;
  }

  const phonePattern = /^[0-9+\-\s()]{7,20}$/;

  if (!phonePattern.test(phone)) {
    alert("Please enter a valid phone number.");
    return;
  }

  // Check the email
  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Check the location
  if (!location) {
    alert("Please enter your pickup location.");
    return;
  }

  if (location.length < 5) {
    alert("Please enter a more complete pickup location.");
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
  const slotBooked = await isTimeSlotBooked(
    bookingState.date,
    bookingState.time,
  );

  if (slotBooked) {
    alert(
      "Sorry, this time slot has just been booked by another customer. Please select another time.",
    );

    await renderTimes();

    return;
  }

  const bookingDate =
    bookingState.date.getFullYear() +
    "-" +
    String(bookingState.date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(bookingState.date.getDate()).padStart(2, "0");

  const { data, error } = await supabaseClient.rpc("create_booking", {
    p_customer_name: bookingState.name,
    p_customer_email: bookingState.email,
    p_customer_phone: bookingState.phone,
    p_location: bookingState.location,
    p_service: bookingState.service.name,
    p_booking_date: bookingDate,
    p_booking_time: bookingState.time,
    p_notes: bookingState.notes || null,
  });

  if (error) {
    console.error("Booking error:", error);

    if (error.message.includes("BOOKING_LIMIT_REACHED")) {
      todayBookingCount = bookingSettings.daily_booking_limit;

      updateBookingAvailability();
      openBookingLimitModal();

      return;
    }

    alert("Sorry, we could not save your booking. Please try again.");

    return;
  }
  // Update today's booking count
  todayBookingCount++;

  updateBookingAvailability();
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

  // Update the selected date label
  const selectedDateLabel = document.getElementById("selected-date-label");

  selectedDateLabel.textContent = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  renderTimes();
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

async function renderTimes() {
  const container = document.getElementById("times-grid");

  container.innerHTML = "";

  if (!bookingState.date) {
    return;
  }

  const dayOfWeek = bookingState.date.getDay();

  const { data: businessHours, error } = await supabaseClient
    .from("business_hours")
    .select("day_of_week, is_open, opening_time, closing_time")
    .eq("day_of_week", dayOfWeek)
    .single();

  if (error) {
    console.error("Error loading business hours:", error);
    return;
  }

  if (!businessHours || !businessHours.is_open) {
    container.innerHTML = "<p>We are closed on this day.</p>";
    return;
  }

  const [openingHour, openingMinute] = businessHours.opening_time
    .split(":")
    .map(Number);

  const [closingHour, closingMinute] = businessHours.closing_time
    .split(":")
    .map(Number);

  const startMinutes = openingHour * 60 + openingMinute;
  const endMinutes = closingHour * 60 + closingMinute;

  const availableTimes = [];

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = String(minute).padStart(2, "0");

    const time = `${displayHour}:${displayMinute} ${period}`;

    availableTimes.push(time);
    if (bookingState.time && !availableTimes.includes(bookingState.time)) {
      bookingState.time = null;
    }
  }

  // Show the available time slots immediately
  const slotResults = availableTimes.map(function (time) {
    return {
      time: time,
      booked: false,
    };
  });

  const checkingMessage = document.createElement("p");
  checkingMessage.textContent = "Checking availability...";
  checkingMessage.className = "checking-availability";

  container.appendChild(checkingMessage);

  container.innerHTML = slotResults
    .map(function (slot) {
      return `
      <div
  class="time-slot ${slot.time === bookingState.time ? "selected" : ""}"
  data-time="${slot.time}"
  onclick="selectTime(this, '${slot.time}')">
  ${slot.time}
</div>
    `;
    })
    .join("");

  // Check Supabase for already booked times in the background
  const bookedTimes = await getBookedTimes(bookingState.date);
  console.log("Booked times for selected date:", bookedTimes);
  const checkingElement = container.querySelector(".checking-availability");

  if (checkingElement) {
    checkingElement.remove();
  }

  if (bookedTimes === null) {
    return;
  }

  // Mark booked slots after they have been loaded
  container.querySelectorAll(".time-slot").forEach(function (slotElement) {
    const time = slotElement.getAttribute("data-time");

if (bookedTimes.includes(time)) {
      slotElement.classList.add("disabled");
      slotElement.removeAttribute("onclick");

      slotElement.innerHTML = `
      ${time}
      <span class="slot-status">Booked</span>
    `;
    }
  });


}

function selectService(id) {
  bookingState.service = services.find((s) => s.id === id);

  document.querySelectorAll(".service-card").forEach((card, index) => {
    card.classList.toggle("selected", services[index].id === id);
  });

  updateSummary();
}

function continueToStep2() {
  if (!checkBookingAvailability()) {
    return;
  }

  if (!bookingState.service) {
    alert("Please select a service first.");
    return;
  }

  goToStep(2);
}

async function getBookedTimes(date) {
  const selectedDate =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("booking_time")
    .eq("booking_date", selectedDate)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error loading booked times:", error);
    return null;
  }

  return data.map(function (booking) {
    return booking.booking_time;
  });
}

async function isTimeSlotBooked(date, time) {
  const selectedDate =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("id")
    .eq("booking_date", selectedDate)
    .eq("booking_time", time)
    .neq("status", "cancelled")
    .limit(1);

  if (error) {
    console.error("Error checking time slot:", error);
    return false;
  }

  return data.length > 0;
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

document.getElementById("selected-date-label").textContent = "Select a date";

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
  document.getElementById(`step-nav-${step}`).classList.add("active");
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
  document
    .getElementById("step-nav-1")
    .querySelector(".step-number").innerText = "1";

  // Reset Steps 2–4 numbers
  document
    .getElementById("step-nav-2")
    .querySelector(".step-number").innerText = "2";
  document
    .getElementById("step-nav-3")
    .querySelector(".step-number").innerText = "3";
  document
    .getElementById("step-nav-4")
    .querySelector(".step-number").innerText = "4";

  // Remove completed state from dividers
  document
    .querySelectorAll(".step-divider")
    .forEach((divider) => divider.classList.remove("completed"));

  // Update sidebar
  updateSummary();
}
function handleBookingButton(event) {
  event.preventDefault();

  if (!checkBookingAvailability()) {
    return false;
  }

  window.location.href = "booking.html";

  return false;
}

window.onload = init;
