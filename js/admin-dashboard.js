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
          ${booking.customer_phone}
        </div>

        <div class="cell-sub">
          <i class="fa-regular fa-envelope"></i>
          ${booking.customer_email}
        </div>
      </td>

      <td>
        <span class="badge-${booking.status}">
          ${capitalizeStatus(booking.status)}
        </span>
      </td>

      <td onclick="event.stopPropagation()">
        <div class="table-actions">
       <button
  class="btn-action-sm"
  onclick="updateBookingStatus(${booking.id}, 'confirmed')"
>
  <i class="fa-regular fa-circle-check"></i>
  Confirm
</button>

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

function capitalizeStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const logoutButton = document.getElementById("logout-btn");

logoutButton.addEventListener("click", async function () {
  await supabaseClient.auth.signOut();
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
  document.getElementById("services-view").classList.add("hidden");

  // Show the selected view
  if (viewName === "overview") {
    navItems[0].classList.add("active");

    document.getElementById("overview-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Overview";
  } else if (viewName === "appointments") {
    navItems[1].classList.add("active");

    document.getElementById("appointments-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Appointments";
  } else if (viewName === "services") {
    navItems[2].classList.add("active");

    document.getElementById("services-view").classList.remove("hidden");

    document.getElementById("breadcrumb-current").textContent = "Services";
  }
}

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

  document.getElementById("modal-email").textContent = booking.customer_email;

  document.getElementById("modal-phone").textContent = booking.customer_phone;

  document.getElementById("modal-location").textContent = booking.location;

  document.getElementById("modal-notes").textContent =
    booking.notes || "No notes provided";

  const statusElement = document.getElementById("modal-status");

  statusElement.textContent = capitalizeStatus(booking.status);
  statusElement.className = `badge-${booking.status}`;

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
      <p class="cell-sub">No upcoming appointments.</p>
    `;
    return;
  }

  bookings.forEach(function (booking) {
    const appointment = document.createElement("div");

    appointment.className = "appointment-item";

    appointment.innerHTML = `
      <div>
        <div class="cell-main">
          ${booking.customer_name}
        </div>

        <div class="cell-sub">
          ${booking.service}
        </div>
      </div>

      <div>
        <div class="cell-main">
          ${formatBookingDate(booking.booking_date)}
        </div>

        <div class="cell-sub">
          ${booking.booking_time}
        </div>
      </div>

      <div>
        <span class="badge-${booking.status}">
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
      <p class="cell-sub">No recent activity.</p>
    `;
    return;
  }

  bookings.forEach(function (booking) {
    const activity = document.createElement("div");

    activity.className = "activity-item";

    activity.innerHTML = `
      <div>
        <div class="cell-main">
          ${booking.customer_name}
        </div>

        <div class="cell-sub">
          ${booking.service}
        </div>
      </div>

      <div>
        <span class="badge-${booking.status}">
          ${capitalizeStatus(booking.status)}
        </span>
      </div>
    `;

    activityList.appendChild(activity);
  });
}
loadRecentActivity();
