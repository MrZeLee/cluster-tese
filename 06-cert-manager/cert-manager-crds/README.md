# Download cert-manager.crds.yaml

```bash
version=$(grep 'version:' ../cert-manager/fleet.yaml | awk '{print $2}' | tr -d '"'); curl -L -o cert-manager.crds.yaml "https://github.com/cert-manager/cert-manager/releases/download/v${version}/cert-manager.crds.yaml"
```
