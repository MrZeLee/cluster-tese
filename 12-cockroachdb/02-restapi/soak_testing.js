import http from "k6/http";
import { check, sleep, group } from "k6";

// Access environment variables
const url = __ENV.DB_URL;
const token = __ENV.TOKEN;

export let options = {
  vus: 50,
  duration: "12h",
};

export default function () {
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

