import type { ToolGuideContent } from "./types";

export const kubernetesGuides: Record<string, ToolGuideContent> = {
  "secret-generator": {
    heading: "Kubernetes Secrets in practice: creating, using and protecting them",
    intro: [
      "A Kubernetes Secret stores sensitive values such as passwords, API tokens, registry credentials, TLS certificates and SSH keys, separately from your container images and Deployment manifests. The generator above builds the YAML for the five common types: generic (Opaque), basic-auth, docker-registry (`kubernetes.io/dockerconfigjson`), TLS and SSH, with optional labels, annotations and immutability.",
      "The most important thing to understand is that Secret values are only Base64-encoded, not encrypted. Below is how to use Secrets in pods and how to keep them actually secret.",
    ],
    steps: [
      "Choose the Secret type or click a preset.",
      "Enter the name, namespace and the values. For TLS, paste the certificate and private key in PEM format.",
      "Generate the YAML, review it, and apply it with `kubectl apply -f secret.yaml`.",
      "Click Clear Sensitive Values when you've finished, and don't commit the file to Git.",
    ],
    examples: [
      {
        title: "Creating the same Secrets with kubectl",
        code: "kubectl create secret generic db-credentials -n app \\\n  --from-literal=username=app_user --from-literal=password='S3cret!'\n\nkubectl create secret docker-registry regcred -n app \\\n  --docker-server=registry.example.com --docker-username=ci --docker-password=\"$TOKEN\"\n\nkubectl create secret tls web-tls -n app --cert=tls.crt --key=tls.key",
        text: "Add `--dry-run=client -o yaml` to any of these to produce YAML instead of creating the Secret directly.",
      },
      {
        title: "Using a Secret in a pod",
        code: "env:\n  - name: DB_PASSWORD\n    valueFrom:\n      secretKeyRef:\n        name: db-credentials\n        key: password\nimagePullSecrets:\n  - name: regcred",
        text: "Environment variables are read once at container start. Secrets mounted as volume files are updated automatically when the Secret changes (unless mounted with subPath).",
      },
    ],
    tips: [
      { title: "Base64 is not encryption", text: "Anyone who can `kubectl get secret -o yaml` can decode the values. Limit access with RBAC, and enable encryption at rest for etcd." },
      { title: "Never commit Secret YAML to Git", text: "Use Sealed Secrets, SOPS, or an external secrets manager (Vault, AWS Secrets Manager, Azure Key Vault) with the External Secrets Operator." },
      { title: "Secrets are namespaced", text: "A pod can only use Secrets from its own namespace. \"secret not found\" errors are often a namespace mismatch." },
      { title: "Immutable Secrets", text: "`immutable: true` prevents accidental edits and reduces load on the API server. To change one, create a new Secret with a new name and update the workload." },
    ],
    faq: [
      { q: "How do I read a Secret's value?", a: "`kubectl get secret db-credentials -n app -o jsonpath='{.data.password}' | base64 -d`." },
      { q: "What's the difference between data and stringData?", a: "`data` values must be Base64-encoded. `stringData` accepts plain text, and Kubernetes encodes it when the Secret is stored." },
      { q: "Why does my pod show ImagePullBackOff with a registry Secret?", a: "Check the Secret is in the pod's namespace, is listed under `imagePullSecrets`, and contains the right registry server name exactly as used in the image reference." },
      { q: "Do pods pick up a changed Secret automatically?", a: "Mounted files update after a short delay; environment variables don't. Restart the Deployment with `kubectl rollout restart deployment/<name>`." },
    ],
    related: [
      { href: "/devops/base64-encoder/", label: "Base64 Encoder" },
      { href: "/kubernetes/namespace-generator/", label: "Namespace Generator" },
      { href: "/kubernetes/deployment-generator/", label: "Deployment Generator" },
      { href: "/network/password-generator/", label: "Password Generator" },
    ],
  },

  "namespace-generator": {
    heading: "Setting up namespaces with quotas, limits and Pod Security",
    intro: [
      "A namespace is more than a folder for resources. With the right settings it becomes a safe boundary for a team or environment: a ResourceQuota caps how much CPU, memory, storage and objects it can use, a LimitRange gives every container sensible default requests and limits, and Pod Security Admission labels block risky pod settings.",
      "The generator above produces all of these in one YAML file, with presets for basic, development, production and restricted namespaces. Below is how they interact, and the errors you'll see when a quota or policy blocks a deployment.",
    ],
    steps: [
      "Choose a preset or enter the namespace name, labels and annotations.",
      "Enable Pod Security Admission and choose the enforce level. Restricted is best for application namespaces.",
      "Add a ResourceQuota and a LimitRange with values that suit the team's workloads.",
      "Generate the YAML and apply it with `kubectl apply -f namespace.yaml`.",
    ],
    examples: [
      {
        title: "Checking quota usage",
        code: "kubectl describe resourcequota -n team-a\n# Resource         Used   Hard\n# limits.memory    6Gi    8Gi\n# pods             14     20\n# requests.cpu     3      4",
        text: "When Used reaches Hard, new pods are rejected. This is the first thing to check when a deployment suddenly stops scaling.",
      },
      {
        title: "Testing Pod Security before enforcing it",
        code: "kubectl label --dry-run=server --overwrite ns team-a \\\n  pod-security.kubernetes.io/enforce=restricted",
        text: "The server-side dry run lists which existing pods would violate the restricted level, without changing anything.",
      },
    ],
    tips: [
      { title: "Quotas require requests and limits", text: "Once a quota covers CPU or memory, every pod must declare requests and limits, or it's rejected. A LimitRange with defaults prevents those errors." },
      { title: "Start with warn and audit", text: "Set the `warn` and `audit` Pod Security levels to restricted first, fix the warnings, then switch `enforce`." },
      { title: "Namespaces aren't network isolation", text: "By default pods in different namespaces can talk to each other. Add NetworkPolicies for real isolation." },
      { title: "Deleting a namespace deletes everything in it", text: "Including Secrets and PVCs. Double-check the context with `kubectl config current-context` before `kubectl delete ns`." },
    ],
    faq: [
      { q: "Why is my pod 'forbidden: exceeded quota'?", a: "The namespace's ResourceQuota has no room left. Check usage with `kubectl describe resourcequota -n <ns>` and lower requests or raise the quota." },
      { q: "Why is my pod 'forbidden: violates PodSecurity'?", a: "It uses a setting the namespace's level doesn't allow, such as running as root or privilege escalation. The error lists the fields to fix in the pod's securityContext." },
      { q: "What's the difference between ResourceQuota and LimitRange?", a: "ResourceQuota limits the namespace's total. LimitRange sets defaults and min/max values for each individual container." },
      { q: "Why is my namespace stuck in Terminating?", a: "Usually a resource with a finalizer that its controller can't remove. Find it with `kubectl api-resources --verbs=list --namespaced -o name | xargs -n1 kubectl get -n <ns> --ignore-not-found`." },
    ],
    related: [
      { href: "/kubernetes/deployment-generator/", label: "Deployment Generator" },
      { href: "/kubernetes/secret-generator/", label: "Secret Generator" },
      { href: "/kubernetes/configmap-generator/", label: "ConfigMap Generator" },
      { href: "/guides/kubernetes-deployment-guide/", label: "Kubernetes Deployment Guide" },
    ],
  },

  "pvc-generator": {
    heading: "Persistent storage in Kubernetes: PVCs, access modes and troubleshooting",
    intro: [
      "A PersistentVolumeClaim (PVC) is how a pod asks for storage that survives restarts and rescheduling. The generator above builds a claim with size, StorageClass, access mode, volume mode, optional label selector for an existing PersistentVolume, cloning or snapshot restore, and an optional test pod that mounts it.",
      "Most storage problems come from three things: no default StorageClass, an access mode the storage can't provide, or a volume that's bound to one node or zone. Below is how to spot each one.",
    ],
    steps: [
      "Choose a preset or set the name, namespace and size (for example `10Gi`).",
      "Set the StorageClass, or leave it empty to use the cluster default. Check available classes with `kubectl get storageclass`.",
      "Choose the access mode. Most block storage supports only ReadWriteOnce.",
      "Generate the YAML, apply it, and check it reaches the Bound status.",
    ],
    examples: [
      {
        title: "Checking that the claim bound",
        code: "kubectl get pvc -n app\n# NAME       STATUS    VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS\n# app-data   Bound     pvc-3f1c...    10Gi       RWO            gp3\nkubectl describe pvc app-data -n app      # Events explain a Pending claim",
        text: "A claim stuck in Pending always has a reason in its Events: no matching class, provisioner errors, or waiting for a pod (WaitForFirstConsumer).",
      },
      {
        title: "Growing a volume",
        code: "kubectl get storageclass gp3 -o jsonpath='{.allowVolumeExpansion}'\nkubectl patch pvc app-data -n app -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"20Gi\"}}}}'",
        text: "Expansion only works if the StorageClass allows it. PVCs can grow but never shrink.",
      },
    ],
    tips: [
      { title: "RWX needs shared storage", text: "ReadWriteMany requires a file-based backend such as NFS, CephFS, Azure Files or EFS. Cloud block disks (EBS, Azure Disk, vSphere CSI block volumes) are ReadWriteOnce." },
      { title: "WaitForFirstConsumer is normal", text: "Many classes create the volume only when a pod uses the claim, so the right zone is chosen. Pending until then isn't an error." },
      { title: "Check the reclaim policy", text: "With `Delete`, removing the PVC also deletes the disk and its data. Use `Retain` for important data, or back it up first." },
      { title: "Zones and nodes matter", text: "A disk created in one availability zone can only attach to nodes in that zone. Pods that can't schedule after a node failure are often waiting for a node in the right zone." },
    ],
    faq: [
      { q: "What's the difference between a PV and a PVC?", a: "A PersistentVolume is the actual storage. A PVC is the request for it. With dynamic provisioning, creating the PVC creates the PV automatically." },
      { q: "Why is my PVC stuck in Pending?", a: "Run `kubectl describe pvc` and read the Events. Common causes are no default StorageClass, a misspelled class name, an unsupported access mode, or WaitForFirstConsumer." },
      { q: "Can two pods use the same RWO volume?", a: "Only if they run on the same node. Use ReadWriteOncePod to guarantee a single pod, or RWX storage for many." },
      { q: "Why does the pod say 'Multi-Attach error'?", a: "The RWO volume is still attached to another node, often after a node failure. It clears when the old attachment times out or the old pod is fully removed." },
    ],
    related: [
      { href: "/kubernetes/deployment-generator/", label: "Deployment Generator" },
      { href: "/kubernetes/namespace-generator/", label: "Namespace Generator" },
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
      { href: "/guides/kubernetes-deployment-guide/", label: "Kubernetes Deployment Guide" },
    ],
  },

  "helm-values-validator": {
    heading: "Validating Helm values before you deploy",
    intro: [
      "Helm charts are configured through `values.yaml`, and a single indentation error or wrong type can produce a broken release, or a release that deploys but silently ignores your settings. This validator checks your values file is valid YAML, highlights the error location, and can reformat the file consistently. The examples include basic chart, Deployment and Ingress values, plus an intentionally invalid file to show what errors look like.",
      "YAML validity is only the first check. Below are the Helm commands that confirm the chart actually renders what you expect before anything reaches the cluster.",
    ],
    steps: [
      "Paste your `values.yaml` or load an example.",
      "Click Validate YAML and fix any error at the line it reports.",
      "Click Format YAML for consistent indentation, then copy or download the file.",
      "Render and test it against the chart with the commands below before installing.",
    ],
    examples: [
      {
        title: "Checking a release before it touches the cluster",
        code: "helm show values bitnami/nginx > default-values.yaml       # see every supported key\nhelm lint ./mychart -f values.yaml\nhelm template myapp ./mychart -f values.yaml > rendered.yaml\nhelm upgrade --install myapp ./mychart -f values.yaml -n app --dry-run=server",
        text: "`helm template` shows the exact manifests your values produce, and the server-side dry run asks the API server to validate them without creating anything.",
      },
      {
        title: "A typo Helm won't warn you about",
        code: "replicaCount: 3\nresource:            # chart expects \"resources\"\n  limits:\n    memory: 512Mi",
        text: "This is valid YAML, so it passes validation, but the chart ignores the unknown key and your limits never apply. Compare your keys with `helm show values`, or use a chart that ships a `values.schema.json`.",
      },
    ],
    tips: [
      { title: "Spaces only", text: "YAML forbids tabs for indentation. Configure your editor to insert two spaces." },
      { title: "Quote values that look like other types", text: "`version: 1.10` becomes the number 1.1, and `enabled: yes` may become a boolean. Quote strings: `\"1.10\"`, `\"yes\"`." },
      { title: "Later files win", text: "With `-f base.yaml -f prod.yaml`, prod values override base. `--set` overrides both. Keep environment differences in small override files." },
      { title: "See what's deployed", text: "`helm get values myapp -n app` shows the values the running release actually uses, which is useful when the cluster doesn't match your file." },
    ],
    faq: [
      { q: "Does this validate against my chart's schema?", a: "It checks YAML syntax and structure. To validate against the chart, run `helm lint` and `helm template`; charts with `values.schema.json` will also reject wrong types." },
      { q: "What does 'mapping values are not allowed here' mean?", a: "Almost always wrong indentation or a missing space after a colon. Check the line reported and the one above it." },
      { q: "How do I see what changed before upgrading?", a: "Install the helm-diff plugin and run `helm diff upgrade myapp ./mychart -f values.yaml`." },
      { q: "How do I roll back a bad release?", a: "`helm history myapp -n app` lists revisions, and `helm rollback myapp <revision> -n app` restores one." },
    ],
    related: [
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/kubernetes/deployment-generator/", label: "Deployment Generator" },
      { href: "/kubernetes/ingress-generator/", label: "Ingress Generator" },
      { href: "/guides/kubernetes-deployment-guide/", label: "Kubernetes Deployment Guide" },
    ],
  },

  "service-generator": {
    heading: "Choosing a Service type and fixing Services that don't route",
    intro: [
      "A Service gives a set of pods one stable name and IP address, and load-balances traffic across them. The generator above supports all the types: ClusterIP for internal traffic, NodePort to expose a port on every node, LoadBalancer for a cloud or MetalLB load balancer, ExternalName for a DNS alias, and headless Services for StatefulSets. It also covers session affinity, external traffic policy, dual-stack settings and annotations.",
      "Below is when to use each type, and a checklist for the most common problem: a Service that exists but sends traffic nowhere.",
    ],
    steps: [
      "Choose the type or click a preset.",
      "Set the selector labels so they exactly match the labels on your pods.",
      "Set the Service port (what clients connect to) and the target port (what the container listens on).",
      "Generate the YAML, apply it, and check that the Service has endpoints.",
    ],
    examples: [
      {
        title: "Does the Service have endpoints?",
        code: "kubectl get endpointslices -n app -l kubernetes.io/service-name=web\nkubectl get pods -n app -l app=web --show-labels\nkubectl run tmp -n app --rm -it --image=busybox -- wget -qO- http://web:80",
        text: "No endpoints means the selector doesn't match any ready pod. The temporary pod tests the Service from inside the cluster.",
      },
      {
        title: "Which type should I use?",
        code: "ClusterIP      internal only: app-to-app and databases (the default)\nNodePort       quick external access on <nodeIP>:30000-32767, mostly labs\nLoadBalancer   production external access via a cloud LB or MetalLB\nHeadless       clusterIP: None, DNS returns pod IPs, used by StatefulSets\nExternalName   DNS alias to a service outside the cluster",
        text: "For HTTP and HTTPS websites, expose a ClusterIP Service through an Ingress or Gateway instead of one LoadBalancer per app.",
      },
    ],
    tips: [
      { title: "port vs targetPort", text: "`port` is what clients use; `targetPort` must match the container's listening port (or its named port). A mismatch gives connection refused even though endpoints exist." },
      { title: "Labels must match exactly", text: "A selector of `app: web` doesn't match pods labeled `app: web-frontend`. Check with `--show-labels`." },
      { title: "Readiness affects endpoints", text: "Pods that fail their readiness probe are removed from the Service. If endpoints disappear under load, check the probe." },
      { title: "externalTrafficPolicy: Local", text: "It preserves the client's source IP and avoids an extra hop, but nodes without a matching pod don't serve traffic, so spread pods across nodes." },
    ],
    faq: [
      { q: "How do I reach a Service from another namespace?", a: "Use its DNS name `<service>.<namespace>.svc.cluster.local`, or `<service>.<namespace>` for short." },
      { q: "Why is my LoadBalancer's EXTERNAL-IP stuck at pending?", a: "The cluster has no load balancer integration. On bare metal or vSphere without a cloud provider, install MetalLB or use an Ingress or Gateway controller." },
      { q: "Can a NodePort be any number?", a: "By default it must be in 30000–32767. Leave it empty to let Kubernetes choose a free one." },
      { q: "How do I test a Service from my laptop?", a: "`kubectl port-forward svc/web 8080:80 -n app`, then open http://localhost:8080." },
    ],
    related: [
      { href: "/kubernetes/ingress-generator/", label: "Ingress Generator" },
      { href: "/kubernetes/deployment-generator/", label: "Deployment Generator" },
      { href: "/network/port-checker/", label: "Port Checker" },
      { href: "/guides/kubernetes-deployment-guide/", label: "Kubernetes Deployment Guide" },
    ],
  },

  "ingress-generator": {
    heading: "Exposing apps with Ingress: TLS, paths and troubleshooting",
    intro: [
      "An Ingress routes external HTTP and HTTPS traffic to Services inside the cluster by hostname and path, so many apps can share one load balancer and one set of TLS certificates. The generator above builds the Ingress with class name, host, multiple paths, TLS with optional cert-manager issuer, HTTPS redirects, and common controller annotations for rewrites, regex paths, WebSockets, CORS, body size, timeouts and backend protocol.",
      "An Ingress resource does nothing on its own. It needs an Ingress controller running in the cluster, and the annotations you can use depend on which controller that is.",
    ],
    steps: [
      "Choose a preset, then set the name, namespace and the Ingress class of your controller (`kubectl get ingressclass`).",
      "Set the hostname and add one path per backend Service, with the Service name and port.",
      "Enable TLS and give a Secret name, and add a cert-manager issuer if you want certificates issued automatically.",
      "Generate the YAML, apply it, and test with the commands below.",
    ],
    examples: [
      {
        title: "Testing an Ingress before DNS is ready",
        code: "kubectl get ingress -n app                         # ADDRESS shows the controller's IP\ncurl -sv --resolve app.example.com:443:203.0.113.10 https://app.example.com/\nkubectl describe ingress web -n app                # events and backend status",
        text: "`--resolve` sends the request to the controller's IP with the right hostname, so you can test routing and certificates before changing DNS.",
      },
      {
        title: "Automatic certificates with cert-manager",
        code: "metadata:\n  annotations:\n    cert-manager.io/cluster-issuer: letsencrypt-prod\nspec:\n  tls:\n    - hosts: [app.example.com]\n      secretName: app-example-tls",
        text: "cert-manager sees the annotation, completes the ACME challenge and stores the certificate in the named Secret. `kubectl get certificate -n app` shows its status.",
      },
    ],
    tips: [
      { title: "ingress-nginx has been retired", text: "The community ingress-nginx controller reached end of maintenance in March 2026 and no longer receives fixes. Existing installs keep working, but plan a move to a maintained controller (for example Traefik, HAProxy, a vendor NGINX build, or your cloud's controller) or to the Gateway API. The nginx.ingress.kubernetes.io annotations only work with that controller." },
      { title: "404 from the controller", text: "The host or path didn't match any rule. Check the Host header, the pathType (Prefix vs Exact) and the ingressClassName." },
      { title: "502 or 503 errors", text: "The Ingress matched but the Service has no ready endpoints, or the port is wrong. Check the Service as in the Service Generator guide." },
      { title: "Rewrites change paths", text: "With rewrite-target, `/api/users` may reach the app as `/users`. If the app returns 404s for valid pages, check what path it actually receives." },
    ],
    faq: [
      { q: "What's the difference between an Ingress and a LoadBalancer Service?", a: "A LoadBalancer exposes one Service on its own address. An Ingress shares one entry point between many Services, routing by host and path, and handles TLS centrally." },
      { q: "Should I use Ingress or the Gateway API?", a: "Ingress is widely supported and fine for simple HTTP routing. The Gateway API is its newer, more expressive successor, and the better choice for new platforms." },
      { q: "Why is my certificate not issued?", a: "Check `kubectl describe certificate` and the cert-manager logs. Common causes are DNS not pointing at the controller yet, or the HTTP-01 challenge path blocked by a redirect or firewall." },
      { q: "How do I increase the upload size limit?", a: "With an NGINX-based controller, set the proxy body size annotation, for example `nginx.ingress.kubernetes.io/proxy-body-size: 50m`. Other controllers use their own settings." },
    ],
    related: [
      { href: "/kubernetes/service-generator/", label: "Service Generator" },
      { href: "/kubernetes/secret-generator/", label: "Secret Generator" },
      { href: "/network/ssl-checker/", label: "SSL Certificate Checker" },
      { href: "/guides/kubernetes-deployment-guide/", label: "Kubernetes Deployment Guide" },
    ],
  },
};
