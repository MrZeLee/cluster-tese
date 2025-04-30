import http from 'k6/http';
import { check, sleep } from 'k6';

// Access environment variables
const url = __ENV.DB_URL;
const token = __ENV.TOKEN;

export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 400 },
    { duration: '5m', target: 400 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  let testIdVal = __VU * 10000 + __ITER;
  let uniqueSuffix = __VU * 1000 + __ITER;

  let params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`,
    },
  };

  let testPayload = JSON.stringify({
    id: testIdVal,
    number: uniqueSuffix,
  });

  let testRes = http.post(`${url}/test`, testPayload, params);
  check(testRes, {
    'POST /test status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);

  let getTestRes = http.get(`${url}/test/${testIdVal}`, params);
  check(getTestRes, {
    'GET /test returns correct number after POST': (r) =>
      r.json().number === uniqueSuffix,
  });
  sleep(1);

  let updatedTestPayload = JSON.stringify({
    id: testIdVal,
    number: uniqueSuffix + 1,
  });

  let putRes = http.put(`${url}/test/${testIdVal}`, updatedTestPayload, params);
  check(putRes, {
    'PUT /test status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);

  let getUpdatedPostRes = http.get(`${url}/test/${testIdVal}`, params);
  check(getUpdatedPostRes, {
    'GET /test returns updated number after PUT': (r) =>
      r.json().number === uniqueSuffix + 1,
  });
  sleep(1);

  let deleteTestRes = http.del(`${url}/test/${testIdVal}`, null, params);
  check(deleteTestRes, {
    'DELETE /test status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
}

