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
};
