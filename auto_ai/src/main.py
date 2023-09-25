##############################################################################
#
# Sample python API to do univariate linear regression.
#
##############################################################################


from flask import Flask, request, json
from .SimpleAI import SimpleAI

TRAIN_DATA = {}
MODEL_DATA = {}

MIN_SAMPLES_FOR_MODEL = 130 # This is the minimum number of samples
MODEL_RECALCULATION_SAMPLE_INCREMENT_COUNT = 130 # The model is reevalatued when the sample increase by this number

app = Flask(__name__)

@app.route("/api/ai/predict", methods=['POST'])
def predict_output():
    json_data = json.loads(request.data)
    api_path = json_data["api_path"]
    input = json_data["input"]
    output = None
    if api_path in MODEL_DATA:
        output = MODEL_DATA[api_path].predict_single(input)

    return {
        "status": "ok",
        "api_version": "0.1.0",
        "input": input,
        "output": output
    }

@app.route("/api/ai/collect", methods=['POST'])
def collect_data():
    json_data = json.loads(request.data)
    api_path = json_data["api_path"]
    input = json_data["input"]
    output = json_data["output"]

    train_data = None
    if api_path in TRAIN_DATA:
        train_data = TRAIN_DATA[api_path]
    else:
        train_data = {}

    train_data[input] = output
    TRAIN_DATA[api_path] = train_data

    if len(train_data) >= MIN_SAMPLES_FOR_MODEL and len(train_data)%MODEL_RECALCULATION_SAMPLE_INCREMENT_COUNT == 0:
        # TODO: this should be handled in a thread
        simple_ai = SimpleAI()
        simple_ai.train_linear(list(train_data.keys()), list(train_data.values())) # The order of items is guaranteed by python
        MODEL_DATA[api_path] = simple_ai

    return {
        "status": "ok"
    }

@app.route("/api/ai/collected", methods=['POST'])
def get_collected_data():
    json_data = json.loads(request.data)
    api_path = json_data["api_path"]

    if api_path in TRAIN_DATA:
        return {
            "status": "ok",
            "data" : list(zip(list(TRAIN_DATA[api_path].keys()), list(TRAIN_DATA[api_path].values())))
        }
    else:
        return {"status": "error", "message": "data not found"}, 404

@app.route("/api/health")
def get_health():
    return {
        "status": "ok"
    }
