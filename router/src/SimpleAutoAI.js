import fetch from "node-fetch";

export class SimpleAutoAI {
    constructor(logger) {
        this.logger = logger;
    }

    async predict(apiUrl, inputValue) {
        const url = `${process.env.AUTO_AI_SERVER_URL}/api/ai/predict`;
        try {
            const response = await fetch(url, {
                method: "post",
                body: JSON.stringify({
                    api_path: apiUrl,
                    input: inputValue,
                }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            return data;
        } catch (exception) {
            this.logger.error(
                `HttpProxy: Failed to fetch AI data for url: ${apiUrl} with input ${inputValue} , at: ` +
                    new Date().toISOString()
            );
            this.logger.error(exception);
            return null;
        }
    }

    async collect(apiUrl, inputValue, outputValue) {
        const url = `${process.env.AUTO_AI_SERVER_URL}/api/ai/collect`;
        try {
            const response = await fetch(url, {
                method: "post",
                body: JSON.stringify({
                    api_path: apiUrl,
                    input: inputValue,
                    output: outputValue,
                }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            return data;
        } catch (exception) {
            this.logger.error(
                `HttpProxy: Failed to save data for AI. Url: ${apiUrl} with input ${inputValue} , at: ` +
                    new Date().toISOString()
            );
            this.logger.error(exception);
            return null;
        }
    }
}
