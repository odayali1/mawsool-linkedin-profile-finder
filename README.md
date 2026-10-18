# LinkedIn Profile Finder | Name and Company

**Find LinkedIn profiles from a person’s name and company** — optional job title and LinkedIn URL for higher accuracy. Starting from $0.40 per 1,000
## If you need a different Mawsool Actor

| If this is what you need | Open |
| --- | --- |
| You have an email and want the LinkedIn profile. | [Reverse Email Lookup](https://apify.com/oday/mawsool-email-linkedin-lookup) |
| You have a profile URL and want the personal email. | [LinkedIn Email Finder](https://apify.com/oday/mawsool-linkedin-personal-email-finder) |
| You only need the current employer, before paying for a full profile. | [Current Company Checker](https://apify.com/oday/mawsool-linkedin-company-checker) |
| You want the current company and headline, and you will compare them to your CRM yourself. | [Profile Freshness Check](https://apify.com/oday/mawsool-linkedin-profile-freshness) |
| You want an alert when the employer or headline changes. | [Job Change Tracker](https://apify.com/oday/mawsool-linkedin-job-change-watch) |
| You have a profile URL and want the full profile. | [LinkedIn Profile Scraper](https://apify.com/oday/mawsool-linkedin-profile-details) |
| You have a large file of profile URLs. | [Mass Profile Scraper](https://apify.com/oday/mawsool-mass-linkedin-profile-scraper) |
| You want the current employer's website from a profile URL. | [Profile to Company Website](https://apify.com/oday/mawsool-linkedin-profile-to-company-website) |
| You want the job history only. | [Work Experience](https://apify.com/oday/mawsool-linkedin-profile-experience) |
| You want schools and degrees only. | [Education](https://apify.com/oday/mawsool-linkedin-profile-education) |
| You want a yes or no for one certificate. | [Certification Checker](https://apify.com/oday/mawsool-linkedin-certification-checker) |
| You want certificates, patents, courses, and publications. | [Certifications and Patents](https://apify.com/oday/mawsool-linkedin-profile-credentials) |
| You want likes and comments for outreach. | [Profile Activity](https://apify.com/oday/mawsool-linkedin-profile-activity) |
| You have a company URL and want the full company record. | [Company Details](https://apify.com/oday/mawsool-linkedin-company-details) |
| You have a large file of company URLs. | [Mass Company Scraper](https://apify.com/oday/mawsool-mass-linkedin-company-scraper) |
| You want the website, industry, and employee range. | [Firmographics and Website](https://apify.com/oday/mawsool-linkedin-company-firmographics) |
| You want office addresses. | [Company Locations](https://apify.com/oday/mawsool-linkedin-company-locations) |
| You want lookalike companies. | [Similar Companies](https://apify.com/oday/mawsool-linkedin-similar-companies) |
| You want the recent posts on a company page. | [Company Posts](https://apify.com/oday/mawsool-linkedin-company-posts) |
| You want only new posts on the next scheduled run. | [Company Post Monitor](https://apify.com/oday/mawsool-linkedin-company-post-watch) |

The same list is on [Mawsool's Apify profile](https://apify.com/oday).

## Use with AI agents

Apify exposes this Actor to ChatGPT, Claude, Gemini, Grok, and other agents through the Apify MCP server. Tell the agent the input you have, the fields you want back, and the starting price on this page. If you already have profile URLs and only need the current company and headline, use [Profile Freshness Check](https://apify.com/oday/mawsool-linkedin-profile-freshness) first and compare the result to your CRM yourself.

 A visitor who starts on one Actor can open the rest from that page.


Paste first name + last name + company → get verified LinkedIn name, headline, company, location, skills, and profile URL. Powered by **Mawsool**. Built for **sales outreach, recruiting, CRM enrichment, Clay, HubSpot, and Salesforce**.

> **If `hasLinkedIn` is `true`, the match is exact (LinkedIn URL) or confident (strong name/company/title score).** Weak/ambiguous hits return `hasLinkedIn: false`.

**From $1 per 1,000 lookups.** Export CSV, Excel, or JSON. Run in the UI, via Apify API, Zapier, Make, or Scheduler.

### What’s new (reliability upgrade)
- Larger dedicated lookup pool for higher success rates under load  
- Automatic retry on temporary API hiccups  
- Fallback API path if the primary endpoint is unreachable  
- **Paid Apify plans get automatic per-lookup discounts** (tiered PPE pricing rolling out)

Also see our companion Actor: **[Email to LinkedIn Finder](https://apify.com/oday/mawsool-email-linkedin-lookup)** (email → LinkedIn).

**Mawsool enrichment suite on Apify:**
| Need | Actor |
|------|-------|
| Name + company → LinkedIn | **This Actor** |
| Email → LinkedIn | [Email to LinkedIn Finder](https://apify.com/oday/mawsool-email-linkedin-lookup) |

---

## Ready-made CRM enrichment recipes (example tasks)

One-click, pre-configured examples — open one, press Start, and adapt the input to your own list:

| Use case | Example task |
|----------|--------------|
| See how name + company lookup works | [Find LinkedIn by name & company demo](https://apify.com/oday/mawsool-linkedin-profile-finder/examples/find-linkedin-by-name-company-demo) |
| Fill missing LinkedIn URLs in your CRM | [CRM lead list LinkedIn enrichment](https://apify.com/oday/mawsool-linkedin-profile-finder/examples/crm-lead-list-linkedin-enrichment) |
| Verify LinkedIn URLs already in your CRM | [Verify CRM LinkedIn URLs](https://apify.com/oday/mawsool-linkedin-profile-finder/examples/verify-crm-linkedin-urls) |
| Source candidates from name + employer | [Recruiting candidate LinkedIn lookup](https://apify.com/oday/mawsool-linkedin-profile-finder/examples/recruiting-candidate-linkedin-lookup) |
| Follow up after events & conferences | [Enrich conference attendee list](https://apify.com/oday/mawsool-linkedin-profile-finder/examples/enrich-conference-attendee-list) |

**Typical CRM workflow:** export leads (name + company) from HubSpot, Salesforce, or a spreadsheet → paste as CSV → run → filter `hasLinkedIn = true` → import LinkedIn URLs, headlines, and locations back into your CRM.

---

## What does a LinkedIn profile finder do?

A **LinkedIn profile finder** (also called find LinkedIn by name, people lookup, or person search) takes identity clues — usually **first name, last name, and company** — and returns the matching LinkedIn profile.

This Actor answers:

- *What is this person’s LinkedIn URL?*
- *What is their headline, location, and company on LinkedIn?*
- *Is this the right John Smith at Acme — or a different one?*

Use **match strategies** to control how strict matching is. Default is **LinkedIn URL** (exact when a URL is present).

---

## Find LinkedIn by name and company — sample output

### Confident LinkedIn match

```json
{
  "firstName": "Nathan",
  "lastName": "Jolly",
  "company": "4 Pines Brewing Company Pty Ltd",
  "jobTitle": "Brand Manager",
  "hasLinkedIn": true,
  "matchType": "confident",
  "matchStrategy": "name_company_job_title",
  "fullName": "Nathan Jolly",
  "headline": "Brand Manager of Brookvale Union",
  "linkedinUrl": "https://www.linkedin.com/in/nathan-jolly-45490b20b",
  "matchedCompany": "4 Pines Brewing Company Pty Ltd",
  "location": "Sydney, New South Wales, Australia",
  "success": true
}
```

### No confident match

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "company": "Acme Inc",
  "hasLinkedIn": false,
  "matchType": "likely",
  "linkedinUrl": "",
  "success": true
}
```

Rows are **flat and CSV-ready**. Variable profile fields are preserved in `profileRawJson` / `profileFlattenedJson`.

---

## Who uses LinkedIn people lookup?

### Sales & outbound
Turn conference lists and CRM rows (name + company) into **LinkedIn URLs** for connection requests and personalized outreach.

### Recruiters
Resolve candidate names + employers to the **correct LinkedIn profile** before screening.

### RevOps & CRM enrichment
Enrich HubSpot / Salesforce / Clay contacts that have name + company but no LinkedIn.

### Data & growth teams
Batch-enrich thousands of people via API or Scheduler. Export CSV for sequences.

---

## Match strategies — which one should I use?

| Strategy | When to use | Why |
|----------|-------------|-----|
| **LinkedIn URL** (default) | Row already has `linkedin.com/in/...` | Exact profile slug match — highest confidence. If a row has **no URL**, Mawsool auto-falls back to Name + Company + Job Title. |
| **Name + Company + Job Title** | Sales/recruiting lists without LinkedIn links | Best accuracy for common names when you know the role |
| **Name + Company** | Employer known, title unknown | Solid default for CRM enrichment without titles |
| **Name + Job Title** | Company name missing/unreliable | Helps when company branding varies |
| **Company + Job Title** | Find people in a role at a company | Broader; may need manual review |
| **Name / Company / Job title only** | Exploratory / broad search | Lower precision — use carefully |

---

## How to find a LinkedIn profile (easy UI)

### Option A — Add people in the form
Fill **First name**, **Last name**, **Company** (add Job title / LinkedIn URL if you have them). Click **+** for more rows.

### Option B — Paste CSV (bulk)
Paste into **Or paste people as CSV** with a header row:

```text
firstName,lastName,company,jobTitle,linkedinUrl
Nathan,Jolly,4 Pines Brewing Company Pty Ltd,Brand Manager,
Jane,Doe,Acme Inc,VP Sales,https://www.linkedin.com/in/janedoe
```

### Option C — Upload CSV file
Use **Or upload a CSV file** with the same columns.

Then:
1. Pick a **Match strategy** (default: LinkedIn URL)
2. Click **Start**
3. Open **LinkedIn matches** for a clean table → Export CSV / Excel / JSON

### Run via API

```bash
apify call oday/mawsool-linkedin-profile-finder \
  --input '{
    "people":[{
      "firstName":"Nathan",
      "lastName":"Jolly",
      "company":"4 Pines Brewing Company Pty Ltd",
      "jobTitle":"Brand Manager"
    }],
    "matchStrategy":"linkedin_url"
  }'
```

---

## Pricing — pay per person looked up

One `profile-lookup` event = one person processed.

| Plan tier | Per lookup | Per 1,000 |
|-----------|------------|-----------|
| Free | $0.001 | **$1.00** |
| Bronze | $0.0009 | $0.90 |
| Silver | $0.0008 | $0.80 |
| Gold, Platinum, and Diamond | $0.0004 | $0.40 |

No separate Mawsool subscription required on Apify.

---

## LinkedIn profile finder vs email to LinkedIn

| Need | Actor |
|------|-------|
| **Name + company → LinkedIn** | **This Actor** |
| **Email → LinkedIn** | [Email to LinkedIn Finder](https://apify.com/oday/mawsool-email-linkedin-lookup) |

Chain them: find the profile here → enrich email-linked contacts with the email Actor.

---

## Integrations

- Apify API & webhooks
- Zapier & Make
- Google Sheets export
- HubSpot, Salesforce, Clay via API/middleware
- Apify Scheduler for nightly enrichment

---

## About Mawsool

Mawsool provides B2B contact intelligence and LinkedIn matching for sales and recruiting teams worldwide.

**Support:** [support@mawsool.tech](mailto:support@mawsool.tech)  
**Open-source CLI (thin client):** [github.com/odayali1/mawsool-cli](https://github.com/odayali1/mawsool-cli)

---

## FAQ — find LinkedIn by name

### How do I find a LinkedIn profile from a name and company?
Add `firstName`, `lastName`, and `company`, optionally `jobTitle`, run this Actor, and read `linkedinUrl` when `hasLinkedIn` is `true`.

### What is the best match strategy?
**LinkedIn URL** when the row has a profile link (default). **Name + Company + Job Title** when you only have identity fields. Rows without a URL auto-fall back to smart name/company/title matching.

### Does this scrape LinkedIn or need cookies?
No LinkedIn login or cookies are required. This Actor calls Mawsool’s people lookup API.

### What do match types mean?
- `exact` — LinkedIn URL slug matched  
- `confident` — strong name/company/title match (`hasLinkedIn: true`)  
- `likely` / `none` — not confident enough (`hasLinkedIn: false`)

### Can I do bulk LinkedIn profile lookup?
Yes — up to 10,000 people per run with `maxPeople`, or schedule multiple runs.

### How much does it cost?
From **$1 per 1,000 lookups**, with lower rates on higher Apify plans.

---

## Limitations

- Confident/exact matches only return profiles (`likely` is treated as no LinkedIn for automation)
- Coverage depends on Mawsool’s matching graph for each person
- Job title greatly improves accuracy for common names

---

## Keywords

People find this Actor when searching: **LinkedIn profile finder**, **find LinkedIn by name**, **find LinkedIn profile from name and company**, **LinkedIn people lookup**, **person search LinkedIn**, **LinkedIn enrichment**, **B2B contact enrichment**, and **CRM LinkedIn enrichment**.
