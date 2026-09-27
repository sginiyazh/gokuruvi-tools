import type { ToolGuideContent } from "./types";

export const vmwareGuides: Record<string, ToolGuideContent> = {
  "datastore-capacity-calculator": {
    heading: "How to plan VMware datastore capacity",
    intro: [
      "A full VMFS datastore is one of the most disruptive problems in vSphere. When a thin-provisioned disk or snapshot can't grow, ESXi pauses the affected VMs with a \"no more space for virtual disk\" question until space is freed. Capacity planning catches this weeks in advance.",
      "This calculator takes the datastore's total capacity, used space and total provisioned space, plus your safety threshold and a typical VM disk size. It reports current free space, usage percentage and health status, how much space remains before the threshold, roughly how many more VMs of that size fit, and your thin-provisioning overcommit ratio.",
    ],
    steps: [
      "Find Capacity, Used (or Free) and Provisioned in the vSphere Client: select the datastore, then open Summary.",
      "Enter those values in GB.",
      "Set your safety threshold. 80% is a common policy. For reference, vCenter's default \"Datastore usage on disk\" alarm warns at 75% and turns critical at 85%.",
      "Enter your average VM disk size, then click Calculate.",
      "If the status is Approaching or Over threshold, plan expansion, Storage vMotion or clean-up before provisioning more VMs.",
    ],
    examples: [
      {
        title: "Getting the numbers with PowerCLI",
        code: "Get-Datastore | Select-Object Name,\n  @{N='CapacityGB';E={[math]::Round($_.CapacityGB)}},\n  @{N='UsedGB';E={[math]::Round($_.CapacityGB - $_.FreeSpaceGB)}},\n  @{N='ProvisionedGB';E={[math]::Round(($_.ExtensionData.Summary.Capacity - $_.ExtensionData.Summary.FreeSpace + $_.ExtensionData.Summary.Uncommitted)/1GB)}} |\n  Sort-Object UsedGB -Descending",
        text: "This lists every datastore with the three values this calculator needs.",
      },
      {
        title: "Reading the overcommit ratio",
        text: "8,000 GB capacity with 9,600 GB provisioned is a 1.2× overcommit. That's fine while used space stays well under the threshold, but if every thin disk filled up, the datastore would need 1,600 GB more than it has.",
      },
    ],
    tips: [
      { title: "Snapshots grow silently", text: "A forgotten snapshot's delta file can grow to the size of the base disk. Check `Get-VM | Get-Snapshot` regularly; snapshot sprawl is the top cause of unexpected full datastores." },
      { title: "Keep room for swap files", text: "Each powered-on VM has a .vswp file equal to its configured RAM minus its reservation. Powering on many VMs at once, for example after an HA event, consumes that space immediately." },
      { title: "Watch thin overcommit above 1.5×", text: "Higher ratios are workable only with good monitoring and a quick way to add capacity." },
      { title: "UNMAP reclaims space", text: "Space freed inside a guest isn't returned to thin storage automatically on older systems. VMFS6 performs automatic UNMAP; guests also need TRIM/discard enabled." },
    ],
    faq: [
      { q: "What datastore usage percentage is safe?", a: "Most administrators keep datastores below 80% used, which leaves room for snapshots, swap files and growth. vCenter's default alarm warns at 75% and turns critical at 85%." },
      { q: "What is provisioned space?", a: "The total size all VM disks could grow to, plus swap and other files. With thin provisioning, it can exceed the physical capacity." },
      { q: "What happens when a datastore fills up?", a: "VMs that need to write new blocks to thin disks or snapshots are paused until space is freed. Thick-provisioned VMs keep running but can't take snapshots." },
      { q: "Should I use thin or thick provisioning?", a: "Thin saves space and is the common default, but needs monitoring. Thick eager-zeroed is required for some workloads, such as Fault Tolerance and certain clustered disks." },
    ],
    related: [
      { href: "/vmware/vm-sizing-calculator/", label: "VM Sizing Calculator" },
      { href: "/vmware/snapshot-command-generator/", label: "Snapshot Command Generator" },
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
      { href: "/database/database-size-calculator/", label: "Database Size Calculator" },
    ],
  },

  "port-reference": {
    heading: "VMware vSphere network ports explained",
    intro: [
      "vSphere components talk to each other over many ports: the vSphere Client and API over HTTPS 443, ESXi management over 902, vMotion over 8000, vSAN over 2233 and 12345/23451, HA over 8182, and more. When a firewall between vCenter, hosts and storage blocks one of them, you get failures that are hard to diagnose, such as hosts that disconnect, migrations that time out, or consoles that won't open.",
      "This reference lists the ports you need most often, grouped by vCenter, ESXi host, migration, availability, vSAN, storage, provisioning, patching, logging, monitoring and time sync. Use the filter to search by component or port number.",
    ],
    steps: [
      "Type a component (for example vMotion or vSAN) or a port number into the Filter box.",
      "Note the port and protocol, and which components need to reach each other.",
      "Create firewall rules only between the networks that need them, for example the vMotion VMkernel subnet to itself.",
      "Test connectivity from the source host or appliance before blaming the application.",
    ],
    examples: [
      {
        title: "Testing ports from an ESXi host",
        code: "# From the ESXi shell\nnc -z vcenter.corp.local 443\nnc -z 10.10.20.12 8000\n\n# vmkping over a specific VMkernel interface (e.g. vMotion)\nvmkping -I vmk1 10.10.20.12",
        text: "`nc -z` tests a TCP port; `vmkping -I` tests reachability over a specific VMkernel adapter. Add `-d -s 8972` to vmkping to check that jumbo frames (MTU 9000) work end to end.",
      },
      {
        title: "Checking the ESXi firewall",
        code: "esxcli network firewall ruleset list\nesxcli network firewall ruleset set --ruleset-id=sshServer --enabled=true",
        text: "ESXi has its own firewall. Services such as SSH, NFS client and syslog need their rule set enabled on the host as well.",
      },
    ],
    tips: [
      { title: "Port 902 is easy to forget", text: "vCenter uses TCP 902 to manage hosts and to send heartbeats (UDP 902), and it's also used for VM console and NFC traffic. Block it and hosts show as disconnected." },
      { title: "Isolate vMotion and vSAN", text: "vMotion traffic isn't encrypted by default and vSAN carries storage data. Keep them on dedicated, non-routed VLANs." },
      { title: "Versions differ", text: "Port requirements change between vSphere versions and optional products. Confirm with Broadcom's official Ports and Protocols tool (ports.broadcom.com) for your exact release." },
      { title: "Time sync matters", text: "NTP (UDP 123) problems cause SSO token failures and certificate errors. All hosts and vCenter should use the same time sources." },
    ],
    faq: [
      { q: "What port does vMotion use?", a: "TCP 8000 between the vMotion VMkernel interfaces of the source and destination hosts. Storage vMotion and cold migrations can also use NFC on TCP 902." },
      { q: "Which ports does vCenter need to reach ESXi?", a: "Mainly TCP 443 and 902, plus UDP 902 for heartbeats. ESXi hosts need TCP 443 to vCenter." },
      { q: "What is port 5480 used for?", a: "It's the vCenter Server Appliance Management Interface (VAMI), used for appliance updates, backups and network settings." },
      { q: "Do I need to open ports to the internet?", a: "Only for optional features such as online patch downloads or Skyline. vCenter and ESXi management should never be reachable from the internet." },
    ],
    related: [
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
      { href: "/network/port-checker/", label: "Port Checker" },
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
      { href: "/database/database-port-reference/", label: "Database Port Reference" },
    ],
  },

  "powercli-command-generator": {
    heading: "How to use the PowerCLI Command Generator",
    intro: [
      "VMware PowerCLI is the PowerShell module for managing vCenter and ESXi. Anything you can click in the vSphere Client can be scripted, which makes it the fastest way to check or change many VMs at once and to make changes that can be repeated and audited.",
      "This generator builds ready-to-run commands for the tasks administrators do every day: connecting to vCenter, reading VM details, graceful power operations, snapshots, vMotion and Storage vMotion, resizing CPU and memory, checking datastore free space and putting hosts into maintenance mode.",
    ],
    steps: [
      "Install PowerCLI once with `Install-Module VMware.PowerCLI -Scope CurrentUser`.",
      "Choose an action, then fill in the vCenter server, VM name and target (destination host, datastore or snapshot name).",
      "For resize actions, enter the new vCPU count and RAM in GB.",
      "Generate the command, run `Connect-VIServer` first, then run the generated command.",
    ],
    examples: [
      {
        title: "First-time setup",
        code: "Install-Module VMware.PowerCLI -Scope CurrentUser\nSet-PowerCLIConfiguration -Scope User -ParticipateInCEIP $false -Confirm:$false\n# Lab only: accept self-signed certificates\nSet-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false\nConnect-VIServer -Server vcenter.corp.local",
        text: "In production, install vCenter's root CA certificate on your workstation instead of ignoring certificate errors.",
      },
      {
        title: "Running the same action on many VMs",
        code: "Get-VM -Name 'web-*' | Where-Object PowerState -eq 'PoweredOn' |\n  New-Snapshot -Name 'pre-patch' -Memory:$false -Quiesce:$true",
        text: "PowerCLI cmdlets accept pipeline input, so the generated command can be extended to a group of VMs with a wildcard or filter.",
      },
    ],
    tips: [
      { title: "Shutdown-VMGuest vs Stop-VM", text: "The generator uses `Shutdown-VMGuest`, a clean OS shutdown that needs VMware Tools. `Stop-VM` is like pulling the power cable, so use it only when the guest is hung." },
      { title: "CPU and memory hot-add", text: "Resizing a running VM only works if CPU/memory hot-add is enabled and the guest OS supports it. Otherwise, shut the VM down first. Reducing resources always needs a power-off." },
      { title: "Use -WhatIf", text: "Many PowerCLI cmdlets support `-WhatIf`, which shows what would change without doing it. Use it before bulk operations." },
      { title: "Disconnect when finished", text: "Run `Disconnect-VIServer -Confirm:$false` at the end of scripts so sessions don't pile up on vCenter." },
    ],
    faq: [
      { q: "Does PowerCLI work on Linux and macOS?", a: "Yes. PowerCLI runs on PowerShell 7 on Windows, Linux and macOS." },
      { q: "Can I connect directly to an ESXi host?", a: "Yes. Use `Connect-VIServer` with the host name. Features that need vCenter, such as vMotion and DRS, won't be available." },
      { q: "Why does vMotion fail from PowerCLI?", a: "The same checks apply as in the GUI: shared storage (or Storage vMotion), compatible CPUs or EVC, and a working vMotion network. Check the vCenter task for the exact error." },
      { q: "How do I list VMs with snapshots older than 3 days?", a: "`Get-VM | Get-Snapshot | Where-Object Created -lt (Get-Date).AddDays(-3) | Select VM, Name, Created, SizeGB`." },
    ],
    related: [
      { href: "/vmware/snapshot-command-generator/", label: "Snapshot Command Generator" },
      { href: "/vmware/vm-sizing-calculator/", label: "VM Sizing Calculator" },
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
    ],
  },

  "snapshot-command-generator": {
    heading: "How to manage VMware snapshots safely",
    intro: [
      "A VMware snapshot preserves a VM's disk state, and optionally its memory, at a point in time so you can roll back after a failed patch or change. It's a short-term safety net, not a backup. Every write after the snapshot goes into a growing delta file, and long chains hurt performance and fill datastores.",
      "This generator builds PowerCLI commands to create, list, remove one, remove all, revert and consolidate snapshots. For create, you can choose whether to include memory and whether to quiesce the guest file system with VMware Tools.",
    ],
    steps: [
      "Connect to vCenter with `Connect-VIServer`.",
      "Choose the operation and enter the VM name and, where needed, the snapshot name.",
      "For create, tick Memory if you need to return to the running state, and Quiesce for application-consistent disks.",
      "Generate and run the command, then confirm the result in the VM's Snapshots view.",
    ],
    examples: [
      {
        title: "Pre-patch snapshot routine",
        code: "New-Snapshot -VM 'app-server-01' -Name 'pre-patch-2026-09' -Description 'Before September patching' -Memory:$false -Quiesce:$true\n# ...patch and test...\nGet-Snapshot -VM 'app-server-01' -Name 'pre-patch-2026-09' | Remove-Snapshot -Confirm:$false",
        text: "Take the snapshot, patch, test, then delete it within 24–72 hours once you're confident. Put the date in the name so stale snapshots are easy to spot.",
      },
      {
        title: "Finding snapshot sprawl across vCenter",
        code: "Get-VM | Get-Snapshot | Select-Object VM, Name, Created, @{N='SizeGB';E={[math]::Round($_.SizeGB,1)}} | Sort-Object Created",
        text: "Run this weekly, or schedule it and email the output. Anything older than a few days needs an owner and a plan.",
      },
    ],
    tips: [
      { title: "Snapshots are not backups", text: "They depend on the original base disk. If the base disk or datastore is lost, the snapshot is useless. Use a real backup product as well." },
      { title: "Keep chains short", text: "VMware recommends no more than 2–3 snapshots in a chain, and removing them within 72 hours. Each extra level adds I/O overhead." },
      { title: "Memory snapshots are large and stun the VM", text: "Including memory writes the VM's full RAM to disk and pauses the VM briefly. Skip it unless you need to return to the exact running state." },
      { title: "Consolidate when prompted", text: "If vCenter shows \"Virtual machine disks consolidation is needed\", leftover delta files remain after a failed delete, often from backup software. Run the consolidate command." },
    ],
    faq: [
      { q: "Does deleting a snapshot lose my changes?", a: "No. Deleting (removing) a snapshot merges its changes into the base disk and keeps the current state. Reverting is what discards changes." },
      { q: "Why does removing a large snapshot take so long?", a: "All the changed blocks must be merged into the parent disk. A 200 GB delta can take a long time on busy storage. Schedule large removals off-peak." },
      { q: "What does quiescing do?", a: "VMware Tools asks the guest to flush file system buffers, and on Windows, to use VSS writers, so the disk state is application-consistent." },
      { q: "Can I snapshot a VM with independent disks?", a: "Independent disks are excluded from snapshots by design. Their contents aren't captured or reverted." },
    ],
    related: [
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
      { href: "/windows/hyperv-command-generator/", label: "Hyper-V Command Generator" },
      { href: "/database/backup-command-generator/", label: "Database Backup Command Generator" },
    ],
  },

  "vm-sizing-calculator": {
    heading: "How to estimate vSphere cluster capacity",
    intro: [
      "Before you buy hosts or promise a project team 200 new VMs, you need to know how many VMs your cluster can really run. This calculator estimates it from your hosts' CPU cores and RAM, your overcommit ratios, the HA reserve and a typical VM size.",
      "It first removes the HA reserve hosts, then multiplies the remaining physical cores and RAM by your vCPU:pCPU and vRAM:pRAM ratios. It divides that capacity by the VM size for both CPU and memory, and the smaller of the two results is your maximum. It also tells you whether CPU or RAM is the limiting resource, which shows which one to buy more of.",
    ],
    steps: [
      "Enter the number of hosts and how many to keep in reserve for HA. N+1 is the minimum; N+2 allows for maintenance during a failure.",
      "Enter physical cores per host. Count real cores, not hyper-threads.",
      "Enter RAM per host and your overcommit ratios. 4:1 CPU and 1:1 to 1.25:1 RAM are typical starting points for general workloads.",
      "Enter the vCPU and RAM of a typical VM, then click Calculate.",
    ],
    examples: [
      {
        title: "Worked example",
        text: "4 hosts with N+1 leaves 3 usable. 3 × 32 cores × 4:1 = 384 vCPUs; 3 × 512 GB × 1.25 = 1,920 GB vRAM. For 4 vCPU / 16 GB VMs, that's 96 VMs by CPU and 120 by RAM, so the cluster supports about 96 VMs and CPU is the bottleneck.",
      },
      {
        title: "Checking real overcommit today",
        code: "Get-Cluster 'Prod' | Get-VMHost | ForEach-Object {\n  $vms = $_ | Get-VM | Where-Object PowerState -eq 'PoweredOn'\n  [pscustomobject]@{ Host = $_.Name\n    vCPUperCore = [math]::Round(($vms | Measure-Object NumCpu -Sum).Sum / $_.NumCpu, 2)\n    vRAMperRAM  = [math]::Round(($vms | Measure-Object MemoryGB -Sum).Sum / $_.MemoryTotalGB, 2) }\n}",
        text: "Compare your current ratios with the ones you plan to use. If CPU ready time is already high at 3:1, 5:1 won't work for you.",
      },
    ],
    tips: [
      { title: "Watch CPU Ready, not just ratios", text: "The right vCPU:pCPU ratio depends on the workload. CPU Ready above about 5% per vCPU means VMs are waiting for CPU time." },
      { title: "Be conservative with RAM overcommit", text: "Memory overcommit relies on ballooning, compression and swapping, which hurt performance. Many teams plan for 1:1 on production databases." },
      { title: "Right-size VMs first", text: "Oversized VMs waste capacity. A VM with 8 vCPUs that uses 10% CPU schedules less efficiently than the same VM with 2." },
      { title: "Leave headroom", text: "Plan to run at 70–80% of the calculated maximum so the cluster can absorb peaks, growth and DRS balancing." },
    ],
    faq: [
      { q: "What is a good vCPU to pCPU ratio?", a: "Around 3:1 to 5:1 for general server workloads and 1:1 to 2:1 for latency-sensitive databases. VDI can go higher. Measure CPU Ready to confirm." },
      { q: "Should hyper-threads count as cores?", a: "No. Plan with physical cores. Hyper-threading adds some throughput (roughly 10–30%) but not a full core's worth." },
      { q: "Why reserve hosts for HA?", a: "If a host fails, its VMs restart on the remaining hosts. Without spare capacity, they can't all power back on." },
      { q: "Does this include vSAN or ESXi overhead?", a: "No. Reserve extra RAM for the hypervisor and services like vSAN (often 10% or more per host) when you enter host RAM." },
    ],
    related: [
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
      { href: "/vmware/port-reference/", label: "VMware Port Reference" },
      { href: "/windows/hyperv-command-generator/", label: "Hyper-V Command Generator" },
    ],
  },
};
