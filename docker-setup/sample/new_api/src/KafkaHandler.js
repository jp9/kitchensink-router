import { Kafka } from 'kafkajs';
import Cosine from './Cosine.js';

const kafka = new Kafka({
    clientId: 'new-api',
    brokers: ['kafka:9092'],
});

const kafkaTopicReq = 'api.cos.request';
const kafkaTopicRes = 'api.cos.response';


class KafkaHandler {
    constructor() {
        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId: 'new-api-group-id' });
    }

    async startHandler() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: kafkaTopicReq, fromBeginning: true });
        await this.producer.connect();

        let self = this;
        this.consumer.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                try {
                    const inputValue = parseFloat(message.value.toString());
                    const cosValue = Cosine.cosineValue(inputValue);
                    self.producer.send({
                        topic: kafkaTopicRes,
                        messages: [
                            {
                                key: message.key,
                                value: JSON.stringify({
                                    "status": "ok",
                                    "api_version": 2,
                                    "input": inputValue,
                                    "output": cosValue,
                                    "process_date": new Date().toISOString()
                                })
                            },
                        ],
                    });
                } catch (ex) {
                    console.error("Failed while processing the message. Date:", new Date().toISOString());
                    console.error(ex);
                }
            },
        });
    }

    gracefulShutdown() {
        this.consumer.disconnect();
        this.producer.disconnect();
    }
}

export default KafkaHandler;
