let currentBookingFilter = "all";
let bookingSearchTerm = "";
let currentModalBookingId = null;

async function checkAdminLogin() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // Not logged in
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Check user's role
  const { data: roleData, error } = await supabaseClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !roleData || roleData.role !== "admin") {
    await supabaseClient.auth.signOut();
    alert("Access denied. Admin access only.");
    window.location.href = "admin-login.html";
    return;
  }

  console.log("Admin authenticated:", user.email);
}

checkAdminLogin();

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    window.location.href = "admin-login.html";
  }
});

async function loadBookings() {
  const { data: bookings, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: true });

  if (error) {
    console.error("Error loading bookings:", error);
    return;
  }

  console.log("Bookings from Supabase:", bookings);

  // Update dashboard statistics
  const upcomingCount = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed",
  ).length;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  // Update appointment filter counts
  document.getElementById("filter-all-count").textContent = bookings.length;

  document.getElementById("filter-pending-count").textContent = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;

  document.getElementById("filter-confirmed-count").textContent =
    bookings.filter((booking) => booking.status === "confirmed").length;

  document.getElementById("filter-completed-count").textContent =
    bookings.filter((booking) => booking.status === "completed").length;

  document.getElementById("filter-cancelled-count").textContent =
    bookings.filter((booking) => booking.status === "cancelled").length;

  document.getElementById("upcoming-count").textContent = upcomingCount;
  document.getElementById("pending-count").textContent = pendingCount;
  document.getElementById("completed-count").textContent = completedCount;

  const appointmentsBody = document.getElementById("appointments-body");

  appointmentsBody.innerHTML = "";

  let filteredBookings =
    currentBookingFilter === "all"
      ? bookings
      : bookings.filter(function (booking) {
          return booking.status === currentBookingFilter;
        });

  if (bookingSearchTerm) {
    filteredBookings = filteredBookings.filter(function (booking) {
      const searchText = `
      ${booking.customer_name}
      ${booking.customer_email}
      ${booking.customer_phone}
      ${booking.service}
    `.toLowerCase();

      return searchText.includes(bookingSearchTerm);
    });
  }
filteredBookings.forEach(function (booking) {
  const row = document.createElement("tr");

  const statusClass = (booking.status || "").toLowerCase();

  row.innerHTML = `
    <td>
      <div class="cell-main">${booking.customer_name}</div>
      <div class="cell-sub">
        ${booking.notes || "No notes provided"}
      </div>
    </td>

    <td>
      <div class="cell-main">${booking.service}</div>
    </td>

    <td>
      <div class="cell-main">
        ${formatBookingDate(booking.booking_date)}
      </div>
      <div class="cell-sub">
        ${booking.booking_time}
      </div>
    </td>

    <td>
      <div class="cell-sub">
        <i class="fa-solid fa-phone"></i>
        ${booking.customer_phone || "N/A"}
      </div>
      <div class="cell-sub">
        <i class="fa-regular fa-envelope"></i>
        ${booking.customer_email || "N/A"}
      </div>
    </td>

    <td>
      <span class="badge-${statusClass}">
        ${capitalizeStatus(booking.status)}
      </span>
    </td>

    <td>
      <div class="cell-main">
        ${formatBookedOn(booking.created_at)}
      </div>
    </td>

    <td onclick="event.stopPropagation()">
      <div class="table-actions">
        ${
          booking.status === "pending"
            ? `
          <button
            class="btn-action-sm"
            onclick="updateBookingStatus(${booking.id}, 'confirmed')"
          >
            <i class="fa-regular fa-circle-check"></i>
            Confirm
          </button>

          <button
            class="btn-action-sm"
            onclick="updateBookingStatus(${booking.id}, 'cancelled')"
          >
            <i class="fa-regular fa-circle-xmark"></i>
            Cancel
          </button>
        `
            : ""
        }

        ${
          booking.status === "confirmed"
            ? `
          <button
            class="btn-action-sm"
            onclick="updateBookingStatus(${booking.id}, 'completed')"
          >
            <i class="fa-regular fa-clock"></i>
            Complete
          </button>

          <button
            class="btn-action-sm"
            onclick="updateBookingStatus(${booking.id}, 'cancelled')"
          >
            <i class="fa-regular fa-circle-xmark"></i>
            Cancel
          </button>
        `
            : ""
        }

        <button
          class="btn-action-sm"
          onclick="openModal(${booking.id})"
          style="padding: 6px 8px;"
        >
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>
    </td>
  `;

  appointmentsBody.appendChild(row);
});
}

loadBookings();

function filterBookings(status) {
  currentBookingFilter = status;

  loadBookings();
}

function searchBookings(value) {
  bookingSearchTerm = value.trim().toLowerCase();

  loadBookings();
}

async function updateBookingStatus(bookingId, newStatus) {
  if (newStatus === "cancelled") {
    const confirmed = confirm("Are you sure you want to cancel this booking?");

    if (!confirmed) {
      return;
    }
  }

  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) {
    console.error("Error updating booking:", error);
    alert("Could not update booking status.");
    return;
  }

  await loadBookings();
  await loadUpcomingAppointments();
  await loadRecentActivity();
}

function formatBookingDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBookedOn(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalizeStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const logoutButton = document.getElementById("logout-btn");

logoutButton.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    alert("Could not log out. Please try again.");
    return;
  }

  window.location.href = "admin-login.html";
});

function switchTab(viewName) {
  // Remove active state from all navigation items
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Hide all dashboard views
  document.getElementById("overview-view").classList.add("hidden");
  document.getElementById("appointments-view").classList.add("hidden");
  document.getElementById("business-hours-view").classList.add("hidden");
  document.getElementById("blocked-dates-view").classList.add("hidden");
  document.getElementById("settings-view").classList.add("hidden");
  // Show the selected view
  if (viewName === "overview") {
    navItems[0].classList.add("active");

    document.getElementById("overview-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Overview";
  } else if (viewName === "appointments") {
    navItems[1].classList.add("active");

    document.getElementById("appointments-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Appointments";
  } else if (viewName === "business-hours") {
    navItems[2].classList.add("active");

    document.getElementById("business-hours-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent =
      "Business Hours";
  } else if (viewName === "blocked-dates") {
    navItems[3].classList.add("active");

    document.getElementById("blocked-dates-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Blocked Dates";
  } else if (viewName === "settings") {
    navItems[4].classList.add("active");

    document.getElementById("settings-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Settings";
  }
}

async function loadBusinessHours() {
  const { data: hours, error } = await supabaseClient
    .from("business_hours")
    .select("*")
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Error loading business hours:", error);
    return;
  }

  const hoursList = document.getElementById("business-hours-list");

  hoursList.innerHTML = "";

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  hours.forEach(function (day) {
    const row = document.createElement("div");

    row.className = "business-hours-row";

    const openingTime = day.opening_time ? formatTime(day.opening_time) : "";

    const closingTime = day.closing_time ? formatTime(day.closing_time) : "";
    row.innerHTML = `
  <div class="business-day">
    ${dayNames[day.day_of_week]}
  </div>

  <div class="business-status">
    ${
      day.is_open
        ? `<span class="badge-confirmed">Open</span>`
        : `<span class="badge-cancelled">Closed</span>`
    }
  </div>

  <div class="business-time">
    ${day.is_open ? `${openingTime} – ${closingTime}` : "Closed"}
  </div>

  <div class="business-action">
    <button
      class="btn-action-sm"
      onclick="editBusinessHours(${day.id})"
    >
      <i class="fa-solid fa-pen"></i>
      Edit
    </button>
  </div>
`;

    hoursList.appendChild(row);
  });
}

async function addBlockedDate() {
  const blockedDate = prompt(
    "Enter the date you want to block.\n\nFormat: YYYY-MM-DD\nExample: 2026-12-25",
  );

  if (!blockedDate) {
    return;
  }

  const reason = prompt("Why is this date blocked?", "Business closed");

  const { error } = await supabaseClient.from("blocked_dates").insert({
    blocked_date: blockedDate,
    reason: reason || null,
  });

  if (error) {
    console.error("Error adding blocked date:", error);
    alert("Could not block this date.");
    return;
  }

  alert("Date blocked successfully.");

  await loadBlockedDates();
}

async function loadBlockedDates() {
  const { data: dates, error } = await supabaseClient
    .from("blocked_dates")
    .select("*")
    .order("blocked_date", { ascending: true });

  if (error) {
    console.error("Error loading blocked dates:", error);
    return;
  }

  const datesList = document.getElementById("blocked-dates-list");

  datesList.innerHTML = "";

  if (dates.length === 0) {
    datesList.innerHTML = `
      <p class="cell-sub">No blocked dates.</p>
    `;
    return;
  }

  dates.forEach(function (date) {
    const row = document.createElement("div");

    row.className = "business-hours-row";

    row.innerHTML = `
      <div class="business-day">
        ${formatBlockedDate(date.blocked_date)}
      </div>

      <div class="business-time">
        ${date.reason || "Business closed"}
      </div>

      <div class="business-action">
        <button
          class="btn-action-sm"
          onclick="removeBlockedDate(${date.id})"
        >
          <i class="fa-solid fa-trash"></i>
          Remove
        </button>
      </div>
    `;

    datesList.appendChild(row);
  });
}
loadBlockedDates();

async function removeBlockedDate(dateId) {
  const confirmed = confirm(
    "Are you sure you want to remove this blocked date?",
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("blocked_dates")
    .delete()
    .eq("id", dateId);

  if (error) {
    console.error("Error removing blocked date:", error);
    alert("Could not remove this blocked date.");
    return;
  }

  await loadBlockedDates();
}

function formatBlockedDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function editBusinessHours(dayId) {
  const { data: day, error } = await supabaseClient
    .from("business_hours")
    .select("*")
    .eq("id", dayId)
    .single();

  if (error) {
    console.error("Error loading business hours:", error);
    alert("Could not load business hours.");
    return;
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayName = dayNames[day.day_of_week];

  const isOpen = confirm(
    `${dayName}\n\n` +
      `Click OK if this day should be OPEN.\n` +
      `Click Cancel if this day should be CLOSED.`,
  );

  if (!isOpen) {
    const { error: updateError } = await supabaseClient
      .from("business_hours")
      .update({
        is_open: false,
        opening_time: null,
        closing_time: null,
      })
      .eq("id", dayId);

    if (updateError) {
      console.error("Error updating business hours:", updateError);
      alert("Could not update business hours.");
      return;
    }

    await loadBusinessHours();
    return;
  }

  const openingTime = prompt(
    `Enter opening time for ${dayName}.\n\nExample: 08:00`,
    day.opening_time || "08:00",
  );

  if (!openingTime) {
    return;
  }

  const closingTime = prompt(
    `Enter closing time for ${dayName}.\n\nExample: 16:00`,
    day.closing_time || "16:00",
  );

  if (!closingTime) {
    return;
  }

  const { error: updateError } = await supabaseClient
    .from("business_hours")
    .update({
      is_open: true,
      opening_time: openingTime,
      closing_time: closingTime,
    })
    .eq("id", dayId);

  if (updateError) {
    console.error("Error updating business hours:", updateError);
    alert("Could not update business hours.");
    return;
  }

  await loadBusinessHours();
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
loadBusinessHours();

async function openModal(bookingId) {
  currentModalBookingId = bookingId;
  const { data: booking, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error("Error loading booking:", error);
    alert("Could not load booking details.");
    return;
  }

  console.log("Selected booking:", booking);

  document.getElementById("modal-subtitle").textContent =
    `${booking.customer_name} · ${formatBookingDate(booking.booking_date)}`;

  document.getElementById("modal-customer").textContent = booking.customer_name;

  document.getElementById("modal-service").textContent = booking.service;

  document.getElementById("modal-date").textContent = formatBookingDate(
    booking.booking_date,
  );

  document.getElementById("modal-time").textContent = booking.booking_time;

  document.getElementById("modal-booked-on").textContent = formatBookedOn(
    booking.created_at,
  );

  document.getElementById("modal-email").textContent = booking.customer_email;

  document.getElementById("modal-phone").textContent = booking.customer_phone;

  document.getElementById("modal-location").textContent = booking.location;

  document.getElementById("modal-notes").textContent =
    booking.notes || "No notes provided";

  const statusElement = document.getElementById("modal-status");

  statusElement.textContent = capitalizeStatus(booking.status);
  statusElement.className = `badge-${booking.status}`;

  const completeButton = document.getElementById("modal-complete-btn");
  const confirmButton = document.getElementById("modal-confirm-btn");

  completeButton.style.display = "none";
  confirmButton.style.display = "none";

  if (booking.status === "pending") {
    confirmButton.style.display = "inline-flex";
  }

  if (booking.status === "confirmed") {
    completeButton.style.display = "inline-flex";
  }

  document.getElementById("modal-overlay").classList.add("active");
}

async function updateModalBookingStatus(newStatus) {
  if (!currentModalBookingId) {
    return;
  }

  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", currentModalBookingId);

  if (error) {
    console.error("Error updating booking:", error);
    alert("Could not update booking status.");
    return;
  }

  closeModal();

  await loadBookings();
  await loadUpcomingAppointments();
  await loadRecentActivity();
}

function closeModal(e) {
  document.getElementById("modal-overlay").classList.remove("active");
}

async function loadUpcomingAppointments() {
  const today = new Date().toISOString().split("T")[0];

  const { data: bookings, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .in("status", ["pending", "confirmed"])
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Error loading upcoming appointments:", error);
    return;
  }

  const upcomingList = document.getElementById("upcoming-appointments-list");
  upcomingList.innerHTML = "";

  if (bookings.length === 0) {
    upcomingList.innerHTML = `
      <p class="cell-sub" style="padding: 16px;">No upcoming appointments.</p>
    `;
    return;
  }

  bookings.forEach(function (booking) {
    const appointment = document.createElement("div");
    appointment.className = "appointment-item";

    // Format date badge (Month + Day)
    const dateObj = new Date(booking.booking_date + "T00:00:00");
    const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = dateObj.getDate();

    const statusClass = (booking.status || "").toLowerCase();

    appointment.innerHTML = `
      <div class="appointment-left">
        <div class="date-badge">
          <span class="date-month">${month}</span>
          <span class="date-day">${day}</span>
        </div>
        <div class="appointment-details">
          <h4 class="cell-main">${booking.customer_name}</h4>
          <p class="cell-sub">
            ${booking.service} · ${booking.booking_time}
          </p>
        </div>
      </div>

      <div class="appointment-right">
        ${
          booking.customer_phone
            ? `<span class="appointment-phone"><i class="fa-solid fa-phone"></i> +${booking.customer_phone}</span>`
            : ""
        }
        <span class="badge-${statusClass}">
          ${capitalizeStatus(booking.status)}
        </span>
      </div>
    `;

    upcomingList.appendChild(appointment);
  });
}
loadUpcomingAppointments();

async function loadRecentActivity() {
  const { data: bookings, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error loading recent activity:", error);
    return;
  }

  const activityList = document.getElementById("recent-activity-list");
  activityList.innerHTML = "";

  if (bookings.length === 0) {
    activityList.innerHTML = `
      <p class="cell-sub" style="padding: 16px;">No recent activity.</p>
    `;
    return;
  }

  bookings.forEach(function (booking) {
    const activity = document.createElement("div");
    activity.className = "activity-item";

    activity.innerHTML = `
      <div class="item-left">
        <div class="activity-icon">
          <i class="fa-regular fa-calendar-plus"></i>
        </div>
        <div class="item-details">
          <h4 class="cell-main">${booking.customer_name}</h4>
          <p class="cell-sub">
            ${booking.service} · ${formatBookedOn(booking.created_at)}
          </p>
        </div>
      </div>
      <span class="badge-${booking.status}">
        ${capitalizeStatus(booking.status)}
      </span>
    `;

    activityList.appendChild(activity);
  });
}
loadRecentActivity();

async function loadBookingSettings() {
  const { data: settings, error } = await supabaseClient
    .from("booking_settings")
    .select("daily_booking_limit, max_booking_days")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading booking settings:", error);
    return;
  }

  if (!settings) {
    console.error("No booking settings found.");
    return;
  }

  document.getElementById("setting-daily-limit").value =
    settings.daily_booking_limit;

  document.getElementById("setting-max-days").value = settings.max_booking_days;
}
loadBookingSettings();

async function saveBookingSettings() {
  const dailyLimit = Number(
    document.getElementById("setting-daily-limit").value,
  );
const maxBookingDays = Number(
  document.getElementById("setting-max-days").value
);
if (!dailyLimit || dailyLimit < 1) {
  alert("Daily booking limit must be at least 1.");
  return;
}

if (!maxBookingDays || maxBookingDays < 1) {
  alert("Maximum booking days must be at least 1.");
  return;
}

  const { data, error } = await supabaseClient
    .from("booking_settings")
   .update({
  daily_booking_limit: dailyLimit,
  max_booking_days: maxBookingDays,
})
    .eq("id", 1)
    .select();

  if (error) {
    console.error("Error saving booking settings:", error);
    alert("Could not save booking settings.");
    return;
  }

  console.log("UPDATED SETTINGS:", data);

  if (!data || data.length === 0) {
    alert("No booking settings row was updated.");
    return;
  }

  alert("Booking settings saved successfully.");
}


