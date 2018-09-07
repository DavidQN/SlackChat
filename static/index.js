// Establish connection with socket based on my current URL PATH and PORT
let socket = io.connect("http://" + document.domain + ":" + location.port);

// track channel
let current_channel = "General";

// Create unique hash for each post based on username and timestamp
let post_hash = data => {
  return btoa(data.post + data.username + data.timestamp);
};

// Function to add delete button
let delete_icon = post => {
  let delete_icon_html = '<i onClick="delete_post(this)" ';
  delete_icon_html += `data-hash="${post.getAttribute(
    "data-hash"
  )}" name="close-circle" class="fa fa-close close"> </i>`;
  return delete_icon_html;
};

// Get current timestamp
let create_timestamp = () => {
  let date = new Date();
  let minutes = date.getMinutes().toString();
  let hours = (date.getHours() % 12).toString();
  let seconds = date.getSeconds().toString();

  return `${hours}:${minutes}:${seconds}`;
};

// helper function to delete posts
let delete_post = post => {
  console.log("you hit delete post func");
  let data = {
    hash: post.getAttribute("data-hash"),
    channel: post.getAttribute("data-channel")
  };
  socket.emit("delete post", data);
};

// window.onload = () => {
document.addEventListener("DOMContentLoaded", () => {
  socket.on("connect", function() {
    console.log(
      "check ids",
      document,
      document.querySelectorAll("#displayname")
    );
    // Don't allow user to create an empty display name
    document.querySelector("#displayname ").onkeyup = () => {
      if (document.querySelector("#displayname").value.length == 0) {
        document.querySelector("#create_display_name button").disabled = true;
      } else {
        document.querySelector("#create_display_name button").disabled = false;
      }
    };

    // Create display name
    document
      .querySelector("#create_display_name")
      .addEventListener("submit", event => {
        event.preventDefault();
        let grab_displayname = document.querySelector("#displayname").value;
        console.log("new display name", grab_displayname);
        localStorage.setItem("username", grab_displayname);
        document.querySelector("#displayname").value = "";
      });

    // Each vote button in votesform should emit a "submit vote" event
    document
      .querySelector("#votesform")
      .querySelectorAll("button")
      .forEach(button => {
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

      console.log("current local storage", localStorage.getItem("username"));
      // Send message to backend with metadata
      let timestamp = create_timestamp();
      let data = {
        post: post,
        username: localStorage.getItem("username"),
        timestamp: timestamp,
        channel: current_channel
      };
      // alloc unique hash to identify div
      data.hash = post_hash(data);

      socket.emit("create a new post", data);
    });

    /* ISSUE: 
    *   If you change your display name a second time without reloading, the new user can delete
    *   another users posts.
    * Reason:
    *   This is because we never reupdate this selector, so we would need to fire this selector 
    *   again after we change the display name, BUT we don't want to reload the page! 
    */
    //Puts the delete icon on each post
    document.querySelectorAll(".post").forEach(post => {
      if (
        post.getAttribute("data-username") == localStorage.getItem("username")
      ) {
        post.classList.add("current");
        post.innerHTML += delete_icon(post);
      }
    });
  });

  // Display posts to everyone
  socket.on("add post to app", post => {
    console.log("post meta data emitted: ", post);
    let div = document.createElement("div");

    div.setAttribute("data-hash", post.hash);
    div.setAttribute("data-username", post.username);
    div.setAttribute("data-channel", post.channel);

    // used so we can target and delete posts
    div.classList.add("post");

    div.innerHTML =
      post.post + ' <span class="username">' + post.username + "</span>";
    div.innerHTML += ' <span class="timestamp">' + post.timestamp + "</span>";

    if (post.username == localStorage.getItem("username")) {
      // Hash allows us to delete posts
      div.classList.add("current");
      div.innerHTML += `<i data-channel="${post.channel}" data-hash="${
        post.hash
      }" class="fa fa-close close"></i>`;
    }

    // add message to page
    // document.querySelector(".message_posts").append(div);
    document.querySelector(".message_posts").append(div);

    // add ability to delete message
    document.querySelectorAll(".close").forEach(post => {
      post.addEventListener("click", () => {
        delete_post(post);
      });
    });
  });

  // removes posts based on hash
  socket.on("remove post", post => {
    console.log("going to remove: ", post);
    document.querySelector('.post[data-hash="' + post.hash + '"]').remove();
  });

  // When a new vote is announced, add to the unordered list
  socket.on("announce vote", data => {
    const li = document.createElement("li");
    li.innerHTML = `Vote recorded: ${data.selection}`;
    document.querySelector("#votes").append(li);
  });
});
// };
