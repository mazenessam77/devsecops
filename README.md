# DevSecOps 3-Tier Web Application 🚀

Welcome to the **DevSecOps** repository! This project demonstrates a production-ready, secure, and fully automated deployment of a 3-tier web application using modern DevOps and Cloud-Native practices.

## 🏗️ Architecture

The application is deployed on an **Amazon EKS (Elastic Kubernetes Service)** cluster with the entire underlying infrastructure provisioned via **Terraform**.

### Components
1. **Frontend**: A Next.js/Nginx static web application deployed in the `frontend` namespace. It connects to the backend API.
2. **Backend**: A Node.js (Express) API deployed in the `backend` namespace. It securely handles business logic.
3. **Database**: A highly available MySQL StatefulSet deployed in the `database` namespace, utilizing Amazon EBS (`gp3`) via the EBS CSI Driver for persistent storage.

### Security & Networking
- **VPC Segregation**: The EKS cluster and worker nodes reside in **Private Subnets**.
- **Ingress**: External traffic is securely routed via an **AWS Application Load Balancer (ALB)** sitting in Public Subnets, managed by the AWS Load Balancer Controller.
- **Zero-Trust Network Policies**: Strict Kubernetes Network Policies enforce a default-deny posture. Traffic is explicitly allowed only along the path: `ALB -> Frontend -> Backend -> Database`.
- **Least Privilege IAM**: All AWS permissions are strictly scoped using **IAM Roles for Service Accounts (IRSA)**.

## 📈 Monitoring & Observability

The cluster is fully monitored using **AWS CloudWatch Container Insights**.
- **amazon-cloudwatch-observability**: This EKS Add-on runs the CloudWatch Agent and Fluent Bit.
- Real-time telemetry (CPU, Memory, Network, Disk) is streamed directly to CloudWatch at the Cluster, Node, and Pod levels.
- Application logs are aggregated and sent to CloudWatch Logs.

## ⚙️ CI/CD Pipelines (GitHub Actions)

This repository utilizes GitHub Actions to enforce security and automate deployments.

1. **Continuous Integration (CI)**:
   - Triggers on pull requests to `main`.
   - Automatically builds the cross-platform (`linux/amd64`) Docker images.
   - Runs **Trivy** vulnerability scanning on the built images to prevent shipping vulnerable dependencies.
   
2. **Continuous Deployment (CD)**:
   - Triggers upon merge to `main`.
   - Pushes the verified Docker images to **Amazon Elastic Container Registry (ECR)**.
   - Triggers a rollout restart of the Kubernetes pods so the EKS cluster pulls the latest secure images with zero downtime.

## 🛠️ Infrastructure as Code (Terraform)

All AWS infrastructure is codified in the `infra/terraform/` directory.
- `vpc.tf`: Provisions the isolated network (VPC, Subnets, IGW, NAT).
- `eks.tf`: Provisions the EKS Cluster, Managed Node Groups, OIDC Providers, IRSA Roles, and Add-ons (VPC CNI, EBS CSI Driver, CloudWatch).
- `main.tf` & `variables.tf`: Contains the backend configuration and variable definitions.

## 🚀 Quick Start

1. **Deploy Infrastructure**:
   ```bash
   cd infra/terraform
   terraform init
   terraform apply
   ```

2. **Connect to Cluster**:
   ```bash
   aws eks update-kubeconfig --region eu-west-2 --name devsecops-eks
   ```

3. **Deploy Application**:
   ```bash
   kubectl apply -f infra/k8s/namespaces.yaml
   kubectl apply -f infra/k8s/network-policies/policies.yaml
   kubectl apply -f infra/k8s/database/
   kubectl apply -f infra/k8s/backend/
   kubectl apply -f infra/k8s/frontend/
   kubectl apply -f infra/k8s/ingress/
   ```

---
*Built with ❤️ focusing on Security, Scalability, and Automation.*
