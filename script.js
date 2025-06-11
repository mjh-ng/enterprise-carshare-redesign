let currentUser = null;

window.onload = () => {
  // Redirect if not logged in
  const savedUser = localStorage.getItem("carshare_user");
  if (!savedUser && !window.location.href.includes("login")) {
    showLogin();
  } else {
    currentUser = savedUser;
    document.getElementById("profile-box").textContent = currentUser;
    showApp();
  }
};

function login() {
  const name = document.getElementById("name-input").value.trim();
  if (!name) return alert("Please enter your full name.");
  localStorage.setItem("carshare_user", name);
  location.reload();
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("main-app").style.display = "none";
}

function showApp() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";
}

function toggleProfilePanel() {
  const panel = document.getElementById("profile-panel");
  panel.classList.toggle("open");
}
