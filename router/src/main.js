/**
 * A simple router to catch HTTP requests and
 *    - Send the requests to multiple versions of our servers
 *    - Gather data to autogenerate AI models
 *
 * See Readme.MD for details
 *
 * Copyright (c) Jayaprakash Pasala, 2023
 *
 */

import express from "express";
import { KafkaProcessor } from "./KafkaProcessor.js";
import { ProxyProcessor } from "./HttpProcessor.js";
import log4js from "log4js";

const port = process.env.SERVER_PORT || 8080;

log4js.configure({
    appenders: {
        out: { type: "stdout" },
        app: { type: "stdout" },
    },
    categories: {
        default: { appenders: ["out"], level: "info" },
        app: { appenders: ["app"], level: "info" },
    },
});

const logger = log4js.getLogger();
logger.level = "info";

const app = express();


logger.debug("Starting the router");
logger.debug(process.env);
const kafkaProcessor = new KafkaProcessor(log4js.getLogger("app"));
const httpProcessor = new ProxyProcessor(log4js.getLogger("app"));

/**
 * Standard heartbeat 
 */
app.get("/api/health", async (req, res) => {
    res.json({ status: "ok" });
});

/**
 * This calculates the cosine value for a given radian
 * 
 * - Uses Kafka messaging if query parameter (?kafka=true) is specified
 */
app.get("/api/cos/:rad", async (req, res) => {
    const usekafka = req.query.kafka === "true";
    const processor = usekafka ? kafkaProcessor : httpProcessor;
    const result = await processor.process(
        usekafka ? req.params.rad : req.path,
        function (...values) {
            logger.trace("In comparator");
            logger.trace(values);
        }
    );
    res.json(result);
});

/**
 * Generic path will be handled by the http processor
 * - Possible to use kafka processor but adds a bit of complexity
 */
app.get("*", async (req, res) => {
    const result = await httpProcessor.process(req.path, function (...values) {
        logger.trace("In comparator");
        logger.trace(values);
    });
    res.json(result);
});

app.listen(port, () => {
    logger.info(`Router app started and listening on port ${port}`);
});

/**
 * Generic handler when the shutdown is received.
 */
process.on("exit", function () {
    logger.info("Shutting down!! ", new Date());
    app.close();
    kafkaProcessor.gracefulShutdown();
});
