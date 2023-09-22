# README

This directory contains the docker setup for testing the router using sample applications. The sample applications and auto AI are in their in own directories and have their own docker compose files for easy testing.

The docker compose file in this directory starts multiple containers and uses the ".env" file for important configurable parameters. 

## Router container
- This is a simple router, it takes the external request and sends it to the the "Old API" server and "New API" server. Only the old API server results are sent back. The difference in behavior of old and new api is captured in logs.
- The router uses HTTP proxy or Kafka to fulfill the messages ( this is a flag in the ".env" file)

## Old API Server container
This is the API server that serves the output for the request

## New API server container
This the old API server that serves the output for the request

## Kafka container
Kafka container (probably superflous - used for demonstration purpose only)