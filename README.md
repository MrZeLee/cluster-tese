# Kubernetes Cluster Setup

## Overview

This repository automates the deployment of a Kubernetes cluster with various
essential services using Rancher Fleet. The architecture is visualized below:

![Kubernetes Cluster Architecture](.images/cluster.drawio.svg)

This cluster, designed for high availability and resilience, is built upon a
foundation of Raspberry Pi and server nodes. The control plane nodes
(raspb0-raspb2) form a highly available etcd cluster, and all nodes connect
through a redundant network setup with UPS-backed switches and routers,
ensuring continuous operation. Key components like Flannel (for networking)
are deployed and managed via this repository's configurations, along with
various applications detailed in the sections below.

## Directory Structure

```
.
├── 01-kube-system
│   ├── 01-seal-secrets
│   │   └── fleet.yaml
│   └── 02-seal-secrets-helper
│       ├── cattle-system
│       │   └── fleet.yaml
│       ├── cert-manager
│       │   └── fleet.yaml
│       └── traefik
│           └── fleet.yaml
├── 02-secrets
│   ├── seal-secrets
│   │   ├── kustomization.yaml
│   │   ├── seal-cattle-system-values-secret.yaml
│   │   ├── seal-cert-manager-helper-values-secret.yaml
│   │   ├── seal-cloudflare-token-secret.yaml
│   │   ├── seal-dashboard-secret.yaml
│   │   ├── seal-traefik-helper-values-secret.yaml
│   │   └── seal-traefik-values-secret.yaml
│   ├── secrets
│   │   └── .gitignore
│   ├── templates
│   │   ├── files
│   │   │   ├── cattle-system
│   │   │   │   └── values-secret.yaml
│   │   │   ├── cert-manager
│   │   │   │   └── helper-values-secret.yaml
│   │   │   ├── monitoring
│   │   │   │   └── grafana-admin-password.yaml
│   │   │   └── traefik
│   │   │       ├── helper-values-secret.yaml
│   │   │       └── values-secret.yaml
│   │   └── secrets
│   │       └── cloudflare-token-secret.yaml
│   ├── fleet.yaml
│   ├── install.sh
│   └── README.md
├── 03-mirrors
│   └── fleet.yaml
├── 04-cert-manager
│   ├── cert-manager
│   │   ├── fleet.yaml
│   │   └── values.yaml
│   ├── cert-manager-crds
│   │   ├── cert-manager.crds.yaml
│   │   ├── fleet.yaml
│   │   ├── kustomization.yaml
│   │   └── README.md
│   └── cert-manager-helper
│       ├── Chart.yaml
│       ├── fleet.yaml
│       ├── templates
│       │   ├── certificate.yaml
│       │   ├── letsencrypt.yaml
│       │   └── mirror-domain-tls.yaml
│   ├── README.md
├── 05-traefik
│   ├── traefik
│   │   ├── fleet.yaml
│   │   ├── kustomization.yaml
│   │   ├── middleware-auth.yaml
│   │   └── values.yaml
│   └── traefik-helper
│       ├── Chart.yaml
│       ├── fleet.yaml
│       ├── templates
│       │   └── ingress-route.yaml
│       └── templates.ignore
│           ├── rewrite-header-middleware.yaml
│           ├── strip-prefix-middleware.yaml
│           └── test-ingress-route.yaml
├── 06-kubernetes-dashboard
│   ├── kubernetes-dashboard
│   │   ├── admin-user.yaml
│   │   ├── cluster-role-binding.yaml
│   │   ├── fleet.yaml
│   │   ├── kustomization.yaml
│   │   └── long-lived-bearer-token.yaml
│   └── kubernetes-dashboard-helper
│       ├── Chart.yaml
│       ├── fleet.yaml
│       └── templates
│           └── ingress-route.yaml
├── 07-rancher
│   ├── rancher
│   │   ├── fleet.yaml
│   │   └── values.yaml
│   └── rancher-helper
│       ├── Chart.yaml
│       ├── fleet.yaml
│       └── templates
│           └── ingress-route.yaml
├── 08-longhorn
│   ├── fleet.yaml
│   ├── kustomization.yaml
│   ├── longhorn-nfs-installation.yaml
│   └── README.md
├── codecompanion-workspace.json
└── TODO_2025_02_01.md
```

## Components

### 01-kube-system

- **01-seal-secrets**: Deploys the Sealed Secrets controller in the
  `kube-system` namespace. Sealed Secrets allow you to encrypt secrets so they
  can be safely committed to Git repositories.

  - `fleet.yaml`: Configuration for the Fleet controller to manage the Sealed
    Secrets deployment.

- **02-seal-secrets-helper**: Contains Fleet configurations for various
  namespaces (cattle-system, cert-manager, traefik) to facilitate the deployment
  of secrets managed by Sealed Secrets.

### 02-secrets

- **seal-secrets**: Contains SealedSecret resources that are the encrypted
  versions of Kubernetes secrets. These secrets are safe to commit to version
  control.
  - `kustomization.yaml`: Defines the resources to be managed by Kustomize,
    pointing to the individual SealedSecret YAML files.
  - `seal-*.yaml`: Individual SealedSecret resources.
- **secrets**: Holds the pre-encryption (plaintext) Kubernetes secrets.
  - `.gitignore`: Ignores all YAML files to prevent accidental commits of
    sensitive data.
- **templates**: Contains template files for generating Kubernetes secrets using
  placeholders for sensitive information. These templates are used by the
  `install.sh` script.
  - `files`: Contains YAML files with placeholders that are meant to be filled
    in with actual values before being converted into SealedSecrets.
- `fleet.yaml`: Configuration for the Fleet controller to manage the Sealed
  Secrets deployment.
- `install.sh`: A script to create Kubernetes secrets from the templates, seal
  them, and generate the necessary Kustomize file.
- `README.md`: Instructions and commands for creating and managing sealed
  secrets.

### 03-mirrors

- Configures `mirrors`, a tool for mirroring secrets across namespaces.
  - `fleet.yaml`: Configuration for the Fleet controller to manage the Mirrors
    deployment.

### 04-cert-manager

- Deploys cert-manager, a Kubernetes certificate management controller.
  - **cert-manager**: Contains the core cert-manager deployment.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      cert-manager deployment.
    - `values.yaml`: Helm values for configuring the cert-manager chart.
  - **cert-manager-crds**: Deploys the CustomResourceDefinitions (CRDs) required
    by cert-manager.
    - `cert-manager.crds.yaml`: The CRDs for cert-manager.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      cert-manager CRDs deployment.
    - `kustomization.yaml`: Defines the resource to be managed by Kustomize,
      pointing to the CRDs YAML file.
    - `README.md`: Instructions for downloading the cert-manager CRDs YAML file.
  - **cert-manager-helper**: Contains resources to help configure cert-manager,
    including ClusterIssuers and Certificates.
    - `Chart.yaml`: Defines the chart metadata for cert-manager-helper.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      cert-manager-helper deployment.
    - `templates`: Contains templates for the Certificate and ClusterIssuer
      resources.
      - `certificate.yaml`: Template for creating a certificate.
      - `letsencrypt.yaml`: Template for creating a ClusterIssuer using Let's
        Encrypt.
      - `mirror-domain-tls.yaml`: Template for mirroring TLS secrets across
        namespaces.
  - `README.md`: Additional setup instructions.

### 05-traefik

- Deploys Traefik, a modern HTTP reverse proxy and load balancer.
  - **traefik**: Contains the core Traefik deployment.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the Traefik
      deployment.
    - `kustomization.yaml`: Defines the resource to be managed by Kustomize,
      pointing to the middleware YAML file.
    - `middleware-auth.yaml`: Defines a middleware for basic authentication.
    - `values.yaml`: Helm values for configuring the Traefik chart.
  - **traefik-helper**: Contains resources to help configure Traefik, such as
    IngressRoutes.
    - `Chart.yaml`: Defines the chart metadata for traefik-helper.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      traefik-helper deployment.
    - `templates`: Contains templates for the IngressRoute resources.
      - `ingress-route.yaml`: Template for creating an IngressRoute.
    - `templates.ignore`: Older ingressroute and middleware configurations that
      are not actively used.

### 06-kubernetes-dashboard

- Deploys the Kubernetes Dashboard, a web-based UI to manage Kubernetes
  clusters.
  - **kubernetes-dashboard**: Contains the core Kubernetes Dashboard deployment.
    - `admin-user.yaml`: Defines a ServiceAccount for the admin user.
    - `cluster-role-binding.yaml`: Defines a ClusterRoleBinding to grant
      cluster-admin privileges to the admin user.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      Kubernetes Dashboard deployment.
    - `kustomization.yaml`: Defines the resources to be managed by Kustomize.
    - `long-lived-bearer-token.yaml`: Defines a Secret for the long-lived bearer
      token.
  - **kubernetes-dashboard-helper**: Contains resources to help configure the
    Kubernetes Dashboard, such as IngressRoutes.
    - `Chart.yaml`: Defines the chart metadata for kubernetes-dashboard-helper.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      kubernetes-dashboard-helper deployment.
    - `templates`: Contains templates for the IngressRoute resources.
      - `ingress-route.yaml`: Template for creating an IngressRoute.

### 07-rancher

- Deploys Rancher, a multi-cluster management platform.
  - **rancher**: Contains the core Rancher deployment.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the Rancher
      deployment.
    - `values.yaml`: Helm values for configuring the Rancher chart.
  - **rancher-helper**: Contains resources to help configure Rancher, such as
    IngressRoutes.
    - `Chart.yaml`: Defines the chart metadata for rancher-helper.
    - `fleet.yaml`: Configuration for the Fleet controller to manage the
      rancher-helper deployment.
    - `templates`: Contains templates for the IngressRoute resources.
      - `ingress-route.yaml`: Template for creating an IngressRoute.

### 08-longhorn

- Deploys Longhorn, a distributed block storage system for Kubernetes.
  - `fleet.yaml`: Configuration for the Fleet controller to manage the Longhorn
    deployment.
  - `kustomization.yaml`: Defines the resource to be managed by Kustomize,
    pointing to the NFS installation YAML file.
  - `longhorn-nfs-installation.yaml`: Defines a DaemonSet to install NFS
    utilities on the nodes.
  - `README.md`: Additional instructions.

### Other Files

- `codecompanion-workspace.json`: Configuration file for CodeCompanion.nvim,
  defining workspace settings and file descriptions for AI-assisted development.
- `TODO_2025_02_01.md`: A markdown file to track project tasks and due dates.

## Deployment

This repository is structured to be deployed using Rancher Fleet. Each directory
(or subdirectory) containing a `fleet.yaml` file represents a Fleet deployment.

1.  **Configure Fleet:** Ensure that Fleet is properly configured in your
    Rancher environment and that it is set up to sync with this Git repository.

2.  **Secrets:** Fill in the placeholder values in the template files within the
    `02-secrets/templates` directory. Then, run the `02-secrets/install.sh`
    script to generate the SealedSecrets.

    ```bash
    cd 02-secrets
    ./install.sh
    cd ..
    ```

3.  **Commit Changes:** Commit the generated SealedSecrets to the repository.

4.  **Fleet Synchronization:** Fleet will automatically synchronize with the
    repository and deploy the resources defined in each `fleet.yaml` file.

## Dependencies

Some deployments depend on others, as defined in the `dependsOn` sections of the
`fleet.yaml` files. Ensure that the dependencies are deployed in the correct
order to avoid issues. A common dependency is the `secrets` application, which
should be deployed before any applications that rely on the secrets it provides.

## Customization

Most components are configured through Helm charts, which can be customized by
modifying the `values.yaml` files. Make sure to understand the implications of
each configuration option before making changes.
