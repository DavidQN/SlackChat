// Send a message in the current channel when user clicks 'send' or hits enter.
function send_message() {
  // Remove old validation message.
  $("#message").tooltip("dispose");

  // Save message.
  const message = document.querySelector("#message").value;

  // Check if anything was sent.
  if (!message) {
    $("#message").tooltip({
      placement: "top",
      trigger: "manual",
      title: "Enter a message."
    });
    $("#message").tooltip("show");
  } else {
    // Save username, channel and time.
    const username = localStorage.getItem("username");
    const current_channel = localStorage.getItem("current_channel");
    const timestamp = Date.now();

    // Empty input field.
    document.querySelector("#message").value = "";

    // Emit new message.
    socket.emit("message", {
      message: message,
      current_channel: current_channel,
      username: username,
      timestamp: timestamp
    });
  }
}

// Add broadcasted message.
function message_broadcasted(message) {
  append_message(message);

  // Play notification sound.
  if (
    notification.muted == false &&
    message["username"] != localStorage.getItem("username")
  ) {
    notification.play();
  }
}

// Add a message with timestamp, username and content to the message list.
function append_message(message) {
  // Format the time.
  var time = new Date(message["timestamp"]);
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "short"
  };
  time = time.toLocaleString("en-GB", options);

  // Create new list item.
  const this_message = document.createElement("li");

  // Set ID.
  this_message.id = message["id"];

  // Class and message depend on who message came from.
  if (message["username"] == localStorage.getItem("username")) {
    // Message with X icon
    this_message.innerHTML = `<p><b>${message["username"]}</b> @ ${time}: ${
      message["message"]
    }<i class="fas fa-times-circle" onclick="delete_message()"></i></p>`;
    this_message.classList.add("sent");
  } else if (message["username"] == "Admin") {
    this_message.innerHTML = `<p><b>${message["username"]}</b> @ ${time}: ${
      message["message"]
    }</p>`;
    this_message.classList.add("admin");
  } else {
    this_message.innerHTML = `<p><b>${message["username"]}</b> @ ${time}: ${
      message["message"]
    }</p>`;
    this_message.classList.add("reply");
  }

  // Append to channel list.
  document
    .querySelector("#channel_messages")
    .appendChild(this_message)
    .scrollIntoView({ behavior: "smooth" });
}

// Delete message.
function delete_message() {
  // Get message id.
  const id = this["event"]["path"][2].id;

  const current_channel = localStorage.getItem("current_channel");

  socket.emit("deletemessage", { id: id, current_channel: current_channel });
}

// If a deleted message was broadcasted.
function deleted_broadcasted(data) {
  let message = document.getElementById(data);

  // Hide message.
  message.style.animationPlayState = "running";
  message.addEventListener("animationend", () => {
    message.remove();
  });
}
