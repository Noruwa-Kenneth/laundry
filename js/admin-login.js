const loginForm = document.getElementById("admin-login-form");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  console.log("Logged in user:", data.user);

  window.location.href = "admin-dashboard.html";
});