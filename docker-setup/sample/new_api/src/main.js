import express from 'express';
import { env } from 'node:process';
import Cosine from './Cosine.js';
import KafkaHandler from './KafkaHandler.js';
const app = express();
let localKafkaHandler = new KafkaHandler();
await localKafkaHandler.startHandler();

console.log("Port specified in env: %d", env.SERVER_PORT)
const port = env.SERVER_PORT || 8002;

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" })
});


app.get('/api/cos/:radian', (req, res) => {
  const rad = parseFloat(req.params.radian);
  res.json({
    status: "ok",
    api_version: 2,
    input: rad,
    output: Cosine.cosineValue(rad),
    process_date: new Date().toISOString()
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

process.on('exit', function () {
  console.log('Shutting down!! ', new Date());
  app.close();
  if (localKafkaHandler) {
    localKafkaHandler.gracefulShutdown();
  }
});
