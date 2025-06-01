import http from "k6/http";
import { check, sleep, group } from "k6";

const url = __ENV.DB_URL;
const token = __ENV.TOKEN;

export let options = {
  scenarios: {
    stage1: { executor: "constant-vus", vus: 200, duration: "2m", exec: "stage1" },
    stage2: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "2m30s", exec: "stage2" },
    stage3: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "5m", exec: "stage3" },
    stage4: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "7m30s", exec: "stage4" },
    stage5: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "10m", exec: "stage5" },
    stage6: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "12m30s", exec: "stage6" },
    stage7: { executor: "constant-vus", vus: 200, duration: "2m", startTime: "15m", exec: "stage7" },
  },
};

const baseString = "abcdefghij";
function generatePayload(repeatCount) {
  return baseString.repeat(repeatCount);
}

// Each stage uses different payload sizes
export function stage1() { defaultTestLogic(100); }
export function stage2() { defaultTestLogic(500); }
export function stage3() { defaultTestLogic(1000); }
export function stage4() { defaultTestLogic(2000); }
export function stage5() { defaultTestLogic(5000); }
export function stage6() { defaultTestLogic(10000); }
export function stage7() { defaultTestLogic(20000); }

export function defaultTestLogic(repeatCount) {
  const testIdVal = __VU * 10000 + __ITER;
  const payloadContent = generatePayload(repeatCount);

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
  };

  group("1. Create bandwidth test entry", () => {
    const payload = JSON.stringify({
      id: testIdVal,
      payload: payloadContent,
    });

    const res = http.post(`${url}/bandwidth_tests`, payload, {
      ...params,
      tags: { name: "post_bandwidth" },
    });

    check(res, {
      "POST /bandwidth_tests status is 200 or 201": (r) =>
        r.status === 200 || r.status === 201,
    });

    sleep(1);
  });

  group("2. Get bandwidth test entry", () => {
    const res = http.get(`${url}/bandwidth_tests/${testIdVal}`, {
      ...params,
      tags: { name: "get_bandwidth" },
    });

    let body;
    try {
      body = res.json();
    } catch (e) {
      console.error(
        `Failed to parse JSON for GET /bandwidth_tests/${testIdVal}: ${res.body}`,
      );
      return;
    }

    check(res, {
      "GET /bandwidth_tests returns correct payload": () =>
        body.payload && body.payload.length === payloadContent.length,
    });

    sleep(1);
  });

  group("3. Update bandwidth test entry", () => {
    const updatedPayload = JSON.stringify({
      id: testIdVal,
      payload: payloadContent + "X", // Simple mutation
    });

    const res = http.put(`${url}/bandwidth_tests/${testIdVal}`, updatedPayload, {
      ...params,
      tags: { name: "put_bandwidth" },
    });

    check(res, {
      "PUT /bandwidth_tests status is 200 or 204": (r) =>
        r.status === 200 || r.status === 204,
    });

    sleep(1);
  });

  group("4. Get updated bandwidth entry", () => {
    const res = http.get(`${url}/bandwidth_tests/${testIdVal}`, {
      ...params,
      tags: { name: "get_updated_bandwidth" },
    });

    let body;
    try {
      body = res.json();
    } catch (e) {
      console.error(
        `Failed to parse JSON for GET updated /bandwidth_tests/${testIdVal}: ${res.body}`,
      );
      return;
    }

    check(res, {
      "GET /bandwidth_tests returns updated payload": () =>
        body.payload && body.payload.endsWith("X"),
    });

    sleep(1);
  });

  group("5. Delete bandwidth test entry", () => {
    const res = http.del(`${url}/bandwidth_tests/${testIdVal}`, null, {
      ...params,
      tags: { name: "delete_bandwidth" },
    });

    check(res, {
      "DELETE /bandwidth_tests status is 200 or 204": (r) =>
        r.status === 200 || r.status === 204,
    });

    sleep(1);
  });
}

