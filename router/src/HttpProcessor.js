import fetch from "node-fetch";

export class ProxyProcessor {
    constructor(logger) {
        this.logger = logger;
    }

    async fetchData(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    process(apiUrl, compartor) {
        const self = this;
        return new Promise((resolve, reject) => {
            const url1 = `${process.env.OLD_API_SERVER_URL}${apiUrl}`;
            const url2 = `${process.env.NEW_API_SERVER_URL}${apiUrl}`;
            try {
                const promise1 = this.fetchData(url1);
                const promise2 = this.fetchData(url2);
                Promise.all([promise1, promise2])
                    .then((values) => {
                        const originalOutput = values[0];
                        originalOutput["ignored"] = {
                            newer_api: values[1],
                        };
                        resolve(originalOutput);
                        compartor(values);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } catch (exception) {
                self.logger.error(
                    "HttpProxy: Failed to fetch data. At: " +
                        new Date().toISOString()
                );
                self.logger.error(exception);
                reject(err);
            }
        });
    }
}
