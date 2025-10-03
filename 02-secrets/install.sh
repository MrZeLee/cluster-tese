#!/usr/bin/env bash

find bundles -type f -name '*.yaml' |
	while read -r file; do
		path_dir=$(dirname "$file")
    buff_dir="${path_dir#bundles/}"
    namespace=$(basename "$buff_dir")
    bundle_dir=$(dirname "$buff_dir")
		name=$(basename "$file" .yaml)
    echo $name
    if grep -q "kind: Secret" "$file"; then
      cp "$file" "../${bundle_dir}/secrets/${name}.yaml"
    else
      kubectl create secret generic "$name" --namespace="$namespace" --from-file=values.yaml="$file" --dry-run=client -o yaml >"../${bundle_dir}/secrets/${name}.yaml"
    fi
    kubeseal -f "../${bundle_dir}/secrets/${name}.yaml" -o yaml > "../${bundle_dir}/secrets/seal-secret-${name}.yaml"
    rm "../${bundle_dir}/secrets/${name}.yaml"
	done
find bundles -mindepth 2 -type d |
  while read -r file; do
    buff_dir="${file#bundles/}"
    bundle_dir=$(dirname "$buff_dir")
    {
      echo "resources:"
      find "../${bundle_dir}/secrets" -name '*.yaml' -type f ! -name 'kustomization.yaml' ! -name 'fleet.yaml' -printf "- %f\n" | sort
    } | tee "../${bundle_dir}/secrets/kustomization.yaml" > /dev/null
  done
