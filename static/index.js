// Get current timestamp
let create_timestamp = () => {
  let date = new Date();
  let minutes = date.getMinutes().toString();
  let hours = (date.getHours() % 12).toString();
  let seconds = date.getSeconds().toString();

  return `${hours}:${minutes}:${seconds}`;
};

document.addEventListener("DOMContentLoaded", () => {
  // Establish connection with socket based on my current URL PATH and PORT
  let socket = io.connect("http://" + document.domain + ":" + location.port);
  socket.on("connect", function() {
    // Each vote button in votesform should emit a "submit vote" event
    document
      .querySelector("#votesform")
      .querySelectorAll("button")
      .forEach(button => {
        console.log("helloooo", button);
        button.onclick = btn => {
          // prevent page from reloading
          btn.preventDefault();
          // grab metadata from button and emit
          const selection = btn.toElement.dataset.vote;
          socket.emit("submit vote", { selection: selection });
        };
      });

    // broadcast messages to all users
    document.querySelector("#postform").addEventListener("submit", event => {
      // prevent page from reloading
      event.preventDefault();

      // grab contents of input box before we clear it
      let post = document.querySelector("#post").value;
      document.querySelector("#post").value = "";

      // Send message to backend with metadata
      let timestamp = create_timestamp();
      let data = {
        post: post,
        timestamp: timestamp
      };
      socket.emit("create a new post", data);
    });
  });

  // Display posts to everyone
  socket.on("add post to app", post => {
    let div = document.createElement("div");
    div.innerText = post.post;

    // add message to page
    document.querySelector(".message_posts").append(div);
  });

  // When a new vote is announced, add to the unordered list
  socket.on("announce vote", data => {
    const li = document.createElement("li");
    li.innerHTML = `Vote recorded: ${data.selection}`;
    document.querySelector("#votes").append(li);
  });
});
