# Create sealed secret

ls seal-secrets | xargs -I {} rm -f seal-secrets/{}
find files -type f -name '*.yaml' | while read file; do namespace=$(basename $(dirname "$file")); name=$(basename "$file" .yaml); kubectl create secret generic $name --namespace="$namespace" --from-file=values.yaml="$file" --dry-run=client -o yaml | yq eval '.metadata.annotations += {"reflector.v1.k8s.emberstack.com/reflection-allowed": "true", "reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces": ""}' > "secrets/${namespace}-${name}.yaml"; done

```bash
find files -type f -name '*.yaml' | while read file; do namespace=$(basename $(dirname "$file")); name=$(basename "$file" .yaml); kubectl create secret generic $name --namespace="$namespace" --from-file=values.yaml="$file" --dry-run=client -o yaml > "secrets/${namespace}-${name}.yaml"; done
ls secrets | xargs -I {} sh -c 'kubeseal -f secrets/$1 -o yaml > seal-secrets/seal-$1' -- {}
echo "resources:" > seal-secrets/kustomization.yaml
ls secrets | xargs -I {} sh -c 'echo "- seal-$1" >> seal-secrets/kustomization.yaml' -- {}
```

# Create secrets

```bash
kubectl create secret generic {NAME} --namespace={NAMESPACE} --from-literal={KEY}={VALUE} --dry-run=client -o yaml > {NAME}-secret.yaml
```
