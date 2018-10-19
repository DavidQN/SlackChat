// When user clicks the 'create channel' button, validate the channel name and emit the new channel.
function create_channel() {
  // Remove validation message.
  $("#channel_name").tooltip("dispose");

  // Save channel name.
  let channel_name = document.querySelector("#channel_name").value;

  // Validate channel name.
  if (!channel_name) {
    $("#channel_name").tooltip({
      placement: "top",
      trigger: "manual",
      title: "Enter a channel name."
    });
    $("#channel_name").tooltip("show");
  } else if (channel_name.length < 3 || channel_name.length > 15) {
    $("#channel_name").tooltip({
      placement: "top",
      trigger: "manual",
      title: "Channel name needs to be between 3 and 15 characters."
    });
    $("#channel_name").tooltip("show");
  } else {
    // Empty input field.
    document.querySelector("#channel_name").value = "";

    // Save username and time.
    const username = localStorage.getItem("username");
    const timestamp = Date.now();

    channel_name = channel_name.capitalize();

    // Emit new channel.
    socket.emit("newchannel", {
      channel_name: channel_name,
      username: username,
      timestamp: timestamp
    });
  }
}

// Add the new channel tot the channel list.
function channel_broadcasted(channel_name) {
  // Create new list item.
  let new_channel = document.createElement("li");
  new_channel.innerHTML = `<a class="channel_menu" onclick="join_channel()" data-channel="${channel_name}">#${channel_name}</a>`;

  // Append to channel list.
  document.querySelector("#channel_list").appendChild(new_channel);
}

// Join channel.
function join_channel(channel_name) {
  const old_channel = localStorage.getItem("current_channel", channel_name);

  // If no parameter was passed.
  if (typeof channel_name === "undefined") {
    // Save channel name.
    channel_name = this["event"]["path"][0]["dataset"]["channel"];
    localStorage.setItem("current_channel", channel_name);
  }

  // Join new channel, leave old channel.
  socket.emit("join_channel", {
    channel_name: channel_name,
    old_channel: old_channel
  });

  // Open new request to get messages.
  const request = new XMLHttpRequest();
  request.open("POST", "/showmessages");
  request.onload = () => {
    const json = JSON.parse(request.responseText);
    const messages = json[1];
    const channel_name = json[0];

    // Change the displayed title.
    document.querySelector("#channel_title").innerHTML = `#${channel_name}`;

    // Remove old messages.
    document.querySelector("#channel_messages").innerHTML = "";

    messages.forEach(append_message);

    // Show input field.
    document.querySelector("#message_input").style.display = "block";
  };

  // Send request with channel name.
  const data = new FormData();
  data.append("channel_name", channel_name);
  request.send(data);
}
