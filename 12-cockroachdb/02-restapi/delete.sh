curl -s -H "Authorization: Basic $TOKEN" "$DB_URL/test" \
  | jq '.[].id' \
  | xargs -I _ curl -s -H "Authorization: Basic $TOKEN" $DB_URL/test/_ -X DELETE
