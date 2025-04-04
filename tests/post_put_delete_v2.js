import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up to 10 virtual users
    { duration: '1m', target: 10 },  // hold at 10 virtual users
    { duration: '30s', target: 0 }   // ramp down to 0 virtual users
  ],
};

export default function () {
  // Generate unique IDs using __VU and __ITER
  let postIdVal = __VU * 10000 + __ITER;             // Unique id for the post
  let commentIdVal = __VU * 10000 + __ITER + 10000;    // Unique id for the comment
  let uniqueSuffix = `VU${__VU}_Iter${__ITER}`;
  
  let params = { headers: { 'Content-Type': 'application/json' } };

  // 1. Create a new post with a POST request, including an id value
  let postPayload = JSON.stringify({
    id: `${postIdVal}`,
    title: `new post from k6 - ${uniqueSuffix}`,
    author: `k6 tester - ${uniqueSuffix}`
  });
  let postRes = http.post('http://127.0.0.1:8080/posts', postPayload, params);
  check(postRes, {
    'POST /posts status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // GET the post to verify its full content after creation
  let getPostRes = http.get(`http://127.0.0.1:8080/posts/${postIdVal}`);
  check(getPostRes, {
    'GET /posts returns correct title after POST': (r) =>
      r.status === 200 && r.json().title === `new post from k6 - ${uniqueSuffix}`,
  });
  sleep(1);

  // 2. Update the post using a PUT request with new unique content
  let updatedPostPayload = JSON.stringify({
    id: `${postIdVal}`,
    title: `updated post from k6 - ${uniqueSuffix}`,
    author: `k6 tester updated - ${uniqueSuffix}`
  });
  let putRes = http.put(`http://127.0.0.1:8080/posts/${postIdVal}`, updatedPostPayload, params);
  check(putRes, {
    'PUT /posts status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);

  // GET the post again to verify that the update is reflected
  let getUpdatedPostRes = http.get(`http://127.0.0.1:8080/posts/${postIdVal}`);
  check(getUpdatedPostRes, {
    'GET /posts returns updated title after PUT': (r) =>
      r.status === 200 && r.json().title === `updated post from k6 - ${uniqueSuffix}`,
  });
  sleep(1);

  // 3. Create a new comment related to the post with a POST request, including an id value
  let commentPayload = JSON.stringify({
    id: `${commentIdVal}`,
    body: `new comment from k6 - ${uniqueSuffix}`,
    postId: `${postIdVal}`
  });
  let commentRes = http.post('http://127.0.0.1:8080/comments', commentPayload, params);
  check(commentRes, {
    'POST /comments status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // GET the comment to verify it was created correctly
  let getCommentRes = http.get(`http://127.0.0.1:8080/comments/${commentIdVal}`);
  check(getCommentRes, {
    'GET /comments returns correct body after POST': (r) =>
      r.status === 200 && r.json().body === `new comment from k6 - ${uniqueSuffix}`,
  });
  sleep(1);
  
  // 4. Update the comment using a PUT request with new unique content
  let updatedCommentPayload = JSON.stringify({
    id: `${commentIdVal}`,
    body: `updated comment from k6 - ${uniqueSuffix}`,
    postId: `${postIdVal}`
  });
  let putCommentRes = http.put(`http://127.0.0.1:8080/comments/${commentIdVal}`, updatedCommentPayload, params);
  check(putCommentRes, {
    'PUT /comments status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // GET the comment again to verify that the update is reflected
  let getUpdatedCommentRes = http.get(`http://127.0.0.1:8080/comments/${commentIdVal}`);
  check(getUpdatedCommentRes, {
    'GET /comments returns updated body after PUT': (r) =>
      r.status === 200 && r.json().body === `updated comment from k6 - ${uniqueSuffix}`,
  });
  sleep(1);
  
  // 5. Delete the comment using a DELETE request
  let deleteCommentRes = http.del(`http://127.0.0.1:8080/comments/${commentIdVal}`);
  check(deleteCommentRes, {
    'DELETE /comments status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
  
  // 6. Delete the post using a DELETE request
  let deletePostRes = http.del(`http://127.0.0.1:8080/posts/${postIdVal}`);
  check(deletePostRes, {
    'DELETE /posts status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
}

