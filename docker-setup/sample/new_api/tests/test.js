import test from 'node:test';
import { env, hrtime } from 'node:process';
import { strict as assert } from 'node:assert';
import fetch from 'node-fetch';
import { Kafka } from 'kafkajs';
import { subscribe } from 'node:diagnostics_channel';

const KAFKA_RESPONSE_STACK = {};
const PORT = env.SERVER_PORT || 8002;

const kafka = new Kafka({
    clientId: 'test-new-api',
    brokers: ['kafka:9092']
});

const producer = kafka.producer();
const kafkaTopicReq = 'api.cos.request';
const kafkaTopicRes = 'api.cos.response';
const consumer = kafka.consumer({ groupId: 'new-api-test-group-id2' });

const startConsumer = async function () {
    console.log('Connecting consumer');
    await producer.connect();
    console.log("Connected producer");

    await consumer.connect();
    console.log('Consumer connected. Subscribing');
    await consumer.subscribe({ topic: kafkaTopicRes });
    console.log("running");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("In consumer of test");
            //console.log(message);
            console.log(message.key.toString());
            console.log(message.value.toString());
            let localKey = message.key.toString();
            if (KAFKA_RESPONSE_STACK[localKey]) {
                let resp = KAFKA_RESPONSE_STACK[localKey];
                resp({ key: message.key.toString(), value: message.value.toString() });
            }
        },
    });
    console.log("Started consumer");
}


test('Server is up and accessible', async (t) => {
    const response = await fetch(`http://localhost:${PORT}/api/health`);
    const data = await response.json();
    assert.strictEqual("ok", data.status);
});

/**
 * Test accessing using the http apinew-api-test-group-id
 */
test('Test output using http api', async (t) => {
    const input = 0;
    const expectedOutput = Math.cos(input);

    const response = await fetch(`http://localhost:${PORT}/api/cos/${input}`);
    const data = await response.json();
    assert.strictEqual("ok", data.status);

    assert.ok(data.output === expectedOutput, "Failed to get the right cosine value for input");
    assert.ok(data.input === input, "API didn't parse the input correctly");
});


/**
 * Test using the Kafka message queue
 */
test('Test output using kafka message api', async (t) => {
    await startConsumer();

    return new Promise(async (resolve, reject) => {
        for (let input = -7; input < 7; input = input + 10) {
            const expectedOutput = Math.cos(input);
            const key = hrtime.bigint() + "_"+input;
            console.log("Sending the message using producer", key, input);
            await producer.send({
                topic: kafkaTopicReq,
                messages: [
                    { key, value: input + "" },
                ],
            });
            console.log("Starting the wait");

            const doneFunction = (function(radianInput){
                return function (output) {
                    console.log("Done with the getting value", key, radianInput);
                    console.log(output);
                    const outputObj = JSON.parse(output.value);
                    if (outputObj.api_version !== 2) {
                        console.log("Skipping. not the requested api version for key: ", key);
                        return;
                    }

                    try {
                        assert.ok(key === output.key, "Key didn't match");
                        if ((expectedOutput - outputObj.output)>0.01) {
                            console.log("Cosine of the input didn't match", outputObj.output, expectedOutput);
                        }
                        assert.ok(radianInput === outputObj.input, "Input didn't match :" + radianInput+":"+outputObj.input);
                        
                    } catch (ex) {
                        reject(ex);
                    }
                    console.log('deleting key: ', key);
                    delete KAFKA_RESPONSE_STACK[key];

                    if (Object.keys(KAFKA_RESPONSE_STACK).length === 0) {
                        resolve(true);
                    }
                }
            })(input);
            KAFKA_RESPONSE_STACK[key] = doneFunction;
            console.log("Added the function to stack:", key);
        }
    });
});


test('All Done', async (t) => {
    producer.disconnect();
    consumer.disconnect();
});

