##############################################################################
#
# Sample python API to calculate the value of cosine (using polynomial formula)
#
##############################################################################


from math import pi
import threading

from flask import Flask
from .my_cosine import MyCosine
from .kafka_message_handler import message_handler

app = Flask(__name__)

@app.route("/api/cos/<radian>")
def calculate_cos(radian):
    rad = float(radian)
    # print("Calculating cos.", flush=True)
    return {
        "status": "ok",
        "api_version": 1,
        "input": rad,
        "output": MyCosine.consine_value(rad)
    }

@app.route("/api/health")
def get_health():
    return {
        "status": "ok"
    }

consumer_thread = threading.Thread(target=message_handler, daemon=True)
consumer_thread.start()
