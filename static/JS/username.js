// Shows modal that asks for username.
function username_modal() {
  $("#username_modal").modal({
    backdrop: "static",
    keyboard: false,
    show: true
  });
}

// Get, validate and save username; hide modal.
function save_username() {
  const username = document.querySelector("#username").value;

  // Ensure user has entered a username that is between 4 and 20 characters.
  // 4! to 20! variations for usernames
  if (!username) {
    document.querySelector("#username_validation").innerHTML =
      "Enter a username.";
  } else if (username.length < 3 || username.length > 15) {
    document.querySelector("#username_validation").innerHTML =
      "Username needs to be between 3 and 15 characters.";
  } else if (username === "Admin" || username === "admin") {
    document.querySelector("#username_validation").innerHTML =
      "Please choose a different username.";
  } else {
    localStorage.setItem("username", username);

    $("#username_modal").modal("hide");
  }
}
