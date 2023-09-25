
from math import cos
from datetime import datetime
import json

import unittest
import requests


class TestOldApi(unittest.TestCase):

    def test_server_is_up(self):
        """
        Make sure that the http server is up
        """
        r = requests.get('http://localhost:8003/api/health')
        self.assertEqual(r.status_code, 200)

    def test_api_collect(self):
        """
        Test the collection of data
        """
        for num in range(-700, 700, 10):
            radian = num/100.0
            r = requests.post('http://localhost:8003/api/ai/collect',
                              json={'api_path': '/api/cos', 'input': radian, 'output': cos(radian)})
            self.assertEqual(r.status_code, 200)

    def test_api_collected(self):
        """
        Test the data collected..
        """
        r = requests.post('http://localhost:8003/api/ai/collected',
                          json={'api_path': '/api/cos'})
        data_out = r.json()
        print("Output:")
        # print(data_out)
        print(len(data_out['data']))

    def test_predict(self):
        """
        Test output value
        """
        r = requests.post('http://localhost:8003/api/ai/predict',
                          json={'api_path': '/api/cos', 'input': 0.001})
        data_out = r.json()
        print("Output for predicted:")
        print(data_out)
        # print(len(data_out['data']))


if __name__ == '__main__':
    unittest.main()
