import sys
from datetime import datetime
from math import pi
import json

from kafka import KafkaConsumer
from kafka import KafkaProducer
from kafka.errors import KafkaError
from .my_cosine import MyCosine


def message_handler():
    consumer = KafkaConsumer('api.cos.request',
                             group_id='old-api-group-id',
                             bootstrap_servers=['kafka:9092'])
    producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

    for message in consumer:
        try:
            input_value_original = float(message.value.decode('utf-8'))
            input_value = input_value_original % (2*pi)
            output_value = MyCosine.consine_value(input_value)

            producer.send('api.cos.response', key=message.key, value=str.encode(json.dumps({
                "status": "ok",
                "api_version": 1,
                "input": input_value_original,
                "output": output_value,
                "process_date": datetime.now().isoformat()
            })))
            #print("Kafka - sending output for: ", input_value_original, output_value, file=sys.stderr)
        except:
            print("Error processing message. At: ",
                  datetime.now.isoformat(), file=sys.stderr)
            print("Key name", message.key.decode('utf-8'), file=sys.stderr)

    print("Done consuming")
