import os
import time
import datetime

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Return message object
def message(message, username, timestamp, message_id):
    new_message = {}
    new_message["message"] = message
    new_message["username"] = username
    new_message["timestamp"] = timestamp
    new_message["id"] = message_id

    return new_message


# Dict with default challenges and messages.
message_general = message(
    "Company-wide announcements and work-based matters",
    "Slackbot",
    datetime.datetime.now(),
    -1,
)
message_random = message(
    "Non-work banter and water cooler conversation",
    "Slackbot",
    datetime.datetime.now(),
    -1,
)

channels = {"General": [message_general], "Random": [message_random]}

# Counter for message id.
counter = 0


@app.route("/")
def index():
    channel_list = list(channels)
    return render_template("index.html", channel_list=channel_list)


@socketio.on("newchannel")
def newchannel(data):

    new_channel = data["channel_name"]

    # Check if new channel name doesn't already exist.
    if new_channel in channels:
        emit("channel_exists")
    else:
        first_message = message(
            "This channel was created by {}.".format(data["username"]),
            "Admin",
            data["timestamp"],
            -1,
        )

        # Add channel with first message to channels dict.
        channels[new_channel] = []
        channels[new_channel].append(first_message)

        # Emit.
        emit("channels", new_channel, broadcast=True)


@socketio.on("message")
def new_message(data):

    global counter
    new_message = message(data["message"], data["username"], data["timestamp"], counter)
    counter += 1

    current_channel, new_message["current_channel"] = (
        data["current_channel"],
        data["current_channel"],
    )

    # Add new message to message list.
    try:
        channels[current_channel].append(new_message)

        # Only store 150 most recent messages.
        channels[current_channel] = channels[current_channel][-150:]

        emit("new_message", new_message, room=current_channel)
    except KeyError:
        socketio.emit("channel_deleted", "Channel does not exist.")


@app.route("/showmessages", methods=["POST"])
def showmessages():
    # Get stored messages.
    try:
        channel = request.form.get("channel_name")
        messages = channels[channel]
    # Get General messages if channel does not exist.
    except KeyError:
        channel = "General"
        messages = channels[channel]
        # Warn that channel does not exist.
        socketio.emit("channel_deleted", "Channel does not exist.")

    # Return list of posts.
    return jsonify(channel, messages)


@socketio.on("join_channel")
def join_channel(data):
    leave_room(data["old_channel"])
    join_room(data["channel_name"])


@socketio.on("deletemessage")
def deletemessage(data):
    current_channel = data["current_channel"]
    message_id = int(data["id"])

    for i, message in enumerate(channels[current_channel]):
        if message["id"] == message_id:
            del channels[current_channel][i]

            emit("deleted_message", message_id, room=current_channel)
            break
