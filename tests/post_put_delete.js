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
  // Create a new post with a POST request
  let postPayload = JSON.stringify({
    title: 'new post from k6',
    author: 'k6 tester'
  });
  let params = { headers: { 'Content-Type': 'application/json' } };
  let postRes = http.post('http://127.0.0.1:8080/posts', postPayload, params);
  check(postRes, {
    'POST /posts status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  
  // Extract the created post ID to use in subsequent operations
  let postId = postRes.json().id;
  sleep(1); // simulate think time
  
  // Update the post using a PUT request
  let updatedPostPayload = JSON.stringify({
    title: 'updated post from k6',
    author: 'k6 tester updated'
  });
  let putRes = http.put(`http://127.0.0.1:8080/posts/${postId}`, updatedPostPayload, params);
  check(putRes, {
    'PUT /posts status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // Create a new comment related to the post using a POST request
  let commentPayload = JSON.stringify({
    body: 'new comment from k6',
    postId: postId
  });
  let commentRes = http.post('http://127.0.0.1:8080/comments', commentPayload, params);
  check(commentRes, {
    'POST /comments status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  // Extract the created comment ID
  let commentId = commentRes.json().id;
  sleep(1);
  
  // Update the comment using a PUT request
  let updatedCommentPayload = JSON.stringify({
    body: 'updated comment from k6',
    postId: postId
  });
  let putCommentRes = http.put(`http://127.0.0.1:8080/comments/${commentId}`, updatedCommentPayload, params);
  check(putCommentRes, {
    'PUT /comments status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
  
  // Delete the comment using a DELETE request
  let deleteCommentRes = http.del(`http://127.0.0.1:8080/comments/${commentId}`);
  check(deleteCommentRes, {
    'DELETE /comments status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
  
  // Delete the post using a DELETE request
  let deletePostRes = http.del(`http://127.0.0.1:8080/posts/${postId}`);
  check(deletePostRes, {
    'DELETE /posts status is 200 or 204': (r) => r.status === 200 || r.status === 204,
  });
  sleep(1);
}

