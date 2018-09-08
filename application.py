from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)

# Creates a list of messages
message_list = []

# Create a hashmap of channels. ugc = user generated channels
ugc = {"General": []}

# Route renders index page
@app.route("/")
def hello():
    # return render_template("index.html", user_posts=message_list)
    return render_template("index.html", user_posts=ugc)


# Route for adding posts
@socketio.on("create a new post")
def user_post(data):
    if data["channel"] not in ugc:
        socketio.emit("error", "Channel not found")
    else:
        print("inside post", data)
        user_post = {
            "username": data["username"],
            "post": data["post"],
            "hash": data["hash"],
            "timestamp": data["timestamp"],
            "channel": data["channel"],
        }
        # message_list.append(user_post)
        ugc[data["channel"]].append(user_post)
        emit("add post to app", data, broadcast=True)


# Route for deleting posts
@socketio.on("delete post")
def post(data):
    print("delete post func", data)
    if data["channel"] not in ugc:
        socketio.emit("error", "Channel doesn't exist")
    else:
        for post in ugc[data["channel"]]:
            if post["hash"] == data["hash"]:
                ugc[data["channel"]].remove(post)
                # message_list.remove(post)
                emit("remove post", data, broadcast=True)
                break
