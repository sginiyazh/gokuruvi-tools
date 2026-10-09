import type { ToolGuideContent } from "./types";

export const linuxGuides: Record<string, ToolGuideContent> = {
  "chmod-calculator": {
    heading: "Using chmod safely on real servers",
    intro: [
      "The calculator above turns read, write and execute checkboxes into the numeric (`755`) and symbolic (`rwxr-xr-x`) forms. Knowing the numbers is the easy part. The mistakes that cause outages and security findings come from applying the right number to the wrong files, especially with recursive changes.",
      "This section covers the situations administrators hit most often: web content, SSH keys, shared directories and scripts that won't run, plus how to fix permissions after a bad `chmod -R`.",
    ],
    steps: [
      "Tick the permissions you need for owner, group and others, or click a preset such as 755 or 644.",
      "Check the numeric and symbolic result, and the generated `chmod` command.",
      "Before running it, check the current state with `ls -l` (or `stat -c '%a %U:%G %n' file`) so you know what you're changing.",
      "Replace `filename` with your path. For a whole tree, use the `find` patterns below rather than `chmod -R`.",
    ],
    examples: [
      {
        title: "Directories 755, files 644: the right way to fix a web root",
        code: "find /var/www/html -type d -exec chmod 755 {} +\nfind /var/www/html -type f -exec chmod 644 {} +",
        text: "`chmod -R 755` would make every file executable, which is wrong for HTML, images and config files. Treating directories and files separately is the standard fix.",
      },
      {
        title: "Permissions SSH insists on",
        code: "chmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys ~/.ssh/id_ed25519\nchmod 644 ~/.ssh/id_ed25519.pub",
        text: "If these are too open, sshd silently ignores your keys and you get \"Permission denied (publickey)\". The Linux troubleshooting guide covers this in its SSH section.",
      },
    ],
    tips: [
      { title: "Never use 777 to \"fix\" access", text: "It lets every user on the server modify or replace the file. Find the right owner and group instead, often with the Ownership Command Generator." },
      { title: "Execute on a directory means \"enter\"", text: "Without `x` on a directory you can't `cd` into it or reach files inside, even if the files themselves are readable." },
      { title: "Check every directory in the path", text: "A file with 644 is still unreadable if a parent directory blocks access. `namei -l /full/path/to/file` shows the permissions of every component." },
      { title: "chmod can't override SELinux or ACLs", text: "If permissions look right but access is still denied, check `getfacl file` and SELinux denials with `ausearch -m avc -ts recent`." },
    ],
    faq: [
      { q: "What does chmod 755 mean?", a: "Owner can read, write and execute (7); group and others can read and execute (5). It's the normal setting for directories and executable scripts." },
      { q: "What's the difference between 644 and 664?", a: "664 also lets the group write. Use it for shared project files where a team group needs to edit them." },
      { q: "How do I undo a wrong chmod -R?", a: "There's no undo. Restore from backup, or for packaged files on RHEL run `rpm --setperms <package>`. Before big changes, save permissions with `getfacl -R /path > perms.acl` so you can restore them with `setfacl --restore=perms.acl`." },
      { q: "Why does my script say Permission denied?", a: "It probably lacks the execute bit (`chmod +x script.sh`), or it's on a filesystem mounted with `noexec`. Check with `findmnt -o TARGET,OPTIONS /path`." },
    ],
    related: [
      { href: "/linux/permission-converter/", label: "Permission Converter" },
      { href: "/linux/ownership-command-generator/", label: "Ownership Command Generator" },
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
      { href: "/windows/icacls-generator/", label: "Windows NTFS Permission Generator" },
    ],
  },

  "permission-converter": {
    heading: "Special permissions, umask and ACLs explained",
    intro: [
      "This converter handles more than the basic read/write/execute bits: it also supports the three special permissions, setuid (4), setgid (2) and the sticky bit (1), which become a fourth leading digit such as `4755` or `2775`. These are the bits that confuse people most, and the ones security audits look for.",
      "Below are the practical uses for each special bit, how umask decides the permissions new files get, and when you need ACLs because plain permissions aren't enough.",
    ],
    steps: [
      "Choose Numeric to Symbolic or Symbolic to Numeric.",
      "Enter a value such as `2775` or `rwxrwsr-x`, or tick the boxes, including the special permissions if you need them.",
      "Click Convert Permission and choose Regular file or Directory to see how `ls -l` would display it.",
      "Copy the generated `chmod` command and apply it.",
    ],
    examples: [
      {
        title: "A shared team directory with setgid",
        code: "sudo groupadd devteam\nsudo mkdir /srv/projects\nsudo chgrp devteam /srv/projects\nsudo chmod 2775 /srv/projects        # drwxrwsr-x",
        text: "The `s` in the group position (setgid on a directory) makes every new file inherit the `devteam` group, so the whole team can keep editing each other's files.",
      },
      {
        title: "Why /tmp is 1777",
        code: "ls -ld /tmp\n# drwxrwxrwt. 20 root root 4096 Oct  9 10:00 /tmp",
        text: "The trailing `t` is the sticky bit. Everyone can create files, but only a file's owner (or root) can delete or rename it.",
      },
    ],
    tips: [
      { title: "Audit setuid files", text: "Setuid programs run with their owner's privileges, often root. List them with `find / -xdev -perm -4000 -type f 2>/dev/null` and investigate anything unexpected." },
      { title: "Capital S or T means no execute", text: "`rwSr--r--` means setuid is set but the execute bit isn't, which is almost always a mistake." },
      { title: "umask sets the defaults", text: "New files start at 666 and directories at 777, minus the umask. A umask of `022` gives 644 and 755; `002` gives 664 and 775 for group-shared work." },
      { title: "When you need more than one group", text: "Basic permissions allow one owner and one group. To give a second group access, use ACLs: `setfacl -m g:auditors:rx /srv/projects`." },
    ],
    faq: [
      { q: "What does chmod 4755 do?", a: "It sets setuid plus 755. When anyone runs the program, it runs as the file's owner. `/usr/bin/passwd` uses this to update `/etc/shadow`." },
      { q: "Does setuid work on shell scripts?", a: "No. Linux ignores setuid on interpreted scripts for security reasons. Use `sudo` rules instead." },
      { q: "How do I see special permissions numerically?", a: "`stat -c '%a %A %n' file` prints both forms, for example `2775 drwxrwsr-x /srv/projects`." },
      { q: "How do I check if a file has ACLs?", a: "A `+` at the end of the permission string in `ls -l` (for example `rwxr-xr-x+`) means ACLs exist. View them with `getfacl file`." },
    ],
    related: [
      { href: "/linux/chmod-calculator/", label: "chmod Calculator" },
      { href: "/linux/ownership-command-generator/", label: "Ownership Command Generator" },
      { href: "/linux/useradd-generator/", label: "Useradd Command Generator" },
      { href: "/guides/linux-security-hardening/", label: "Linux Security Hardening Guide" },
    ],
  },

  "cron-generator": {
    heading: "Why cron jobs fail, and how to make them reliable",
    intro: [
      "Building the five-field schedule is the easy part, and the generator above does it for you, including a preview of the next run times. Most \"my cron job doesn't run\" problems come from cron's environment rather than the schedule: a different PATH, no login profile, and no terminal to show errors.",
      "This section covers how to install the entry correctly, capture output, and troubleshoot jobs that work by hand but fail from cron.",
    ],
    steps: [
      "Pick a preset or set minute, hour, day of month, month and day of week.",
      "Enter the command, ideally using full paths (`/usr/bin/python3`, not `python3`).",
      "Choose a shell prefix if the command needs bash features, then click Generate Cron Entry and check the next estimated runs.",
      "Install it with `crontab -e` for your user, or as a file in `/etc/cron.d/` for system jobs, which needs an extra user field.",
    ],
    examples: [
      {
        title: "A production-ready cron entry",
        code: "# crontab -e\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin\nMAILTO=\"\"\n30 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1",
        text: "Setting PATH at the top avoids \"command not found\" errors, and redirecting both output and errors to a log means failures leave evidence.",
      },
      {
        title: "Stop overlapping runs",
        code: "*/5 * * * * /usr/bin/flock -n /run/lock/sync.lock /opt/scripts/sync.sh",
        text: "If a run takes longer than five minutes, `flock -n` skips the next one instead of starting a second copy. Overlapping runs are a common cause of corrupted data and high load.",
      },
    ],
    tips: [
      { title: "Escape % signs", text: "In a crontab, `%` means newline. Write `date +\\%F` instead of `date +%F`, or move the command into a script." },
      { title: "Check that cron ran it", text: "`grep CRON /var/log/cron` (RHEL) or `journalctl -u cron` (Ubuntu) shows whether the job started. If it started but did nothing, the problem is in the command." },
      { title: "Reproduce cron's environment", text: "`env -i SHELL=/bin/sh PATH=/usr/bin:/bin HOME=$HOME /opt/scripts/backup.sh` runs the script with the minimal environment cron provides." },
      { title: "Mind the time zone", text: "Cron uses the server's time zone (`timedatectl`). Servers on UTC run \"2 AM\" jobs at 2 AM UTC, not local time." },
    ],
    faq: [
      { q: "What does */15 mean?", a: "Every 15 units of that field. `*/15` in the minute field runs at :00, :15, :30 and :45." },
      { q: "How do I run a job at reboot?", a: "Use `@reboot /opt/scripts/start.sh`. For services, a systemd unit is usually a better choice." },
      { q: "Why does my job run twice?", a: "It may be in two places (user crontab and `/etc/cron.d/`), or on two servers behind the same schedule. Check `crontab -l`, `/etc/cron.d/` and `/etc/crontab`." },
      { q: "Should I use cron or systemd timers?", a: "Cron is simpler and universal. systemd timers add logging in the journal, dependencies, and catch-up for runs missed while the server was off (`Persistent=true`)." },
    ],
    related: [
      { href: "/linux/systemd-service-generator/", label: "Systemd Service Generator" },
      { href: "/database/backup-command-generator/", label: "Database Backup Command Generator" },
      { href: "/linux/tar-command-generator/", label: "Tar Command Generator" },
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
    ],
  },

  "systemd-service-generator": {
    heading: "Deploying and troubleshooting your systemd service",
    intro: [
      "A unit file turns any long-running program into a proper service: started at boot, restarted on failure, logged to the journal and managed with `systemctl`. The generator above covers the options that matter most: service type, ExecStart and friends, user and environment, restart policy, timeouts, logging, and basic hardening such as PrivateTmp and NoNewPrivileges.",
      "Below is how to install the generated unit, choose the right service type, and fix the most common reasons a new service won't start.",
    ],
    steps: [
      "Fill in the service name, description and the full path to the program in ExecStart.",
      "Pick the service type. Use `simple` (or `exec`) for programs that stay in the foreground, and `forking` only for old daemons that background themselves.",
      "Set a dedicated User and Group, the restart policy (usually `on-failure`), and WantedBy=multi-user.target.",
      "Save the output as `/etc/systemd/system/<name>.service`, then run the commands below.",
    ],
    examples: [
      {
        title: "Installing the unit",
        code: "sudo vi /etc/systemd/system/myapp.service      # paste the generated unit\nsudo systemd-analyze verify /etc/systemd/system/myapp.service\nsudo systemctl daemon-reload\nsudo systemctl enable --now myapp\nsystemctl status myapp --no-pager",
        text: "`systemd-analyze verify` catches typos and invalid options before you start the service. `daemon-reload` is required every time you edit the file.",
      },
      {
        title: "Changing a packaged service without editing its file",
        code: "sudo systemctl edit nginx\n# [Service]\n# LimitNOFILE=65536\nsudo systemctl daemon-reload && sudo systemctl restart nginx",
        text: "Drop-in overrides in `/etc/systemd/system/<name>.service.d/` survive package updates, unlike edits to files in `/usr/lib/systemd/system/`.",
      },
    ],
    tips: [
      { title: "Use absolute paths", text: "ExecStart doesn't search your shell's PATH the way you might expect, and doesn't do shell expansion. For pipes or `&&`, wrap the command: `ExecStart=/bin/bash -c '...'`." },
      { title: "Don't daemonize with type simple", text: "If the program forks into the background but the unit says `Type=simple`, systemd thinks it exited and may restart it in a loop." },
      { title: "Wait for the network properly", text: "`After=network.target` doesn't mean the network is up. Use `Wants=network-online.target` plus `After=network-online.target` for services that need it at start." },
      { title: "Read the logs", text: "`journalctl -u myapp -b --no-pager` shows the real error. Status 203/EXEC means the ExecStart path is wrong or not executable; 217/USER means the user doesn't exist." },
    ],
    faq: [
      { q: "Where should custom unit files go?", a: "`/etc/systemd/system/`. Files there override packaged units in `/usr/lib/systemd/system/` (or `/lib/systemd/system/` on Debian)." },
      { q: "What's the difference between Restart=on-failure and always?", a: "`on-failure` restarts after crashes and non-zero exits; `always` also restarts after a clean exit. Most services want on-failure." },
      { q: "Why does my service stop restarting after a few failures?", a: "systemd's start limit (by default 5 starts within 10 seconds) stops the loop. Fix the cause, then `systemctl reset-failed myapp`." },
      { q: "How do I pass secrets to a service?", a: "Use `EnvironmentFile=/etc/myapp/env` with permissions 600 rather than putting secrets in the unit file, which any user can read with `systemctl cat`." },
    ],
    related: [
      { href: "/linux/cron-generator/", label: "Cron Expression Generator" },
      { href: "/linux/useradd-generator/", label: "Useradd Command Generator" },
      { href: "/windows/service-command-generator/", label: "Windows Service Generator" },
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
    ],
  },

  "useradd-generator": {
    heading: "Creating Linux users correctly on RHEL and Ubuntu",
    intro: [
      "Creating a user looks like one command, but a production-ready account usually needs several: the account itself, a password or SSH key, the right groups, sudo access through the correct admin group, and sometimes an expiry date or a forced password change. The generator above builds all of these, with presets for normal users, RHEL and Ubuntu admins, service accounts, Docker users and temporary accounts.",
      "Below are the differences between distributions, how to set up key-based login, and how to manage accounts safely afterwards.",
    ],
    steps: [
      "Enter the username, and optionally a full name, shell, UID and primary group.",
      "Add supplementary groups and tick the options you need: create home directory, system account, sudo access, password change at first login.",
      "Pick the admin group for your distribution: `wheel` on RHEL, Rocky and AlmaLinux, `sudo` on Ubuntu and Debian.",
      "Click Generate User Commands, review them, and run them with sudo.",
    ],
    examples: [
      {
        title: "A new administrator with SSH key login",
        code: "sudo useradd -m -c \"Priya Nair\" -s /bin/bash -G wheel priya\nsudo install -d -m 700 -o priya -g priya /home/priya/.ssh\necho 'ssh-ed25519 AAAA... priya@laptop' | sudo tee /home/priya/.ssh/authorized_keys\nsudo chown priya:priya /home/priya/.ssh/authorized_keys\nsudo chmod 600 /home/priya/.ssh/authorized_keys",
        text: "With key login set up, the user never needs a password over SSH. On Ubuntu, use `-G sudo` instead of `wheel`.",
      },
      {
        title: "A service account that can't log in",
        code: "sudo useradd -r -s /sbin/nologin -d /opt/myapp -M myapp",
        text: "`-r` creates a system account (low UID, no aging), `nologin` blocks interactive login, and `-M` skips creating a home directory.",
      },
    ],
    tips: [
      { title: "useradd vs adduser", text: "On Ubuntu and Debian, `adduser` is an interactive wrapper that creates the home directory and asks for a password. On RHEL, `adduser` is just a link to `useradd`." },
      { title: "Use -aG, never -G alone, with usermod", text: "`usermod -G docker priya` replaces all of priya's supplementary groups. `usermod -aG docker priya` appends." },
      { title: "Group changes need a new login", text: "After adding a user to a group, they must log out and back in (or run `newgrp`) before the new group applies." },
      { title: "Lock, don't delete, first", text: "When someone leaves, `usermod -L -e 1 user` locks and expires the account. Delete later with `userdel -r` once files are reviewed." },
    ],
    faq: [
      { q: "How do I give a user sudo access?", a: "Add them to `wheel` (RHEL family) or `sudo` (Ubuntu/Debian). For narrower rights, create a file in `/etc/sudoers.d/` with `visudo -f`." },
      { q: "How do I force a password change at first login?", a: "`sudo chage -d 0 username` expires the password immediately, so the user must choose a new one at next login." },
      { q: "How do I check a user's groups and account status?", a: "`id username` shows groups; `sudo chage -l username` shows password aging; `sudo passwd -S username` shows whether it's locked." },
      { q: "Why can't the new user log in over SSH?", a: "Common causes: no password or key set, `AllowUsers`/`AllowGroups` in sshd_config, a `nologin` shell, or wrong `.ssh` permissions." },
    ],
    related: [
      { href: "/linux/ownership-command-generator/", label: "Ownership Command Generator" },
      { href: "/linux/ssh-command-builder/", label: "SSH Command Builder" },
      { href: "/network/password-generator/", label: "Password Generator" },
      { href: "/windows/user-management-generator/", label: "Windows Local User Generator" },
    ],
  },

  "tar-command-generator": {
    heading: "Tar for backups and migrations: practical patterns",
    intro: [
      "`tar` bundles files and directories into one archive, optionally compressed with gzip, bzip2, xz or zstd. It's still the standard way to package application directories, move data between servers and keep simple file-level backups. The generator above handles create, extract, list and append, with compression levels, exclusions, incremental `--newer` selection and options such as preserving permissions and staying on one filesystem.",
      "Below are the patterns that matter in real work: choosing compression, verifying archives, copying over SSH, and avoiding the classic extraction mistakes.",
    ],
    steps: [
      "Choose the operation: Create, Extract, List or Append.",
      "Set the archive name and compression. The extension is added for you.",
      "For create, add the source paths and exclusions. Use Change to directory so the archive stores relative paths.",
      "For extract, set a destination directory, then generate the command and run it.",
    ],
    examples: [
      {
        title: "Back up an application, skipping logs and cache",
        code: "tar -C /opt -czf /backup/myapp-$(date +%F).tar.gz \\\n    --exclude='myapp/logs' --exclude='myapp/cache' myapp\ntar -tzf /backup/myapp-$(date +%F).tar.gz | head        # check the contents",
        text: "`-C /opt` stores paths as `myapp/...` instead of `/opt/myapp/...`, so the archive can be restored anywhere.",
      },
      {
        title: "Copy a directory to another server without a temporary file",
        code: "tar -C /data -czf - reports | ssh admin@server02 'tar -C /data -xzf -'",
        text: "The archive streams through SSH and unpacks on the other side, which is useful when the source disk has no room for an archive. For repeat syncs, rsync is usually better.",
      },
    ],
    tips: [
      { title: "Pick compression by need", text: "zstd is fast with good compression and is the best default on modern systems; gzip is the most compatible; xz compresses smallest but slowly." },
      { title: "List before you extract", text: "`tar -tf archive.tar.gz` shows what's inside and where it will land. Archives with absolute paths or `../` entries can overwrite files you didn't expect." },
      { title: "Extracting as root restores ownership", text: "As root, tar restores the stored owners and permissions. As a normal user, files become yours. Use `--no-same-owner` if you don't want the original owners." },
      { title: "tar alone isn't a backup strategy", text: "Copy archives off the server, test restores regularly, and use database-specific tools for databases. Copying live database files with tar gives an inconsistent backup." },
    ],
    faq: [
      { q: "What do -c, -x, -t, -z and -f mean?", a: "`-c` create, `-x` extract, `-t` list, `-z` gzip, and `-f` names the archive file. `-f` must be followed by the file name." },
      { q: "How do I extract a single file?", a: "Name its path as stored in the archive: `tar -xzf backup.tar.gz myapp/config/app.conf`. Use `tar -tzf` first to get the exact path." },
      { q: "Do I need to specify the compression when extracting?", a: "GNU tar detects it automatically, so `tar -xf archive.tar.xz` works. Specifying it is still needed when reading from a pipe." },
      { q: "Why does tar say 'Removing leading / from member names'?", a: "That's a safety feature: absolute paths are stored as relative, so extracting can't overwrite system files by accident." },
    ],
    related: [
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
      { href: "/linux/cron-generator/", label: "Cron Expression Generator" },
      { href: "/database/backup-command-generator/", label: "Database Backup Command Generator" },
      { href: "/security/file-checksum-generator/", label: "File Checksum Generator" },
    ],
  },

  "ownership-command-generator": {
    heading: "chown and chgrp in practice: safe ownership changes",
    intro: [
      "Wrong ownership causes many of the \"Permission denied\" errors that people try to fix with `chmod 777`. The correct fix is usually to make the right user or group own the files. The generator above builds `chown` and `chgrp` commands with recursive, verbose and changes-only output, symlink handling, `--from` filters, `--reference` copying and multiple targets.",
      "Below are the safe patterns for common jobs, with the options that stop a recursive change from going wrong.",
    ],
    steps: [
      "Choose whether to change owner and group, owner only, or group only.",
      "Enter the new owner and/or group and the target path.",
      "Tick Recursive only if the whole tree should change, and keep Preserve root on.",
      "Generate the command, check the target path carefully, and run it.",
    ],
    examples: [
      {
        title: "Give a web application its files",
        code: "sudo chown -R nginx:nginx /var/www/myapp          # RHEL (Ubuntu: www-data:www-data)\nsudo chown -R deploy:nginx /var/www/myapp         # deploy user owns, web server group can read",
        text: "The second form is often better: your deployment user can update files, and the web server can only read them through the group.",
      },
      {
        title: "Fix only files owned by an old user",
        code: "sudo chown -R --from=olduser newuser /srv/shared\nsudo find /srv/shared -nouser -ls                 # files whose owner no longer exists",
        text: "`--from` changes only files currently owned by `olduser` and leaves everything else alone, which is useful after renaming accounts.",
      },
    ],
    tips: [
      { title: "Double-check recursive targets", text: "`sudo chown -R user: /` (a stray space or empty variable) can make a server unbootable. Keep `--preserve-root`, which chown uses by default, and quote variables." },
      { title: "Symlinks", text: "By default, chown changes the target of a symlink named on the command line. With `-R`, it doesn't follow symlinks inside the tree unless you add `-L`. Use `-h` to change the link itself." },
      { title: "Changing ownership clears setuid", text: "chown removes setuid and setgid bits from executables for security. Re-apply them afterwards if they are really needed." },
      { title: "Container volumes use numeric IDs", text: "Inside containers, ownership is matched by UID and GID numbers, not names. Use `chown -R 1000:1000 /data` when the container user is UID 1000." },
    ],
    faq: [
      { q: "Can a normal user change a file's owner?", a: "No. Only root can change the owner. A user can change the group to another group they belong to, using chgrp." },
      { q: "What does chown user: (with a colon) do?", a: "It sets the owner to `user` and the group to that user's login group." },
      { q: "How do I copy ownership from another file?", a: "`chown --reference=/etc/nginx/nginx.conf target.conf` gives the target the same owner and group." },
      { q: "Why is ownership shown as a number?", a: "The UID or GID has no matching user or group, often after copying files between servers or deleting an account. Create the account or chown to an existing one." },
    ],
    related: [
      { href: "/linux/chmod-calculator/", label: "chmod Calculator" },
      { href: "/linux/permission-converter/", label: "Permission Converter" },
      { href: "/linux/useradd-generator/", label: "Useradd Command Generator" },
      { href: "/windows/icacls-generator/", label: "Windows NTFS Permission Generator" },
    ],
  },

  "ssh-command-builder": {
    heading: "SSH beyond the basics: jump hosts, tunnels and config files",
    intro: [
      "Most people use only `ssh user@host`. In operations work you regularly need more: reaching servers through a bastion, forwarding a database port to your laptop, keeping sessions alive through firewalls, or debugging why a connection fails. The builder above handles all of this, including jump hosts, local, remote and dynamic forwarding, keepalives, host key checking and troubleshooting options.",
      "Below are worked examples for the most common jobs, and how to turn a long command into a short entry in `~/.ssh/config`.",
    ],
    steps: [
      "Enter the host, user, port and optionally a private key file.",
      "If the server is only reachable through a bastion, fill in the jump host details.",
      "For tunnels, choose the forwarding type and ports, and tick \"Do not execute command\" (`-N`).",
      "Set keepalives for long sessions, generate the command, and run it.",
    ],
    examples: [
      {
        title: "Reach a private database through a bastion",
        code: "ssh -N -J admin@bastion.example.com -L 5432:db01.internal:5432 admin@app01.internal\n# then, on your laptop:\npsql -h 127.0.0.1 -p 5432 -U app orders",
        text: "`-J` hops through the bastion, and `-L` makes the private database appear on your own port 5432 while the command runs.",
      },
      {
        title: "Turn it into a config entry",
        code: "# ~/.ssh/config\nHost bastion\n    HostName bastion.example.com\n    User admin\n\nHost app01\n    HostName app01.internal\n    User admin\n    ProxyJump bastion\n    ServerAliveInterval 30\n    IdentityFile ~/.ssh/id_ed25519",
        text: "Now `ssh app01` does the same job, and `scp`, `rsync` and Ansible use these settings too.",
      },
    ],
    tips: [
      { title: "Prefer ProxyJump to agent forwarding", text: "`-A` lets anyone with root on the remote server use your agent's keys while you're connected. `-J` gets you through a bastion without exposing your keys." },
      { title: "Keep idle sessions alive", text: "Firewalls and NAT often drop idle connections. `ServerAliveInterval 30` with `ServerAliveCountMax 3` keeps them open and detects dead ones." },
      { title: "Don't disable host key checking in production", text: "`StrictHostKeyChecking=no` removes protection against man-in-the-middle attacks. `accept-new` trusts new hosts but still warns if a known key changes." },
      { title: "Debug with -v", text: "`ssh -v` shows which keys are offered and where the connection stops. The SSH section of the Linux troubleshooting guide explains how to read it." },
    ],
    faq: [
      { q: "What's the difference between -L, -R and -D?", a: "`-L` forwards a local port to a remote destination. `-R` exposes a port on the remote side that comes back to you. `-D` creates a SOCKS proxy that sends your browser traffic through the server." },
      { q: "How do I use a specific key?", a: "`ssh -i ~/.ssh/mykey user@host`. The key file must be readable only by you (`chmod 600`)." },
      { q: "How do I run a command and exit?", a: "Put it after the host: `ssh admin@web01 'df -h /var'`. Add `-t` if the command needs a terminal, such as `top` or `sudo` prompts." },
      { q: "Why does SSH say 'REMOTE HOST IDENTIFICATION HAS CHANGED'?", a: "The server's host key differs from the one you saved. That's expected after a rebuild, but confirm with the server owner, then remove the old entry with `ssh-keygen -R host`." },
    ],
    related: [
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
      { href: "/linux/useradd-generator/", label: "Useradd Command Generator" },
      { href: "/linux/rsync-command-generator/", label: "Rsync Command Generator" },
      { href: "/network/port-checker/", label: "Port Checker" },
    ],
  },

  "file-finder-command": {
    heading: "Using find to solve real server problems",
    intro: [
      "`find` is one of the most useful commands on a Linux server because it can filter by almost anything: name, type, size, age, owner, permissions, emptiness and depth. The generator above builds those filters for you, including case-insensitive names, size and time conditions, permission and ownership matches, depth limits and staying on one filesystem.",
      "Below are the searches administrators run most often, plus how to act on the results safely.",
    ],
    steps: [
      "Set the search path. Be as specific as you can; searching `/` is slow.",
      "Add a name pattern in quotes (for example `*.log`), and choose the object type.",
      "Add size, time, owner or permission filters, and limit depth or stay on one filesystem if needed.",
      "Generate the command, run it, and review the list before adding any delete or exec action.",
    ],
    examples: [
      {
        title: "What's filling the disk?",
        code: "sudo find /var -xdev -type f -size +500M -exec ls -lh {} + 2>/dev/null | sort -k5 -h | tail",
        text: "Lists the largest files on the `/var` filesystem only. `-xdev` avoids crossing into other mounts, and the errors from unreadable directories are hidden.",
      },
      {
        title: "Clean up old logs safely",
        code: "find /var/log/myapp -type f -name '*.log' -mtime +30 -print       # review first\nfind /var/log/myapp -type f -name '*.log' -mtime +30 -delete      # then delete",
        text: "Always run the search with `-print` first. `-mtime +30` means modified more than 30 days ago.",
      },
    ],
    tips: [
      { title: "Quote your patterns", text: "Write `-name '*.log'`, not `-name *.log`. Without quotes, the shell expands the pattern before find sees it, giving wrong results or errors." },
      { title: "Put -delete last", text: "find evaluates left to right. `find . -delete -name '*.tmp'` deletes everything, because the delete runs before the name test." },
      { title: "Use + with -exec", text: "`-exec cmd {} +` runs the command once with many files, which is much faster than `-exec cmd {} \\;` running it once per file." },
      { title: "Security audits", text: "`find / -xdev -perm -0002 -type f` finds world-writable files, and `find / -xdev -nouser` finds files whose owner was deleted. Both are common audit checks." },
    ],
    faq: [
      { q: "What's the difference between -mtime, -atime and -ctime?", a: "`-mtime` is when the content changed, `-atime` when it was last read (often unreliable because of `relatime`), and `-ctime` when metadata such as permissions changed." },
      { q: "How do I search case-insensitively?", a: "Use `-iname` instead of `-name`: `find /home -iname 'report*.pdf'`." },
      { q: "How do I exclude a directory?", a: "Use `-prune`: `find /srv -path /srv/backup -prune -o -name '*.conf' -print`." },
      { q: "Is locate faster than find?", a: "Yes, because it searches a prebuilt database, but results may be out of date until `updatedb` runs. Use find when you need current results or filters other than names." },
    ],
    related: [
      { href: "/guides/linux-server-troubleshooting/", label: "Linux Server Troubleshooting Guide" },
      { href: "/linux/tar-command-generator/", label: "Tar Command Generator" },
      { href: "/linux/chmod-calculator/", label: "chmod Calculator" },
      { href: "/linux/sed-command-generator/", label: "Sed Command Generator" },
    ],
  },
};
