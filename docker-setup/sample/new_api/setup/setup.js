/**
 * This is the setup file to create appropriate topics
 */
import { Kafka } from "kafkajs";
import { env } from "node:process";

const kafka = new Kafka({
    clientId: "setup-client",
    brokers: ["kafka:9092"],
});

const kafkaTopicReq = "api.cos.request";
const kafkaTopicRes = "api.cos.response";
const admin = kafka.admin();

(async () => {
    await admin.connect();
    try {
        const allTopics = await admin.fetchTopicMetadata();
        let kafkaTopicReqCreated = false;
        let kafkaTopicResCreated = false;

        for (let i in allTopics.topics) {
            if (kafkaTopicReq === allTopics.topics[i].name) {
                kafkaTopicReqCreated = true;
            }

            if (kafkaTopicRes === allTopics.topics[i].name) {
                kafkaTopicResCreated = true;
            }
        }

        let topicsToCreate = [];
        if (!kafkaTopicReqCreated) {
            topicsToCreate.push({
                topic: kafkaTopicReq,
            });
        }

        if (!kafkaTopicResCreated) {
            topicsToCreate.push({
                topic: kafkaTopicRes,
            });
        }

        if (topicsToCreate.length > 0) {
            console.log("Creating topics: ", topicsToCreate);
            await admin.createTopics({
                validateOnly: false,
                waitForLeaders: true,
                timeout: 600,
                topics: [
                    {
                        topic: kafkaTopicReq,
                    },
                    {
                        topic: kafkaTopicRes,
                    },
                ],
            });
        } else {
            console.log("Topics already created");
        }
    } catch (ex) {
        console.log("Errors while setting up");
        console.log(ex);
    } finally {
        await admin.disconnect();
    }
})();
