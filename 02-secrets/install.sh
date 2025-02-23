#!/bin/bash

find files -type f -name '*.yaml' |
	while read -r file; do
		namespace=$(basename "$(dirname "$file")")
		name=$(basename "$file" .yaml)
		kubectl create secret generic "$name" --namespace="$namespace" --from-file=values.yaml="$file" --dry-run=client -o yaml >"secrets/${namespace}-${name}.yaml"
	done
find secrets -type f -print0 |
	xargs -I {} sh -c 'kubeseal -f secrets/$1 -o yaml > seal-secrets/seal-$1' -- {}
echo "resources:" >seal-secrets/kustomization.yaml
find secrets -type f -print0 |
	xargs -I {} sh -c 'echo "- seal-$1" >> seal-secrets/kustomization.yaml' -- {}
