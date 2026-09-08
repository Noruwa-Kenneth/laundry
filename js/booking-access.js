

async function handleBookingButton(event) {
  event.preventDefault();

  const bookingLink = event.currentTarget;

  await checkBookingAccess(bookingLink.href);
}


async function checkBookingAccess(bookingUrl) {
  // Get today's date
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  // Load booking settings
  const { data: settings, error: settingsError } =
    await supabaseClient
      .from("booking_settings")
      .select("daily_booking_limit")
      .limit(1)
      .maybeSingle();

  if (settingsError || !settings) {
    console.error(
      "Error loading booking settings:",
      settingsError
    );

    window.location.href = bookingUrl;
    return;
  }

  // Count today's active bookings
  const { data: bookings, error: bookingsError } =
    await supabaseClient
      .from("bookings")
      .select("id, created_at, status")
      .gte("created_at", startOfToday.toISOString())
      .lt("created_at", startOfTomorrow.toISOString())
      .neq("status", "cancelled");

  if (bookingsError) {
    console.error(
      "Error checking today's bookings:",
      bookingsError
    );

    window.location.href = bookingUrl;
    return;
  }

  const todayBookingCount = bookings.length;

  // Daily limit reached
  if (todayBookingCount >= settings.daily_booking_limit) {
    showBookingLimitModal();
    return;
  }

  // Booking still available
  window.location.href = bookingUrl;
}


// Handle every link that points to booking.html
document.addEventListener("click", function (event) {
  const link = event.target.closest('a[href="booking.html"]');

  if (!link) {
    return;
  }

  // The navbar already has its own onclick handler.
  // Don't run the check twice.
  if (event.defaultPrevented) {
    return;
  }

  event.preventDefault();

  checkBookingAccess(link.href);
});


// Create the booking limit modal
function showBookingLimitModal() {
  let modal = document.getElementById("booking-limit-modal");

  if (!modal) {
    modal = document.createElement("div");

    modal.id = "booking-limit-modal";
    modal.className = "booking-limit-modal";

    modal.innerHTML = `
      <div class="booking-limit-card">

        <button
          type="button"
          class="booking-limit-close"
          onclick="closeBookingAccessModal()"
          aria-label="Close"
        >
          &times;
        </button>

        <div class="booking-limit-icon">
          <i class="fa-solid fa-calendar-xmark"></i>
        </div>

        <h2>Sorry! Booking limit reached</h2>

        <p>
          We’ve reached our booking limit for today.
          New bookings will be available again after midnight.
          Please try again tomorrow.
        </p>

        <div class="booking-countdown">
          <span>New bookings available in</span>
          <strong id="booking-access-countdown">--:--:--</strong>
        </div>

        <button
          type="button"
          class="btn-dark"
          onclick="closeBookingAccessModal()"
        >
          Close
        </button>

      </div>
    `;

    document.body.appendChild(modal);
  }

  modal.classList.add("active");

  startBookingAccessCountdown();
}


// Countdown until midnight
let bookingAccessCountdownInterval = null;

function startBookingAccessCountdown() {
  const countdownElement =
    document.getElementById("booking-access-countdown");

  if (!countdownElement) {
    return;
  }

  if (bookingAccessCountdownInterval) {
    clearInterval(bookingAccessCountdownInterval);
  }

  function updateCountdown() {
    const now = new Date();

    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const remaining = midnight - now;

    if (remaining <= 0) {
      countdownElement.textContent = "00:00:00";

      clearInterval(bookingAccessCountdownInterval);
      bookingAccessCountdownInterval = null;

      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes =
      Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    countdownElement.textContent =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;
  }

  updateCountdown();

  bookingAccessCountdownInterval =
    setInterval(updateCountdown, 1000);
}


// Close the modal
function closeBookingAccessModal() {
  const modal =
    document.getElementById("booking-limit-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("active");

  if (bookingAccessCountdownInterval) {
    clearInterval(bookingAccessCountdownInterval);
    bookingAccessCountdownInterval = null;
  }
}