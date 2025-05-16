import http from "k6/http";
import { check, sleep, group } from "k6";

// Access environment variables
const url = __ENV.DB_URL;
const token = __ENV.TOKEN;

export let options = {
  scenarios: {
    vus_0050: {
      executor: "constant-vus",
      vus: 50,
      duration: "1m",
      exec: "stage1"
    },
    vus_0100: {
      executor: "constant-vus",
      vus: 100,
      duration: "2m",
      startTime: "1m30s",
      exec: "stage2"
    },
    vus_0200: {
      executor: "constant-vus",
      vus: 200,
      duration: "2m",
      startTime: "4m",
      exec: "stage3"
    },
    vus_0400: {
      executor: "constant-vus",
      vus: 400,
      duration: "2m",
      startTime: "6m30s",
      exec: "stage4"
    },
    vus_0800: {
      executor: "constant-vus",
      vus: 800,
      duration: "5m",
      startTime: "9m",
      exec: "stage5"
    },
    vus_1600: {
      executor: "constant-vus",
      vus: 1600,
      duration: "5m",
      startTime: "14m30s",
      exec: "stage6"
    },
    vus_3200: {
      executor: "constant-vus",
      vus: 3200,
      duration: "5m",
      startTime: "20m",
      exec: "stage7"
    }
  }
};

// Reuse your existing default function per scenario
export function stage1() { defaultTestLogic(); }
export function stage2() { defaultTestLogic(); }
export function stage3() { defaultTestLogic(); }
export function stage4() { defaultTestLogic(); }
export function stage5() { defaultTestLogic(); }
export function stage6() { defaultTestLogic(); }
export function stage7() { defaultTestLogic(); }

export function defaultTestLogic() {
  let testIdVal = __VU * 10000 + __ITER;
  let uniqueSuffix = __VU * 1000 + __ITER;

  let params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
  };

  group("1. Create test entry", () => {
    let testPayload = JSON.stringify({
      id: testIdVal,
      number: uniqueSuffix,
    });

    let res = http.post(`${url}/test`, testPayload, {
      ...params,
      tags: { name: "post_test" },
    });

    check(res, {
      "POST /test status is 200 or 201": (r) =>
        r.status === 200 || r.status === 201,
    });

    sleep(1);
  });

  group("2. Get test entry", () => {
    let res = http.get(`${url}/test/${testIdVal}`, {
      ...params,
      tags: { name: "get_test" },
    });

    let body;
    try {
      body = res.json();
    } catch (e) {
      console.error(
        `Failed to parse JSON for GET /test/${testIdVal}: ${res.body}`,
      );
      return;
    }

    check(res, {
      "GET /test returns correct number after POST": () =>
        body.number === uniqueSuffix,
    });

    sleep(1);
  });

  group("3. Update test entry", () => {
    let updatedPayload = JSON.stringify({
      id: testIdVal,
      number: uniqueSuffix + 1,
    });

    let res = http.put(`${url}/test/${testIdVal}`, updatedPayload, {
      ...params,
      tags: { name: "put_test" },
    });

    check(res, {
      "PUT /test status is 200 or 204": (r) =>
        r.status === 200 || r.status === 204,
    });

    sleep(1);
  });

  group("4. Get updated entry", () => {
    let res = http.get(`${url}/test/${testIdVal}`, {
      ...params,
      tags: { name: "get_updated_test" },
    });

    let body;
    try {
      body = res.json();
    } catch (e) {
      console.error(
        `Failed to parse JSON for GET updated /test/${testIdVal}: ${res.body}`,
      );
      return;
    }

    check(res, {
      "GET /test returns updated number after PUT": () =>
        body.number === uniqueSuffix + 1,
    });

    sleep(1);
  });

  group("5. Delete test entry", () => {
    let res = http.del(`${url}/test/${testIdVal}`, null, {
      ...params,
      tags: { name: "delete_test" },
    });

    check(res, {
      "DELETE /test status is 200 or 204": (r) =>
        r.status === 200 || r.status === 204,
    });

    sleep(1);
  });
}
