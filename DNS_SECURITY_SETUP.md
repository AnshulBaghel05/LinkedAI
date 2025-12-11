# Email Security DNS Configuration
## Fix for DMARC Security Vulnerability Reported

**Domain**: linkedai.site
**Issue**: Missing DMARC, SPF, and DKIM records allow email spoofing
**Severity**: HIGH - Attackers can send emails appearing to be from @linkedai.site

---

## 🚨 What Was the Vulnerability?

A security researcher demonstrated that they could send emails that appear to originate from `support@linkedai.site` because your domain lacks proper email authentication records. This is the vulnerability described in the security disclosure email you received.

**Proof of Concept from Report**:
- Attacker manipulated an email to their own address
- Email appeared to come from your domain
- No DMARC policy prevented this spoofing attack

---

## 📋 DNS Records to Add

### Step 1: Add SPF Record

**Record Type**: TXT
**Host/Name**: `@` (or leave blank for root domain)
**Value**:
```
v=spf1 include:_spf.resend.com ~all
```

**Explanation**: This authorizes Resend to send emails on behalf of linkedai.site

---

### Step 2: Add DMARC Record

**Record Type**: TXT
**Host/Name**: `_dmarc`
**Value** (Start with Quarantine):
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@linkedai.site; ruf=mailto:dmarc-reports@linkedai.site; fo=1; adkim=s; aspf=s; pct=100
```

**After Testing** (Upgrade to Reject after 1 week):
```
v=DMARC1; p=reject; rua=mailto:dmarc-reports@linkedai.site; ruf=mailto:dmarc-reports@linkedai.site; fo=1; adkim=s; aspf=s; pct=100
```

**What this means**:
- `p=quarantine` - Suspicious emails go to spam (safer for initial deployment)
- `p=reject` - Reject all unauthorized emails (use after testing)
- `rua=` - Where to send aggregate reports
- `ruf=` - Where to send forensic reports
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment
- `pct=100` - Apply policy to 100% of emails

---

### Step 3: Get DKIM Keys from Resend

1. **Log in to Resend Dashboard**: https://resend.com/domains
2. **Add your domain** (if not already added): linkedai.site
3. **Get DKIM records**: Resend will provide 3 DKIM TXT records

**They will look like**:
```
Host: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB...

Host: resend2._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB...

Host: resend3._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB...
```

4. **Add these TXT records** to your DNS provider

---

## 🛠️ Where to Add These Records

### If using Cloudflare (Recommended):
1. Go to: https://dash.cloudflare.com
2. Select domain: linkedai.site
3. Go to: DNS > Records
4. Click "Add record"
5. Add each record one by one

### If using another DNS provider:
- Look for "DNS Management" or "DNS Records" section
- Add TXT records as specified above

---

## ✅ Verify Configuration

### 1. Check SPF Record
```bash
nslookup -type=TXT linkedai.site
# or
dig linkedai.site TXT
```

Should show: `v=spf1 include:_spf.resend.com ~all`

### 2. Check DMARC Record
```bash
nslookup -type=TXT _dmarc.linkedai.site
# or
dig _dmarc.linkedai.site TXT
```

Should show: `v=DMARC1; p=quarantine...`

### 3. Check DKIM Records
```bash
nslookup -type=TXT resend._domainkey.linkedai.site
nslookup -type=TXT resend2._domainkey.linkedai.site
nslookup -type=TXT resend3._domainkey.linkedai.site
```

Should return the public keys from Resend

### 4. Use Online Tools
- **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx?action=dmarc%3alinkedai.site
- **DMARC Analyzer**: https://www.dmarcanalyzer.com/dmarc/dmarc-record-check/
- **Resend Domain Verification**: Check in Resend dashboard

---

## 📧 Update Environment Variables

Make sure your `.env.local` has:

```bash
RESEND_FROM_EMAIL=noreply@linkedai.site
# or
RESEND_FROM_EMAIL=support@linkedai.site
```

**Do NOT use**: `onboarding@resend.dev` in production!

---

## 🔒 Security Impact

### Before (Current State):
❌ Attackers can spoof emails from @linkedai.site
❌ Your emails may be marked as spam
❌ No visibility into email authentication failures
❌ Vulnerable to phishing attacks using your domain

### After (With DMARC/SPF/DKIM):
✅ Only authorized servers can send emails from @linkedai.site
✅ Emails properly authenticated and trusted by recipients
✅ Reports show who is trying to send emails from your domain
✅ Phishing attacks using your domain are blocked

---

## 📊 Monitoring DMARC Reports

After adding DMARC, you'll receive daily XML reports at the email address specified in `rua=`.

**Options for viewing reports**:
1. **Postmark DMARC Digests** (Free): https://dmarc.postmarkapp.com/
2. **DMARC Analyzer** (Paid): https://www.dmarcanalyzer.com/
3. **Manual parsing**: Use an XML parser or online tool

---

## ⏱️ DNS Propagation Time

- **Typical**: 1-4 hours
- **Maximum**: 48 hours
- Check propagation: https://www.whatsmydns.net/

---

## 🚀 Deployment Checklist

- [ ] Add SPF record
- [ ] Get DKIM keys from Resend dashboard
- [ ] Add all 3 DKIM records
- [ ] Add DMARC record (start with `p=quarantine`)
- [ ] Wait 24 hours for DNS propagation
- [ ] Verify all records using nslookup/dig
- [ ] Test sending email from your app
- [ ] Check email headers show "PASS" for SPF, DKIM, DMARC
- [ ] Monitor DMARC reports for 1 week
- [ ] Upgrade DMARC policy to `p=reject` after confirming no issues

---

## 📝 Response to Security Researcher

Once configured, you can respond to the security disclosure:

```
Thank you for the responsible disclosure. We have implemented the following:

1. Added SPF record authorizing Resend
2. Configured DKIM signing for all outbound emails
3. Deployed DMARC policy (p=reject) to prevent email spoofing
4. Set up monitoring for authentication failures

We appreciate your diligence in reporting this vulnerability.
Would you be interested in a bug bounty reward for this finding?
```

---

## 🆘 Need Help?

- **Resend Support**: support@resend.com
- **DMARC Guide**: https://dmarc.org/overview/
- **SPF Guide**: https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/
- **DKIM Guide**: https://www.cloudflare.com/learning/dns/dns-records/dns-dkim-record/
