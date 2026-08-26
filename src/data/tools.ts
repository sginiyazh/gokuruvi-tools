// Centralized tool index for Gokuruvi Tools.
//
// This is the single source of truth for every tool page on the site,
// used by the homepage's global search, category counts, and the Quick
// Toolbox / Popular Tools sections. Keep it in sync when adding, removing,
// or renaming a tool page — nothing else derives this list automatically.

export interface Tool {
  title: string;
  description: string;
  href: string;
  icon: string;
  category: ToolCategory;
  /** Extra search terms beyond title/description/category, e.g. "yaml" on a Helm tool. */
  keywords?: string[];
}

export type ToolCategory =
  | "Linux"
  | "Windows"
  | "Network"
  | "VMware"
  | "Cloud"
  | "DevOps"
  | "Kubernetes"
  | "Database"
  | "Security"
  | "AI";

export const categoryMeta: Array<{
  name: ToolCategory;
  icon: string;
  href: string;
  description: string;
}> = [
  { name: "Linux", icon: "🐧", href: "/linux/", description: "Permissions, cron, systemd, files, and security command generators." },
  { name: "Windows", icon: "🪟", href: "/windows/", description: "PowerShell, CMD, services, Group Policy, and Windows Server tools." },
  { name: "Network", icon: "🌐", href: "/network/", description: "Subnetting, DNS, ports, SSL, and connectivity diagnostics." },
  { name: "VMware", icon: "🖥️", href: "/vmware/", description: "vSphere capacity planning, PowerCLI, snapshots, and port reference." },
  { name: "Cloud", icon: "☁️", href: "/cloud/", description: "AWS, Azure, Terraform, and cloud-init configuration generators." },
  { name: "DevOps", icon: "⚙️", href: "/devops/", description: "Docker, YAML/JSON validation, JWT, base64, and CI/CD utilities." },
  { name: "Kubernetes", icon: "☸️", href: "/kubernetes/", description: "Deployment, Service, Ingress, and other manifest generators." },
  { name: "Database", icon: "🗄️", href: "/database/", description: "SQL formatting, connection strings, backup, and capacity tools." },
  { name: "Security", icon: "🛡️", href: "/security/", description: "Hashing, HMAC, JWT, CSP, and file-integrity utilities." },
  { name: "AI", icon: "🤖", href: "/ai/", description: "Prompt library, AI glossary, token counter, and model comparison." },
];

export const tools: Tool[] = [
  // Linux
  { title: "Linux chmod Calculator", description: "Convert Linux read, write, and execute permissions into numeric chmod values.", href: "/linux/chmod-calculator/", icon: "🔐", category: "Linux", keywords: ["permissions", "chmod"] },
  { title: "Cron Expression Generator", description: "Build Linux cron expressions for scheduled commands, scripts, and automated tasks.", href: "/linux/cron-generator/", icon: "⏰", category: "Linux", keywords: ["cron", "schedule", "crontab"] },
  { title: "Systemd Service Generator", description: "Generate a systemd service unit file for Linux applications and background services.", href: "/linux/systemd-service-generator/", icon: "⚙️", category: "Linux", keywords: ["systemd", "service"] },
  { title: "Ownership Command Generator", description: "Generate chown and chgrp commands to change Linux file and directory ownership.", href: "/linux/ownership-command-generator/", icon: "👤", category: "Linux", keywords: ["chown", "chgrp"] },
  { title: "Permission Converter", description: "Convert symbolic Linux permissions such as rwxr-xr-x into numeric permission values.", href: "/linux/permission-converter/", icon: "🔄", category: "Linux", keywords: ["permissions", "rwx"] },
  { title: "File Finder Command", description: "Build Linux find commands to locate files by name, size, owner, permission, or date.", href: "/linux/file-finder-command/", icon: "🔎", category: "Linux", keywords: ["find"] },
  { title: "Tar Command Generator", description: "Generate tar commands to create, extract, compress, and inspect Linux archive files.", href: "/linux/tar-command-generator/", icon: "📦", category: "Linux", keywords: ["tar", "archive", "compress"] },
  { title: "SSH Command Builder", description: "Create SSH commands using custom usernames, ports, keys, tunnels, and options.", href: "/linux/ssh-command-builder/", icon: "🖥️", category: "Linux", keywords: ["ssh"] },
  { title: "Rsync Command Generator", description: "Generate rsync commands for local and remote file synchronization and backups.", href: "/linux/rsync-command-generator/", icon: "🔁", category: "Linux", keywords: ["rsync", "sync", "backup"] },
  { title: "Useradd Generator", description: "Build Linux useradd commands with home directory, shell, UID, groups, and expiry options.", href: "/linux/useradd-generator/", icon: "➕", category: "Linux", keywords: ["useradd", "user"] },
  { title: "Firewall-cmd Generator", description: "Generate firewalld commands for ports, services, zones, sources, and permanent rules.", href: "/linux/firewall-cmd-generator/", icon: "🛡️", category: "Linux", keywords: ["firewalld", "firewall"] },
  { title: "Iptables Generator", description: "Build iptables rules for ports, protocols, source addresses, and traffic actions.", href: "/linux/iptables-generator/", icon: "🔥", category: "Linux", keywords: ["iptables", "firewall"] },
  { title: "OpenSSL Command Generator", description: "Generate OpenSSL commands for certificates, private keys, CSRs, and certificate checks.", href: "/linux/openssl-command-generator/", icon: "🔏", category: "Linux", keywords: ["openssl", "ssl", "certificate", "csr"] },
  { title: "Sed Command Generator", description: "Build sed commands to search, replace, delete, insert, and transform Linux text files.", href: "/linux/sed-command-generator/", icon: "📝", category: "Linux", keywords: ["sed", "text"] },

  // Windows
  { title: "PowerShell Command Generator", description: "Generate practical PowerShell commands for everyday Windows and Windows Server administration.", href: "/windows/powershell-generator/", icon: "💻", category: "Windows", keywords: ["powershell"] },
  { title: "Windows CMD Generator", description: "Build common CMD commands for files, networking, processes, services and system tasks.", href: "/windows/command-generator/", icon: "⌨️", category: "Windows", keywords: ["cmd"] },
  { title: "Windows Service Generator", description: "Generate commands to query, start, stop, restart and configure Windows services.", href: "/windows/service-command-generator/", icon: "⚙️", category: "Windows", keywords: ["service"] },
  { title: "Windows Firewall Rule Generator", description: "Create inbound and outbound Microsoft Defender Firewall rules with PowerShell.", href: "/windows/firewall-rule-generator/", icon: "🛡️", category: "Windows", keywords: ["firewall", "defender"] },
  { title: "Local User Management Generator", description: "Generate commands to create, modify, disable and remove local Windows users and groups.", href: "/windows/user-management-generator/", icon: "👤", category: "Windows", keywords: ["user", "group"] },
  { title: "NTFS Permission Generator", description: "Build ICACLS commands to grant, remove, reset and verify NTFS file and folder permissions.", href: "/windows/icacls-generator/", icon: "🔐", category: "Windows", keywords: ["icacls", "ntfs", "permissions"] },
  { title: "Event Log Command Generator", description: "Generate commands to query, filter and export Windows Event Logs for incident troubleshooting.", href: "/windows/event-log-commands/", icon: "📋", category: "Windows", keywords: ["event log"] },
  { title: "Robocopy Generator", description: "Create reliable Robocopy commands for migrations, mirroring, retries, logging and permissions.", href: "/windows/robocopy-generator/", icon: "📁", category: "Windows", keywords: ["robocopy", "copy"] },
  { title: "Group Policy Update Generator", description: "Generate GPUpdate commands to refresh user and computer Group Policy settings.", href: "/windows/gpupdate-generator/", icon: "🔄", category: "Windows", keywords: ["gpupdate", "group policy"] },
  { title: "Group Policy Result Generator", description: "Generate GPResult commands and HTML reports to verify effective Group Policy settings.", href: "/windows/gpresult-generator/", icon: "📊", category: "Windows", keywords: ["gpresult", "group policy"] },
  { title: "SFC & DISM Repair Generator", description: "Generate SFC and DISM commands to diagnose and repair Windows image and system-file corruption.", href: "/windows/sfc-dism-generator/", icon: "🧰", category: "Windows", keywords: ["sfc", "dism", "repair"] },
  { title: "RDP Troubleshooter", description: "Check Remote Desktop services, firewall rules, listening ports and connectivity settings.", href: "/windows/rdp-troubleshooter/", icon: "🖱️", category: "Windows", keywords: ["rdp", "remote desktop"] },
  { title: "TCP Port Tester", description: "Generate PowerShell tests for DNS resolution and TCP connectivity to remote hosts and ports.", href: "/windows/tcp-port-tester/", icon: "🔌", category: "Windows", keywords: ["port", "tcp"] },
  { title: "Disk Health Checker", description: "Check disk health, free space, physical-disk status and file-system information from Windows.", href: "/windows/disk-health-checker/", icon: "💿", category: "Windows", keywords: ["disk"] },
  { title: "BitLocker Command Generator", description: "Generate BitLocker commands for encryption status, recovery protectors and volume management.", href: "/windows/bitlocker-command-generator/", icon: "🔒", category: "Windows", keywords: ["bitlocker", "encryption"] },
  { title: "Windows Feature Installer", description: "Generate PowerShell and DISM commands to inspect, install and remove Windows features and roles.", href: "/windows/windows-feature-installer/", icon: "🧩", category: "Windows", keywords: ["feature", "role"] },
  { title: "IIS Command Generator", description: "Generate IIS commands for websites, application pools, bindings and service administration.", href: "/windows/iis-command-generator/", icon: "🌐", category: "Windows", keywords: ["iis", "web server"] },
  { title: "Hyper-V Command Generator", description: "Generate Hyper-V commands for virtual machines, switches, checkpoints, disks and networking.", href: "/windows/hyperv-command-generator/", icon: "🧱", category: "Windows", keywords: ["hyper-v", "virtualization", "vm"] },

  // Network
  { title: "What Is My IP", description: "See the public IPv4 and IPv6 address detected for your current connection.", href: "/network/what-is-my-ip/", icon: "🌍", category: "Network", keywords: ["ip"] },
  { title: "Internet Speed Test", description: "Measure approximate download, upload and latency performance from your browser.", href: "/network/internet-speed-test/", icon: "⚡", category: "Network", keywords: ["speed test"] },
  { title: "Bandwidth Calculator", description: "Calculate transfer time, data size and bandwidth using common network units.", href: "/network/bandwidth-calculator/", icon: "📊", category: "Network", keywords: ["bandwidth"] },
  { title: "AbuseIPDB Check", description: "Check an IP address against AbuseIPDB using your API key.", href: "/network/abuseipdb-check/", icon: "🛡️", category: "Network", keywords: ["abuse", "threat"] },
  { title: "Password Generator", description: "Generate strong random passwords with configurable length and character sets.", href: "/network/password-generator/", icon: "🔐", category: "Network", keywords: ["password"] },
  { title: "Port Checker", description: "Check whether a TCP port is reachable on a public hostname or IPv4 address.", href: "/network/port-checker/", icon: "🔌", category: "Network", keywords: ["port"] },
  { title: "DNS Checker", description: "Query common DNS records for a hostname and review returned answers.", href: "/network/dns-checker/", icon: "🧭", category: "Network", keywords: ["dns"] },
  { title: "SSL Certificate Checker", description: "Check SSL certificate installation, validity and TLS details for a website.", href: "/network/ssl-checker/", icon: "🔒", category: "Network", keywords: ["ssl", "tls", "certificate"] },
  { title: "IPv4 Subnet Calculator", description: "Calculate subnet mask, network, broadcast, usable range and host capacity.", href: "/network/subnet-calculator/", icon: "🧮", category: "Network", keywords: ["subnet"] },
  { title: "IPv4 Address Calculator", description: "Calculate IPv4 network details, host ranges and address information.", href: "/network/ip-calculator/", icon: "🌐", category: "Network", keywords: ["ip"] },
  { title: "IPv4 CIDR Calculator", description: "Convert CIDR prefixes into masks, ranges and usable host counts.", href: "/network/cidr-calculator/", icon: "🔢", category: "Network", keywords: ["cidr"] },

  // VMware
  { title: "VM Sizing & Cluster Capacity Calculator", description: "Estimate how many VMs a vSphere cluster can support based on host specs and HA reserve.", href: "/vmware/vm-sizing-calculator/", icon: "🧮", category: "VMware", keywords: ["vsphere", "cluster", "capacity"] },
  { title: "Datastore Capacity Calculator", description: "Calculate usable datastore free space, thin-provisioning overcommit and VM headroom.", href: "/vmware/datastore-capacity-calculator/", icon: "💽", category: "VMware", keywords: ["datastore", "storage"] },
  { title: "PowerCLI Command Generator", description: "Generate PowerCLI commands for power operations, snapshots, vMotion and resource queries.", href: "/vmware/powercli-command-generator/", icon: "💻", category: "VMware", keywords: ["powercli", "vmotion"] },
  { title: "Snapshot Command Generator", description: "Generate commands to create, list, remove, revert and consolidate VM snapshots safely.", href: "/vmware/snapshot-command-generator/", icon: "📸", category: "VMware", keywords: ["snapshot"] },
  { title: "VMware Port Reference", description: "Quick reference for vCenter, ESXi, vMotion, Fault Tolerance and vSAN network ports.", href: "/vmware/port-reference/", icon: "📚", category: "VMware", keywords: ["esxi", "vcenter", "port", "vsan"] },

  // Cloud
  { title: "Cloud-init Generator", description: "Generate cloud-init YAML configurations for Ubuntu, RHEL, Debian and other Linux cloud VMs.", href: "/cloud/cloud-init-generator/", icon: "☁️", category: "Cloud", keywords: ["cloud-init", "yaml"] },
  { title: "Terraform Provider Generator", description: "Generate Terraform provider blocks for AWS, Azure, Google Cloud, OCI and Huawei Cloud.", href: "/cloud/terraform-provider-generator/", icon: "🏗️", category: "Cloud", keywords: ["terraform"] },
  { title: "Terraform Backend Generator", description: "Create remote backend configurations for S3, Azure Storage, GCS and Terraform Cloud.", href: "/cloud/terraform-backend-generator/", icon: "📦", category: "Cloud", keywords: ["terraform", "backend"] },
  { title: "Terraform Variables Generator", description: "Generate variables.tf and terraform.tfvars content for Terraform infrastructure projects.", href: "/cloud/terraform-variables-generator/", icon: "📝", category: "Cloud", keywords: ["terraform"] },
  { title: "AWS IAM Policy Generator", description: "Create AWS IAM policy documents for users, groups, roles and supported AWS services.", href: "/cloud/aws-iam-policy-generator/", icon: "🔐", category: "Cloud", keywords: ["aws", "iam"] },
  { title: "AWS Security Group Generator", description: "Generate inbound and outbound AWS Security Group rules for EC2 and cloud workloads.", href: "/cloud/aws-security-group-generator/", icon: "🛡️", category: "Cloud", keywords: ["aws", "security group"] },
  { title: "Azure NSG Generator", description: "Create Azure Network Security Group rules with ports, protocols, priorities and sources.", href: "/cloud/azure-nsg-generator/", icon: "🌐", category: "Cloud", keywords: ["azure", "nsg"] },
  { title: "AWS ARN Parser", description: "Parse and validate AWS Amazon Resource Names into partition, service, region and resource.", href: "/cloud/aws-arn-parser/", icon: "🔎", category: "Cloud", keywords: ["aws", "arn"] },
  { title: "Azure Resource ID Parser", description: "Parse Azure Resource IDs into subscription, resource group, provider and resource name.", href: "/cloud/azure-resource-id-parser/", icon: "📋", category: "Cloud", keywords: ["azure"] },

  // DevOps
  { title: "YAML Validator", description: "Validate YAML syntax, format documents and convert YAML configuration into JSON.", href: "/devops/yaml-validator/", icon: "📝", category: "DevOps", keywords: ["yaml"] },
  { title: "JSON Validator", description: "Validate, format and minify JSON documents directly in your browser.", href: "/devops/json-validator/", icon: "🧩", category: "DevOps", keywords: ["json"] },
  { title: "Docker Run Generator", description: "Build Docker run commands with ports, volumes, environment variables and restart options.", href: "/devops/docker-run-generator/", icon: "🐳", category: "DevOps", keywords: ["docker"] },
  { title: "Docker Compose Validator", description: "Validate Docker Compose YAML syntax and check its basic service structure.", href: "/devops/docker-compose-validator/", icon: "📦", category: "DevOps", keywords: ["docker", "compose", "yaml"] },
  { title: "Dockerfile Generator", description: "Generate starter Dockerfiles for Node.js, Python and Nginx applications.", href: "/devops/dockerfile-generator/", icon: "🏗️", category: "DevOps", keywords: ["docker", "dockerfile"] },
  { title: "Base64 Encoder", description: "Encode plain text and Unicode content into Base64 format.", href: "/devops/base64-encoder/", icon: "🔐", category: "DevOps", keywords: ["base64"] },
  { title: "Base64 Decoder", description: "Decode Base64 values into readable UTF-8 text.", href: "/devops/base64-decoder/", icon: "🔓", category: "DevOps", keywords: ["base64"] },
  { title: "JWT Decoder", description: "Inspect the header and payload of a JSON Web Token without sending it to a server.", href: "/devops/jwt-decoder/", icon: "🪪", category: "DevOps", keywords: ["jwt"] },
  { title: "Regex Tester", description: "Test JavaScript regular expressions and inspect matching values and positions.", href: "/devops/regex-tester/", icon: "🔎", category: "DevOps", keywords: ["regex"] },
  { title: "Environment File Generator", description: "Create clean .env configuration files and download them directly.", href: "/devops/env-file-generator/", icon: "⚙️", category: "DevOps", keywords: ["env", "dotenv"] },
  { title: "Jenkinsfile Generator", description: "Generate a declarative Jenkins pipeline with checkout, build, test and deploy stages.", href: "/devops/jenkinsfile-generator/", icon: "🔧", category: "DevOps", keywords: ["jenkins", "pipeline", "ci/cd"] },
  { title: "Ansible Playbook Generator", description: "Generate a starter Ansible playbook with package, service, copy and command tasks.", href: "/devops/ansible-playbook-generator/", icon: "📗", category: "DevOps", keywords: ["ansible", "playbook", "automation"] },

  // Kubernetes
  { title: "Kubernetes Deployment Generator", description: "Generate Kubernetes Deployment YAML with replicas, images, ports, labels and resources.", href: "/kubernetes/deployment-generator/", icon: "🚀", category: "Kubernetes", keywords: ["yaml", "deployment"] },
  { title: "Kubernetes Service Generator", description: "Create ClusterIP, NodePort and LoadBalancer Service manifests for Kubernetes applications.", href: "/kubernetes/service-generator/", icon: "🔌", category: "Kubernetes", keywords: ["yaml", "service"] },
  { title: "Kubernetes Ingress Generator", description: "Generate Kubernetes Ingress YAML with hosts, paths, services, annotations and TLS settings.", href: "/kubernetes/ingress-generator/", icon: "🌐", category: "Kubernetes", keywords: ["yaml", "ingress"] },
  { title: "Kubernetes ConfigMap Generator", description: "Create Kubernetes ConfigMap manifests for application settings and configuration data.", href: "/kubernetes/configmap-generator/", icon: "🗂️", category: "Kubernetes", keywords: ["yaml", "configmap"] },
  { title: "Kubernetes Secret Generator", description: "Generate Kubernetes Secret YAML with Base64-encoded keys and values.", href: "/kubernetes/secret-generator/", icon: "🔐", category: "Kubernetes", keywords: ["yaml", "secret"] },
  { title: "Kubernetes Namespace Generator", description: "Create Kubernetes Namespace manifests with labels and annotations.", href: "/kubernetes/namespace-generator/", icon: "📁", category: "Kubernetes", keywords: ["yaml", "namespace"] },
  { title: "Kubernetes PVC Generator", description: "Generate PersistentVolumeClaim YAML with access modes, storage size and storage class.", href: "/kubernetes/pvc-generator/", icon: "💾", category: "Kubernetes", keywords: ["yaml", "pvc", "storage"] },
  { title: "Helm Values Validator", description: "Validate Helm values.yaml files and identify YAML syntax and formatting errors.", href: "/kubernetes/helm-values-validator/", icon: "⚙️", category: "Kubernetes", keywords: ["helm", "yaml"] },

  // Database
  { title: "SQL Formatter", description: "Format and clean common SQL statements for easier review and troubleshooting.", href: "/database/sql-formatter/", icon: "🧹", category: "Database", keywords: ["sql"] },
  { title: "Connection String Builder", description: "Build connection strings for PostgreSQL, MySQL, Microsoft SQL Server and Oracle.", href: "/database/connection-string-builder/", icon: "🔌", category: "Database", keywords: ["connection string"] },
  { title: "Database Port Reference", description: "Quick reference for common database engines, default ports and protocols.", href: "/database/database-port-reference/", icon: "📚", category: "Database", keywords: ["port"] },
  { title: "Backup Command Generator", description: "Generate common database backup commands with safer, clear parameters.", href: "/database/backup-command-generator/", icon: "💾", category: "Database", keywords: ["backup"] },
  { title: "Restore Command Generator", description: "Generate common database restore commands for recovery workflows.", href: "/database/restore-command-generator/", icon: "♻️", category: "Database", keywords: ["restore"] },
  { title: "Database Size Calculator", description: "Convert storage units and estimate database growth and required capacity.", href: "/database/database-size-calculator/", icon: "📐", category: "Database", keywords: ["capacity"] },
  { title: "SQL Identifier Escaper", description: "Quote SQL identifiers for PostgreSQL, MySQL, SQL Server and Oracle syntax.", href: "/database/sql-identifier-escaper/", icon: "🧷", category: "Database", keywords: ["sql"] },
  { title: "JDBC URL Builder", description: "Generate JDBC URLs for popular relational database platforms.", href: "/database/jdbc-url-builder/", icon: "☕", category: "Database", keywords: ["jdbc", "java"] },

  // Security
  { title: "Password Strength Checker", description: "Evaluate password length, character diversity and common weaknesses locally.", href: "/security/password-strength-checker/", icon: "🧪", category: "Security", keywords: ["password"] },
  { title: "Hash Generator", description: "Generate SHA-256, SHA-384 and SHA-512 hashes without sending text to a server.", href: "/security/hash-generator/", icon: "🔏", category: "Security", keywords: ["hash", "sha"] },
  { title: "HMAC Generator", description: "Generate HMAC signatures using SHA-256, SHA-384 or SHA-512.", href: "/security/hmac-generator/", icon: "🔐", category: "Security", keywords: ["hmac"] },
  { title: "Security JWT Decoder", description: "Decode JWT headers and payloads locally for inspection and troubleshooting.", href: "/security/jwt-decoder/", icon: "🪪", category: "Security", keywords: ["jwt"] },
  { title: "CSP Generator", description: "Build a Content-Security-Policy header using secure, configurable directives.", href: "/security/csp-generator/", icon: "🛡️", category: "Security", keywords: ["csp"] },
  { title: "SRI Hash Generator", description: "Create Subresource Integrity hashes for script and stylesheet content.", href: "/security/sri-hash-generator/", icon: "🔗", category: "Security", keywords: ["sri"] },
  { title: "Security Headers Analyzer", description: "Paste response headers and check for important browser security controls.", href: "/security/security-headers-analyzer/", icon: "📋", category: "Security", keywords: ["headers"] },
  { title: "File Checksum Generator", description: "Calculate SHA-256, SHA-384 or SHA-512 checksums for local files.", href: "/security/file-checksum-generator/", icon: "🧾", category: "Security", keywords: ["checksum"] },

  // AI
  { title: "AI Prompt Library", description: "40+ copy-paste prompts for debugging, code review, studying, interview prep, and writing.", href: "/ai/prompt-library/", icon: "📋", category: "AI", keywords: ["prompt"] },
  { title: "AI & LLM Glossary", description: "Plain-English definitions of AI and LLM terms — tokens, context window, RAG, agents, and more.", href: "/ai/glossary/", icon: "📖", category: "AI", keywords: ["glossary", "terms"] },
  { title: "AI Token Counter & Cost Estimator", description: "Estimate token counts and API costs for GPT, Claude and Gemini before you run a prompt.", href: "/ai/token-counter/", icon: "🔢", category: "AI", keywords: ["token", "cost"] },
  { title: "Model Context Window Calculator", description: "Check how much text, code or conversation history fits inside a model's context window.", href: "/ai/context-window-calculator/", icon: "📏", category: "AI", keywords: ["context window"] },
  { title: "AI Model Comparison", description: "Compare context windows, standard API pricing and practical strengths of current models.", href: "/ai/model-comparison/", icon: "⚖️", category: "AI", keywords: ["model"] },
  { title: "Command Explainer", description: "Paste a shell, kubectl, Docker, git or systemd command to get a plain-English breakdown.", href: "/ai/command-explainer/", icon: "🧭", category: "AI", keywords: ["command"] },
  { title: "Claude Certification Study Guide", description: "What CCAO-F, CCDV-F, CCAR-F, and CCAR-P actually test — exam domains, format, pricing, and how to pick the right one.", href: "/ai/claude-certifications/", icon: "🎓", category: "AI", keywords: ["claude", "certification", "ccao", "ccdv", "ccar", "anthropic", "exam"] },
];

export function toolCount(category: ToolCategory): number {
  return tools.filter((t) => t.category === category).length;
}
