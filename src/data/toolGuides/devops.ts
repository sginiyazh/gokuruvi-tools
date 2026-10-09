import type { ToolGuideContent } from "./types";

export const devopsGuides: Record<string, ToolGuideContent> = {
  "jenkinsfile-generator": {
    heading: "How to build a Jenkins pipeline with this generator",
    intro: [
      "A Jenkinsfile describes your CI/CD pipeline as code. It lives in your Git repository next to the application, so pipeline changes are reviewed, versioned and rolled back like any other code. Jenkins picks it up automatically in Pipeline and Multibranch Pipeline jobs.",
      "This generator writes a declarative pipeline with the parts most jobs need: an `agent`, an `options` block with `buildDiscarder(logRotator(...))` so old builds don't fill the Jenkins disk, and an overall `timeout` so a hung build can't block an executor forever. It then adds the Checkout, Build, Test and Deploy stages you select, and a `post` section that reports success or failure.",
    ],
    steps: [
      "Choose the agent. `any` runs on any available executor; a label such as `linux` pins the job to matching nodes.",
      "Enter the Git repository URL and branch for the Checkout stage.",
      "Set how many builds to keep and the overall timeout in minutes.",
      "Tick the stages you need and enter the shell command for Build, Test and Deploy, for example `mvn -B package`, `npm test` or `./deploy.sh`.",
      "Generate the file, save it as `Jenkinsfile` (no extension) in the repository root, commit it, and point a Pipeline job at the repository.",
    ],
    examples: [
      {
        title: "A typical generated pipeline",
        code: "pipeline {\n  agent any\n  options {\n    buildDiscarder(logRotator(numToKeepStr: '20'))\n    timeout(time: 30, unit: 'MINUTES')\n  }\n  stages {\n    stage('Checkout') { steps { git branch: 'main', url: 'https://github.com/acme/app.git' } }\n    stage('Build')    { steps { sh 'npm ci && npm run build' } }\n    stage('Test')     { steps { sh 'npm test' } }\n  }\n  post {\n    success { echo 'Pipeline completed successfully.' }\n    failure { echo 'Pipeline failed. Check the stage logs above.' }\n  }\n}",
        text: "Each stage shows up as its own column in the Jenkins stage view, so you can see at a glance where a build failed.",
      },
      {
        title: "Using credentials safely",
        code: "stage('Deploy') {\n  steps {\n    withCredentials([string(credentialsId: 'deploy-token', variable: 'TOKEN')]) {\n      sh 'curl -fsS -H \"Authorization: Bearer $TOKEN\" https://deploy.example.com/release'\n    }\n  }\n}",
        text: "Store secrets in Jenkins Credentials and bind them with `withCredentials`. Jenkins masks them in the console log. Use single quotes around the `sh` string so Groovy doesn't interpolate the secret.",
      },
    ],
    tips: [
      { title: "Checkout scm in Multibranch jobs", text: "In a Multibranch Pipeline, the job already knows the repository and branch. You can replace the `git` step with `checkout scm`." },
      { title: "Protect the deploy stage", text: "Add `when { branch 'main' }` to Deploy so feature branches build and test but never deploy, or add an `input` step for a manual approval." },
      { title: "Validate before committing", text: "The Jenkins Pipeline Linter (`/pipeline-model-converter/validate`, or the \"Declarative Linter\" in some IDEs) catches syntax errors without running a build." },
      { title: "Archive what you build", text: "Add `archiveArtifacts artifacts: 'target/*.jar', fingerprint: true` and `junit '**/target/surefire-reports/*.xml'` in post so artifacts and test results appear on the build page." },
    ],
    faq: [
      { q: "What's the difference between declarative and scripted pipelines?", a: "Declarative (`pipeline { }`) has a fixed, readable structure and built-in validation. Scripted (`node { }`) is plain Groovy and more flexible but harder to maintain. Start with declarative." },
      { q: "Where do I put the Jenkinsfile?", a: "In the root of your Git repository, named exactly `Jenkinsfile`. You can use another path by setting Script Path in the job configuration." },
      { q: "Why does my sh step fail on Windows agents?", a: "`sh` needs a Unix shell. On Windows agents, use `bat` or `powershell` steps instead." },
      { q: "How do I run stages in parallel?", a: "Wrap stages in a `parallel { }` block inside a parent stage, for example to run unit and integration tests at the same time." },
    ],
    related: [
      { href: "/devops/dockerfile-generator/", label: "Dockerfile Generator" },
      { href: "/devops/ansible-playbook-generator/", label: "Ansible Playbook Generator" },
      { href: "/guides/cicd-pipeline-guide/", label: "CI/CD Pipeline Guide" },
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
    ],
  },

  "ansible-playbook-generator": {
    heading: "How to write your first Ansible playbook",
    intro: [
      "Ansible automates server configuration over SSH, with no agent to install on the managed hosts. You describe the state you want in a YAML playbook, such as a package installed, a service running or a file in place, and Ansible makes each host match it. Running the same playbook again changes nothing if the host is already correct, which is called idempotency.",
      "This generator builds a starter playbook with a play name, target hosts or group, optional privilege escalation (`become: true`), and the tasks you choose: install a package, start and enable a service, copy a file, or run a command. It adds a handler where one makes sense, so a service restarts only when its configuration actually changes.",
    ],
    steps: [
      "Enter a play name and the target: a group from your inventory (such as `webservers`) or `all`.",
      "Tick Become root if the tasks need sudo, which is true for most package and service changes.",
      "Choose the tasks and fill in the package name, service name, file paths or command.",
      "Generate the playbook and save it, for example as `site.yml`.",
      "Do a dry run with `ansible-playbook -i inventory.ini site.yml --check --diff`, then run it without `--check`.",
    ],
    examples: [
      {
        title: "A minimal inventory and run",
        code: "# inventory.ini\n[webservers]\nweb01.example.com\nweb02.example.com ansible_user=deploy\n\n# Test connectivity, then run\nansible -i inventory.ini webservers -m ping\nansible-playbook -i inventory.ini site.yml --check --diff\nansible-playbook -i inventory.ini site.yml",
        text: "The ping module checks SSH access and Python on each host, and it's the quickest way to catch inventory or key problems before running a playbook.",
      },
      {
        title: "Install and run Nginx",
        code: "- name: Configure web servers\n  hosts: webservers\n  become: true\n  tasks:\n    - name: Install nginx\n      ansible.builtin.package:\n        name: nginx\n        state: present\n    - name: Start and enable nginx\n      ansible.builtin.service:\n        name: nginx\n        state: started\n        enabled: true",
        text: "`ansible.builtin.package` picks the right package manager (dnf, yum or apt) for each host, so the same task works across RHEL and Ubuntu.",
      },
    ],
    tips: [
      { title: "Prefer modules over shell commands", text: "Modules like `package`, `service`, `copy`, `template` and `lineinfile` are idempotent. `command` and `shell` run every time unless you add `creates:`, `removes:` or `changed_when:`." },
      { title: "YAML indentation matters", text: "Use two spaces, never tabs. Most \"mapping values are not allowed\" errors are indentation mistakes. Paste the playbook into a YAML validator first." },
      { title: "Keep secrets in Ansible Vault", text: "Encrypt passwords and keys with `ansible-vault encrypt_string` or vault files, and run with `--ask-vault-pass`." },
      { title: "Limit the blast radius", text: "Use `--limit web01.example.com` to test on one host, and `serial: 1` in the play for rolling changes across a cluster." },
    ],
    faq: [
      { q: "Do I need to install anything on the target servers?", a: "Only SSH and Python, which almost every Linux server already has. Ansible itself runs on your control machine." },
      { q: "What does --check --diff do?", a: "`--check` reports what would change without changing it; `--diff` shows the file content differences. Some tasks, such as `command`, are skipped in check mode." },
      { q: "What is a handler?", a: "A task that only runs when notified by another task that reported a change, typically to restart a service after its configuration file changes." },
      { q: "Can Ansible manage Windows servers?", a: "Yes, over WinRM or SSH, using the `ansible.windows` modules such as `win_package`, `win_service` and `win_copy`." },
    ],
    related: [
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/devops/jenkinsfile-generator/", label: "Jenkinsfile Generator" },
      { href: "/linux/systemd-service-generator/", label: "systemd Service Generator" },
      { href: "/linux/ssh-command-builder/", label: "SSH Command Builder" },
    ],
  },

  "base64-encoder": {
    heading: "How Base64 encoding works and when to use it",
    intro: [
      "Base64 turns any data (text, binary files, keys, images) into plain ASCII using 64 safe characters: A–Z, a–z, 0–9, `+` and `/`, with `=` as padding. It lets binary or special-character data travel safely through systems that only handle text, such as JSON, YAML, email, HTTP headers and environment variables.",
      "This tool encodes and decodes in your browser with full Unicode support, so accented characters and emoji round-trip correctly. It can also produce URL-safe Base64 (`-` and `_` instead of `+` and `/`) and remove the `=` padding, which is the format used in JWTs and many URL parameters.",
    ],
    steps: [
      "Paste or type your text, or upload a text file.",
      "Tick URL-safe Base64 and Remove padding if the value will go into a URL, file name or JWT.",
      "Click Encode to Base64, or turn on Auto encode to see the result as you type.",
      "Copy or download the result. Use Swap to move the result back into the input and decode it again as a check.",
    ],
    examples: [
      {
        title: "Encoding on the command line",
        code: "# Linux / macOS (-n avoids encoding a trailing newline)\necho -n 'admin:S3cret!' | base64\n# YWRtaW46UzNjcmV0IQ==\n\n# PowerShell\n[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('admin:S3cret!'))",
        text: "Both give the same result as this tool. Forgetting `-n` is the classic reason command-line output ends in `K` or `Cg==` and doesn't match.",
      },
      {
        title: "Kubernetes Secrets",
        code: "apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-credentials\ntype: Opaque\ndata:\n  username: YXBwX3VzZXI=     # app_user\n  password: UzNjcmV0IQ==     # S3cret!",
        text: "Values under `data:` must be Base64-encoded. Alternatively, use `stringData:` and let Kubernetes encode plain text for you.",
      },
    ],
    tips: [
      { title: "Base64 is not encryption", text: "Anyone can decode it instantly. Never treat Base64 as a way to hide passwords or secrets. Kubernetes Secrets, for example, need encryption at rest and RBAC to be secure." },
      { title: "It makes data about 33% larger", text: "Every 3 bytes become 4 characters. Avoid Base64-embedding large images or files in HTML, CSS or JSON when you can serve them directly." },
      { title: "Standard vs URL-safe", text: "Standard Base64 uses `+` and `/`, which have special meanings in URLs. Use URL-safe Base64 for URLs and file names, and standard Base64 everywhere else unless the receiving system says otherwise." },
      { title: "HTTP Basic authentication", text: "The `Authorization: Basic` header is `username:password` encoded in Base64. That's why Basic auth must only ever be used over HTTPS." },
    ],
    faq: [
      { q: "Is my text uploaded anywhere?", a: "No. Encoding and decoding happen in your browser, and nothing is sent to a server." },
      { q: "Why does my encoded string end in = or ==?", a: "Padding. Base64 works on 3-byte groups, and `=` fills the last group when the input length isn't a multiple of 3. Some formats remove it." },
      { q: "Can Base64 encode binary files?", a: "Yes. Base64 can represent any bytes. For files, command-line tools (`base64 file.bin` or `certutil -encode`) are the easiest option." },
      { q: "Does Base64 support Unicode?", a: "Base64 encodes bytes. This tool converts your text to UTF-8 bytes first, so every Unicode character, including emoji, is preserved." },
    ],
    related: [
      { href: "/devops/base64-decoder/", label: "Base64 Decoder" },
      { href: "/devops/jwt-decoder/", label: "JWT Decoder" },
      { href: "/kubernetes/secret-generator/", label: "Kubernetes Secret Generator" },
      { href: "/security/hash-generator/", label: "Hash Generator" },
    ],
  },

  "base64-decoder": {
    heading: "How to decode Base64 and troubleshoot common errors",
    intro: [
      "Base64 shows up everywhere in operations work: Kubernetes Secret values, JWT segments, SAML responses, email attachments, API payloads, and certificates and keys inside PEM files. Decoding it is often the quickest way to see what a system is really sending.",
      "This decoder accepts both standard Base64 (`+` and `/`) and URL-safe Base64 (`-` and `_`), with or without `=` padding, and turns the result back into readable Unicode text. Ignore whitespace lets you paste values that were wrapped across several lines, as they often are in PEM files and emails. Everything runs locally in your browser.",
    ],
    steps: [
      "Paste the Base64 value, or upload a file containing it.",
      "Keep Ignore whitespace on if the value spans several lines.",
      "Click Decode Base64, or turn on Auto decode to decode as you type.",
      "Copy or download the decoded text. Move Result to Input lets you decode again if the value was encoded twice.",
    ],
    examples: [
      {
        title: "Reading a Kubernetes Secret",
        code: "kubectl get secret db-credentials -o jsonpath='{.data.password}'\n# UzNjcmV0IQ==\n\n# Decode directly on the command line\nkubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d",
        text: "Paste the value here to see `S3cret!`. This is often the fastest way to confirm an application is getting the credentials you expect.",
      },
      {
        title: "Decoding on Windows",
        code: "[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('UzNjcmV0IQ=='))\n\n# Decode a file\ncertutil -decode encoded.txt decoded.bin",
        text: "Useful on servers where you can't open a browser.",
      },
    ],
    tips: [
      { title: "'Invalid character' errors", text: "Usually caused by extra quotes, a `Bearer` prefix, a `data:...;base64,` header, or characters lost when copying. Paste only the Base64 part." },
      { title: "Garbled output means binary data", text: "If the result looks like random symbols, the original data wasn't text. It may be an image, a compressed file or an encrypted value. Decode it to a file with the command-line tools instead." },
      { title: "JWTs are three values", text: "Decode each dot-separated part separately, or use the JWT Decoder, which also formats the JSON." },
      { title: "Missing padding", text: "Some systems strip the `=` padding. This tool adds it back automatically; other decoders may need you to add `=` until the length is a multiple of 4." },
    ],
    faq: [
      { q: "Is decoded data sent to a server?", a: "No. Decoding runs entirely in your browser, so it's safe for configuration values and test credentials." },
      { q: "What is the difference between Base64 and URL-safe Base64?", a: "URL-safe Base64 replaces `+` with `-` and `/` with `_` so the value can appear in URLs. This decoder accepts both." },
      { q: "Can decoding Base64 reveal passwords?", a: "Yes. Base64 is encoding, not encryption, so anything stored only as Base64 should be considered readable by anyone with access." },
      { q: "Why is the decoded text in the wrong language or full of symbols?", a: "The original text may not have been UTF-8 (for example UTF-16 from some Windows tools), or it's binary data. Try decoding it with the source system's encoding." },
    ],
    related: [
      { href: "/devops/base64-encoder/", label: "Base64 Encoder" },
      { href: "/security/jwt-decoder/", label: "JWT Decoder" },
      { href: "/kubernetes/secret-generator/", label: "Kubernetes Secret Generator" },
      { href: "/devops/json-validator/", label: "JSON Validator" },
    ],
  },
  "docker-compose-validator": {
    heading: "Validating Docker Compose files before you deploy",
    intro: [
      "A Compose file describes a multi-container application: services, images or builds, ports, volumes, networks, environment and dependencies. One indentation slip or wrong type, and `docker compose up` fails, or worse, starts with settings silently ignored.",
      "This validator checks the YAML syntax and the Compose structure in your browser: that `services` exists and is a mapping, that each service has an image or build, and that top-level volumes, networks and configs are well formed. It also flags common problems such as `latest` image tags. Below is how to confirm the file with Docker itself and how to fix the errors people hit most.",
    ],
    steps: [
      "Paste your `compose.yaml` (or `docker-compose.yml`), upload it, or load the sample.",
      "Click Validate and fix any YAML errors at the reported line.",
      "Review the Compose checks for missing images, invalid sections and warnings.",
      "Confirm with Docker using the commands below before running it on a server.",
    ],
    examples: [
      {
        title: "Let Docker render the final configuration",
        code: "docker compose config            # resolved file with variables substituted\ndocker compose config --quiet    # only report errors\ndocker compose config --services # list service names",
        text: "`docker compose config` shows exactly what Compose will run after merging override files and substituting `.env` variables. It's the best check for \"why isn't my setting applied?\"",
      },
      {
        title: "Waiting for a database properly",
        code: "services:\n  db:\n    image: postgres:16\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      retries: 10\n  app:\n    image: acme/app:1.4.2\n    depends_on:\n      db:\n        condition: service_healthy",
        text: "Plain `depends_on` only waits for the container to start, not for the database to accept connections. A healthcheck plus `service_healthy` fixes start-up race conditions.",
      },
    ],
    tips: [
      { title: "The version key is obsolete", text: "Modern Docker Compose ignores the top-level `version:` and warns about it. You can delete it." },
      { title: "Quote port mappings", text: "Write `\"8080:80\"` in quotes. Unquoted values like `22:22` can be read by YAML as a number in base 60." },
      { title: "Pin image versions", text: "`image: nginx:latest` changes under you without warning. Use a specific tag, such as `nginx:1.27`, for predictable deployments." },
      { title: "Keep secrets out of the file", text: "Put values in a `.env` file next to the Compose file (excluded from Git) and reference them as `${DB_PASSWORD}`." },
    ],
    faq: [
      { q: "What's the difference between docker-compose and docker compose?", a: "`docker-compose` was the old standalone Python tool. `docker compose` (with a space) is the current plugin built into Docker. Use the plugin." },
      { q: "Why is my environment variable empty?", a: "Variables in the Compose file are substituted from your shell or the `.env` file next to it. Run `docker compose config` to see the value it actually uses." },
      { q: "How do containers talk to each other?", a: "Services on the same Compose network reach each other by service name, for example `postgres://db:5432`. Don't use localhost between containers." },
      { q: "Is my file uploaded anywhere?", a: "No. Validation runs entirely in your browser." },
    ],
    related: [
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/devops/dockerfile-generator/", label: "Dockerfile Generator" },
      { href: "/devops/docker-run-generator/", label: "Docker Run Generator" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
    ],
  },

  "env-file-generator": {
    heading: "Managing .env files and configuration safely",
    intro: [
      "A `.env` file keeps configuration such as database URLs, API keys, ports and feature flags out of your code, so the same build runs in development, staging and production with different settings. This is the \"config in the environment\" principle from the Twelve-Factor App method.",
      "The generator above builds `.env` files from templates for Node.js, Astro, Docker and API services, per environment, with comments, quoting, sorting, masked secrets in the preview, and secure random values for secrets. Below is how to use these files without leaking credentials.",
    ],
    steps: [
      "Choose a template and the target environment.",
      "Add or edit variables. Use Add Random Secret for session keys and tokens.",
      "Choose quoting, sorting and comments, then generate the file.",
      "Download it as `.env`, and create a matching `.env.example` with the values removed for your repository.",
    ],
    examples: [
      {
        title: "Keep the real file out of Git",
        code: "# .gitignore\n.env\n.env.*\n!.env.example\n\n# check nothing slipped through\ngit ls-files | grep -E '(^|/)\\.env'",
        text: "Commit `.env.example` with variable names and placeholder values, so new developers know what to set, and never commit the real file.",
      },
      {
        title: "Where each tool reads .env",
        code: "docker compose up                   # reads .env next to the compose file\ndocker run --env-file .env myimage  # passes every line as a variable\nnode --env-file=.env server.js      # Node.js 20.6+ without extra packages",
        text: "Python apps usually load it with `python-dotenv`. In production, prefer your platform's secret store over a file on disk.",
      },
    ],
    tips: [
      { title: "If a secret was committed, rotate it", text: "Deleting the file in a later commit doesn't remove it from Git history. Change the password or key immediately." },
      { title: "No spaces around =", text: "`PORT = 3000` breaks many parsers. Write `PORT=3000`, and quote values containing spaces or `#`." },
      { title: "Different values per environment", text: "Never reuse production secrets in development. A leaked laptop shouldn't expose production." },
      { title: "Frontend variables are public", text: "Variables exposed to browser code (for example `PUBLIC_` or `VITE_` prefixes) end up in the JavaScript bundle. Never put secrets in them." },
    ],
    faq: [
      { q: "Should I commit .env files?", a: "No. Commit `.env.example` with placeholders, and keep real values out of the repository." },
      { q: "Do I need quotes around values?", a: "Only for values with spaces, `#` or special characters. Quoting rules differ slightly between tools, so keep values simple where possible." },
      { q: "Are the random secrets generated securely?", a: "Yes. They're created in your browser with the Web Crypto random generator and never sent anywhere." },
      { q: "What should I use instead of .env in production?", a: "Your platform's secret management: Kubernetes Secrets, AWS Secrets Manager, Azure Key Vault, Vault, or your CI/CD system's protected variables." },
    ],
    related: [
      { href: "/devops/docker-compose-validator/", label: "Docker Compose Validator" },
      { href: "/kubernetes/secret-generator/", label: "Kubernetes Secret Generator" },
      { href: "/network/password-generator/", label: "Password Generator" },
      { href: "/cloud/terraform-variables-generator/", label: "Terraform Variables Generator" },
    ],
  },

  "jwt-decoder": {
    heading: "Debugging JWTs in CI/CD pipelines, Kubernetes and API gateways",
    intro: [
      "In DevOps work, JSON Web Tokens show up far beyond user logins: CI/CD systems issue OIDC tokens so pipelines can deploy to cloud accounts without stored keys, Kubernetes gives every pod a service-account token, and API gateways and ingress controllers validate JWTs before traffic reaches your services.",
      "This decoder shows the header, payload and signature, explains each claim, and checks expiry automatically. Decoding runs in your browser and doesn't verify the signature. Below are the claims that cause most pipeline and gateway failures.",
    ],
    steps: [
      "Paste the token (without the `Bearer ` prefix), or load the sample.",
      "Read the header for the algorithm and key ID (`kid`).",
      "Check the claim details: issuer, audience, subject and the expiration check.",
      "Compare them with what the receiving system expects; a mismatch is usually the cause of the rejection.",
    ],
    examples: [
      {
        title: "A CI/CD OIDC token deploying to AWS",
        code: "{\n  \"iss\": \"https://token.actions.githubusercontent.com\",\n  \"aud\": \"sts.amazonaws.com\",\n  \"sub\": \"repo:acme/web:ref:refs/heads/main\",\n  \"exp\": 1790003600\n}",
        text: "The cloud role's trust policy usually matches `sub`. A deploy that works on `main` but fails on a tag or pull request is often a `sub` value that the trust policy doesn't allow.",
      },
      {
        title: "Inspecting a Kubernetes service-account token",
        code: "kubectl create token app-sa -n app --duration=10m\n# or, inside a pod:\ncat /var/run/secrets/kubernetes.io/serviceaccount/token",
        text: "Decode it to see the namespace, service account and audience. Projected tokens are short-lived and rotated automatically, so `exp` is expected to be soon.",
      },
    ],
    tips: [
      { title: "401 vs 403", text: "401 usually means the token itself was rejected (expired, wrong issuer or audience, bad signature). 403 means it was valid but the identity lacks permission." },
      { title: "Clock skew", text: "Servers with wrong time reject valid tokens as \"not yet valid\" or expired. Check NTP on the validating system." },
      { title: "Audience must match exactly", text: "Gateways compare `aud` as an exact string. `api://orders` and `api://orders/` are different values." },
      { title: "Never log full tokens", text: "Pipeline logs and gateway debug logs are often widely readable. Log only the claims you need, never the whole token." },
    ],
    faq: [
      { q: "Why does my pipeline say 'Not authorized to perform sts:AssumeRoleWithWebIdentity'?", a: "The role's trust policy doesn't match the token's `aud` or `sub` claims. Decode the token from a debug step and compare its claims with the trust policy conditions." },
      { q: "Does this tool verify the signature?", a: "No. Verification needs the issuer's public keys (from its JWKS endpoint) and should be done by the receiving service." },
      { q: "What's the difference between this and the Security JWT Decoder?", a: "Both decode tokens. This one adds claim explanations and an automatic expiry check, and this guide focuses on pipeline, Kubernetes and gateway scenarios." },
      { q: "Is the token sent anywhere?", a: "No. Decoding runs in your browser." },
    ],
    related: [
      { href: "/security/jwt-decoder/", label: "Security JWT Decoder" },
      { href: "/devops/base64-decoder/", label: "Base64 Decoder" },
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/guides/cicd-pipeline-guide/", label: "CI/CD Pipeline Guide" },
    ],
  },

  "dockerfile-generator": {
    heading: "Building small, secure and fast Docker images",
    intro: [
      "A Dockerfile is the recipe for your container image. Small changes to it make a big difference: a multi-stage build can shrink an image from over a gigabyte to under a hundred megabytes, running as a non-root user limits the damage of a compromise, and ordering steps for the build cache turns minute-long rebuilds into seconds.",
      "The generator above writes Dockerfiles for Node.js, Astro, Python, PHP with Apache, Java with Maven, Nginx, Go and static sites, with options for multi-stage builds, a non-root user, health checks, production settings and labels. Below is how to build, check and improve the result.",
    ],
    steps: [
      "Choose the application type. The base image, commands and port fill in automatically.",
      "Adjust the build and start commands for your project.",
      "Keep Multi-stage build, Non-root user and Health check turned on.",
      "Generate the Dockerfile, add a `.dockerignore`, then build and test it with the commands below.",
    ],
    examples: [
      {
        title: "Build, run and inspect",
        code: "docker build -t acme/web:1.0.0 .\ndocker run --rm -p 8080:3000 acme/web:1.0.0\ndocker image ls acme/web            # check the size\ndocker history acme/web:1.0.0       # which layers are large?",
        text: "`docker history` shows which instruction added the most size. It's usually dependencies or build tools that should stay in the build stage.",
      },
      {
        title: "A .dockerignore keeps builds fast and safe",
        code: "node_modules\n.git\n.env\n*.log\ndist\ncoverage",
        text: "Without it, Docker sends your whole folder to the build, including `.env` secrets and `.git`, which can end up inside the image.",
      },
    ],
    tips: [
      { title: "Copy dependency files first", text: "`COPY package*.json ./` then `RUN npm ci`, then `COPY . .`. Dependencies are only reinstalled when the lock file changes." },
      { title: "Pin base image versions", text: "Use `node:22-alpine` or `python:3.12-slim`, not `latest`, so rebuilds don't change behavior unexpectedly." },
      { title: "Use exec form for CMD", text: "`CMD [\"node\", \"server.js\"]` lets the app receive stop signals and shut down cleanly. The shell form runs it under `/bin/sh`, which may not pass signals on." },
      { title: "Scan your images", text: "Tools such as Trivy or Docker Scout list known vulnerabilities in your image's packages. Rebuild regularly to pick up base-image fixes." },
    ],
    faq: [
      { q: "What is a multi-stage build?", a: "One stage has the compilers and build tools, a final stage copies only the built output. The final image is smaller and has fewer vulnerabilities." },
      { q: "Alpine or slim images?", a: "Alpine is smallest but uses musl libc, which can break some Python wheels and native modules. Debian-based `slim` images are a safer default." },
      { q: "Why does my container exit immediately?", a: "The main process finished or crashed. Run `docker logs <container>`, and make sure the start command runs in the foreground." },
      { q: "What's the difference between CMD and ENTRYPOINT?", a: "ENTRYPOINT sets the executable; CMD sets default arguments that are easy to override at `docker run`. Many images use only CMD." },
    ],
    related: [
      { href: "/devops/docker-run-generator/", label: "Docker Run Generator" },
      { href: "/devops/docker-compose-validator/", label: "Docker Compose Validator" },
      { href: "/devops/jenkinsfile-generator/", label: "Jenkinsfile Generator" },
      { href: "/kubernetes/deployment-generator/", label: "Kubernetes Deployment Generator" },
    ],
  },

  "regex-tester": {
    heading: "Regular expressions for logs, configs and validation",
    intro: [
      "Regular expressions are everywhere in operations work: searching logs with grep, extracting fields in monitoring rules, validating input, rewriting URLs in web servers and ingress controllers, and editing files with sed. This tester runs JavaScript regular expressions in your browser with live highlighting, capture groups, all the common flags (g, i, m, s, u) and a replacement preview.",
      "Below are patterns you'll use repeatedly, and the differences between regex flavors that make a pattern work here but fail in grep or sed.",
    ],
    steps: [
      "Enter your pattern without surrounding slashes, and tick the flags you need.",
      "Paste sample text, ideally real log lines or values.",
      "Check the highlighted matches and the capture groups in the match details.",
      "Optionally enter replacement text (using `$1`, `$2` for groups) and preview the result.",
    ],
    examples: [
      {
        title: "Patterns worth keeping",
        code: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b                 IPv4-looking address\n^(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] \"(\\w+) (\\S+)    Apache/Nginx access log: IP, time, method, path\n\\b(ERROR|FATAL|CRITICAL)\\b                 log severity\n^\\s*#|^\\s*$                                comment or blank line in config files",
        text: "Test each against a few real lines before using it in an alert or script.",
      },
      {
        title: "Using the same pattern on the command line",
        code: "grep -E 'ERROR|FATAL' /var/log/app.log\ngrep -P '\\d{3}' access.log             # -P enables \\d and lookarounds (GNU grep)\nsed -E 's/(user)=([^ ]+)/\\1=REDACTED/g' app.log",
        text: "`grep -E` and `sed -E` use POSIX extended regex, which has no `\\d` or lookarounds. Use `[0-9]` instead, or `grep -P` where available.",
      },
    ],
    tips: [
      { title: "Anchor your validations", text: "`\\d{3}` also matches inside \"12345\". Use `^\\d{3}$` when the whole value must match." },
      { title: "Prefer lazy or negated classes", text: "`\".*\"` grabs from the first to the last quote on the line. `\"[^\"]*\"` or `\".*?\"` stops at the next quote." },
      { title: "Escape dots in IPs and domains", text: "`.` matches any character. `example.com` also matches `exampleXcom`; write `example\\.com`." },
      { title: "Beware catastrophic backtracking", text: "Nested quantifiers such as `(a+)+` can take seconds on some inputs. Keep patterns simple in web servers and gateways, where slow regex is a denial-of-service risk." },
    ],
    faq: [
      { q: "Which regex flavor does this use?", a: "JavaScript (ECMAScript). It's close to PCRE used by many languages, but differs from POSIX grep and sed, so test there too." },
      { q: "What do the m and s flags do?", a: "`m` makes `^` and `$` match at every line break. `s` lets `.` match newlines too." },
      { q: "How do I use a capture group in the replacement?", a: "Reference it as `$1`, `$2` here and in JavaScript; in sed use `\\1`, `\\2`." },
      { q: "Is my text sent anywhere?", a: "No. Matching runs in your browser." },
    ],
    related: [
      { href: "/linux/sed-command-generator/", label: "Sed Command Generator" },
      { href: "/linux/file-finder-command/", label: "File Finder Command Generator" },
      { href: "/database/sql-formatter/", label: "SQL Formatter" },
      { href: "/devops/json-validator/", label: "JSON Validator" },
    ],
  },

  "yaml-validator": {
    heading: "Fixing YAML errors in Kubernetes, Ansible, CI and Compose files",
    intro: [
      "YAML is the configuration language of modern infrastructure: Kubernetes manifests, Helm values, Ansible playbooks, Docker Compose files, GitHub Actions and GitLab CI pipelines all use it. Its reliance on indentation and its automatic type guessing make small mistakes easy and hard to spot.",
      "This validator parses your YAML in the browser, points to the line and column of any error, reformats valid YAML consistently, and converts it to JSON so you can see exactly how it was interpreted. Below are the errors that cause most broken deployments.",
    ],
    steps: [
      "Paste your YAML or load the sample.",
      "Click Validate. If there's an error, go to the reported line and also check the line above it.",
      "Click Format to normalize indentation, or Convert to JSON to see the parsed types.",
      "Copy or download the result, then validate it with the target tool as well.",
    ],
    examples: [
      {
        title: "The Norway problem and other type surprises",
        code: "country: NO        # may become boolean false in YAML 1.1 parsers\nversion: 1.10      # becomes the number 1.1\nport: 0755         # may be read as octal 493\nzip: \"01234\"       # quoted, stays a string",
        text: "Convert to JSON to see how values were read. Quote anything that must stay text: versions, IDs, codes and values like yes/no/on/off.",
      },
      {
        title: "Validate with the tool that will use the file",
        code: "kubectl apply --dry-run=server -f deploy.yaml\nansible-playbook site.yml --syntax-check\ndocker compose config --quiet\nyamllint .",
        text: "Valid YAML can still be an invalid manifest or playbook. These commands check the structure the tool expects.",
      },
    ],
    tips: [
      { title: "Tabs are never allowed", text: "YAML forbids tab characters for indentation. Set your editor to insert spaces and show whitespace." },
      { title: "Lists under keys", text: "Items must be indented consistently under their key. Mixing two-space and four-space list indentation in one file is a frequent cause of \"bad indentation\" errors." },
      { title: "Multiple documents", text: "`---` separates documents in one file, which is common in Kubernetes. A stray `---` creates an empty document that some tools reject." },
      { title: "Multi-line strings", text: "`|` keeps line breaks (good for scripts and certificates), `>` folds lines into one paragraph." },
    ],
    faq: [
      { q: "What does 'mapping values are not allowed here' mean?", a: "Usually a missing space after a colon, or a value at the wrong indentation level. Check the reported line and the one above." },
      { q: "Is JSON valid YAML?", a: "Yes. YAML 1.2 is a superset of JSON, so JSON files parse as YAML." },
      { q: "Does this check Kubernetes schemas?", a: "It checks YAML syntax only. Use `kubectl apply --dry-run=server` or a schema validator such as kubeconform for Kubernetes fields." },
      { q: "Is my YAML uploaded?", a: "No. Everything runs in your browser." },
    ],
    related: [
      { href: "/devops/json-validator/", label: "JSON Validator" },
      { href: "/kubernetes/helm-values-validator/", label: "Helm Values Validator" },
      { href: "/devops/docker-compose-validator/", label: "Docker Compose Validator" },
      { href: "/devops/ansible-playbook-generator/", label: "Ansible Playbook Generator" },
    ],
  },

  "json-validator": {
    heading: "Validating and troubleshooting JSON in APIs and configs",
    intro: [
      "JSON is the format of nearly every API, plus many configuration files: IAM policies, package.json, Terraform variables, monitoring dashboards and logging pipelines. Unlike YAML it's strict, so a single trailing comma or wrong quote makes the whole document invalid.",
      "This validator checks JSON in your browser and shows the error position, formats it for reading, and minifies it for transport. Below are the errors people hit most, and command-line tools for working with JSON on servers.",
    ],
    steps: [
      "Paste JSON or load the sample.",
      "Click Validate and fix the error at the reported position.",
      "Use Format to make it readable, or Minify to remove whitespace.",
      "Copy or download the result.",
    ],
    examples: [
      {
        title: "The errors behind most invalid JSON",
        code: "{ 'name': 'web' }          single quotes: JSON needs double quotes\n{ \"a\": 1, }                trailing comma\n{ name: \"web\" }            unquoted key\n{ \"a\": 1 // comment }      comments aren't allowed\n{ \"n\": NaN }               NaN and Infinity aren't valid",
        text: "Many of these are fine in JavaScript, which is why JSON copied from code often fails to parse.",
      },
      {
        title: "Working with JSON on the command line",
        code: "jq . response.json                                   # validate and pretty-print\ncurl -s https://api.example.com/health | jq '.status'\njq -r '.items[].metadata.name' pods.json            # extract values\npython3 -m json.tool config.json                     # if jq isn't installed",
        text: "`jq` is the standard tool for filtering API output and Kubernetes JSON in scripts.",
      },
    ],
    tips: [
      { title: "Check the content type", text: "If an API returns HTML (such as an error page) instead of JSON, parsing fails at position 0 with \"Unexpected token <\". Look at the raw response first." },
      { title: "Large numbers lose precision", text: "JavaScript numbers can't represent integers above 2^53 exactly. Long IDs should be sent as strings." },
      { title: "Watch for a BOM", text: "Files saved by some Windows editors start with a hidden byte-order mark that breaks strict parsers. Save as UTF-8 without BOM." },
      { title: "Need comments? Use another format", text: "JSON has no comments. For hand-edited config, consider YAML, TOML or JSONC where the tool supports it." },
    ],
    faq: [
      { q: "What does 'Unexpected end of JSON input' mean?", a: "The text is incomplete: a missing closing bracket or brace, or a truncated response." },
      { q: "Is JSON the same as a JavaScript object?", a: "No. JSON is a stricter text format: double-quoted keys and strings, and no comments, functions or trailing commas." },
      { q: "Can I convert JSON to YAML?", a: "Valid JSON is already valid YAML. The YAML Validator converts in the other direction, from YAML to JSON." },
      { q: "Is my JSON sent to a server?", a: "No. Validation runs in your browser." },
    ],
    related: [
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/cloud/aws-iam-policy-generator/", label: "AWS IAM Policy Generator" },
      { href: "/devops/jwt-decoder/", label: "JWT Decoder" },
      { href: "/devops/regex-tester/", label: "Regex Tester" },
    ],
  },

  "docker-run-generator": {
    heading: "Running containers safely with docker run",
    intro: [
      "`docker run` has dozens of options, and the defaults aren't always what you want on a server: containers run as root, have no memory limit, and don't restart after a reboot. The generator above builds a complete command with name, restart policy, network, ports, volumes, environment variables, resource limits, user, read-only filesystem and other runtime options.",
      "Below is what each important option protects you from, and how to inspect and troubleshoot a container once it's running.",
    ],
    steps: [
      "Enter the image with a specific tag, and a container name.",
      "Add port mappings (`host:container`), volumes for data that must persist, and environment variables.",
      "Set a restart policy (`unless-stopped` for services), memory and CPU limits, and a non-root user if the image supports it.",
      "Generate the command, run it, and check the container with the commands below.",
    ],
    examples: [
      {
        title: "A production-style container",
        code: "docker run -d --name web --restart unless-stopped \\\n  -p 127.0.0.1:8080:80 \\\n  -v web-data:/usr/share/nginx/html:ro \\\n  --memory 512m --cpus 1 \\\n  --read-only --tmpfs /var/cache/nginx --tmpfs /var/run \\\n  nginx:1.27",
        text: "Binding the port to 127.0.0.1 keeps it reachable only from the host, for example behind a reverse proxy, instead of from the whole network.",
      },
      {
        title: "Inspecting a running container",
        code: "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'\ndocker logs --tail 100 -f web\ndocker exec -it web sh\ndocker stats --no-stream\ndocker inspect web --format '{{.State.ExitCode}} {{.State.OOMKilled}}'",
        text: "If a container keeps restarting, `docker inspect` shows the exit code and whether it was killed for exceeding its memory limit.",
      },
    ],
    tips: [
      { title: "Published ports bypass the host firewall", text: "Docker writes its own iptables rules, so `-p 8080:80` can be reachable from the network even if firewalld or ufw blocks it. Bind to 127.0.0.1 or a specific IP when you don't want that." },
      { title: "Avoid --privileged", text: "It gives the container almost full access to the host. Add only the specific capabilities needed with `--cap-add` instead." },
      { title: "Use volumes for data", text: "Anything written inside the container without a volume is lost when the container is removed. Databases always need a volume." },
      { title: "Set memory limits", text: "Without one, a leaking container can push the whole host into out-of-memory and get unrelated processes killed." },
    ],
    faq: [
      { q: "What's the difference between always and unless-stopped?", a: "Both restart after crashes and reboots. `unless-stopped` stays stopped after a reboot if you stopped it manually; `always` starts it again." },
      { q: "Named volume or bind mount?", a: "Named volumes (`-v data:/path`) are managed by Docker and portable. Bind mounts (`-v /srv/data:/path`) map a host folder, which is useful for config files you edit on the host." },
      { q: "Why can't I reach my container's port?", a: "Check that it's published with `-p`, that the app listens on 0.0.0.0 inside the container (not 127.0.0.1), and any cloud or network firewall." },
      { q: "When should I use Docker Compose instead?", a: "As soon as you have more than one container, or a long `docker run` you keep re-typing. A Compose file is easier to read, version and reuse." },
    ],
    related: [
      { href: "/devops/dockerfile-generator/", label: "Dockerfile Generator" },
      { href: "/devops/docker-compose-validator/", label: "Docker Compose Validator" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
      { href: "/network/port-checker/", label: "Port Checker" },
    ],
  },
};
