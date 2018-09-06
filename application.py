from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)

# Creates a list of messages
message_list = []

# Create a hashmap of channels. ugc = user generated channels
ugc = {"General"}

# Route renders index page
@app.route("/")
def hello():
    return render_template("index.html", user_posts=message_list)
    # return render_template("index.html", user_posts = ugc )


# Route for adding posts
@socketio.on("create a new post")
def user_post(data):
    print("inside post", data)
    user_post = {
        "username": data["username"],
        "post": data["post"],
        "hash": data["hash"],
        "timestamp": data["timestamp"],
    }
    message_list.append(user_post)
    emit("add post to app", data, broadcast=True)


# Route for deleting posts
@socketio.on("delete post")
def post(data):
    print("inside delete post func", data)
    print("mess list", message_list)
    for post in message_list:
        print("inside arr", post)
        if post["hash"] == data["hash"]:
            print("i am inside posttt deleteee", data)
            message_list.remove(post)
            emit("remove post", data, broadcast=True)
            break


# Create votes
@socketio.on("submit vote")
def vote(data):
    print("data from vote:", data)
    selection = data["selection"]
    emit("announce vote", {"selection": selection}, broadcast=True)
