import type { ToolGuideContent } from "./types";

export const cloudGuides: Record<string, ToolGuideContent> = {
  "aws-arn-parser": {
    heading: "Understanding AWS ARNs and using them correctly",
    intro: [
      "An Amazon Resource Name (ARN) uniquely identifies any AWS resource, and you meet them constantly: in IAM policies, CloudTrail logs, error messages, CLI output and Terraform. The general format is `arn:partition:service:region:account-id:resource`, but services fill in the parts differently, which is where confusion starts.",
      "This parser splits an ARN into partition, service, region, account ID, resource type, resource ID and path, and gives you the result as JSON. Below are the patterns worth knowing and the mistakes that make IAM policies fail.",
    ],
    steps: [
      "Paste an ARN, or click an example such as IAM Role, S3 Bucket or Lambda.",
      "Click Parse ARN.",
      "Check each part, especially the region and account ID, which are empty for some services.",
      "Copy or download the JSON for documentation or scripts.",
    ],
    examples: [
      {
        title: "Why some ARNs have empty parts",
        code: "arn:aws:s3:::my-bucket                                    S3 bucket: no region or account\narn:aws:s3:::my-bucket/logs/*                             objects inside it\narn:aws:iam::123456789012:role/app-role                   IAM is global: no region\narn:aws:ec2:me-central-1:123456789012:instance/i-0abc123   regional resource\narn:aws-us-gov:s3:::gov-bucket                            GovCloud partition",
        text: "S3 bucket names are globally unique, so the ARN doesn't need a region or account. IAM resources are global, so they have an account but no region.",
      },
      {
        title: "Getting ARNs from the CLI",
        code: "aws sts get-caller-identity --query Arn --output text      # who am I?\naws iam get-role --role-name app-role --query Role.Arn --output text",
        text: "`get-caller-identity` is the quickest way to see which user or role your credentials belong to when an AccessDenied error appears.",
      },
    ],
    tips: [
      { title: "Bucket vs objects in S3 policies", text: "`s3:ListBucket` applies to `arn:aws:s3:::bucket`, while `s3:GetObject` applies to `arn:aws:s3:::bucket/*`. Using only one of them is the most common S3 policy mistake." },
      { title: "Check the partition", text: "China (`aws-cn`) and GovCloud (`aws-us-gov`) use different partitions. Policies written with `arn:aws:` don't match their resources." },
      { title: "Wildcards in ARNs", text: "`*` matches any characters within the ARN, but keep wildcards as narrow as you can, such as `arn:aws:logs:*:123456789012:log-group:/app/*`." },
      { title: "Assumed-role ARNs look different", text: "Credentials from a role appear as `arn:aws:sts::123456789012:assumed-role/app-role/session-name`, not as the role's IAM ARN." },
    ],
    faq: [
      { q: "What does arn:aws mean?", a: "`arn` marks it as an ARN and `aws` is the partition for standard commercial regions." },
      { q: "Why does my S3 ARN have three colons together?", a: "The region and account fields are empty for S3 buckets, so the separators appear next to each other." },
      { q: "Is the account ID in an ARN secret?", a: "It isn't considered a secret, but don't publish it unnecessarily. It helps attackers target your account." },
      { q: "Is my ARN sent anywhere?", a: "No. Parsing happens in your browser." },
    ],
    related: [
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/cloud/azure-resource-id-parser/", label: "Azure Resource ID Parser" },
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
      { href: "/devops/json-validator/", label: "JSON Validator" },
    ],
  },

  "azure-resource-id-parser": {
    heading: "Reading Azure resource IDs and scopes",
    intro: [
      "Every Azure resource has an ID that describes exactly where it lives: `/subscriptions/<id>/resourceGroups/<rg>/providers/<namespace>/<type>/<name>`. Child resources such as subnets or App Service slots add more type/name pairs. The same format describes scopes for role assignments and policies, from a management group down to a single resource.",
      "This parser breaks an ID into subscription, resource group, provider namespace, resource types and names, and returns it as JSON. Below is where these IDs come from, and how they're used in RBAC, CLI scripts and Terraform.",
    ],
    steps: [
      "Paste a resource ID, or click an example such as Virtual Machine or Subnet.",
      "Click Parse Resource ID.",
      "Check the subscription, resource group, provider and the type/name hierarchy.",
      "Copy or download the JSON.",
    ],
    examples: [
      {
        title: "Getting resource IDs with the Azure CLI",
        code: "az vm show -g rg-app -n vm-web01 --query id -o tsv\naz network vnet subnet show -g rg-net --vnet-name vnet-prod -n snet-app --query id -o tsv\naz group show -n rg-app --query id -o tsv",
        text: "Most `az ... show` commands return the `id` field, which is the value this parser expects.",
      },
      {
        title: "Using an ID as a role assignment scope",
        code: "az role assignment create --assignee user@example.com --role \"Reader\" \\\n  --scope /subscriptions/<sub-id>/resourceGroups/rg-app",
        text: "The scope decides how far access reaches. A resource-group scope covers everything in that group; a resource ID scope covers only that resource.",
      },
    ],
    tips: [
      { title: "Case doesn't matter, but be consistent", text: "Azure treats IDs as case-insensitive, but tools and scripts that compare strings may not. Terraform can report false changes when casing differs." },
      { title: "Child resources", text: "A subnet's ID contains its parent: `.../virtualNetworks/vnet-prod/subnets/snet-app`. You need both names to reference it." },
      { title: "Moves change the ID", text: "Moving a resource to another resource group or subscription gives it a new ID. Update scripts, role assignments and Terraform state afterwards." },
      { title: "Use the narrowest scope", text: "Grant roles at the resource group or resource level rather than the subscription, to follow least privilege." },
    ],
    faq: [
      { q: "What is the provider namespace?", a: "The resource provider that owns the type, for example `Microsoft.Compute` for VMs or `Microsoft.Network` for VNets." },
      { q: "What's the difference between a subscription ID and a tenant ID?", a: "The tenant is your Microsoft Entra ID directory; a tenant can contain many subscriptions. Resource IDs include the subscription, not the tenant." },
      { q: "How do I find a resource by its ID?", a: "`az resource show --ids <resource-id>` works for any resource type." },
      { q: "Is the ID I paste sent anywhere?", a: "No. Parsing happens in your browser." },
    ],
    related: [
      { href: "/cloud/azure-nsg-generator/", label: "Azure NSG Generator" },
      { href: "/cloud/aws-arn-parser/", label: "AWS ARN Parser" },
      { href: "/cloud/terraform-provider-generator/", label: "Terraform Provider Generator" },
      { href: "/guides/cloud-migration-guide/", label: "Cloud Migration Guide" },
    ],
  },

  "terraform-provider-generator": {
    heading: "Configuring Terraform providers the right way",
    intro: [
      "Every Terraform project starts with a `terraform` block that pins the Terraform version and required providers, followed by provider blocks that set regions, projects and credentials. Getting this right early prevents broken builds when a provider releases a new major version, and keeps credentials out of your code.",
      "The generator above builds `providers.tf` for AWS, AzureRM, Google, Kubernetes, Helm and VMware vSphere, with version constraints, aliases, authentication variables, an optional S3 backend and an example resource.",
    ],
    steps: [
      "Choose a provider preset.",
      "Set the required Terraform version and a version constraint such as `~> 5.0`.",
      "Fill in region or project, and an alias if you need a second configuration (for example another region).",
      "Generate `providers.tf`, then run `terraform init` and `terraform validate`.",
    ],
    examples: [
      {
        title: "Two regions with provider aliases",
        code: "provider \"aws\" {\n  region = \"me-central-1\"\n}\n\nprovider \"aws\" {\n  alias  = \"dr\"\n  region = \"eu-west-1\"\n}\n\nresource \"aws_s3_bucket\" \"backup\" {\n  provider = aws.dr\n  bucket   = \"acme-dr-backups\"\n}",
        text: "Resources use the default provider unless they name an alias, so one configuration can manage several regions or accounts.",
      },
      {
        title: "Upgrading providers safely",
        code: "terraform init -upgrade     # fetch newer versions allowed by your constraints\nterraform plan              # review changes before applying\ngit add .terraform.lock.hcl # commit the lock file",
        text: "The lock file records exact provider versions, so every teammate and CI run uses the same ones. Always commit it.",
      },
    ],
    tips: [
      { title: "Use ~> for providers", text: "`~> 5.0` allows 5.x but not 6.0. Major versions often contain breaking changes, so upgrade them deliberately." },
      { title: "Never hard-code credentials", text: "Use environment variables, CLI profiles, workload identity or OIDC from your CI system. Keys in `.tf` files end up in Git and in state." },
      { title: "Pin the Terraform version too", text: "`required_version = \">= 1.6, < 2.0\"` stops someone running an incompatible Terraform version against shared state." },
      { title: "Terraform or OpenTofu", text: "The same provider blocks work with OpenTofu, the open-source fork. Pick one tool per state file and keep the whole team on it." },
    ],
    faq: [
      { q: "What does terraform init do?", a: "It downloads the providers and modules your configuration needs, sets up the backend, and creates or updates `.terraform.lock.hcl`." },
      { q: "Why does Terraform say a provider version doesn't match the lock file?", a: "The constraint changed or the lock file is from another platform. Run `terraform init -upgrade`, review, and commit the updated lock file." },
      { q: "Where should provider configuration live?", a: "In the root module. Reusable modules should declare required providers but not configure credentials or regions." },
      { q: "Can I use one provider for several AWS accounts?", a: "Use one provider block per account with an alias, each using `assume_role` or a different profile." },
    ],
    related: [
      { href: "/cloud/terraform-backend-generator/", label: "Terraform Backend Generator" },
      { href: "/cloud/terraform-variables-generator/", label: "Terraform Variables Generator" },
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/guides/cicd-pipeline-guide/", label: "CI/CD Pipeline Guide" },
    ],
  },

  "cloud-init-generator": {
    heading: "Using cloud-init to build servers automatically",
    intro: [
      "cloud-init runs on the first boot of most cloud images (AWS, Azure, Google Cloud, OpenStack, Proxmox and VMware templates) and configures the new machine: hostname, users, SSH keys, packages, files and commands. A good user-data file means every server comes up ready, without logging in to finish the setup by hand.",
      "The generator above builds a `#cloud-config` file with system settings, a user with SSH key and sudo rule, package updates, files and commands, with presets for a basic VM, web server, Docker host and hardened SSH. Below is how to test it and debug when something doesn't apply.",
    ],
    steps: [
      "Choose a preset or fill in hostname, timezone and locale.",
      "Add your user, SSH public key and sudo rule. Keep password authentication off.",
      "Add packages, files and run commands.",
      "Generate the YAML and paste it into the provider's user-data or custom-data field when creating the VM.",
    ],
    examples: [
      {
        title: "Validate before you launch",
        code: "cloud-init schema --config-file user-data.yaml --annotate",
        text: "Run this on any machine with cloud-init installed. It reports invalid keys and YAML errors before you waste a VM launch on them.",
      },
      {
        title: "Debugging on the new server",
        code: "cloud-init status --long          # done, running or error\nsudo less /var/log/cloud-init-output.log   # output of your commands\nsudo less /var/log/cloud-init.log          # detailed module log\nsudo cloud-init query userdata             # the user-data it received",
        text: "Most failures show up in `cloud-init-output.log`, for example a package name that doesn't exist or a command that failed.",
      },
    ],
    tips: [
      { title: "The first line matters", text: "The file must start with exactly `#cloud-config`. Without it, cloud-init treats the data as something else and ignores your settings." },
      { title: "It runs once per instance", text: "Most modules run only on the first boot of a new instance. To test changes on the same VM, run `sudo cloud-init clean --logs` and reboot." },
      { title: "Don't put secrets in user-data", text: "User-data can often be read by anyone on the VM through the metadata service. Fetch secrets from a secrets manager at boot instead." },
      { title: "Wait for it in scripts", text: "Automation that connects right after launch should run `cloud-init status --wait` before continuing, or it may race with package installs." },
    ],
    faq: [
      { q: "What's the difference between bootcmd and runcmd?", a: "`bootcmd` runs early on every boot, before most setup. `runcmd` runs once, near the end of the first boot, after packages and files are in place." },
      { q: "Does cloud-init work on VMware?", a: "Yes. vSphere can pass cloud-init data through guest customization or guestinfo properties, and many Linux templates include cloud-init." },
      { q: "Why didn't my user get created?", a: "Check the YAML indentation under `users:`, and remember that defining `users:` replaces the image's default user unless you include `default` in the list." },
      { q: "Can I use a shell script instead?", a: "Yes. User-data starting with `#!/bin/bash` runs as a script, but `#cloud-config` is easier to read, validate and keep consistent." },
    ],
    related: [
      { href: "/linux/useradd-generator/", label: "Useradd Command Generator" },
      { href: "/linux/ssh-command-builder/", label: "SSH Command Builder" },
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/cloud/terraform-provider-generator/", label: "Terraform Provider Generator" },
    ],
  },

  "terraform-variables-generator": {
    heading: "Writing Terraform variables that catch mistakes early",
    intro: [
      "Input variables make a Terraform configuration reusable across environments. Well-written variables have a type, a description, a sensible default (or none, when the value must be supplied), and a validation rule that rejects bad values at plan time instead of failing halfway through an apply.",
      "The generator above builds `variable` blocks for every type, from strings and numbers to lists, maps and objects, with optional defaults, `terraform.tfvars` entries, sensitive and ephemeral flags, nullability, validation rules and matching outputs.",
    ],
    steps: [
      "Choose a type preset and enter the variable name and description.",
      "Add a default only if a safe value exists. Leave it out to force callers to set it.",
      "Add a validation condition and a clear error message.",
      "Generate the block into `variables.tf`, and put environment-specific values in a `.tfvars` file.",
    ],
    examples: [
      {
        title: "A variable with validation",
        code: "variable \"environment\" {\n  type        = string\n  description = \"Deployment environment\"\n\n  validation {\n    condition     = contains([\"dev\", \"staging\", \"prod\"], var.environment)\n    error_message = \"environment must be dev, staging or prod.\"\n  }\n}",
        text: "A typo like `prd` now fails at `terraform plan` with a clear message, instead of creating resources with the wrong names or tags.",
      },
      {
        title: "Ways to set a variable, lowest to highest priority",
        code: "default in variables.tf\nterraform.tfvars / *.auto.tfvars\n-var-file=prod.tfvars\n-var 'instance_count=3'\nTF_VAR_instance_count=3   (environment variable, lower than files and -var)",
        text: "Keep one `.tfvars` file per environment and pass it with `-var-file`, so the same code deploys dev and prod.",
      },
    ],
    tips: [
      { title: "Use object types for related settings", text: "`object({ size = string, count = number })` keeps related values together and type-checked, instead of several loose variables." },
      { title: "sensitive hides output, not state", text: "Sensitive values are hidden in plan output but still stored in the state file. Protect state with an encrypted, access-controlled backend." },
      { title: "Ephemeral variables", text: "In Terraform 1.10 and later, `ephemeral = true` lets a value (such as a short-lived token) be used without being saved to plan or state, where the provider supports it." },
      { title: "Don't commit secret tfvars", text: "Add `*.tfvars` files containing secrets to `.gitignore`, or supply secrets from your CI system as `TF_VAR_` environment variables." },
    ],
    faq: [
      { q: "What's the difference between variables and locals?", a: "Variables are inputs set by whoever runs Terraform. Locals are computed values inside the configuration that callers can't override." },
      { q: "Why does Terraform ask me for a value interactively?", a: "A variable has no default and no value was supplied. Set it in a tfvars file, with -var, or with a TF_VAR_ environment variable." },
      { q: "What does nullable = false do?", a: "It stops callers from passing `null`, so the default is used instead of an empty value." },
      { q: "Can validation refer to other variables?", a: "In Terraform 1.9 and later, yes. Older versions only allow the variable's own value in the condition." },
    ],
    related: [
      { href: "/cloud/terraform-provider-generator/", label: "Terraform Provider Generator" },
      { href: "/cloud/terraform-backend-generator/", label: "Terraform Backend Generator" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
      { href: "/guides/cicd-pipeline-guide/", label: "CI/CD Pipeline Guide" },
    ],
  },

  "aws-iam-policy-generator": {
    heading: "Writing least-privilege AWS IAM policies",
    intro: [
      "IAM policies decide who can do what in your AWS account. A policy that's too broad (`\"Action\": \"*\"`) is a security incident waiting to happen, while one that's too narrow breaks applications with AccessDenied errors. The generator above builds identity, resource and trust policies with effect, actions, resources, principals, NotAction/NotResource and condition blocks, plus presets for common needs such as S3 read-only, Secrets Manager access and denying other regions.",
      "Below is how AWS evaluates policies, how to narrow permissions, and how to debug AccessDenied.",
    ],
    steps: [
      "Start from a preset close to what you need.",
      "List only the actions the application really calls, and scope resources to specific ARNs.",
      "Add conditions where useful, such as requiring a specific region, VPC endpoint or tag.",
      "Generate the JSON, test it, and attach it to a role rather than to individual users.",
    ],
    examples: [
      {
        title: "Read access to one S3 prefix only",
        code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    { \"Effect\": \"Allow\", \"Action\": \"s3:ListBucket\",\n      \"Resource\": \"arn:aws:s3:::acme-reports\",\n      \"Condition\": { \"StringLike\": { \"s3:prefix\": [\"finance/*\"] } } },\n    { \"Effect\": \"Allow\", \"Action\": \"s3:GetObject\",\n      \"Resource\": \"arn:aws:s3:::acme-reports/finance/*\" }\n  ]\n}",
        text: "Listing applies to the bucket and reading to the objects, so two statements are needed.",
      },
      {
        title: "Testing a policy before you rely on it",
        code: "aws iam simulate-principal-policy \\\n  --policy-source-arn arn:aws:iam::123456789012:role/app-role \\\n  --action-names s3:GetObject \\\n  --resource-arns arn:aws:s3:::acme-reports/finance/q3.pdf",
        text: "The simulator shows whether the call would be allowed and which statement decided it.",
      },
    ],
    tips: [
      { title: "Explicit Deny always wins", text: "AWS denies by default; an Allow grants access; any explicit Deny overrides every Allow, including from SCPs and permission boundaries." },
      { title: "Use roles, not long-lived keys", text: "Attach policies to roles for EC2, Lambda, ECS and CI (via OIDC). Access keys on users leak and rarely get rotated." },
      { title: "Let IAM Access Analyzer help", text: "Access Analyzer can validate policies for errors and generate a least-privilege policy from CloudTrail activity." },
      { title: "Be careful with NotAction", text: "`Allow` with `NotAction` grants everything except the listed actions, which is far broader than it looks. It's mainly useful in Deny statements." },
    ],
    faq: [
      { q: "What's the difference between an identity policy and a resource policy?", a: "Identity policies attach to users, groups and roles. Resource policies attach to resources such as S3 buckets or KMS keys and include a Principal." },
      { q: "What is a trust policy?", a: "The resource policy on a role that says who may assume it, for example the EC2 service or another account." },
      { q: "How do I find out why I got AccessDenied?", a: "Check CloudTrail for the denied call, confirm the identity with `aws sts get-caller-identity`, and test with the policy simulator. Many error messages now name the policy type that denied it." },
      { q: "What does Version 2012-10-17 mean?", a: "It's the policy language version, not a date you change. Always use 2012-10-17; the older version lacks features such as policy variables." },
    ],
    related: [
      { href: "/cloud/aws-arn-parser/", label: "AWS ARN Parser" },
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
      { href: "/devops/json-validator/", label: "JSON Validator" },
      { href: "/guides/linux-security-hardening/", label: "Security Hardening Guide" },
    ],
  },

  "terraform-backend-generator": {
    heading: "Storing Terraform state safely",
    intro: [
      "Terraform's state file maps your configuration to real resources. Kept on one laptop, it gets lost, overwritten or out of date, and two people running apply at once can corrupt it. A remote backend stores state centrally, encrypts it, and locks it during operations.",
      "The generator above builds the backend block for AWS S3, AzureRM, Google Cloud Storage, Consul, Kubernetes, HTTP, Terraform Cloud and local state, with encryption, locking and authentication options. Below is how to set one up and move existing state into it.",
    ],
    steps: [
      "Choose the backend for your platform.",
      "Enter the bucket or storage account, the state key or prefix, and the region.",
      "Turn on encryption and locking. For S3, use the native lockfile option.",
      "Generate the block into `backend.tf` and run `terraform init`.",
    ],
    examples: [
      {
        title: "S3 backend with native locking",
        code: "terraform {\n  backend \"s3\" {\n    bucket       = \"acme-terraform-state\"\n    key          = \"prod/network/terraform.tfstate\"\n    region       = \"me-central-1\"\n    encrypt      = true\n    use_lockfile = true\n  }\n}",
        text: "Since Terraform 1.10, `use_lockfile` locks state with a file in the same bucket, so a DynamoDB table is no longer needed. DynamoDB-based locking is deprecated.",
      },
      {
        title: "Moving existing local state to the backend",
        code: "terraform init -migrate-state\n# Terraform asks to copy the existing state to the new backend: answer yes\nterraform plan     # should show no changes",
        text: "A clean plan after migrating confirms that the state arrived intact.",
      },
    ],
    tips: [
      { title: "Protect the state bucket", text: "Enable versioning (so you can recover an older state), block public access, encrypt it, and restrict access to the people and pipelines that run Terraform." },
      { title: "Variables don't work in backend blocks", text: "Backend settings are read before variables. Use partial configuration with `terraform init -backend-config=prod.hcl` for per-environment values." },
      { title: "One state per component and environment", text: "Separate keys such as `prod/network` and `prod/app` keep plans fast and limit the damage of mistakes." },
      { title: "Stuck locks", text: "If a run crashed and left a lock, confirm nobody else is running Terraform, then `terraform force-unlock <LOCK_ID>`." },
    ],
    faq: [
      { q: "Does the state file contain secrets?", a: "Often, yes: passwords and keys from resources end up in state in plain text. Treat the backend as sensitive storage." },
      { q: "Can I store state in Git?", a: "No. It has no locking, it leaks secrets, and merges corrupt it. Use a remote backend." },
      { q: "How do I create the state bucket itself?", a: "Create it once by hand or with a small separate Terraform configuration that uses local state, then use it as the backend for everything else." },
      { q: "What's the difference between a backend and a workspace?", a: "The backend is where state is stored. Workspaces are multiple named states within one backend configuration." },
    ],
    related: [
      { href: "/cloud/terraform-provider-generator/", label: "Terraform Provider Generator" },
      { href: "/cloud/terraform-variables-generator/", label: "Terraform Variables Generator" },
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/guides/cloud-migration-guide/", label: "Cloud Migration Guide" },
    ],
  },

  "aws-security-group-generator": {
    heading: "Designing AWS security groups that are secure and maintainable",
    intro: [
      "A security group is a stateful firewall attached to EC2 instances, load balancers, RDS databases and other resources. Rules allow traffic; there are no deny rules, and anything not allowed is blocked. Because it's stateful, return traffic for an allowed connection is automatically permitted.",
      "The generator above builds a security group with ingress and egress rules from CIDRs, IPv6, other security groups, prefix lists or itself, plus common HTTPS, SSH and ICMP rules and tags, as Terraform HCL or AWS CLI commands. Below are the design patterns that keep security groups tight.",
    ],
    steps: [
      "Choose a preset such as Web Server or Internal Only.",
      "Set the name, description, VPC and region.",
      "Add ingress rules with the narrowest source possible. Prefer another security group over a CIDR for traffic inside AWS.",
      "Generate the Terraform or CLI output and apply it.",
    ],
    examples: [
      {
        title: "Chain security groups instead of opening CIDRs",
        code: "ALB security group:   allow 443 from 0.0.0.0/0\nApp security group:   allow 8080 from the ALB security group\nDB security group:    allow 5432 from the App security group",
        text: "Each tier only accepts traffic from the tier in front of it. New instances are covered automatically, without updating IP ranges.",
      },
      {
        title: "Finding groups open to the world",
        code: "aws ec2 describe-security-groups \\\n  --filters Name=ip-permission.cidr,Values=0.0.0.0/0 \\\n  --query 'SecurityGroups[].[GroupId,GroupName]' --output table",
        text: "Review every result. Only public load balancers and genuinely public services should accept traffic from 0.0.0.0/0.",
      },
    ],
    tips: [
      { title: "Never open SSH or RDP to 0.0.0.0/0", text: "Restrict them to your office IP or VPN, or better, use AWS Systems Manager Session Manager and open no inbound port at all." },
      { title: "Use separate rule resources in Terraform", text: "AWS's Terraform provider recommends `aws_vpc_security_group_ingress_rule` and `aws_vpc_security_group_egress_rule` over inline rules, which are harder to manage and can conflict." },
      { title: "Egress matters too", text: "The default rule allows all outbound traffic. For sensitive workloads, restrict egress to the destinations and ports they need." },
      { title: "Security groups and NACLs are different", text: "Network ACLs work at the subnet level, are stateless and allow deny rules. Usually you only need security groups; use NACLs for coarse subnet-wide blocks." },
    ],
    faq: [
      { q: "Do I need an outbound rule for responses?", a: "No. Security groups are stateful, so replies to allowed inbound traffic are permitted automatically." },
      { q: "Can I block a specific IP with a security group?", a: "No, there are no deny rules. Use a network ACL or AWS WAF to block specific addresses." },
      { q: "How many rules can a security group have?", a: "By default 60 inbound and 60 outbound rules per group; the quota can be raised. Prefix lists help keep rule counts low." },
      { q: "Why can't my instance reach the internet even with egress allowed?", a: "Check the route table (internet gateway or NAT gateway), the network ACL, and whether the instance has a public IP or sits in a private subnet." },
    ],
    related: [
      { href: "/network/cidr-calculator/", label: "CIDR Calculator" },
      { href: "/cloud/azure-nsg-generator/", label: "Azure NSG Generator" },
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/network/port-checker/", label: "Port Checker" },
    ],
  },

  "azure-nsg-generator": {
    heading: "Building Azure network security groups with clear priorities",
    intro: [
      "A Network Security Group (NSG) filters traffic to Azure resources at the subnet and network-interface level. Unlike AWS security groups, NSGs have both allow and deny rules, evaluated in priority order from 100 to 4096, where the lowest number wins and evaluation stops at the first match. NSGs are stateful, so return traffic is allowed automatically.",
      "The generator above builds an NSG with a primary rule plus optional HTTPS, restricted SSH and RDP, and outbound internet rules, using CIDRs, service tags or application security groups, as Terraform or Azure CLI output. Below is how priorities and default rules work, and how to troubleshoot blocked traffic.",
    ],
    steps: [
      "Choose a preset such as Web Server or Internal Only.",
      "Set the NSG name, resource group and location.",
      "Define rules with priority, direction, access, protocol, source and destination. Leave gaps between priorities (100, 110, 120…) for future rules.",
      "Generate the output, apply it, and associate the NSG with a subnet or NIC.",
    ],
    examples: [
      {
        title: "The default rules you can't delete",
        code: "Inbound   65000  AllowVnetInBound               VirtualNetwork -> VirtualNetwork\nInbound   65001  AllowAzureLoadBalancerInBound  AzureLoadBalancer -> Any\nInbound   65500  DenyAllInBound                 Any -> Any\nOutbound  65000  AllowVnetOutBound\nOutbound  65001  AllowInternetOutBound\nOutbound  65500  DenyAllOutBound",
        text: "Your rules (priority 100–4096) are evaluated first. Note that traffic within the virtual network is allowed by default, which surprises many people.",
      },
      {
        title: "Why is my traffic blocked?",
        code: "az network watcher test-ip-flow --vm vm-web01 -g rg-app \\\n  --direction Inbound --protocol TCP \\\n  --local 10.0.1.4:443 --remote 203.0.113.25:50000",
        text: "IP flow verify names the exact NSG rule that allowed or denied the packet. The portal shows the same in the VM's Effective security rules view.",
      },
    ],
    tips: [
      { title: "Subnet and NIC NSGs both apply", text: "If NSGs are attached to both, inbound traffic must be allowed by the subnet NSG and then the NIC NSG. One allow isn't enough." },
      { title: "Use service tags", text: "Tags such as `AzureLoadBalancer`, `Storage.WestEurope` or `AzureMonitor` track Microsoft's address ranges for you, instead of hard-coding IPs." },
      { title: "Application security groups", text: "Group VMs by role (web, app, db) and write rules between ASGs instead of IP addresses, so new VMs get the right rules when added to the group." },
      { title: "Don't open RDP or SSH to the internet", text: "Use Azure Bastion, just-in-time VM access in Defender for Cloud, or a VPN, and keep management ports closed to `Internet`." },
    ],
    faq: [
      { q: "Which rule wins if two match?", a: "The one with the lowest priority number. Evaluation stops at the first match, so put specific denies before broad allows." },
      { q: "Should I attach NSGs to subnets or NICs?", a: "Subnets are easier to manage and audit. Use NIC-level NSGs only for exceptions on specific VMs." },
      { q: "Can an NSG filter by domain name?", a: "No. NSGs work with IPs, ports, service tags and ASGs. For FQDN filtering use Azure Firewall." },
      { q: "Do I need an outbound rule for responses?", a: "No. NSGs are stateful, so return traffic for allowed connections is permitted." },
    ],
    related: [
      { href: "/cloud/aws-security-group-generator/", label: "AWS Security Group Generator" },
      { href: "/cloud/azure-resource-id-parser/", label: "Azure Resource ID Parser" },
      { href: "/network/cidr-calculator/", label: "CIDR Calculator" },
      { href: "/windows/firewall-rule-generator/", label: "Windows Firewall Rule Generator" },
    ],
  },
};
