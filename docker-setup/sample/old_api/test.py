
from math import cos
from datetime import datetime
import json
from kafka import KafkaConsumer
from kafka import KafkaProducer

import unittest
import requests

from src.my_cosine import MyCosine

class TestOldApi(unittest.TestCase):
    def test_cosine_value(self):
        """
        Test and compare the values of cosine values of our implementation with the standard library
        """
        for num in range(-700,700):
            radian = num/100.0 
            cos_value = MyCosine.consine_value(radian)
            actual_cos_value = cos(radian)
            self.assertAlmostEqual(cos_value, actual_cos_value, 2, "Failed while calculating cos for : "+str(radian))
        
    def test_server_is_up(self):
        """
        Make sure that the http server is up
        """
        r = requests.get('http://localhost:8001/api/health')
        self.assertEqual(r.status_code, 200)

    def test_http_cos_request(self):
        """
        Test the cosine value using http request
        """
        for num in range(-700, 700, 10):
            radian = num/100.0
            r = requests.get('http://localhost:8001/api/cos/'+str(radian))
            self.assertEqual(r.status_code, 200)
            result = r.json()
            actual_cos_value = cos(radian)
            self.assertAlmostEqual(result["output"], actual_cos_value, 2, "Failed while calculating cos for : "+str(radian))

    def test_kafka_request(self):
        """
        Test the cosine value using the kafka events
        """
        consumer = KafkaConsumer('api.cos.response',
                            group_id='old-api-test-group-id',
                            bootstrap_servers=['kafka:9092'],
                            enable_auto_commit=True)
        # Producer.
        producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

        for num in range (-700, 700, 10):
            radian = num/100.0
            producer.send('api.cos.request', key=str.encode(str(datetime.now())+"_"+str(radian)), value=str.encode(str(radian)))
            #print("Sent the message for: ", radian)
            for message in consumer:
                try:
                    # print("Received")
                    # print ("%s:%d:%d: key=%s value=%s" % (message.topic, message.partition,
                    #                             message.offset, message.key,
                    #                             message.value))
                    kafka_result = json.loads(message.value.decode('utf-8'))
                    if kafka_result['api_version'] != 1:
                        continue
                
                    self.assertAlmostEqual(kafka_result["output"], cos(radian), 2, "Failed while calculating cos for : "+str(radian))
                except:
                    print("Error processing message. At: ", datetime.now.isoformat())
                    print("Key name", message.key.decode('utf-8'))
                    self.fail("Failed to get the message from consumer, for value: ", radian)
                break


if __name__ == '__main__':
    unittest.main()

