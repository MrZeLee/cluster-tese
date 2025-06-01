curl -s -H "Authorization: Basic $TOKEN" "$DB_URL/test" \
  | jq '.[].id' \
  | xargs -I _ curl -s -H "Authorization: Basic $TOKEN" $DB_URL/test/_ -X DELETE

curl -s -H "Authorization: Basic $TOKEN" "$DB_URL/bandwidth_tests" \
  | jq '.[].id' \
  | xargs -I = curl -s -H "Authorization: Basic $TOKEN" $DB_URL/bandwidth_tests/= -X DELETE
