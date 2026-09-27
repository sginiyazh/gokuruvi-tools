import type { ToolGuideContent } from "./types";

export const windowsGuides: Record<string, ToolGuideContent> = {
  "robocopy-generator": {
    heading: "How to use Robocopy for migrations and backups",
    intro: [
      "Robocopy (Robust File Copy) is built into every modern version of Windows and Windows Server. It's the standard tool for file server migrations, because it retries failed files, resumes interrupted copies, keeps NTFS permissions and timestamps, copies with many threads at once, and writes a detailed log.",
      "This generator builds a command from your source and destination, copy mode (`/E` copies all subfolders, `/MIR` mirrors the source exactly), thread count (`/MT`), retry count and wait time (`/R` and `/W`), and optional security copy (`/COPY:DATSOU`), restartable mode (`/Z`), exclude-older (`/XO`) and a log file (`/LOG+`).",
    ],
    steps: [
      "Enter the source and destination paths. UNC paths such as `\\\\fileserver\\share` work too.",
      "Choose Copy all subfolders for a normal copy, or Mirror source for a final sync that must match exactly.",
      "Set threads (8–32 is typical), retries and wait. The Windows defaults of 1 million retries and 30 seconds' wait are far too long.",
      "Tick Copy security when migrating file shares so NTFS permissions come across.",
      "Generate the command, then run it from an elevated Command Prompt or PowerShell.",
    ],
    examples: [
      {
        title: "Two-phase file server migration",
        code: ":: Phase 1: bulk copy days before cut-over\nrobocopy \"\\\\old-fs\\data\" \"\\\\new-fs\\data\" *.* /E /COPY:DATSOU /R:2 /W:3 /MT:16 /Z /LOG+:\"C:\\Temp\\phase1.log\"\n\n:: Phase 2: final delta sync during the cut-over window\nrobocopy \"\\\\old-fs\\data\" \"\\\\new-fs\\data\" *.* /MIR /COPY:DATSOU /R:2 /W:3 /MT:16 /LOG+:\"C:\\Temp\\final.log\"",
        text: "The first pass moves most of the data while users keep working. The final pass only copies changes, so the outage is short.",
      },
      {
        title: "Dry run with /L",
        code: "robocopy \"D:\\Data\" \"E:\\Data\" *.* /MIR /L /NP /LOG:\"C:\\Temp\\preview.log\"",
        text: "`/L` lists what would be copied or deleted without touching anything. Always preview a `/MIR` before running it for real.",
      },
    ],
    tips: [
      { title: "/MIR deletes files", text: "Mirror removes anything in the destination that isn't in the source. If you swap source and destination by mistake, you can wipe the good copy." },
      { title: "Exit codes 0–7 are success", text: "Robocopy returns 0 (nothing to copy), 1 (files copied) or up to 7 for various non-error states. 8 and above means failures. Scheduled tasks and scripts should treat `< 8` as success." },
      { title: "Copying security needs rights", text: "`/COPY:DATSOU` needs administrator rights and, for auditing info (U), the Manage auditing and security log privilege. Use `/COPY:DATS` if you get access errors." },
      { title: "/Z is slower", text: "Restartable mode protects large files on unreliable links but adds overhead. For fast LAN copies of many small files, leave it off." },
    ],
    faq: [
      { q: "What does /MT do?", a: "It copies several files in parallel with multiple threads (default 8, maximum 128). This greatly speeds up copies of many small files." },
      { q: "Does Robocopy copy open files?", a: "No. Files locked by another process are retried and then skipped. For open files, copy from a VSS shadow copy or schedule the copy when files are closed." },
      { q: "What's the difference between /E and /MIR?", a: "/E copies all subfolders, including empty ones, but never deletes. /MIR is /E plus /PURGE, which deletes destination files that no longer exist in the source." },
      { q: "How do I copy only new or changed files?", a: "Run the same command again. Robocopy skips files with the same size and timestamp by default. `/XO` also skips files that are older than the destination copy." },
    ],
    related: [
      { href: "/windows/icacls-generator/", label: "NTFS Permission Generator" },
      { href: "/network/bandwidth-calculator/", label: "Bandwidth Calculator" },
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
      { href: "/windows/disk-health-checker/", label: "Disk Health Checker" },
    ],
  },

  "bitlocker-command-generator": {
    heading: "How to manage BitLocker from PowerShell",
    intro: [
      "BitLocker encrypts Windows volumes so data can't be read if a laptop or disk is stolen. Administrators often need to check encryption status, find recovery keys, enable encryption on new machines, or suspend protection before firmware and BIOS updates.",
      "This generator builds the right command from the BitLocker PowerShell module for six common tasks: show status, list key protectors, show the recovery password, enable encryption with a recovery password protector (XTS-AES 256, used space only), suspend protection for one reboot, and resume protection.",
    ],
    steps: [
      "Enter the drive letter, for example `C`.",
      "Choose the action.",
      "Generate the command and run it in PowerShell as Administrator.",
      "Before enabling encryption, make sure you have somewhere safe to store the recovery password, such as Active Directory, Entra ID, or your password vault.",
    ],
    examples: [
      {
        title: "Backing up the recovery key to Active Directory or Entra ID",
        code: "$kp = (Get-BitLockerVolume -MountPoint 'C:').KeyProtector | Where-Object KeyProtectorType -eq 'RecoveryPassword'\n\n# Active Directory\nBackup-BitLockerKeyProtector -MountPoint 'C:' -KeyProtectorId $kp.KeyProtectorId\n\n# Microsoft Entra ID\nBackupToAAD-BitLockerKeyProtector -MountPoint 'C:' -KeyProtectorId $kp.KeyProtectorId",
        text: "Do this straight after enabling BitLocker. A lost recovery key on a locked-out machine means the data is gone for good.",
      },
      {
        title: "Before a BIOS or firmware update",
        code: "Suspend-BitLocker -MountPoint 'C:' -RebootCount 1",
        text: "Firmware changes alter TPM measurements and would otherwise trigger a recovery prompt at next boot. Protection resumes automatically after the reboot count.",
      },
    ],
    tips: [
      { title: "Suspend isn't decrypt", text: "Suspending leaves the data encrypted but stores the key in the clear on the disk until protection resumes. Don't leave machines suspended." },
      { title: "UsedSpaceOnly is fine for new disks", text: "It's much faster and secure for new installs. On disks that previously held unencrypted data, full encryption also covers deleted-but-recoverable data." },
      { title: "Check the TPM first", text: "Run `Get-Tpm` and confirm TpmPresent and TpmReady are True before enabling BitLocker on the OS drive." },
      { title: "Command-line alternative", text: "`manage-bde -status` and `manage-bde -protectors -get C:` give the same information from Command Prompt and WinPE." },
    ],
    faq: [
      { q: "Where do I find a BitLocker recovery key?", a: "In Active Directory (the computer object's BitLocker Recovery tab), in the Entra ID or Intune device record, in the user's Microsoft account for personal devices, or wherever it was saved when encryption was turned on." },
      { q: "Which encryption method should I use?", a: "XTS-AES 256 on fixed drives in modern Windows. Use AES-CBC for removable drives that must be read on very old Windows versions." },
      { q: "Does BitLocker slow down the computer?", a: "On modern CPUs with AES-NI, the performance impact is negligible for everyday use." },
      { q: "Is BitLocker available on Windows Home?", a: "Full BitLocker needs Pro, Enterprise or Education. Many Home devices have a simpler Device Encryption feature instead." },
    ],
    related: [
      { href: "/windows/disk-health-checker/", label: "Disk Health Checker" },
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
      { href: "/windows/gpresult-generator/", label: "GPResult Generator" },
      { href: "/security/password-strength-checker/", label: "Password Strength Checker" },
    ],
  },

  "command-generator": {
    heading: "Everyday Windows Command Prompt commands",
    intro: [
      "Even with PowerShell available, classic Command Prompt (CMD) commands are still the quickest way to answer basic questions on any Windows machine, including older servers, recovery environments and remote sessions where PowerShell is restricted.",
      "This generator builds six of the most useful ones: `ping` to test reachability, `nslookup` for DNS lookups, `tasklist` filtered by process name, `systeminfo` for OS and hardware details, `route print` for the routing table, and `dir` for detailed directory listings. Characters like `&`, `|`, `<` and `>` are stripped from your input so the command can't be chained accidentally.",
    ],
    steps: [
      "Choose a task.",
      "Enter the host, process name or path it needs. Leave it empty to use a safe default.",
      "Click Generate and copy the command.",
      "Paste it into Command Prompt. None of these commands need administrator rights.",
    ],
    examples: [
      {
        title: "A quick network triage sequence",
        code: "ipconfig /all\nping 10.0.0.1 -n 4\nnslookup intranet.corp.local\ntracert intranet.corp.local\nroute print",
        text: "Check the IP configuration, ping the gateway, confirm DNS resolves, see where the path breaks, and check routes. This finds most \"can't reach the server\" problems in a couple of minutes.",
      },
      {
        title: "Finding and ending a hung process",
        code: "tasklist /FI \"IMAGENAME eq excel.exe\"\ntaskkill /IM excel.exe /F",
        text: "`taskkill /F` force-closes the process and unsaved work is lost, so use it only when the application is really unresponsive.",
      },
    ],
    tips: [
      { title: "ping blocked doesn't mean down", text: "Windows Firewall blocks ICMP echo by default on many profiles. If ping fails, test the real service port with `Test-NetConnection -Port`." },
      { title: "nslookup uses its own resolver", text: "nslookup queries DNS servers directly and ignores the hosts file and DNS cache. `Resolve-DnsName` in PowerShell behaves more like applications do." },
      { title: "Filter systeminfo", text: "`systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\" /C:\"System Boot Time\"` pulls out just the lines you need." },
      { title: "Save output to a file", text: "Add `> C:\\Temp\\output.txt` to save results for a ticket, or `| clip` to copy them to the clipboard." },
    ],
    faq: [
      { q: "Should I use CMD or PowerShell?", a: "PowerShell is more powerful and returns objects you can filter. CMD commands are shorter for quick checks and work everywhere, including WinPE." },
      { q: "Why does ping show 'Request timed out'?", a: "The host is down, a firewall is blocking ICMP, or there's no route. Test a TCP port to tell these apart." },
      { q: "How do I clear the DNS cache?", a: "Run `ipconfig /flushdns` from an elevated Command Prompt." },
      { q: "How do I find what's using a port?", a: "`netstat -ano | findstr :443` shows the process ID; then `tasklist /FI \"PID eq 1234\"` shows the process name." },
    ],
    related: [
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
      { href: "/network/dns-checker/", label: "DNS Checker" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
    ],
  },

  "disk-health-checker": {
    heading: "How to check disk health on Windows",
    intro: [
      "Failing disks rarely die without warning. Rising error counters, degraded health status and a filling volume usually show up days or weeks before an outage. Windows exposes all of this through the Storage PowerShell module.",
      "This generator builds five checks: volume free space and health (`Get-Volume`), physical disk health and operational status (`Get-PhysicalDisk`), reliability and SMART-style counters (`Get-StorageReliabilityCounter`), the partition layout (`Get-Partition`), and an online file-system scan (`chkdsk /scan`) that doesn't need to take the volume offline.",
    ],
    steps: [
      "Choose the check.",
      "Enter the drive letter for volume and chkdsk checks.",
      "Generate the command and run it in PowerShell. Reliability counters and chkdsk need Administrator.",
      "Anything other than Healthy/OK, or rising error counts, means back up now and plan to replace the disk.",
    ],
    examples: [
      {
        title: "Reading reliability counters",
        code: "Get-PhysicalDisk | Get-StorageReliabilityCounter |\n  Select-Object DeviceId, Temperature, Wear, ReadErrorsUncorrected, WriteErrorsUncorrected, PowerOnHours",
        text: "Wear is the percentage of SSD endurance used. Uncorrected read or write errors above zero are a strong sign of failure. Some RAID controllers and virtual disks don't pass these counters through, so the values may be blank.",
      },
      {
        title: "Finding what's filling a disk",
        code: "Get-ChildItem C:\\ -Directory -ErrorAction SilentlyContinue | ForEach-Object {\n  [pscustomobject]@{ Folder = $_.FullName\n    SizeGB = [math]::Round((Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB, 2) }\n} | Sort-Object SizeGB -Descending | Select-Object -First 10",
        text: "Common culprits are `C:\\Windows\\SoftwareDistribution`, old IIS logs, user profile Downloads folders and crash dumps.",
      },
    ],
    tips: [
      { title: "Hardware RAID hides disks", text: "Behind a RAID controller, Windows sees one logical disk. Use the vendor's tool (Dell OpenManage, HPE SSA, MegaCLI/StorCLI) or iDRAC/iLO to check the physical drives." },
      { title: "chkdsk /scan vs /f", text: "`/scan` runs online and only reports. `/f` fixes errors but needs exclusive access; on the system drive it runs at the next reboot." },
      { title: "Keep 15–20% free", text: "NTFS performance drops and Windows updates can fail on nearly full volumes. SSDs also need free space for wear levelling." },
      { title: "Clean up safely", text: "Use `cleanmgr` or Storage Sense, and `DISM /Online /Cleanup-Image /StartComponentCleanup`, instead of deleting system folders by hand." },
    ],
    faq: [
      { q: "How do I check SMART status in Windows?", a: "`Get-PhysicalDisk | Select FriendlyName, HealthStatus` gives the overall status, and `Get-StorageReliabilityCounter` shows detailed counters. The older `wmic diskdrive get status` still works on many systems but is deprecated." },
      { q: "What does 'Warning' health status mean?", a: "The disk or storage pool has detected a problem, such as predicted failure or a degraded mirror. Back up and investigate immediately." },
      { q: "Is chkdsk safe to run?", a: "`chkdsk /scan` is read-only and safe on a live system. Always have a backup before running `/f` or `/r` on a disk with suspected problems." },
      { q: "How do I check disk temperature?", a: "The Temperature field in `Get-StorageReliabilityCounter` shows it when the drive reports it. Most drives prefer to stay under 50–60 °C." },
    ],
    related: [
      { href: "/windows/sfc-dism-generator/", label: "SFC & DISM Repair Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
    ],
  },

  "event-log-commands": {
    heading: "How to query Windows Event Logs with PowerShell",
    intro: [
      "The Windows Event Log is the first place to look when a server reboots unexpectedly, a service crashes or a user can't log in. Event Viewer works for one machine, but PowerShell's `Get-WinEvent` is faster, can filter precisely, and can export results for tickets or analysis.",
      "This generator builds a `Get-WinEvent -FilterHashtable` command for the System, Application, Security or Setup log. You can filter by level, look back a set number of hours, and limit the number of events, with optional CSV export. FilterHashtable filters on the server side, which is far faster than piping every event to `Where-Object`.",
    ],
    steps: [
      "Choose the log. System covers drivers, services and reboots; Application covers app crashes; Security covers logons and audits.",
      "Choose a level, for example Error or Critical, or Any.",
      "Set how many hours back to search and the maximum number of events.",
      "Optionally enter a CSV path, then generate and run. Reading the Security log needs Administrator.",
    ],
    examples: [
      {
        title: "Why did the server reboot?",
        code: "Get-WinEvent -FilterHashtable @{LogName='System'; Id=41,1074,6005,6006,6008} -MaxEvents 20 |\n  Select-Object TimeCreated, Id, Message",
        text: "1074 is a planned restart and shows who or what initiated it. 6008 and 41 mean an unexpected shutdown or crash. 6005 and 6006 mark the Event Log service starting and stopping.",
      },
      {
        title: "Failed logons in the last 24 hours",
        code: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} |\n  ForEach-Object { $_.Properties[5].Value } | Group-Object | Sort-Object Count -Descending",
        text: "Event 4625 is a failed logon, and property 5 is the target user name. A spike on one account suggests a brute-force attempt or a service with an old password.",
      },
    ],
    tips: [
      { title: "Level numbers", text: "1 = Critical, 2 = Error, 3 = Warning, 4 = Information. The generator uses these values in the FilterHashtable." },
      { title: "Query remote machines", text: "Add `-ComputerName SERVER01` to query another server. This needs the Remote Event Log Management firewall rule." },
      { title: "Logs roll over", text: "When a log reaches its maximum size, the oldest events are overwritten. Increase the Security log size on domain controllers and critical servers." },
      { title: "Useful event IDs", text: "7031/7034: service crashed. 1000: application error. 4624/4625: logon success/failure. 4740: account locked out (on domain controllers)." },
    ],
    faq: [
      { q: "Why is Get-WinEvent faster than Get-EventLog?", a: "Get-WinEvent filters on the server side with FilterHashtable or XPath and supports modern logs. Get-EventLog is legacy and isn't available in PowerShell 7." },
      { q: "How do I search Applications and Services logs?", a: "Use the full log name, for example `Microsoft-Windows-TaskScheduler/Operational`. `Get-WinEvent -ListLog *` lists every log." },
      { q: "Why do I get 'No events were found'?", a: "No events match the filter. It's an informational error, not a failure. Widen the time range or level." },
      { q: "How do I find which account locked out a user?", a: "On a domain controller, search the Security log for event 4740. The Caller Computer Name field shows the source machine." },
    ],
    related: [
      { href: "/windows/rdp-troubleshooter/", label: "RDP Troubleshooter" },
      { href: "/windows/service-command-generator/", label: "Windows Service Generator" },
      { href: "/windows/sfc-dism-generator/", label: "SFC & DISM Repair Generator" },
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
    ],
  },

  "firewall-rule-generator": {
    heading: "How to create Windows Firewall rules with PowerShell",
    intro: [
      "Microsoft Defender Firewall blocks unsolicited inbound traffic by default, so a new service such as a web app, database or monitoring agent often needs a rule before other machines can reach it. Creating rules with PowerShell is faster and easier to repeat than clicking through the console, and the same command works in scripts and deployment tools.",
      "This generator builds a `New-NetFirewallRule` command from a display name, direction (inbound or outbound), protocol (TCP or UDP), port, action (allow or block) and profile (Any, Domain, Private or Public). It checks the port is between 1 and 65535.",
    ],
    steps: [
      "Give the rule a clear, descriptive name, for example `App - SQL Server 1433 from App Tier`.",
      "Choose the direction, protocol and port.",
      "Choose Allow or Block, and the profile. Servers joined to a domain should normally use Domain.",
      "Generate and run the command in PowerShell as Administrator, then test from the client machine.",
    ],
    examples: [
      {
        title: "Allowing SQL Server only from the application subnet",
        code: "New-NetFirewallRule -DisplayName 'SQL 1433 from App Tier' -Direction Inbound -Protocol TCP -LocalPort 1433 `\n  -RemoteAddress 10.20.30.0/24 -Action Allow -Profile Domain",
        text: "Adding `-RemoteAddress` limits who can connect. It's the most important improvement you can make to the generated rule.",
      },
      {
        title: "Checking what's allowed",
        code: "Get-NetFirewallRule -Enabled True -Direction Inbound -Action Allow |\n  Get-NetFirewallPortFilter | Where-Object LocalPort -eq 1433\n\nGet-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction",
        text: "Confirm the rule exists, and that the firewall profile you expect is active and enabled.",
      },
    ],
    tips: [
      { title: "Check the active profile", text: "A rule for the Domain profile does nothing if the network is detected as Public. `Get-NetConnectionProfile` shows the current category." },
      { title: "Group Policy can override local rules", text: "If domain policy disables local rule merging, locally created rules are ignored. Create the rule in the GPO instead." },
      { title: "Allowing the port isn't enough", text: "The service must also be listening on that port and interface. Check with `Get-NetTCPConnection -LocalPort 1433 -State Listen`." },
      { title: "Remove rules you no longer need", text: "Old allow rules pile up. Use `Remove-NetFirewallRule -DisplayName '...'` when a service is decommissioned." },
    ],
    faq: [
      { q: "Do I need an outbound rule?", a: "Usually not. Windows allows outbound traffic by default. Outbound rules are for blocking, or for environments that switched the default to block." },
      { q: "Which profile should I use?", a: "Domain for domain-joined servers on the corporate network, Private for trusted networks, and avoid opening ports on Public." },
      { q: "How do I allow a port range?", a: "Use a range in `-LocalPort`, for example `-LocalPort 5000-5100`, or a comma-separated list such as `80,443`." },
      { q: "Can I do this with netsh?", a: "Yes: `netsh advfirewall firewall add rule name=\"App\" dir=in action=allow protocol=TCP localport=8080`. PowerShell is the modern, recommended way." },
    ],
    related: [
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
      { href: "/windows/rdp-troubleshooter/", label: "RDP Troubleshooter" },
      { href: "/linux/firewall-cmd-generator/", label: "firewall-cmd Generator" },
      { href: "/cloud/azure-nsg-generator/", label: "Azure NSG Generator" },
    ],
  },

  "gpresult-generator": {
    heading: "How to check applied Group Policy with GPResult",
    intro: [
      "When a Group Policy setting doesn't apply, such as a mapped drive that's missing, a security setting that's ignored or software that never installs, the first question is which policies the computer and user actually received. `gpresult` answers it by showing the Resultant Set of Policy (RSoP).",
      "This generator builds the command for computer settings, user settings or both, as a summary (`/r`), verbose output (`/v`) or a full HTML report (`/h`). The HTML report is the most useful: it shows every winning setting and which GPO it came from.",
    ],
    steps: [
      "Choose the scope: Computer + User, Computer only or User only.",
      "Choose Summary, Verbose or HTML report. For HTML, enter a file path.",
      "Generate the command.",
      "Run it in an elevated prompt for computer results, or in the user's own session for their user results. Open the HTML file in a browser.",
    ],
    examples: [
      {
        title: "Full HTML report",
        code: "gpresult /h \"C:\\Temp\\gp-report.html\" /f\nstart C:\\Temp\\gp-report.html",
        text: "`/f` overwrites an existing file. Look at Applied GPOs, Denied GPOs (with the reason, such as security filtering or a WMI filter) and the setting-by-setting \"Winning GPO\" column.",
      },
      {
        title: "Checking another user or computer",
        code: "gpresult /s PC-0452 /user CORP\\jsmith /scope user /r",
        text: "`/s` queries a remote computer and `/user` selects whose results to show. The user must have logged on to that computer at least once.",
      },
    ],
    tips: [
      { title: "Run elevated for computer settings", text: "Without administrator rights, gpresult only shows user settings and warns that computer data isn't available." },
      { title: "Last applied time matters", text: "Check \"Last time Group Policy was applied\". If it's old, the machine may not be reaching a domain controller. Run `gpupdate /force` and check again." },
      { title: "Denied reasons", text: "\"Empty\" means the GPO has no settings for that scope. \"Security\" means the account isn't in the security filter. \"WMI Filter\" means the filter evaluated false." },
      { title: "Loopback processing", text: "On RDS and kiosk servers, loopback mode can replace or merge user settings based on the computer's OU, which often explains \"wrong\" user policies." },
    ],
    faq: [
      { q: "What's the difference between /r and /v?", a: "/r shows a summary of applied GPOs and group memberships. /v adds every individual setting, which is very long in the console." },
      { q: "Why does gpresult say 'user does not have RSoP data'?", a: "The user hasn't logged on to that machine, or you ran it elevated as a different account. Run it in the user's session or specify `/user`." },
      { q: "Is there a PowerShell equivalent?", a: "Yes: `Get-GPResultantSetOfPolicy -ReportType Html -Path C:\\Temp\\rsop.html` from the GroupPolicy module, part of RSAT." },
      { q: "Why is a GPO not in the applied list at all?", a: "Check that it's linked to the right OU, that the link is enabled, that inheritance isn't blocked, and that the computer or user is in that OU." },
    ],
    related: [
      { href: "/windows/gpupdate-generator/", label: "GPUpdate Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/user-management-generator/", label: "Local User Management Generator" },
      { href: "/windows/icacls-generator/", label: "NTFS Permission Generator" },
    ],
  },

  "gpupdate-generator": {
    heading: "How to refresh Group Policy with GPUpdate",
    intro: [
      "Windows refreshes Group Policy in the background every 90 minutes, plus a random offset of up to 30 minutes (domain controllers every 5 minutes). After changing a GPO, you usually don't want to wait, and `gpupdate` applies the changes immediately.",
      "This generator builds the command with the target (computer, user or both), `/force` to re-apply every setting instead of only changed ones, `/wait` to control how long to wait for processing, and `/boot` or `/logoff` for settings that only apply at startup or sign-in, such as software installation and folder redirection.",
    ],
    steps: [
      "Choose the target: Computer + User, Computer only or User only.",
      "Tick Force to re-apply all settings. This is useful when troubleshooting.",
      "Set the wait time in seconds, and tick Boot or Logoff if the settings need them.",
      "Generate and run the command. Use an elevated prompt for computer policy.",
    ],
    examples: [
      {
        title: "Standard refresh after a GPO change",
        code: "gpupdate /target:computer /force\ngpresult /r /scope computer",
        text: "Refresh, then confirm with gpresult that the GPO now appears under Applied Group Policy Objects.",
      },
      {
        title: "Refreshing many computers remotely",
        code: "Invoke-GPUpdate -Computer 'PC-0452' -Force -RandomDelayInMinutes 0\n\n# Every computer in an OU\nGet-ADComputer -SearchBase 'OU=Workstations,DC=corp,DC=local' -Filter * |\n  ForEach-Object { Invoke-GPUpdate -Computer $_.Name -Force -RandomDelayInMinutes 0 }",
        text: "Invoke-GPUpdate (GroupPolicy module) schedules gpupdate on the remote machines. The Group Policy Management Console can also do this: right-click an OU and choose Group Policy Update.",
      },
    ],
    tips: [
      { title: "/force isn't always needed", text: "A plain `gpupdate` applies changed policies. `/force` re-applies everything and adds load, so avoid running it on hundreds of machines at once." },
      { title: "Some settings need a restart or sign-in", text: "Software installation, folder redirection and some security settings only apply at boot or logon. gpupdate will say so; use `/boot` or `/logoff`." },
      { title: "Check replication first", text: "If a remote site doesn't get the change, the GPO may not have replicated to its domain controller yet. Check with `repadmin /replsummary`." },
      { title: "Errors go to the event log", text: "Look under Applications and Services Logs → Microsoft → Windows → GroupPolicy → Operational for detailed processing errors." },
    ],
    faq: [
      { q: "What does gpupdate /force do?", a: "It re-applies all policy settings, not just the ones that changed since the last refresh." },
      { q: "How often does Group Policy refresh automatically?", a: "Every 90 minutes with a random offset of 0–30 minutes on members, and every 5 minutes on domain controllers." },
      { q: "Why does gpupdate say 'Computer policy could not be updated successfully'?", a: "Usually the computer can't reach a domain controller or SYSVOL. Check DNS, network connectivity and the GroupPolicy Operational log." },
      { q: "Do I need admin rights?", a: "Updating user policy doesn't. Updating computer policy needs an elevated prompt." },
    ],
    related: [
      { href: "/windows/gpresult-generator/", label: "GPResult Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/command-generator/", label: "Windows CMD Generator" },
      { href: "/windows/firewall-rule-generator/", label: "Firewall Rule Generator" },
    ],
  },

  "hyperv-command-generator": {
    heading: "How to manage Hyper-V with PowerShell",
    intro: [
      "The Hyper-V PowerShell module lets you manage virtual machines faster than Hyper-V Manager, and on Server Core or remote hosts it's often the only practical option. Scripts also make VM builds consistent.",
      "This generator covers six common tasks: list VMs with state, CPU and memory; start a VM; shut one down cleanly; create a timestamped checkpoint; create a Generation 2 VM attached to an existing VHDX; and list virtual switches.",
    ],
    steps: [
      "Choose the action.",
      "Enter the VM name and, for Create VM, the startup memory, the VHDX path and optionally the virtual switch.",
      "Generate the command.",
      "Run it in PowerShell as Administrator on the Hyper-V host, or add `-ComputerName HOST01` to manage a remote host.",
    ],
    examples: [
      {
        title: "Building a new VM from scratch",
        code: "New-VHD -Path 'D:\\VMs\\app01.vhdx' -SizeBytes 80GB -Dynamic\nNew-VM -Name 'app01' -Generation 2 -MemoryStartupBytes 4GB -VHDPath 'D:\\VMs\\app01.vhdx' -SwitchName 'External'\nSet-VMProcessor -VMName 'app01' -Count 2\nAdd-VMDvdDrive -VMName 'app01' -Path 'D:\\ISO\\WindowsServer2025.iso'\nSet-VMFirmware -VMName 'app01' -FirstBootDevice (Get-VMDvdDrive -VMName 'app01')\nStart-VM -Name 'app01'",
        text: "The generator's Create VM command assumes the VHDX already exists. These lines add disk creation, CPU count and an install ISO.",
      },
      {
        title: "Checkpoint before a change",
        code: "Checkpoint-VM -Name 'app01' -SnapshotName ('BeforeChange-' + (Get-Date -Format 'yyyyMMdd-HHmm'))\nGet-VMSnapshot -VMName 'app01'\n# When finished\nRemove-VMSnapshot -VMName 'app01' -Name 'BeforeChange-*'",
        text: "Remove checkpoints once the change is confirmed. Like VMware snapshots, they aren't backups and slow the VM down over time.",
      },
    ],
    tips: [
      { title: "Stop-VM -Shutdown vs -TurnOff", text: "`-Shutdown` asks the guest OS to shut down through integration services. `-TurnOff` cuts power immediately, so use it only for hung VMs." },
      { title: "Generation 2 for modern guests", text: "Gen 2 VMs use UEFI, support Secure Boot and boot from SCSI. Use Gen 1 only for old or 32-bit operating systems." },
      { title: "Production checkpoints", text: "Hyper-V's default production checkpoints use VSS in the guest for consistent snapshots. They need integration services running in the VM." },
      { title: "Dynamic memory", text: "`Set-VMMemory -DynamicMemoryEnabled $true -MinimumBytes 2GB -MaximumBytes 8GB` lets VMs share host RAM more efficiently. Avoid it for SQL Server and Exchange." },
    ],
    faq: [
      { q: "How do I install the Hyper-V PowerShell module?", a: "On Windows Server: `Install-WindowsFeature Hyper-V-PowerShell`. On Windows 10/11: enable Microsoft-Hyper-V-Management-PowerShell in optional features." },
      { q: "How do I connect a VM to a different switch?", a: "`Connect-VMNetworkAdapter -VMName 'app01' -SwitchName 'Internal'`." },
      { q: "What's the difference between a checkpoint and a snapshot?", a: "They're the same thing. Microsoft renamed snapshots to checkpoints, which is why cmdlets like `Get-VMSnapshot` still use the old name." },
      { q: "How do I move a VM to another host?", a: "`Move-VM -Name 'app01' -DestinationHost 'HV02'` performs a live migration when both hosts are configured for it." },
    ],
    related: [
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
      { href: "/vmware/vm-sizing-calculator/", label: "VM Sizing Calculator" },
      { href: "/windows/windows-feature-installer/", label: "Windows Feature Installer" },
      { href: "/vmware/snapshot-command-generator/", label: "Snapshot Command Generator" },
    ],
  },

  "icacls-generator": {
    heading: "How to manage NTFS permissions with ICACLS",
    intro: [
      "`icacls` is the built-in Windows command for viewing and changing NTFS permissions on files and folders. It's essential for file servers, application folders and scripted deployments, and it can back up and restore entire permission sets.",
      "This generator builds four operations: grant a permission (Read, Read & execute, Modify or Full control) to a user or group, remove a user's entries, reset permissions to inherited defaults, or view the current access control list (ACL). When you choose \"Folder, subfolders and files\", it adds `(OI)(CI)` inheritance flags so the permission applies to everything below. Grant, remove and reset include `/T` to process subfolders and `/C` to continue on errors.",
    ],
    steps: [
      "Enter the file or folder path.",
      "Enter the user or group, for example `CORP\\FileShare-Finance-RW`.",
      "Choose the permission, the action and how far it should apply.",
      "Generate the command and run it in an elevated prompt. View the ACL first so you know the starting point.",
    ],
    examples: [
      {
        title: "Backing up permissions before a change",
        code: "icacls \"D:\\Shares\\Finance\" /save \"C:\\Temp\\finance-acl.txt\" /T /C\n\n:: Restore if needed (run against the PARENT folder)\nicacls \"D:\\Shares\" /restore \"C:\\Temp\\finance-acl.txt\"",
        text: "Always save the ACLs before a bulk change. Restoring takes seconds, compared with hours of rebuilding permissions by hand.",
      },
      {
        title: "Reading icacls output",
        code: "D:\\Shares\\Finance CORP\\Finance-RW:(OI)(CI)(M)\n                  BUILTIN\\Administrators:(OI)(CI)(F)\n                  NT AUTHORITY\\SYSTEM:(I)(OI)(CI)(F)",
        text: "`(OI)` object inherit (files), `(CI)` container inherit (folders), `(I)` inherited from the parent. `F` Full, `M` Modify, `RX` Read & execute, `R` Read.",
      },
    ],
    tips: [
      { title: "Grant groups, not users", text: "Assign permissions to AD groups and manage membership. Per-user entries become unmanageable quickly." },
      { title: "Modify is usually enough", text: "Full control also lets users change permissions and take ownership. Give it only to administrators." },
      { title: "/reset is destructive", text: "It replaces explicit permissions with inherited ones on everything below the path. Save the ACLs first." },
      { title: "Share and NTFS permissions combine", text: "For network access, the most restrictive of the share and NTFS permissions wins. A common approach is Share: Authenticated Users – Change, then control access with NTFS." },
    ],
    faq: [
      { q: "What do (OI)(CI) mean?", a: "Object Inherit and Container Inherit. Together they make the permission apply to the folder, its subfolders and its files." },
      { q: "How do I take ownership of a folder?", a: "Run `takeown /F \"D:\\Path\" /R /D Y`, then `icacls \"D:\\Path\" /grant Administrators:F /T`." },
      { q: "How do I remove inheritance?", a: "`icacls \"D:\\Path\" /inheritance:d` disables inheritance and keeps copies of the inherited entries. `/inheritance:r` removes them." },
      { q: "Why do I get 'Access is denied' even as administrator?", a: "The admin account may not have rights on that item. Take ownership first, or run with backup privileges." },
    ],
    related: [
      { href: "/windows/robocopy-generator/", label: "Robocopy Generator" },
      { href: "/windows/user-management-generator/", label: "Local User Management Generator" },
      { href: "/linux/permission-converter/", label: "Linux Permission Converter" },
      { href: "/linux/chmod-calculator/", label: "chmod Calculator" },
    ],
  },

  "powershell-generator": {
    heading: "Practical PowerShell commands for Windows administrators",
    intro: [
      "PowerShell is the main management tool for Windows Server and Windows 10/11. Its commands return objects rather than plain text, so you can sort, filter and export results with a single pipeline.",
      "This generator builds six everyday commands: find a process with its CPU and memory use, get a service's status and startup type, find files larger than a given size, show the network configuration, list disk free space, and restart a computer. Quotes in your input are escaped automatically.",
    ],
    steps: [
      "Choose a task.",
      "Enter the process name, service name, path or size in GB it needs, or leave it empty for a sensible default.",
      "Click Generate, then copy the command.",
      "Run it in PowerShell. Restarting remote computers and reading some system areas need Administrator.",
    ],
    examples: [
      {
        title: "Exporting results for a report",
        code: "Get-Volume | Where-Object DriveLetter |\n  Select-Object DriveLetter, FileSystemLabel,\n    @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}},\n    @{N='FreeGB';E={[math]::Round($_.SizeRemaining/1GB,2)}} |\n  Export-Csv C:\\Temp\\disk-report.csv -NoTypeInformation",
        text: "Any generated command can end with `| Export-Csv`, `| Out-GridView` (interactive table) or `| ConvertTo-Html` to share the results.",
      },
      {
        title: "Running a command on many servers",
        code: "Invoke-Command -ComputerName SRV01, SRV02, SRV03 -ScriptBlock {\n  Get-Service -Name 'Spooler' | Select-Object Name, Status, StartType\n}",
        text: "PowerShell remoting (WinRM) runs the same command on many machines at once and adds a PSComputerName column to show which server each result came from.",
      },
    ],
    tips: [
      { title: "Test with -WhatIf", text: "Commands that change things, like `Restart-Computer` and `Remove-Item`, support `-WhatIf` to show what would happen." },
      { title: "Use Get-Help and Get-Command", text: "`Get-Command *firewall*` finds cmdlets; `Get-Help Get-Process -Examples` shows usage examples." },
      { title: "Execution policy", text: "If scripts won't run, check `Get-ExecutionPolicy`. `RemoteSigned` is a sensible default for administrators' workstations." },
      { title: "Prefer PowerShell 7 for new scripts", text: "PowerShell 7 is faster and cross-platform. Windows PowerShell 5.1 is still needed for some older modules." },
    ],
    faq: [
      { q: "How do I run PowerShell as Administrator?", a: "Right-click PowerShell or Windows Terminal and choose Run as administrator, or run `Start-Process pwsh -Verb RunAs`." },
      { q: "How do I find which process uses the most memory?", a: "`Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, Id, @{N='MemMB';E={[math]::Round($_.WorkingSet/1MB)}}`." },
      { q: "Why does Restart-Computer fail on a remote server?", a: "WinRM must be enabled on the target (`Enable-PSRemoting`), the firewall must allow it, and you need admin rights on that machine." },
      { q: "What's the PowerShell equivalent of ipconfig?", a: "`Get-NetIPConfiguration` for a summary, or `Get-NetIPAddress` for every address." },
    ],
    related: [
      { href: "/windows/command-generator/", label: "Windows CMD Generator" },
      { href: "/windows/service-command-generator/", label: "Windows Service Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/vmware/powercli-command-generator/", label: "PowerCLI Command Generator" },
    ],
  },

  "rdp-troubleshooter": {
    heading: "How to troubleshoot Remote Desktop (RDP) connections",
    intro: [
      "\"Remote Desktop can't connect to the remote computer\" can mean many things: DNS pointing to the wrong IP, a firewall blocking TCP 3389, the Remote Desktop Services service stopped, RDP disabled in the registry, or a Network Level Authentication (NLA) or credential problem. Working through them in order finds the cause quickly.",
      "This tool generates two checklists. Enter a remote host to get client-side tests: DNS resolution, a detailed TCP port test and ping. Leave the host empty to get server-side checks to run on the target machine: the TermService status, whether anything is listening on the RDP port, the Remote Desktop firewall rules, and the `fDenyTSConnections` registry value.",
    ],
    steps: [
      "On your own PC, enter the server name and RDP port (default 3389), generate, and run the commands.",
      "If DNS or the port test fails, fix networking or the firewall first.",
      "If the port is open but login fails, the problem is authentication or licensing. Check the error message and the server's event logs.",
      "If you can reach the server another way (console, iLO/iDRAC, hypervisor), leave the host empty and run the server-side checks there.",
    ],
    examples: [
      {
        title: "Turning RDP on from the server console",
        code: "Set-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name fDenyTSConnections -Value 0\nEnable-NetFirewallRule -DisplayGroup 'Remote Desktop'\nRestart-Service TermService -Force",
        text: "`fDenyTSConnections = 1` means RDP is disabled. Note that restarting TermService disconnects any existing RDP sessions.",
      },
      {
        title: "Reading Test-NetConnection results",
        code: "ComputerName     : srv01.corp.local\nRemoteAddress    : 10.0.5.21\nRemotePort       : 3389\nTcpTestSucceeded : False",
        text: "If RemoteAddress is the wrong IP, fix DNS. If it's correct but TcpTestSucceeded is False, a firewall is blocking the port or the service isn't listening.",
      },
    ],
    tips: [
      { title: "Check group membership", text: "Users need to be in the Remote Desktop Users group (or Administrators) and allowed by the \"Allow log on through Remote Desktop Services\" policy." },
      { title: "NLA and expired passwords", text: "With Network Level Authentication, users with an expired password or \"must change password at next logon\" can't sign in over RDP. Reset it another way first." },
      { title: "RDS licensing grace period", text: "On Remote Desktop Session Host servers, an expired 120-day licensing grace period blocks non-admin logons. Admins can still connect with `mstsc /admin`." },
      { title: "Never expose 3389 to the internet", text: "Open RDP ports are brute-forced constantly. Use a VPN, RD Gateway or a bastion host instead." },
    ],
    faq: [
      { q: "What port does RDP use?", a: "TCP 3389 by default, and optionally UDP 3389 for better performance. The port can be changed in the registry under `RDP-Tcp\\PortNumber`." },
      { q: "Where are RDP errors logged?", a: "On the server, check Applications and Services Logs → Microsoft → Windows → TerminalServices-LocalSessionManager and RemoteConnectionManager, plus Security events 4625 for failed logons." },
      { q: "Why do I get a black screen after connecting?", a: "Often a display driver or Explorer problem in the session. Try Ctrl+Alt+End, sign out the session from Task Manager, or reduce colour depth and disable bitmap caching in the client." },
      { q: "How do I see who is logged on over RDP?", a: "Run `quser /server:SRV01`, or `qwinsta` locally. Use `logoff <ID> /server:SRV01` to end a stuck session." },
    ],
    related: [
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
      { href: "/windows/firewall-rule-generator/", label: "Firewall Rule Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/service-command-generator/", label: "Windows Service Generator" },
    ],
  },

  "service-command-generator": {
    heading: "How to manage Windows services from the command line",
    intro: [
      "Windows services run in the background: web servers, database engines, monitoring agents, the print spooler and hundreds of system components. Managing them from PowerShell is faster than the Services console, works over remoting, and can be scripted for maintenance windows.",
      "This generator builds commands to check a service's status and startup type, start it, stop it, restart it, or set its startup type to Automatic, Manual or Disabled. Stop and Restart include `-Force`, which also stops dependent services.",
    ],
    steps: [
      "Enter the service name. Use the short name (such as `Spooler` or `W3SVC`), not the display name. `Get-Service *sql*` helps you find it.",
      "Choose the action.",
      "Generate the command and run it in PowerShell as Administrator.",
      "Check the result with the status action, and look in the System event log if the service won't start.",
    ],
    examples: [
      {
        title: "Finding a service and its dependencies",
        code: "Get-Service -DisplayName '*SQL Server*' | Select-Object Name, DisplayName, Status, StartType\nGet-Service -Name 'MSSQLSERVER' -DependentServices",
        text: "Check dependents before stopping a service. `-Force` stops them too, which may take down more than you intended.",
      },
      {
        title: "Changing the service account password",
        code: "sc.exe config \"AppService\" obj= \"CORP\\svc-app\" password= \"NewPassword\"\nRestart-Service -Name 'AppService'",
        text: "`sc.exe` still does jobs Set-Service can't in Windows PowerShell 5.1. The space after `obj=` and `password=` is required. In PowerShell, always type `sc.exe`, because `sc` is an alias for Set-Content.",
      },
    ],
    tips: [
      { title: "Automatic (Delayed Start)", text: "For services that depend on the network or other apps, delayed start avoids boot-time race conditions: `sc.exe config AppService start= delayed-auto`." },
      { title: "Configure recovery actions", text: "Make critical services restart themselves after a crash: `sc.exe failure AppService reset= 86400 actions= restart/60000/restart/60000//`." },
      { title: "Stuck in 'Stopping'", text: "Find the process with `sc.exe queryex AppService` and end it with `Stop-Process -Id <PID> -Force` as a last resort." },
      { title: "Don't disable what you don't know", text: "Disabling unfamiliar system services can break updates, networking or logons. Check what depends on a service first." },
    ],
    faq: [
      { q: "What's the difference between a service's name and display name?", a: "The name (such as `wuauserv`) is the internal identifier used by commands. The display name (such as Windows Update) is what the Services console shows." },
      { q: "How do I manage services on a remote computer?", a: "Use `Invoke-Command -ComputerName SRV01 { Restart-Service W3SVC }`, or `Get-Service -ComputerName SRV01` in Windows PowerShell 5.1." },
      { q: "Why does my service start and then stop immediately?", a: "The application inside it is failing. Check the System and Application event logs and the application's own log files." },
      { q: "Can I create a new service?", a: "Yes: `New-Service -Name 'AppService' -BinaryPathName 'C:\\App\\app.exe' -StartupType Automatic`. The program must be written to run as a service." },
    ],
    related: [
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/iis-command-generator/", label: "IIS Command Generator" },
      { href: "/linux/systemd-service-generator/", label: "systemd Service Generator" },
    ],
  },

  "sfc-dism-generator": {
    heading: "How to repair Windows with SFC and DISM",
    intro: [
      "When Windows shows odd errors, such as failed updates, crashing system components or features that won't install, corrupted system files are a common cause. Two built-in tools fix most of these problems. System File Checker (SFC) checks protected system files and replaces damaged ones from the component store. DISM checks and repairs the component store itself.",
      "This generator builds five commands: `sfc /scannow` (scan and repair), `sfc /verifyonly` (scan only), and DISM's CheckHealth (quick), ScanHealth (thorough) and RestoreHealth (repair), with an optional offline repair source for machines without internet or Windows Update access.",
    ],
    steps: [
      "Open Command Prompt or PowerShell as Administrator.",
      "Run DISM RestoreHealth first. It repairs the component store that SFC relies on.",
      "Then run `sfc /scannow` to repair the system files themselves.",
      "Restart, then run `sfc /scannow` again to confirm it reports no integrity violations.",
    ],
    examples: [
      {
        title: "The recommended repair order",
        code: "DISM /Online /Cleanup-Image /CheckHealth\nDISM /Online /Cleanup-Image /ScanHealth\nDISM /Online /Cleanup-Image /RestoreHealth\nsfc /scannow",
        text: "CheckHealth takes seconds and only reads existing flags. ScanHealth takes several minutes. RestoreHealth downloads replacement files from Windows Update unless you give it a source.",
      },
      {
        title: "Repairing from installation media",
        code: "dism /Get-WimInfo /WimFile:D:\\sources\\install.wim\nDISM /Online /Cleanup-Image /RestoreHealth /Source:wim:D:\\sources\\install.wim:1 /LimitAccess",
        text: "Use media for the same Windows version and build. Get-WimInfo shows the index numbers. `/LimitAccess` stops DISM from contacting Windows Update, which suits servers without internet access.",
      },
    ],
    tips: [
      { title: "Read the SFC result line", text: "\"Did not find any integrity violations\" means files are fine. \"Found corrupt files and successfully repaired them\" means restart. \"Unable to fix some of them\" means run DISM RestoreHealth, then SFC again." },
      { title: "Logs for details", text: "SFC writes to `C:\\Windows\\Logs\\CBS\\CBS.log` and DISM to `C:\\Windows\\Logs\\DISM\\dism.log`. Search for `[SR]` in CBS.log to see SFC's actions." },
      { title: "WSUS environments", text: "If Group Policy points updates at WSUS, RestoreHealth may fail with 0x800f081f because WSUS doesn't serve repair files. Use a /Source or allow Windows Update for repair content." },
      { title: "Don't interrupt", text: "RestoreHealth can appear stuck at 20% or 62% for a long time. That's normal, so let it finish." },
    ],
    faq: [
      { q: "Should I run SFC or DISM first?", a: "Run DISM RestoreHealth first. SFC repairs files from the component store, so if the store itself is damaged, SFC can't fix everything." },
      { q: "How long do they take?", a: "SFC usually takes 5–20 minutes. DISM RestoreHealth can take 10–30 minutes or more, depending on disk speed and download speed." },
      { q: "What does error 0x800f081f mean?", a: "DISM couldn't find the source files. Give it a matching install.wim or .esd with `/Source` and `/LimitAccess`." },
      { q: "Can I run SFC on a system that won't boot?", a: "Yes, from WinRE or installation media: `sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows`." },
    ],
    related: [
      { href: "/windows/disk-health-checker/", label: "Disk Health Checker" },
      { href: "/windows/event-log-commands/", label: "Event Log Commands" },
      { href: "/windows/windows-feature-installer/", label: "Windows Feature Installer" },
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
    ],
  },

  "tcp-port-tester": {
    heading: "How to test TCP ports and connectivity on Windows",
    intro: [
      "\"The application can't connect\" is one of the most common tickets. The fastest way to narrow it down is to test from the client: does the name resolve to the right IP, does the host answer, and is the TCP port open? PowerShell's `Test-NetConnection` answers all three without installing telnet or any other tool.",
      "This generator builds a short test script: an optional `Resolve-DnsName` DNS check, an optional `Test-Connection` ping, and a detailed `Test-NetConnection` port test that shows the source interface, the remote address and whether the TCP handshake succeeded.",
    ],
    steps: [
      "Enter the hostname or IP address, and the TCP port, for example 443 for HTTPS, 1433 for SQL Server or 3389 for RDP.",
      "Keep DNS and ping ticked for a full picture.",
      "Generate the commands and run them in PowerShell on the machine that has the problem.",
      "Use the results to decide where to look next: DNS, routing, a firewall, or the service itself.",
    ],
    examples: [
      {
        title: "Interpreting the results",
        code: "DNS fails                          -> name or DNS server problem\nDNS OK, ping fails, port OK        -> ICMP blocked, service fine\nDNS OK, port fails (timeout)       -> firewall dropping traffic or wrong route\nDNS OK, port fails (quickly)       -> host reachable, nothing listening (service down or wrong port)\nPort OK, app still fails           -> TLS, authentication or application problem",
        text: "A slow failure means packets are being dropped silently, usually by a firewall. A fast failure means the host actively refused the connection.",
      },
      {
        title: "Testing many ports at once",
        code: "80, 443, 1433, 3389 | ForEach-Object {\n  [pscustomobject]@{ Port = $_; Open = (Test-NetConnection 'srv01' -Port $_ -WarningAction SilentlyContinue).TcpTestSucceeded }\n}",
        text: "Handy for checking every port an application needs after a firewall change.",
      },
    ],
    tips: [
      { title: "Test from the right place", text: "Run the test from the actual client or application server. A test from your laptop checks a different network path." },
      { title: "Proxies don't apply", text: "Test-NetConnection makes a direct TCP connection and ignores web proxy settings, while browsers and some apps go through a proxy." },
      { title: "UDP can't be tested this way", text: "Test-NetConnection only tests TCP. UDP services like DNS or syslog need application-level tests, such as `Resolve-DnsName -Server`." },
      { title: "Faster checks", text: "In PowerShell 7, `Test-Connection srv01 -TcpPort 443` returns True or False quickly, which is useful in scripts." },
    ],
    faq: [
      { q: "Is Test-NetConnection the same as telnet?", a: "For port testing, yes: both try a TCP handshake. Test-NetConnection is built in and gives clearer output, so there's no need to install the Telnet client." },
      { q: "Why does the ping fail when the port test succeeds?", a: "Many firewalls block ICMP echo. The TCP port test is the more reliable indicator that the service is reachable." },
      { q: "How do I test from a Linux server?", a: "Use `nc -zv host 443`, or `timeout 3 bash -c '</dev/tcp/host/443' && echo open`." },
      { q: "Does a successful test mean the application works?", a: "It means the network path and listener are fine. Certificates, authentication and application settings can still fail." },
    ],
    related: [
      { href: "/windows/rdp-troubleshooter/", label: "RDP Troubleshooter" },
      { href: "/network/port-checker/", label: "Port Checker" },
      { href: "/windows/firewall-rule-generator/", label: "Firewall Rule Generator" },
      { href: "/database/database-port-reference/", label: "Database Port Reference" },
    ],
  },

  "user-management-generator": {
    heading: "How to manage local Windows users with PowerShell",
    intro: [
      "Local accounts still matter on workgroup servers, jump boxes, lab machines and for emergency access. The `Microsoft.PowerShell.LocalAccounts` module manages them without opening Computer Management.",
      "This generator builds commands to create a user (prompting for the password securely, so it never appears in the command or history), enable or disable an account, remove it, add it to the local Administrators group, or show its details.",
    ],
    steps: [
      "Enter the username and, when creating an account, an optional full name.",
      "Choose the action.",
      "Generate the command and run it in PowerShell as Administrator.",
      "For new accounts, type the password when prompted. It's read as a SecureString.",
    ],
    examples: [
      {
        title: "Auditing local administrators",
        code: "Get-LocalGroupMember -Group 'Administrators' | Select-Object Name, ObjectClass, PrincipalSource",
        text: "Review this regularly. Unexpected members of the local Administrators group are a common sign of compromise or privilege creep. PrincipalSource shows whether each account is local, AD or Entra ID.",
      },
      {
        title: "Finding stale accounts",
        code: "Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordLastSet | Sort-Object LastLogon",
        text: "Disable accounts that haven't logged on for 90 days, and remove them after a waiting period.",
      },
    ],
    tips: [
      { title: "Disable before you delete", text: "Removing an account deletes its SID, and permissions that referred to it become unresolvable. Disable it first and delete later." },
      { title: "Use LAPS for the built-in admin", text: "Windows LAPS gives each machine a unique, rotated local administrator password stored in AD or Entra ID, which stops lateral movement with a shared password." },
      { title: "Minimize local admins", text: "Add users to Administrators only when needed. For most tasks, Remote Desktop Users or a specific operators group is enough." },
      { title: "Domain controllers have no local users", text: "These cmdlets don't work on domain controllers. Use the ActiveDirectory module (`New-ADUser`) there." },
    ],
    faq: [
      { q: "How do I reset a local user's password?", a: "`$p = Read-Host -AsSecureString; Set-LocalUser -Name 'appuser' -Password $p`." },
      { q: "How do I add a domain group to local Administrators?", a: "`Add-LocalGroupMember -Group 'Administrators' -Member 'CORP\\Server-Admins'`." },
      { q: "Why is Get-LocalUser not recognized?", a: "It's in Windows PowerShell 5.1 on Windows 10 / Server 2016 and later. In PowerShell 7, run `Import-Module Microsoft.PowerShell.LocalAccounts -UseWindowsPowerShell`." },
      { q: "Can I do this with the net command?", a: "Yes: `net user appuser * /add` prompts for a password, and `net localgroup Administrators appuser /add` adds the user to the group." },
    ],
    related: [
      { href: "/windows/icacls-generator/", label: "NTFS Permission Generator" },
      { href: "/network/password-generator/", label: "Password Generator" },
      { href: "/windows/gpresult-generator/", label: "GPResult Generator" },
      { href: "/linux/useradd-generator/", label: "Linux useradd Generator" },
    ],
  },

  "windows-feature-installer": {
    heading: "How to install Windows roles and features with PowerShell",
    intro: [
      "Windows Server roles (such as IIS, DNS or Hyper-V) and Windows 10/11 optional features (such as WSL, Hyper-V or .NET 3.5) can all be installed from PowerShell. That's quicker than Server Manager, and the same line works in build scripts and remote sessions.",
      "The generator uses the right cmdlets for each platform. Windows Server uses `Get-WindowsFeature`, `Install-WindowsFeature` (optionally with `-IncludeManagementTools`) and `Uninstall-WindowsFeature`. Windows 10/11 uses `Get-WindowsOptionalFeature`, `Enable-WindowsOptionalFeature -All -NoRestart` and `Disable-WindowsOptionalFeature`.",
    ],
    steps: [
      "Choose Windows Server or Windows 10/11.",
      "Choose List available, Install/enable or Remove/disable.",
      "Enter the exact feature name, for example `Web-Server` on Server or `Microsoft-Windows-Subsystem-Linux` on Windows 10/11. Use the list action to find names.",
      "Generate and run the command in PowerShell as Administrator, then restart if it asks you to.",
    ],
    examples: [
      {
        title: "Common Windows Server feature names",
        code: "Install-WindowsFeature Web-Server -IncludeManagementTools        # IIS\nInstall-WindowsFeature DNS -IncludeManagementTools               # DNS Server\nInstall-WindowsFeature Hyper-V -IncludeManagementTools -Restart  # Hyper-V\nInstall-WindowsFeature RSAT-AD-PowerShell                        # AD PowerShell module\nInstall-WindowsFeature Failover-Clustering -IncludeManagementTools",
        text: "`-IncludeManagementTools` adds the matching console and PowerShell module. Without it, you often get the role but no way to manage it locally.",
      },
      {
        title: "Common Windows 10/11 optional features",
        code: "Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All\nEnable-WindowsOptionalFeature -Online -FeatureName NetFx3 -All\nEnable-WindowsOptionalFeature -Online -FeatureName TelnetClient",
        text: "Feature names are case-insensitive but must match exactly. `Get-WindowsOptionalFeature -Online | Where-Object FeatureName -like '*hyper*'` helps you find them.",
      },
    ],
    tips: [
      { title: "Offline or no-internet servers", text: ".NET 3.5 and some features need source files. Add `-Source D:\\sources\\sxs` (Server) or `-Source` and `-LimitAccess` (DISM) pointing at matching installation media." },
      { title: "Install on remote servers", text: "`Install-WindowsFeature Web-Server -ComputerName SRV02` installs the role remotely from your management machine." },
      { title: "Install only what you need", text: "Every extra role increases patching effort and attack surface. On IIS in particular, avoid legacy components like CGI and WebDAV unless needed." },
      { title: "Check for a pending restart", text: "If an install fails immediately, a previous install may be waiting for a reboot. Restart and try again." },
    ],
    faq: [
      { q: "What's the difference between Get-WindowsFeature and Get-WindowsOptionalFeature?", a: "Get-WindowsFeature (ServerManager module) is for Windows Server roles and features. Get-WindowsOptionalFeature (DISM module) works on client Windows and also on Server." },
      { q: "How do I see what's installed?", a: "Server: `Get-WindowsFeature | Where-Object Installed`. Windows 10/11: `Get-WindowsOptionalFeature -Online | Where-Object State -eq 'Enabled'`." },
      { q: "Why do I get 'source files could not be found'?", a: "The feature payload isn't on the machine and Windows Update isn't reachable. Point `-Source` at the installation media's sources\\sxs folder." },
      { q: "Can I use DISM instead?", a: "Yes: `DISM /Online /Enable-Feature /FeatureName:NetFx3 /All`. The PowerShell cmdlets use the same engine." },
    ],
    related: [
      { href: "/windows/iis-command-generator/", label: "IIS Command Generator" },
      { href: "/windows/hyperv-command-generator/", label: "Hyper-V Command Generator" },
      { href: "/windows/sfc-dism-generator/", label: "SFC & DISM Repair Generator" },
      { href: "/windows/powershell-generator/", label: "PowerShell Command Generator" },
    ],
  },
};
