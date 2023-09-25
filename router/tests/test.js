import test from "node:test";
import { env, hrtime } from "node:process";
import { strict as assert } from "node:assert";
import fetch from "node-fetch";
import { subscribe } from "node:diagnostics_channel";
import log4js from "log4js";

const logger = log4js.getLogger();
logger.level = "info";

const PORT = env.SERVER_PORT || 8080;

test("Server is up and accessible", async (t) => {
  const response = await fetch(`http://localhost:${PORT}/api/health`);
  const data = await response.json();
  assert.strictEqual("ok", data.status);
});

/**
 * Test the values
 */
test("Test output for the cosine api using http processor", async (t) => {
  for (let input = -7; input < 7; input = input + 0.1) {
    const expectedOutput = Math.cos(input);

    const response = await fetch(`http://localhost:${PORT}/api/cos/${input}`);
    const data = await response.json();
    assert.strictEqual("ok", data.status);

    logger.trace(input);
    logger.trace(data);
    assert.ok(
      data.input === input,
      "API didn't parse the input correctly: " + input + " : " + data.input
    );
    const oldOutput = data.output;
    const newOutput = data.__newer_api.output;
    assert.ok(
      Math.abs(oldOutput - newOutput) < 0.01,
      "Equalilty failed for input : " +
        input +
        " old : " +
        oldOutput +
        " new : " +
        newOutput
    );
  }
});

/**
 * Test the values
 */
test("Test output for the cosine api using kafka processor", async (t) => {
  for (let input = -7; input < 7; input = input + 0.1) {
    const expectedOutput = Math.cos(input);

    const response = await fetch(
      `http://localhost:${PORT}/api/cos/${input}?kafka=true`
    );
    const data = await response.json();
    assert.strictEqual("ok", data.status);

    logger.trace(input);
    logger.trace(data);
    assert.ok(
      data.input === input,
      "API didn't parse the input correctly: " + input + " : " + data.input
    );
    const oldOutput = data.output;
    const newOutput = data.__newer_api.output;
    assert.ok(
      Math.abs(oldOutput - newOutput) < 0.01,
      "Equalilty failed for input : " +
        input +
        " old : " +
        oldOutput +
        " new : " +
        newOutput
    );
  }
});
