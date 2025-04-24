import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up to 100 VUs over 1 minute
    { duration: '2m', target: 200 },  // Ramp up to 200 VUs over 2 minutes
    { duration: '3m', target: 400 },  // Ramp up to 400 VUs over 3 minutes
    { duration: '5m', target: 400 },  // Hold at 400 VUs for 5 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 VUs over 1 minute
  ],
};

export default function () {
  // Generate unique IDs using __VU and __ITER
  let testIdVal = __VU * 10000 + __ITER;
  let uniqueSuffix = __VU * 1000 + __ITER;
  let url = '';
  
  let params = { headers: { 'Content-Type': 'application/json' , 'Authorization': 'Basic '} };

  // 1. Create a new post with a POST request, including an id value
  let testPayload = JSON.stringify({
    id: testIdVal,
    number: uniqueSuffix,
  });
  let testRes = http.post(`${url}/test`, testPayload, params);
  check(testRes, {
    'POST /test status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // GET the post to verify its content after creation
  let getTestRes = http.get(`${url}/test/${testIdVal}`, params);
  check(getTestRes, {
    'GET /test returns correct number after POST': (r) =>
      r.json().number === uniqueSuffix,
  });
  sleep(1);

  // 2. Update the test using a PUT request with new unique content
  let updatedTestPayload = JSON.stringify({
    id: testIdVal,
    number: uniqueSuffix + 1
  });
  let putRes = http.put(`${url}/test/${testIdVal}`, updatedTestPayload, params);
  check(putRes, {
    'PUT /test status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);

  // GET the post again to verify that the update is reflected
  let getUpdatedPostRes = http.get(`${url}/test/${testIdVal}`, params);
  check(getUpdatedPostRes, {
    'GET /test returns updated number after PUT': (r) =>
      r.json().number === uniqueSuffix + 1,
  });
  sleep(1);
  
  // 6. Delete the post using a DELETE request
  let deleteTestRes = http.del(`${url}/test/${testIdVal}`, null, params);

  check(deleteTestRes, {
    'DELETE /test status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
}
