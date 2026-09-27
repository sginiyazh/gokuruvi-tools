import type { ToolGuideContent } from "./types";

export const databaseGuides: Record<string, ToolGuideContent> = {
  "database-port-reference": {
    heading: "Default database ports and how to use them",
    intro: [
      "Every database server listens on a default TCP port. You need these numbers when writing firewall rules, cloud security groups, Kubernetes Services and application connection strings. They're also the first thing to check when an application reports \"connection refused\" or a timeout.",
      "The list covers PostgreSQL (5432), MySQL and MariaDB (3306), Microsoft SQL Server (1433 plus the SQL Browser on UDP 1434), Oracle Listener (1521), MongoDB (27017), Redis (6379), Cassandra (9042), Elasticsearch (9200) and CouchDB (5984). Type in the filter box to narrow it down.",
    ],
    steps: [
      "Type the database name or a port number in the Filter box.",
      "Note the port and protocol (TCP or UDP).",
      "Confirm the server really uses the default. Administrators often change ports, especially for named SQL Server instances.",
      "Open the port only between the application servers and the database, never to the whole internet.",
    ],
    examples: [
      {
        title: "Testing whether a database port is reachable",
        code: "# Linux\nnc -zv db01.example.com 5432\n\n# Windows PowerShell\nTest-NetConnection db01.example.com -Port 1433",
        text: "\"succeeded\" or \"TcpTestSucceeded : True\" means the network path and listener are fine, so a remaining login failure is about credentials or database permissions.",
      },
      {
        title: "Checking which port a server actually listens on",
        code: "# On the database server (Linux)\nss -ltnp | grep -E 'postgres|mysqld|oracle'\n\n# PostgreSQL\npsql -c 'SHOW port;'\n\n# MySQL\nmysql -e \"SHOW VARIABLES LIKE 'port';\"",
        text: "Use this when the application's configured port doesn't match what's really running.",
      },
    ],
    tips: [
      { title: "Never expose databases to the internet", text: "Internet-facing ports 3306, 5432, 6379, 9200 and 27017 are scanned constantly. Unprotected Redis, Elasticsearch and MongoDB servers are a leading cause of data leaks." },
      { title: "SQL Server named instances use dynamic ports", text: "A named instance like `SQL01\\REPORTS` usually listens on a dynamic port and relies on the SQL Browser (UDP 1434). Assign a static port in SQL Server Configuration Manager to simplify firewall rules." },
      { title: "Changing the port isn't security", text: "A non-default port reduces log noise from automated scans, but it doesn't replace firewalls, TLS and strong authentication." },
      { title: "Remember replication and cluster ports", text: "Clusters use extra ports, such as Galera 4567/4568/4444, Oracle RAC interconnects or MongoDB replica sets. Check your product's documentation." },
    ],
    faq: [
      { q: "What port does PostgreSQL use?", a: "PostgreSQL uses TCP 5432 by default. It's set with the `port` parameter in postgresql.conf." },
      { q: "What port does SQL Server use?", a: "The default instance listens on TCP 1433. Named instances use dynamic ports discovered through the SQL Server Browser service on UDP 1434." },
      { q: "What port does Oracle use?", a: "The Oracle Net Listener defaults to TCP 1521. It's configured in listener.ora." },
      { q: "What port does Redis use?", a: "Redis listens on TCP 6379. Redis Sentinel uses 26379 and Redis Cluster uses 16379 for its cluster bus." },
    ],
    related: [
      { href: "/database/connection-string-builder/", label: "Connection String Builder" },
      { href: "/database/jdbc-url-builder/", label: "JDBC URL Builder" },
      { href: "/network/port-checker/", label: "Port Checker" },
      { href: "/windows/tcp-port-tester/", label: "TCP Port Tester" },
    ],
  },

  "jdbc-url-builder": {
    heading: "How to build a JDBC connection URL",
    intro: [
      "Java applications, Spring Boot services, application servers and many BI and ETL tools connect to databases through a JDBC URL. Each driver has its own format, and a small mistake such as a missing slash, the wrong separator or a SID used instead of a service name gives confusing errors.",
      "This builder produces a correct URL for PostgreSQL, MySQL, Microsoft SQL Server and Oracle (thin driver). Choosing a database fills in its default port. The SQL Server URL includes `encrypt=true;trustServerCertificate=false`, which is the secure default for current Microsoft drivers.",
    ],
    steps: [
      "Choose the database engine. The default port fills in automatically.",
      "Enter the hostname or IP address of the database server.",
      "Change the port if your server doesn't use the default.",
      "Enter the database name. For Oracle, enter the service name, not the SID.",
      "Click Generate and paste the URL into your application config.",
    ],
    examples: [
      {
        title: "The format for each engine",
        code: "jdbc:postgresql://db01:5432/orders\njdbc:mysql://db01:3306/orders\njdbc:sqlserver://db01:1433;databaseName=orders;encrypt=true;trustServerCertificate=false\njdbc:oracle:thin:@//db01:1521/ORCLPDB1",
        text: "Note the differences: SQL Server uses semicolon-separated properties, and Oracle's `@//host:port/service` form refers to a service name.",
      },
      {
        title: "Using it in Spring Boot",
        code: "spring.datasource.url=jdbc:postgresql://db01:5432/orders\nspring.datasource.username=orders_app\nspring.datasource.password=${DB_PASSWORD}",
        text: "Keep the username and password in separate properties, fed from environment variables or a secrets manager, rather than embedding them in the URL.",
      },
    ],
    tips: [
      { title: "Oracle SID vs service name", text: "The old SID syntax is `jdbc:oracle:thin:@host:1521:ORCL` (colon). Pluggable databases need the service name with `@//host:1521/service` (slash)." },
      { title: "SQL Server certificate errors", text: "If you get \"PKIX path building failed\", the server's certificate isn't trusted by Java. Import the CA into the Java truststore instead of setting `trustServerCertificate=true` in production." },
      { title: "MySQL timezone and SSL", text: "MySQL Connector/J often needs `?sslMode=REQUIRED` or `?serverTimezone=UTC` appended, depending on the server's configuration." },
      { title: "Named SQL Server instances", text: "Use `jdbc:sqlserver://host\\INSTANCE;databaseName=...` or, better, the instance's static port." },
    ],
    faq: [
      { q: "Where do I put the username and password?", a: "Most drivers accept `user` and `password` properties in the URL, but it's safer to set them separately in your connection pool or framework config." },
      { q: "Which driver JAR do I need?", a: "PostgreSQL: postgresql.jar. MySQL: mysql-connector-j. SQL Server: mssql-jdbc. Oracle: ojdbc11 (or ojdbc8 for Java 8)." },
      { q: "Why do I get 'No suitable driver found'?", a: "The JDBC driver JAR isn't on the classpath, or the URL prefix is misspelled, for example `jdbc:postgres:` instead of `jdbc:postgresql:`." },
      { q: "How do I connect to Oracle RAC or several hosts?", a: "Use a TNS-style descriptor or a SCAN address as the host. SCAN lets the listener spread connections across RAC nodes." },
    ],
    related: [
      { href: "/database/connection-string-builder/", label: "Connection String Builder" },
      { href: "/database/database-port-reference/", label: "Database Port Reference" },
      { href: "/database/sql-formatter/", label: "SQL Formatter" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
    ],
  },

  "sql-identifier-escaper": {
    heading: "How to quote SQL identifiers safely",
    intro: [
      "Table, column and schema names that contain spaces, reserved words (like `order`, `user` or `group`), mixed case or special characters must be quoted, or the query fails. Each database uses different quote characters: double quotes in PostgreSQL and Oracle (the SQL standard), backticks in MySQL and MariaDB, and square brackets in SQL Server.",
      "This tool wraps your identifier in the right quotes and escapes any quote characters inside the name by doubling them. That's also what you need when building dynamic SQL, where an unescaped identifier can become an injection point.",
    ],
    steps: [
      "Choose your database: PostgreSQL / Oracle, MySQL / MariaDB, or SQL Server.",
      "Enter a single identifier, such as a table or column name, without a schema prefix.",
      "Click Escape and copy the quoted result.",
      "For qualified names, escape each part separately and join them with a dot, for example `\"sales\".\"Order Items\"`.",
    ],
    examples: [
      {
        title: "The same name in each dialect",
        code: "-- PostgreSQL / Oracle\nSELECT \"Order Date\" FROM \"order\";\n\n-- MySQL / MariaDB\nSELECT `Order Date` FROM `order`;\n\n-- SQL Server\nSELECT [Order Date] FROM [order];",
        text: "`order` is a reserved word everywhere, so it must be quoted as a table name.",
      },
      {
        title: "Escaping in code",
        code: "-- PostgreSQL\nSELECT format('SELECT * FROM %I', 'Order Items');\n\n-- SQL Server\nSELECT QUOTENAME(N'Order Items');",
        text: "In stored procedures, use the database's built-in function. `quote_ident`/`format('%I')` in PostgreSQL and `QUOTENAME` in SQL Server do the same job as this tool.",
      },
    ],
    tips: [
      { title: "Quoting makes names case-sensitive", text: "In PostgreSQL, `\"Users\"` and `users` are different tables. Unquoted names are folded to lowercase (PostgreSQL) or uppercase (Oracle)." },
      { title: "Identifiers can't be parameters", text: "Prepared statement placeholders work only for values, not table or column names. Validate dynamic identifiers against an allowlist and quote them." },
      { title: "ANSI_QUOTES in MySQL", text: "If MySQL runs with `sql_mode=ANSI_QUOTES`, double quotes also work for identifiers, and string literals must use single quotes." },
      { title: "Better still, avoid awkward names", text: "Lowercase `snake_case` names without spaces or reserved words never need quoting, which prevents a whole class of bugs." },
    ],
    faq: [
      { q: "What's the difference between identifiers and string literals?", a: "Identifiers name objects like tables and columns. String literals are data values and always use single quotes, such as `'London'`." },
      { q: "How do I escape a quote inside the name?", a: "Double it: `\"` becomes `\"\"` in PostgreSQL, a backtick becomes two backticks in MySQL, and `]` becomes `]]` in SQL Server. The tool does this automatically." },
      { q: "Does this protect against SQL injection?", a: "Correct quoting prevents injection through identifiers. Combine it with allowlist validation, and always use parameters for values." },
      { q: "Does SQL Server support double quotes?", a: "Yes, when `QUOTED_IDENTIFIER` is ON (the default). Square brackets work regardless of that setting." },
    ],
    related: [
      { href: "/database/sql-formatter/", label: "SQL Formatter" },
      { href: "/database/connection-string-builder/", label: "Connection String Builder" },
      { href: "/database/backup-command-generator/", label: "Backup Command Generator" },
      { href: "/devops/regex-tester/", label: "Regex Tester" },
    ],
  },

  "backup-command-generator": {
    heading: "How to back up PostgreSQL, MySQL and SQL Server",
    intro: [
      "This tool generates a sensible backup command for the three most common relational databases, with production-friendly options already set.",
      "PostgreSQL uses `pg_dump -Fc`, the custom format. It's compressed and lets `pg_restore` restore selected tables or run in parallel. MySQL and MariaDB use `mysqldump --single-transaction --routines --triggers`, which takes a consistent snapshot of InnoDB tables without locking them and includes stored procedures and triggers. SQL Server uses `BACKUP DATABASE ... WITH CHECKSUM, COMPRESSION`, which checks page checksums while backing up and shrinks the file.",
    ],
    steps: [
      "Choose the database engine.",
      "Enter the host, database name, user and backup file path.",
      "Click Generate and review the command.",
      "Run it from a machine with the client tools installed. PostgreSQL and MySQL will prompt for the password.",
      "Test the backup by restoring it to a non-production server. A backup you've never restored is only a hope.",
    ],
    examples: [
      {
        title: "Scheduled nightly PostgreSQL backup",
        code: "# /etc/cron.d/pg-backup: 01:30 every night, keeps 14 days\n30 1 * * * postgres pg_dump -Fc -f /backup/orders_$(date +\\%F).dump orders && find /backup -name 'orders_*.dump' -mtime +14 -delete",
        text: "Running as the postgres OS user with peer authentication avoids storing a password. `%` must be escaped as `\\%` in cron.",
      },
      {
        title: "Verifying a SQL Server backup",
        code: "RESTORE VERIFYONLY FROM DISK = N'D:\\Backup\\orders.bak' WITH CHECKSUM;",
        text: "This confirms the backup file is readable and its checksums are valid, without restoring it. It's quick enough to run after every backup job.",
      },
    ],
    tips: [
      { title: "Keep passwords out of commands", text: "Use `~/.pgpass` for PostgreSQL and `~/.my.cnf` or `mysql_config_editor` for MySQL, instead of typing passwords on the command line where they show up in the process list and shell history." },
      { title: "Follow the 3-2-1 rule", text: "Keep three copies of your data, on two types of media, with one copy off-site or immutable. Ransomware targets backup folders on the same server." },
      { title: "Dumps aren't point-in-time recovery", text: "A nightly dump can lose up to a day of data. For lower RPO, add WAL archiving (PostgreSQL), binary logs (MySQL) or transaction log backups (SQL Server)." },
      { title: "Back up globals separately", text: "`pg_dump` doesn't include roles or tablespaces. Run `pg_dumpall --globals-only` too." },
    ],
    faq: [
      { q: "Does pg_dump lock the database?", a: "No. It takes a consistent snapshot and doesn't block normal reads or writes. It only conflicts with schema changes like `ALTER TABLE`." },
      { q: "Is --single-transaction safe for MyISAM tables?", a: "No. It only gives a consistent snapshot for InnoDB. MyISAM tables can change during the dump, so convert them to InnoDB." },
      { q: "Where does SQL Server write the backup file?", a: "On the SQL Server machine itself, as the SQL Server service account. That account needs write permission to the folder or network share." },
      { q: "How do I compress a MySQL dump?", a: "Pipe it through gzip: `mysqldump ... | gzip > orders.sql.gz`. Restore with `gunzip < orders.sql.gz | mysql ...`." },
    ],
    related: [
      { href: "/database/restore-command-generator/", label: "Restore Command Generator" },
      { href: "/database/database-size-calculator/", label: "Database Size Calculator" },
      { href: "/linux/cron-generator/", label: "Cron Generator" },
      { href: "/linux/tar-command-generator/", label: "Tar Command Generator" },
    ],
  },

  "connection-string-builder": {
    heading: "How to build a database connection string",
    intro: [
      "Applications need a connection string to find and log in to a database. The format depends on the language and driver. This tool builds the most common styles: PostgreSQL and MySQL URLs, used by Node.js, Python, Go and ORMs like Prisma, SQLAlchemy and Django; an ADO.NET string for SQL Server; and an Easy Connect style string for Oracle.",
      "In the URL formats, the username and password are percent-encoded automatically. A password containing `@`, `:` or `/` would otherwise break the URL. The SQL Server string sets `Encrypt=True;TrustServerCertificate=False` so the connection is encrypted and the certificate is validated.",
    ],
    steps: [
      "Choose the database engine. The default port fills in automatically.",
      "Enter host, port, database (or Oracle service name), username and password.",
      "Click Generate and copy the connection string.",
      "Store it in an environment variable or secrets manager, not in source code.",
    ],
    examples: [
      {
        title: "PostgreSQL URL with a special-character password",
        code: "postgresql://app_user:p%40ss%3Aword@db01:5432/orders",
        text: "The password `p@ss:word` is encoded as `p%40ss%3Aword`. Without encoding, the driver would read `ss` as the host.",
      },
      {
        title: "Using an environment variable",
        code: "# .env (never commit this file)\nDATABASE_URL=postgresql://app_user:secret@db01:5432/orders\n\n# Node.js\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });",
        text: "Most frameworks read `DATABASE_URL` by convention, including Prisma, Rails, Heroku-style platforms and many Python libraries.",
      },
    ],
    tips: [
      { title: "Require TLS", text: "Add `?sslmode=require` (PostgreSQL) or `?ssl-mode=REQUIRED` (MySQL) when connecting over any network you don't fully control, including cloud databases." },
      { title: "Use a least-privilege account", text: "The application user should only have the permissions it needs on its own database, never a superuser, `sa` or `root`." },
      { title: "Set timeouts", text: "Add a connect timeout, such as `connect_timeout=10` in PostgreSQL or `Connect Timeout=15` in SQL Server, so apps fail fast instead of hanging." },
      { title: "Pool connections", text: "Opening a new database connection per request is slow. Use your framework's pool, or PgBouncer for PostgreSQL." },
    ],
    faq: [
      { q: "Is my password sent to your server?", a: "No. The string is assembled in your browser. Still, avoid entering production passwords in any web tool; use a placeholder and substitute the real value in your vault." },
      { q: "What is the difference between a connection string and a JDBC URL?", a: "They serve the same purpose for different drivers. JDBC URLs start with `jdbc:` and are used by Java; the formats here are for other languages and .NET." },
      { q: "Why do I get 'password authentication failed'?", a: "Check the username, check for unencoded special characters in the password, and check that the server's authentication rules (for example pg_hba.conf) allow your client IP." },
      { q: "How do I connect to a SQL Server named instance?", a: "Use `Server=host\\INSTANCE` or `Server=host,port` with the instance's static port." },
    ],
    related: [
      { href: "/database/jdbc-url-builder/", label: "JDBC URL Builder" },
      { href: "/database/database-port-reference/", label: "Database Port Reference" },
      { href: "/devops/env-file-generator/", label: ".env File Generator" },
      { href: "/kubernetes/secret-generator/", label: "Kubernetes Secret Generator" },
    ],
  },

  "restore-command-generator": {
    heading: "How to restore PostgreSQL, MySQL and SQL Server backups",
    intro: [
      "Restoring is where backups prove their worth, and where rushed mistakes do the most damage. This tool generates the standard restore command for each engine.",
      "PostgreSQL uses `pg_restore --clean --if-exists`, which drops existing objects before recreating them, for custom-format dumps made with `pg_dump -Fc`. MySQL and MariaDB feed a SQL dump into the `mysql` client. SQL Server uses `RESTORE DATABASE ... WITH CHECKSUM`, which checks backup integrity during the restore.",
    ],
    steps: [
      "Choose the database engine.",
      "Enter the host, the target database, the user and the backup file path.",
      "Click Generate and read the command carefully. Check you're pointing at the right server.",
      "Restore to a test or staging server first whenever you can, and check row counts and application behavior.",
      "Only then restore to production, during an agreed maintenance window.",
    ],
    examples: [
      {
        title: "Restoring PostgreSQL into a new database",
        code: "createdb -h db01 -U postgres orders_restore\npg_restore -h db01 -U postgres -d orders_restore -j 4 /backup/orders.dump",
        text: "Restoring into a new database side by side is the safest approach. `-j 4` restores with four parallel jobs, which is much faster on large databases.",
      },
      {
        title: "SQL Server restore with new file locations",
        code: "RESTORE FILELISTONLY FROM DISK = N'D:\\Backup\\orders.bak';\n\nRESTORE DATABASE [orders_test] FROM DISK = N'D:\\Backup\\orders.bak'\nWITH MOVE 'orders' TO N'E:\\Data\\orders_test.mdf',\n     MOVE 'orders_log' TO N'F:\\Logs\\orders_test_log.ldf',\n     CHECKSUM, STATS = 10;",
        text: "FILELISTONLY shows the logical file names needed for MOVE. Without MOVE, the restore tries to overwrite the original database's files.",
      },
    ],
    tips: [
      { title: "--clean deletes data", text: "`pg_restore --clean` drops tables in the target database before restoring. Double-check the `-d` database name." },
      { title: "Match or exceed the source version", text: "You can restore an older backup onto a newer server, but not the other way round. SQL Server backups can't be restored to an older version at all." },
      { title: "Plain SQL dumps need psql", text: "If the PostgreSQL backup is a `.sql` text file, restore it with `psql -f file.sql`. pg_restore only reads custom, directory and tar formats." },
      { title: "Fix orphaned users after SQL Server restores", text: "Database users may lose their mapping to server logins. Fix them with `ALTER USER [app] WITH LOGIN = [app];`." },
    ],
    faq: [
      { q: "Can I restore a single table?", a: "With PostgreSQL custom-format dumps, yes: `pg_restore -t tablename`. MySQL dumps need the table's section extracted. SQL Server needs a restore to a new database, then a copy of the table." },
      { q: "How long will the restore take?", a: "Usually longer than the backup took, because indexes are rebuilt and constraints checked. Parallel restore (`-j`) helps for PostgreSQL." },
      { q: "Why does SQL Server say the database is in use?", a: "Other sessions are connected. Run `ALTER DATABASE [db] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;` first, then set it back to MULTI_USER afterwards." },
      { q: "What if the MySQL restore fails partway?", a: "The mysql client stops at the first error, leaving a partial restore. Fix the cause, drop and recreate the database, and restore again from the start." },
    ],
    related: [
      { href: "/database/backup-command-generator/", label: "Backup Command Generator" },
      { href: "/database/connection-string-builder/", label: "Connection String Builder" },
      { href: "/database/database-size-calculator/", label: "Database Size Calculator" },
      { href: "/network/bandwidth-calculator/", label: "Bandwidth Calculator" },
    ],
  },

  "sql-formatter": {
    heading: "How to format SQL for review and troubleshooting",
    intro: [
      "SQL copied from application logs, ORM debug output or monitoring tools usually arrives as one long line, which makes it hard to see what a query really does. Formatting puts each major clause on its own line so joins, filters and grouping stand out.",
      "This formatter uppercases common keywords and starts a new line before SELECT, FROM, WHERE, JOIN variants, GROUP BY, HAVING, ORDER BY, LIMIT, INSERT INTO, VALUES, UPDATE, SET and DELETE FROM. AND and OR conditions get their own indented lines. Formatting happens in your browser, so queries containing internal table names or data never leave your machine.",
    ],
    steps: [
      "Paste the SQL statement into the box.",
      "Click Format.",
      "Read the formatted query and look for missing join conditions, unexpected OR logic or missing WHERE clauses.",
      "Copy the result into your ticket, code review or query editor.",
    ],
    examples: [
      {
        title: "Before and after",
        code: "-- Before\nselect o.id,c.name,sum(i.qty) from orders o join customers c on c.id=o.customer_id left join items i on i.order_id=o.id where o.status='open' and o.created_at>'2026-01-01' group by o.id,c.name order by o.id\n\n-- After\nSELECT o.id, c.name, sum(i.qty)\nFROM orders o\nJOIN customers c ON c.id=o.customer_id\nLEFT JOIN items i ON i.order_id=o.id\nWHERE o.status='open'\n AND o.created_at>'2026-01-01'\nGROUP BY o.id, c.name\nORDER BY o.id",
        text: "The structure is now obvious at a glance: two joins, two filters, one aggregation.",
      },
      {
        title: "Finding slow queries to format",
        code: "-- PostgreSQL (needs the pg_stat_statements extension)\nSELECT query, calls, mean_exec_time\nFROM pg_stat_statements\nORDER BY mean_exec_time DESC\nLIMIT 10;",
        text: "Format the slowest queries, then run them with `EXPLAIN ANALYZE` to see where the time goes.",
      },
    ],
    tips: [
      { title: "Watch for OR without brackets", text: "`WHERE a = 1 AND b = 2 OR c = 3` means `(a AND b) OR c`, which is often not what the author intended. Formatting makes this easy to spot." },
      { title: "Check every JOIN has an ON", text: "A missing join condition creates a Cartesian product, which is a classic cause of huge result sets and runaway queries." },
      { title: "Keywords inside strings", text: "This is a lightweight formatter. Keywords inside string literals, such as `'SELECT FROM'`, may also be uppercased or split. Check literal values before running the formatted query." },
      { title: "Remove sensitive values before sharing", text: "Queries from logs can contain emails, IDs or tokens in literals. Replace them with placeholders before pasting into tickets." },
    ],
    faq: [
      { q: "Does formatting change what the query does?", a: "It only changes whitespace and keyword case, which SQL ignores, apart from the string literal caveat above." },
      { q: "Which databases does it support?", a: "It works on standard SQL, so queries for PostgreSQL, MySQL, SQL Server, Oracle and SQLite all format well. Vendor-specific syntax is left as is." },
      { q: "Is my SQL sent to a server?", a: "No. Formatting runs entirely in your browser." },
      { q: "Can it format stored procedures?", a: "It handles single statements best. For long procedures with control flow, use your IDE's formatter, such as the one in DBeaver, SSMS or DataGrip." },
    ],
    related: [
      { href: "/database/sql-identifier-escaper/", label: "SQL Identifier Escaper" },
      { href: "/devops/json-validator/", label: "JSON Validator" },
      { href: "/devops/yaml-validator/", label: "YAML Validator" },
      { href: "/devops/regex-tester/", label: "Regex Tester" },
    ],
  },

  "database-size-calculator": {
    heading: "How to forecast database storage growth",
    intro: [
      "Running out of disk space is one of the most avoidable database outages. This calculator converts your current size between MB, GB and TB, then projects how large the database will be after a number of months at a steady monthly growth rate.",
      "Growth is compounded monthly: projected size = current size × (1 + growth rate) ^ months. Units use binary conversion (1 TB = 1024 GB), matching how most operating systems and database tools report sizes.",
    ],
    steps: [
      "Enter the current database size and choose its unit.",
      "Enter the monthly growth rate as a percentage. The query below shows how to measure it.",
      "Enter how many months ahead to plan. 12 or 24 months is typical for storage purchases.",
      "Click Calculate and compare the projection with your available disk space, leaving headroom for backups, indexes and maintenance.",
    ],
    examples: [
      {
        title: "Measuring the current size",
        code: "-- PostgreSQL\nSELECT pg_size_pretty(pg_database_size(current_database()));\n\n-- MySQL\nSELECT table_schema, ROUND(SUM(data_length + index_length)/1024/1024/1024, 2) AS size_gb\nFROM information_schema.tables GROUP BY table_schema;\n\n-- SQL Server\nEXEC sp_spaceused;",
        text: "Record the value on the same day each month. Two or three readings give a realistic growth rate.",
      },
      {
        title: "Worked example",
        text: "A 500 GB database growing 4% per month becomes 500 × 1.04¹² ≈ 800 GB after one year and ≈ 1,280 GB (1.25 TB) after two years. A 1 TB volume would be full in about 18 months, before accounting for backups and temporary space.",
      },
    ],
    tips: [
      { title: "Plan for more than the data", text: "Transaction logs, WAL, temporary tables, index rebuilds and local backup files can need 50–100% extra space on top of the data itself." },
      { title: "Alert before it's urgent", text: "Set disk alerts at 75–80% used, so you have weeks, not hours, to extend storage." },
      { title: "Growth isn't always steady", text: "Month-end processing, new features and data imports cause jumps. Revisit the forecast quarterly." },
      { title: "Archive and purge", text: "Old logs, audit rows and soft-deleted records are often the fastest-growing tables. A retention policy can flatten the growth curve." },
    ],
    faq: [
      { q: "How do I calculate the monthly growth rate?", a: "(size this month − size last month) ÷ size last month × 100. Average it over several months for a steadier figure." },
      { q: "Why compound growth instead of linear?", a: "Databases often grow in proportion to their size, since more customers generate more transactions. Compound growth is the safer planning assumption." },
      { q: "Does this include backup storage?", a: "No. Backups need their own capacity, roughly the database size multiplied by the number of full backups you keep (less with compression)." },
      { q: "Is 1 TB 1000 GB or 1024 GB here?", a: "1024 GB, the binary convention used by most operating systems and database tools." },
    ],
    related: [
      { href: "/database/backup-command-generator/", label: "Backup Command Generator" },
      { href: "/vmware/datastore-capacity-calculator/", label: "Datastore Capacity Calculator" },
      { href: "/network/bandwidth-calculator/", label: "Bandwidth Calculator" },
      { href: "/windows/disk-health-checker/", label: "Disk Health Checker" },
    ],
  },
};
