from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Creates a list of messages
message_list = []

# Route renders index page
@app.route("/")
def hello():
    return render_template("index.html", user_posts = message_list )

#Route for adding posts
@socketio.on("create a new post")
def user_post(data):
    print("grab post data: ", data)
    emit("add post to app", data, broadcast=True)

# Create votes
@socketio.on("submit vote")
def vote(data):
    print("data from vote:", data)
    selection = data["selection"]
    emit("announce vote", {"selection": selection}, broadcast=True)