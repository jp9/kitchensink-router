import { Kafka } from "kafkajs";

/**
 * Class to compare the results.
 */
class DataComparator {}

const kafkaTopicReq = "api.cos.request";
const kafkaTopicRes = "api.cos.response";
const KAFKA_RESPONSE_STACK = {};

export class KafkaProcessor {
    constructor(logger) {
        this.logger = logger;
        this.kafka = new Kafka({
            clientId: "kafka-api-proxy",
            brokers: ["kafka:9092"],
        });

        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({
            groupId: "kafka-api-proxy-group-id1",
        });
        this.startedConsumer = false;
    }

    async startConsumer() {
        this.logger.debug("Connecting consumer");
        await this.producer.connect();
        this.logger.debug("Connected producer");

        await this.consumer.connect();
        this.logger.debug("Consumer connected. Subscribing");
        await this.consumer.subscribe({ topic: kafkaTopicRes });

        const self = this;
        this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                self.logger.trace(
                    "In consumer of kafka proxy",
                    message.key.toString()
                );
                const localKey = message.key.toString();
                if (KAFKA_RESPONSE_STACK[localKey]) {
                    const resp = KAFKA_RESPONSE_STACK[localKey];
                    resp.doneFunction({
                        key: message.key.toString(),
                        value: message.value.toString(),
                    });
                }
            },
        });
        this.logger.debug("Started consumer");
    }

    async process(rad, comparator) {
        if (!this.startedConsumer) {
            await this.startConsumer();
            this.startedConsumer = true;
        }

        const self = this;
        return new Promise(async (resolve, reject) => {
            const key = process.hrtime.bigint() + "";
            this.logger.trace(
                "Sending the message using producer (key, input): ",
                key,
                rad
            );
            await this.producer.send({
                topic: kafkaTopicReq,
                messages: [{ key, value: rad + "" }],
            });
            this.logger.trace("Starting the wait");

            const doneFunction = function (output) {
                self.logger.trace("Done with the getting value");
                self.logger.trace(output);
                let outputObj;
                const key = output.key;
                try {
                    outputObj = JSON.parse(output.value);
                    if (outputObj["api_version"] === 1) {
                        KAFKA_RESPONSE_STACK[key]["old_output"] = outputObj;
                    }

                    if (outputObj["api_version"] === 2) {
                        KAFKA_RESPONSE_STACK[key]["new_output"] = outputObj;
                    }

                    if (
                        KAFKA_RESPONSE_STACK[key]["old_output"] &&
                        KAFKA_RESPONSE_STACK[key]["new_output"]
                    ) {
                        const finalOutput = {
                            ...KAFKA_RESPONSE_STACK[key]["old_output"],
                        };
                        finalOutput["ignored"] = {
                            newer_api: KAFKA_RESPONSE_STACK[key]["new_output"],
                        };
                        resolve(finalOutput);
                        comparator(
                            KAFKA_RESPONSE_STACK[key]["old_output"],
                            KAFKA_RESPONSE_STACK[key]["new_output"]
                        );
                        delete KAFKA_RESPONSE_STACK[key];
                    }
                } catch (ex) {
                    self.logger.error(
                        "Failed to get message from kafka. At: ",
                        new Date().toISOString()
                    );
                    self.logger.error(ex);
                    if (outputObj && outputObj["api_version"] === 1) {
                        reject(ex);
                    }
                }
            };
            KAFKA_RESPONSE_STACK[key] = {
                doneFunction,
                old_output: null,
                new_output: null,
                start_time: Date.now(),
            };
        });
    }

    gracefulShutdown() {
        this.consumer.disconnect();
        this.producer.disconnect();
    }
}
