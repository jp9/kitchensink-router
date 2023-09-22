# Kitchen sink router: Run all upgraded/newer APIs in shadow mode and gather metrics (to build auto AI)

Disclaimer: This is a just a simple sample and NOT meant for production. I wrote this as a simple demonstration.

## Introduction:
This is a sample implementation of router (technically man-in-the-middle) that does multiple things:
- Allow newer version of APIs to run in shadow mode (and gather metrics comparing output to the old version of the API)
- Allow the router to use either HTTP or Kafka messaging to communicate with the backend servers.
- Plugs in a simple AI module to predict the output of APIs ( very limited and works only for numerical output only)

## Problem:
    How do I verify that the new improved api is replacing all the features of the old apis ?

## Answer:
    - Assuming the old api is still in use, we run the new api in parallel and compare the output of old and new APIs.

## How ?:
    - Take the external request and send the same request to old system and new one. 
    - Send only old system output to external request
    - Internally compare the new system output to old system
        - Store the results and analyze
        - Use the old output and new output to auto train the AI

## Implementation notes:
    - Solution 1: the router was implemented as a simple HTTP proxy
    - Solution 2: the router uses Kafka send and retrieve api output
    - Tangential question/solution: Can an AI model replace the coded APIs with enough data?

## Implementation details:
    - See the readme file in "docker-setup" and sample API server implementations in that directory.



        
