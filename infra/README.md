# 🚀 DevSecOps AWS EKS Infrastructure & Kubernetes Manifests

This repository contains the complete Infrastructure as Code (IaC) and Kubernetes manifests to deploy a secure, 3-tier architecture on AWS.

## 🏗️ 1. Infrastructure Deployment (Terraform)

The Terraform code provisions the foundational AWS resources:
- A custom VPC spanning 2 AZs with Public and Private subnets.
- An Amazon EKS Cluster deployed in the private subnets.
- Managed Node Groups (EC2 `t3.medium`).
- IRSA (IAM Roles for Service Accounts) configured for the AWS Load Balancer Controller and Amazon EBS CSI Driver.
- EKS Add-ons (VPC CNI, EBS CSI).

### Deployment Steps:
1. Navigate to the Terraform directory:
   ```bash
   cd infra/terraform
   ```
2. Initialize Terraform (downloads providers and modules):
   ```bash
   terraform init
   ```
3. Review the infrastructure plan:
   ```bash
   terraform plan
   ```
4. Apply the configuration to provision the resources (this takes ~15-20 minutes for EKS):
   ```bash
   terraform apply
   ```
5. Once complete, configure `kubectl` using the output command:
   ```bash
   $(terraform output -raw configure_kubectl)
   ```

## ☸️ 2. Kubernetes Workloads & Security (YAML)

The Kubernetes manifests deploy your application across three isolated namespaces (`frontend`, `backend`, `database`), adhering to the Principle of Least Privilege using Network Policies.

### Deployment Steps:
*Ensure you are connected to the EKS cluster via `kubectl` before proceeding.*

1. **Namespaces:** Create the isolated environments.
   ```bash
   kubectl apply -f infra/k8s/namespaces.yaml
   ```

2. **Network Policies (Security First):** Apply the zero-trust default deny and explicit allow rules.
   ```bash
   kubectl apply -f infra/k8s/network-policies/policies.yaml
   ```

3. **Database Tier:** Deploy MySQL with EBS persistent storage.
   ```bash
   kubectl apply -f infra/k8s/database/mysql.yaml
   ```

4. **Backend Tier:** Deploy the Node.js/Next.js API. *(Note: Update the ECR image URI in `backend.yaml` if needed).*
   ```bash
   kubectl apply -f infra/k8s/backend/backend.yaml
   ```

5. **Frontend Tier:** Deploy the Next.js Web UI. *(Note: Update the ECR image URI in `frontend.yaml` if needed).*
   ```bash
   kubectl apply -f infra/k8s/frontend/frontend.yaml
   ```

6. **Ingress:** Expose the frontend to the internet via an AWS Application Load Balancer.
   ```bash
   kubectl apply -f infra/k8s/ingress/ingress.yaml
   ```

### 🔒 Security Highlights
- **VPC Design:** EKS worker nodes run in isolated Private Subnets. Outbound internet access is routed through a NAT Gateway.
- **IRSA:** Pods use fine-grained AWS IAM roles instead of node-level permissions.
- **Zero-Trust Networking:** Kubernetes Network Policies enforce a "Default Deny All" stance. Traffic is only allowed sequentially: `ALB -> Frontend -> Backend -> Database`.
- **EBS Encryption:** The StorageClass forces EBS volume encryption by default.
- **Namespacing:** Resources are isolated into logical boundaries preventing lateral movement.
