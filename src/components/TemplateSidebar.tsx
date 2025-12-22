import { useState, useEffect } from "react";
import { Search, FileText, Layout, ChevronRight, Star, Copy, Eye, X, Scale, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import * as templateStorage from '@/lib/templateStorage';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import CreditsDisplay from '@/components/CreditsDisplay';

export const TEMPLATE_CATEGORIES = {
  PERSONAL_INFO: 'Personal Information',
  CRA_DISPUTE: 'Credit Reporting Agency Dispute',
  DEBT_VALIDATION: 'Debt Validation',
  REINVESTIGATION: 'Reinvestigation Request',
  INQUIRY_DISPUTE: 'Inquiry Dispute'
};

interface Template {
  id: string;
  name: string;
  type: "prompt" | "form";
  category: string;
  description: string;
  preview: string;
  fullContent: string;
  tags: string[];
  rating: number;
  creditCost: number;
  isPopular?: boolean;
  legalArea: string;
  requirements?: string[];
  legalCitations?: string[];
}

// Professional Legal Dispute Templates (forms and prompts)
const legalTemplates: Template[] = [
  // --- REAL PROMPT TEMPLATES ---
  {
    id: "prompt-general-credit-dispute",
    name: "General Credit Dispute Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Dispute errors on a credit report, referencing the Fair Credit Reporting Act (FCRA).",
    preview: "I am writing to dispute inaccurate or unverifiable information on my credit report under the FCRA.",
    fullContent: "I am writing to dispute the following information on my credit report as inaccurate or unverifiable. Please investigate and remove any information that cannot be verified, as required by the Fair Credit Reporting Act (FCRA).",
    tags: ["dispute", "credit", "fcra", "general"],
    rating: 4.8,
    creditCost: 1,
    legalArea: "Credit Reporting",
    requirements: [],
    legalCitations: ["FCRA"]
  },
  {
    id: "prompt-609-dispute",
    name: "609 Dispute Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Request verification of credit report items under FCRA Section 609.",
    preview: "I am requesting verification of items on my credit report under FCRA Section 609.",
    fullContent: "Pursuant to FCRA Section 609, I am requesting verification of the following items on my credit report. Please provide copies of all records and contracts bearing my signature. If you cannot verify, please remove the items.",
    tags: ["609", "verification", "fcra", "dispute"],
    rating: 4.8,
    creditCost: 1,
    legalArea: "Credit Reporting",
    requirements: [],
    legalCitations: ["FCRA § 609"]
  },
  {
    id: "prompt-611-dispute",
    name: "611 Dispute Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Request the method of verification for disputed items under FCRA Section 611.",
    preview: "I am requesting the method of verification for disputed items under FCRA Section 611.",
    fullContent: "Under FCRA Section 611, I am requesting the method of verification for the following disputed items. Please provide details of your investigation and how the information was verified.",
    tags: ["611", "verification", "fcra", "dispute"],
    rating: 4.7,
    creditCost: 1,
    legalArea: "Credit Reporting",
    requirements: [],
    legalCitations: ["FCRA § 611"]
  },
  {
    id: "prompt-623-dispute",
    name: "623 Dispute Letter / Debt Validation Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Challenge the validity of a debt with a third-party collector, citing FCRA Section 623 and FDCPA.",
    preview: "I am challenging the validity of a debt under FCRA Section 623 and FDCPA.",
    fullContent: "I am disputing the validity of the following debt. Please provide all documentation proving your right to collect, as required by FCRA Section 623 and the FDCPA. If you cannot validate, please remove the debt from my credit report.",
    tags: ["623", "debt", "validation", "fdcpa"],
    rating: 4.7,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["FCRA § 623", "FDCPA"]
  },
  {
    id: "prompt-cca-request",
    name: "CCA Request Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Request a copy of the credit agreement under the Consumer Credit Act (CCA).",
    preview: "I am requesting a copy of my credit agreement under the Consumer Credit Act (CCA).",
    fullContent: "Under the Consumer Credit Act (CCA), I am requesting a copy of my credit agreement for the following account. Please provide this documentation to verify the debt.",
    tags: ["cca", "agreement", "debt", "request"],
    rating: 4.6,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["Consumer Credit Act"]
  },
  {
    id: "prompt-statute-barred",
    name: "Statute Barred Debt Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Notify creditors of unenforceable debts due to time limits (England, Wales, Northern Ireland).",
    preview: "This debt is statute barred and no longer enforceable.",
    fullContent: "I am writing to inform you that the debt referenced is statute barred and no longer legally enforceable due to the expiration of the limitation period.",
    tags: ["statute", "barred", "debt", "limitation"],
    rating: 4.6,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["Limitation Act"]
  },
  {
    id: "prompt-prescribed-debt",
    name: "Prescribed Debt Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Inform creditors of prescribed debts in Scotland (unenforceable after 5 years).",
    preview: "This debt is prescribed and unenforceable in Scotland.",
    fullContent: "I am writing to inform you that the debt referenced is prescribed and unenforceable under Scottish law, as more than five years have passed since the last acknowledgment or payment.",
    tags: ["prescribed", "debt", "scotland", "limitation"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["Prescription and Limitation (Scotland) Act"]
  },
  {
    id: "prompt-cannot-pay-ccj",
    name: "Cannot Pay CCJ Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Request payment plan adjustments for a County Court Judgment (England, Wales).",
    preview: "I am requesting a payment plan adjustment for my County Court Judgment (CCJ).",
    fullContent: "I am unable to pay the full amount of my County Court Judgment (CCJ) and request an affordable payment plan. Please consider my financial circumstances.",
    tags: ["ccj", "payment", "plan", "court"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Court Judgment",
    requirements: [],
    legalCitations: ["County Court Rules"]
  },
  {
    id: "prompt-vulnerable-persons",
    name: "Vulnerable Persons Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Stop enforcement actions for vulnerable individuals under Taking Control of Goods: National Standards 2014.",
    preview: "I am a vulnerable person and request a stop to enforcement actions.",
    fullContent: "I am considered a vulnerable person under the Taking Control of Goods: National Standards 2014 and request that all enforcement actions cease immediately.",
    tags: ["vulnerable", "enforcement", "protection", "hardship"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["Taking Control of Goods: National Standards 2014"]
  },
  {
    id: "prompt-right-of-offset",
    name: "Right of Offset Stop Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Prevent banks from using the right of offset to deduct funds.",
    preview: "I am requesting that you stop using the right of offset to deduct funds from my account.",
    fullContent: "I am writing to request that you cease using the right of offset to deduct funds from my account, as I do not authorize these withdrawals.",
    tags: ["offset", "bank", "deduction", "stop"],
    rating: 4.4,
    creditCost: 1,
    legalArea: "Banking",
    requirements: [],
    legalCitations: []
  },
  {
    id: "prompt-cancel-cpa",
    name: "Cancel CPA/Recurring Payments Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Cancel Continuous Payment Authority (CPA) or recurring payments.",
    preview: "I am requesting cancellation of my Continuous Payment Authority (CPA) or recurring payments.",
    fullContent: "Please cancel my Continuous Payment Authority (CPA) or any recurring payments associated with my account, effective immediately.",
    tags: ["cpa", "recurring", "payment", "cancel"],
    rating: 4.4,
    creditCost: 1,
    legalArea: "Banking",
    requirements: [],
    legalCitations: []
  },
  {
    id: "prompt-cancel-hire-purchase",
    name: "Cancel Hire Purchase Agreement Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Terminate a hire purchase agreement.",
    preview: "I am requesting to terminate my hire purchase agreement.",
    fullContent: "I am writing to request the termination of my hire purchase agreement. Please confirm the end of the agreement and any final steps required.",
    tags: ["hire", "purchase", "agreement", "cancel"],
    rating: 4.3,
    creditCost: 1,
    legalArea: "Consumer Credit",
    requirements: [],
    legalCitations: []
  },
  {
    id: "prompt-debt-settlement-offer",
    name: "Debt Settlement Offer Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Propose a full or partial debt settlement.",
    preview: "I am offering a settlement to resolve my outstanding debt.",
    fullContent: "I am writing to propose a settlement for my outstanding debt. Please let me know if you will accept a reduced payment to resolve this matter.",
    tags: ["settlement", "offer", "debt", "payment"],
    rating: 4.4,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: []
  },
  {
    id: "prompt-medical-dispute-collector",
    name: "Medical Dispute Letter to Collector",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Dispute medical debts with collectors under FDCPA.",
    preview: "I am disputing a medical debt with your agency under the FDCPA.",
    fullContent: "I am disputing the validity of the following medical debt. Please provide validation as required by the FDCPA and cease collection activities until validation is provided.",
    tags: ["medical", "debt", "fdcpa", "dispute"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Medical Debt",
    requirements: [],
    legalCitations: ["FDCPA"]
  },
  {
    id: "prompt-medical-dispute-bureau",
    name: "Medical Collection Dispute Letter to Credit Bureau",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Challenge medical debts on credit reports under FCRA.",
    preview: "I am disputing a medical collection on my credit report under the FCRA.",
    fullContent: "I am disputing the following medical collection on my credit report. Please investigate and remove any inaccurate or unverifiable information as required by the FCRA.",
    tags: ["medical", "collection", "fcra", "dispute"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Medical Debt",
    requirements: [],
    legalCitations: ["FCRA"]
  },
  {
    id: "prompt-letter-of-explanation",
    name: "Letter of Explanation for Credit Issues",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Explain derogatory credit history for loan or mortgage applications.",
    preview: "This letter explains recent credit issues for my loan application.",
    fullContent: "I am providing this letter to explain recent negative items on my credit report. Please consider this context in your review of my loan or mortgage application.",
    tags: ["explanation", "credit", "issues", "loan"],
    rating: 4.4,
    creditCost: 1,
    legalArea: "Credit Reporting",
    requirements: [],
    legalCitations: []
  },
  {
    id: "prompt-credit-freeze",
    name: "Credit Report Freeze Letter",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Request a credit report freeze under FCRA.",
    preview: "I am requesting a freeze on my credit report under the FCRA.",
    fullContent: "I am requesting a freeze on my credit report to prevent new credit inquiries, as allowed under the FCRA.",
    tags: ["freeze", "credit", "fcra", "security"],
    rating: 4.4,
    creditCost: 1,
    legalArea: "Credit Reporting",
    requirements: [],
    legalCitations: ["FCRA"]
  },
  {
    id: "prompt-debt-validation-older",
    name: "Debt Validation Letter for Older Collections",
    type: "prompt",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Challenge older collection accounts under FDCPA and FCRA.",
    preview: "I am requesting validation for an older collection account under FDCPA and FCRA.",
    fullContent: "I am requesting validation for the following older collection account. Please provide all documentation as required by the FDCPA and FCRA, or remove the account if it cannot be validated.",
    tags: ["debt", "validation", "older", "fdcpa"],
    rating: 4.5,
    creditCost: 1,
    legalArea: "Debt Collection",
    requirements: [],
    legalCitations: ["FDCPA", "FCRA"]
  },
  // --- END REAL PROMPT TEMPLATES ---
  {
    id: "personal-info-update",
    name: "Personal Information Update Request",
    type: "form",
    category: TEMPLATE_CATEGORIES.PERSONAL_INFO,
    description: "Update incorrect personal information in credit bureau records under FCRA",
    preview: "Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a), I am writing to request updates to my personal information...",
    fullContent: `[YOUR NAME]
[YOUR ADDRESS]
[CITY, STATE ZIP]
[YOUR EMAIL]
[YOUR PHONE]
[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
[CREDIT BUREAU NAME]
[CREDIT BUREAU ADDRESS]
[CITY, STATE ZIP]

Re: Request to Update Personal Information - Consumer File [LAST 4 OF SSN]

To Whom It May Concern:

Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i(a), I am writing to request updates to my personal information in your records. After reviewing my credit report, I have identified inaccurate personal information that requires correction.

CURRENT INFORMATION TO BE RETAINED:
Full Legal Name: [YOUR FULL LEGAL NAME]
Current Address: [YOUR CURRENT ADDRESS]
Date of Birth: [YOUR DOB]
Social Security Number: XXX-XX-[LAST 4]

INFORMATION TO BE REMOVED:
[LIST INCORRECT NAMES, ADDRESSES, OR OTHER PERSONAL INFORMATION]

LEGAL REQUIREMENTS:
Under FCRA § 1681i(a), you are required to:
1. Process this request within 30 days
2. Forward all relevant information to information furnishers
3. Notify me of the results of your investigation

Please send me an updated copy of my credit report reflecting these changes at the address listed above.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of Driver's License or State ID
- Proof of Address (Utility Bill/Lease Agreement)
- Social Security Card (last 4 digits visible only)`,
    tags: ["personal", "info", "fcra", "update"],
    rating: 4.9,
    creditCost: 2,
    isPopular: true,
    legalArea: "Personal Information",
    requirements: [
      "Valid government-issued ID",
      "Proof of current address",
      "Social Security card (last 4 digits)",
      "List of incorrect information to remove"
    ],
    legalCitations: [
      "FCRA § 1681i(a) - Procedure in case of disputed accuracy",
      "FCRA § 1681h - Conditions and form of disclosure to consumers"
    ]
  },
  {
    id: "cra-dispute-comprehensive",
    name: "Credit Report Dispute Letter (Comprehensive)",
    type: "form",
    category: TEMPLATE_CATEGORIES.CRA_DISPUTE,
    description: "Comprehensive dispute letter for credit reporting agencies under FCRA",
    preview: "I am writing to dispute inaccurate information in my credit report. I have identified the following items that require investigation...",
    fullContent: `[YOUR NAME]
[YOUR ADDRESS]
[CITY, STATE ZIP]
[YOUR EMAIL]
[YOUR PHONE]
[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
[CREDIT BUREAU NAME]
[CREDIT BUREAU ADDRESS]
[CITY, STATE ZIP]

Re: Formal Dispute of Inaccurate Information - Consumer File [LAST 4 OF SSN]

NOTICE OF DISPUTE PURSUANT TO FCRA § 1681i(a)

To Whom It May Concern:

I am writing to dispute inaccurate information in my credit report. I have identified the following items that require investigation and correction pursuant to the Fair Credit Reporting Act (FCRA):

DISPUTED ITEMS:
1. Account: [CREDITOR NAME]
   Account #: XXXX-XXXX-[LAST 4]
   Reason for Dispute: [SPECIFIC REASON]
   Supporting Documentation: [LIST DOCUMENTS ATTACHED]

2. Account: [CREDITOR NAME]
   Account #: XXXX-XXXX-[LAST 4]
   Reason for Dispute: [SPECIFIC REASON]
   Supporting Documentation: [LIST DOCUMENTS ATTACHED]

LEGAL REQUIREMENTS AND CITATIONS:
Pursuant to FCRA § 1681i(a), you must:
1. Conduct a reasonable investigation within 30 days
2. Forward all relevant information to the furnishers
3. Consider all information I have submitted
4. Delete any information that cannot be verified
5. Notify me of the results within 5 business days of completion

DEMAND FOR CORRECTION:
If you cannot verify this information with the original creditor, you must delete it pursuant to FCRA § 1681i(a)(5). Failure to comply may result in legal action under FCRA § 1681n for willful non-compliance.

Please send me an updated copy of my credit report showing your corrections.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of credit report with disputed items circled
- Supporting documentation for each dispute
- Copy of ID and proof of address`,
    tags: ["cra", "dispute", "fcra", "comprehensive"],
    rating: 4.9,
    creditCost: 3,
    isPopular: true,
    legalArea: "Credit Reporting",
    requirements: [
      "Credit report copy with disputed items marked",
      "Supporting documentation for disputes",
      "Valid ID and proof of address",
      "Detailed list of disputed items"
    ],
    legalCitations: [
      "FCRA § 1681i(a) - Investigation procedures",
      "FCRA § 1681i(a)(5) - Treatment of inaccurate or unverifiable information",
      "FCRA § 1681n - Civil liability for willful noncompliance"
    ]
  },
  {
    id: "debt-validation-demand",
    name: "Debt Validation Demand Letter",
    type: "form",
    category: TEMPLATE_CATEGORIES.DEBT_VALIDATION,
    description: "Professional debt validation request under FDCPA Section 809(b)",
    preview: "I am writing in response to your notice regarding the above-referenced account. I dispute the validity of this debt and request validation...",
    fullContent: `[YOUR NAME]
[YOUR ADDRESS]
[CITY, STATE ZIP]
[YOUR EMAIL]
[YOUR PHONE]
[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
[DEBT COLLECTOR NAME]
[DEBT COLLECTOR ADDRESS]
[CITY, STATE ZIP]

Re: Debt Validation Request - Account # [ACCOUNT NUMBER IF KNOWN]
    Alleged Amount: $[AMOUNT]

NOTICE OF DISPUTE AND DEMAND FOR VALIDATION
PURSUANT TO FDCPA § 809(b) [15 USC § 1692g(b)]

To Whom It May Concern:

I am writing in response to your [LETTER/PHONE CALL] dated [DATE] regarding the above-referenced account. I dispute the validity of this debt and request validation pursuant to the Fair Debt Collection Practices Act (FDCPA).

LEGAL NOTICE AND DEMANDS:

Pursuant to FDCPA § 809(b), I hereby demand that you provide ALL of the following:

1. Amount and itemization of the alleged debt, including:
   - Original principal
   - Added interest
   - Collection fees
   - Other charges

2. Name and address of the original creditor

3. Complete chain of title showing your right to collect, including:
   - Assignment documentation
   - Purchase agreements
   - Bills of sale

4. Copy of the original signed agreement

5. Complete payment history showing:
   - All payments made
   - Interest calculations
   - Fees added
   - Current balance calculation

6. Your license status:
   - Proof of license to collect in [YOUR STATE]
   - Registration with Secretary of State
   - Bond information if required

7. Statute of limitations verification:
   - Date of last payment
   - Date of default
   - Applicable state statute

LEGAL REQUIREMENTS AND CONSEQUENCES:

Under FDCPA § 809(b), you must:
1. Cease all collection activities until you provide validation
2. Mark this debt as disputed with credit bureaus
3. Provide complete validation within 30 days
4. Remove credit reporting if you cannot validate

NOTICE OF RIGHTS RESERVED:

This is an attempt to resolve this matter amicably. However, failure to comply with this request may result in legal action under FDCPA § 813 [15 USC § 1692k] for statutory damages of $1,000 plus actual damages, costs, and attorney fees.

I await your response within 30 days. Send all future communications in writing to the address above.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of your collection notice (if applicable)
- Copy of certified mail receipt`,
    tags: ["debt", "validation", "fdcpa", "collector"],
    rating: 4.8,
    creditCost: 3,
    isPopular: true,
    legalArea: "Debt Collection",
    requirements: [
      "Copy of collection notice or documentation of call",
      "Account information (if known)",
      "Certified mail receipt",
      "Detailed list of disputed items"
    ],
    legalCitations: [
      "FDCPA § 809(b) [15 USC § 1692g(b)] - Validation of debts",
      "FDCPA § 813 [15 USC § 1692k] - Civil liability",
      "FDCPA § 807 [15 USC § 1692e] - False or misleading representations",
      "FDCPA § 808 [15 USC § 1692f] - Unfair practices"
    ]
  },
  {
    id: "reinvestigation-demand",
    name: "Reinvestigation Demand Letter",
    type: "form",
    category: TEMPLATE_CATEGORIES.REINVESTIGATION,
    description: "Demand proper reinvestigation when credit bureaus fail to investigate adequately",
    preview: "I am writing regarding your inadequate investigation of my previous dispute. Your investigation failed to comply with FCRA requirements...",
    fullContent: `[YOUR NAME]
[YOUR ADDRESS]
[CITY, STATE ZIP]
[YOUR EMAIL]
[YOUR PHONE]
[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
[CREDIT BUREAU NAME]
[CREDIT BUREAU ADDRESS]
[CITY, STATE ZIP]

Re: Demand for Reinvestigation - Consumer File [LAST 4 OF SSN]
    Previous Dispute Date: [DATE OF ORIGINAL DISPUTE]

NOTICE OF FAILED INVESTIGATION AND DEMAND FOR REINVESTIGATION
PURSUANT TO FCRA § 611 [15 USC § 1681i]

To Whom It May Concern:

I am writing regarding your inadequate investigation of my previous dispute dated [DATE]. Your investigation failed to comply with the requirements of the Fair Credit Reporting Act (FCRA).

PREVIOUS DISPUTE DETAILS:
Date of Original Dispute: [DATE]
Method of Submission: [CERTIFIED MAIL/ONLINE/FAX]
Items Disputed: [LIST ITEMS]
Your Response Date: [DATE]

LEGAL VIOLATIONS IN PREVIOUS INVESTIGATION:

1. Failure to conduct a reasonable investigation as required by FCRA § 611(a)(1)
2. Failure to review and consider all relevant information submitted
3. Failure to forward all relevant information to furnishers
4. Failure to provide description of investigation procedures
5. [OTHER SPECIFIC VIOLATIONS]

EVIDENCE OF INADEQUATE INVESTIGATION:

1. [SPECIFIC EVIDENCE OF INADEQUATE INVESTIGATION]
2. [DOCUMENTATION IGNORED IN PREVIOUS INVESTIGATION]
3. [PROOF OF CONTINUED INACCURATE REPORTING]

LEGAL DEMANDS:

Pursuant to FCRA § 611, I demand that you:

1. Conduct a new, thorough investigation of all disputed items
2. Forward all enclosed documentation to furnishers
3. Provide detailed description of investigation procedures
4. Remove information that cannot be properly verified
5. Send investigation results within 30 days
6. Include source documents used to verify information

NOTICE OF LIABILITY:

Failure to conduct a proper reinvestigation may result in legal action under:
- FCRA § 616 [15 USC § 1681n] for willful noncompliance
- FCRA § 617 [15 USC § 1681o] for negligent noncompliance

Your continued failure to investigate properly may result in claims for:
- Actual damages
- Statutory damages up to $1,000
- Punitive damages
- Attorney's fees and costs

Please send all correspondence to the address above. I expect your response within 30 days as required by law.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of previous dispute letter
- Copy of your inadequate response
- Supporting documentation
- Credit report with disputed items marked`,
    tags: ["reinvestigation", "fcra", "failed", "demand"],
    rating: 4.7,
    creditCost: 4,
    legalArea: "Credit Reporting",
    requirements: [
      "Copy of original dispute letter",
      "Copy of credit bureau response",
      "Evidence of inadequate investigation",
      "Current credit report copy",
      "Supporting documentation"
    ],
    legalCitations: [
      "FCRA § 611 [15 USC § 1681i] - Procedure in case of disputed accuracy",
      "FCRA § 616 [15 USC § 1681n] - Civil liability for willful noncompliance",
      "FCRA § 617 [15 USC § 1681o] - Civil liability for negligent noncompliance",
      "Cushman v. Trans Union Corp., 115 F.3d 220 (3d Cir. 1997)"
    ]
  },
  {
    id: "inquiry-dispute",
    name: "Unauthorized Inquiry Dispute Letter",
    type: "form",
    category: TEMPLATE_CATEGORIES.INQUIRY_DISPUTE,
    description: "Dispute unauthorized credit inquiries that violate FCRA Section 604",
    preview: "I am writing to dispute unauthorized credit inquiries that appear on my credit report. These inquiries were made without my permission...",
    fullContent: `[YOUR NAME]
[YOUR ADDRESS]
[CITY, STATE ZIP]
[YOUR EMAIL]
[YOUR PHONE]
[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED
[CREDIT BUREAU NAME]
[CREDIT BUREAU ADDRESS]
[CITY, STATE ZIP]

Re: Dispute of Unauthorized Credit Inquiry - Consumer File [LAST 4 OF SSN]

NOTICE OF DISPUTE - UNAUTHORIZED INQUIRY
PURSUANT TO FCRA § 604 [15 USC § 1681b]

To Whom It May Concern:

I am writing to dispute unauthorized credit inquiries that appear on my credit report. These inquiries were made without my permission and without a permissible purpose under FCRA § 604.

DISPUTED INQUIRIES:

1. Company Name: [COMPANY NAME]
   Date of Inquiry: [DATE]
   Reason: No permissible purpose/No business relationship/No authorization

2. Company Name: [COMPANY NAME]
   Date of Inquiry: [DATE]
   Reason: No permissible purpose/No business relationship/No authorization

LEGAL VIOLATIONS:

The above inquiries violate FCRA § 604 [15 USC § 1681b] which requires:
1. A permissible purpose for accessing credit reports
2. Written consent for employment purposes
3. Legitimate business need related to a transaction

I have no business relationship with these companies and did not authorize these inquiries. This constitutes a violation of:
- FCRA § 604 [15 USC § 1681b] - Permissible Purposes
- FCRA § 607 [15 USC § 1681e] - Compliance Procedures
- FCRA § 615 [15 USC § 1681m] - Requirements on Users

LEGAL DEMANDS:

Pursuant to FCRA § 611 [15 USC § 1681i], I demand that you:

1. Remove all unauthorized inquiries immediately
2. Investigate how these companies obtained access
3. Implement procedures to prevent unauthorized access
4. Provide me with investigation results
5. Send updated credit report showing removals

NOTICE OF LIABILITY:

Unauthorized access to credit reports may result in:
- Statutory damages of $1,000 per violation
- Actual damages
- Punitive damages
- Attorney's fees and costs

Under FCRA § 616 [15 USC § 1681n] and § 617 [15 USC § 1681o]

Please respond within 30 days as required by law. Send all correspondence to the address above.

Sincerely,
[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of credit report with unauthorized inquiries marked
- Documentation showing no business relationship (if available)
- Copy of ID and proof of address`,
    tags: ["inquiry", "unauthorized", "fcra", "dispute"],
    rating: 4.6,
    creditCost: 2,
    legalArea: "Credit Reporting",
    requirements: [
      "Credit report with unauthorized inquiries marked",
      "Proof of no business relationship (if available)",
      "Valid ID and proof of address",
      "List of unauthorized inquiries"
    ],
    legalCitations: [
      "FCRA § 604 [15 USC § 1681b] - Permissible purposes of consumer reports",
      "FCRA § 607 [15 USC § 1681e] - Compliance procedures",
      "FCRA § 615 [15 USC § 1681m] - Requirements on users",
      "FCRA § 616 [15 USC § 1681n] - Civil liability for willful noncompliance",
      "FCRA § 617 [15 USC § 1681o] - Civil liability for negligent noncompliance"
    ]
  }
];

interface TemplateSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onTemplateSelect: (template: Template) => void;
  userCredits: number;
  onCreditUpdate: () => void;
}

export default function TemplateSidebar({ 
  isOpen, 
  onToggle, 
  onTemplateSelect, 
  userCredits,
  onCreditUpdate 
}: TemplateSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "prompt" | "form">("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  // Track processing state per-template to avoid disabling all buttons when one is clicked
  const [processingTemplates, setProcessingTemplates] = useState<string[]>([]);
  const isProcessingFor = (id: string) => processingTemplates.includes(id);
  const addProcessing = (id: string) => setProcessingTemplates(prev => [...prev, id]);
  const removeProcessing = (id: string) => setProcessingTemplates(prev => prev.filter(x => x !== id));
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ["All", ...Array.from(new Set(legalTemplates.map((t) => t.category)))];

  const filteredTemplates = legalTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      template.legalArea.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesType = selectedType === "all" || template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Request template use (shows confirmation dialog)
  const [confirmTemplate, setConfirmTemplate] = useState<Template | null>(null);
  const [confirmUserCredits, setConfirmUserCredits] = useState<number | null>(null);
  const [confirmCreditsLoading, setConfirmCreditsLoading] = useState(false);

  const handleRequestUseTemplate = (template: Template) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use templates",
        variant: "destructive"
      });
      return;
    }

    setConfirmTemplate(template);
  };

  // When the confirm dialog opens, fetch latest credits
  useEffect(() => {
    if (!confirmTemplate || !user?.id) {
      setConfirmUserCredits(null);
      setConfirmCreditsLoading(false);
      return;
    }
    let mounted = true;
    setConfirmCreditsLoading(true);
    api.getUserCredits(user.id)
      .then((resp: any) => {
        if (!mounted) return;
        const credits = resp?.credits ?? null;
        setConfirmUserCredits(credits);
      })
      .catch((err) => {
        console.warn('Failed to fetch user credits for dialog:', err);
        setConfirmUserCredits(null);
      })
      .finally(() => {
        if (mounted) setConfirmCreditsLoading(false);
      });

    return () => { mounted = false; }
  }, [confirmTemplate, user?.id]);

  // Confirmed use -> actually perform API calls and processing
  const confirmUseTemplate = async (template: Template | null) => {
    if (!template || !user) return;

    // Prevent confirming if credits state shows insufficient
    if (typeof confirmUserCredits === 'number' && confirmUserCredits < template.creditCost) {
      toast({ title: 'Insufficient Credits', description: `You have ${confirmUserCredits} credits but this costs ${template.creditCost}.`, variant: 'destructive' });
      return;
    }

    try {
      addProcessing(template.id);
      // Call backend to track usage and deduct credits
      await api.useTemplate(template.id, user.id);

      // Save template to server-side store and local fallback
      try {
        await api.saveTemplate({
          templateId: template.id,
          name: template.name,
          type: template.type,
          fullContent: template.fullContent,
          creditCost: template.creditCost,
          metadata: { legalArea: template.legalArea }
        }, user.id);
      } catch (err) {
        console.warn('Failed to save template on server, falling back to local storage:', err);
        try { templateStorage.saveTemplate(user.id, template); } catch (saveErr) { console.warn('Failed to save template locally:', saveErr); }
      }

      // Small delay to ensure server-side processing completes
      await new Promise(resolve => setTimeout(resolve, 400));

      // Call the template selection handler
      onTemplateSelect(template);

      // Update credits display (parent should refetch credits)
      onCreditUpdate();

      toast({
        title: "Template Applied",
        description: `"${template.name}" has been applied. ${template.creditCost} credits used.`,
      });

      // Close sidebar on mobile
      if (window.innerWidth < 1024) {
        onToggle();
      }

    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: (error as any)?.message || "Failed to apply template. Please try again.",
        variant: "destructive"
      });
    } finally {
      removeProcessing(template.id);
      setConfirmTemplate(null);
      setConfirmUserCredits(null);
    }
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.fullContent);
    toast({
      title: "Copied to clipboard",
      description: `"${template.name}" has been copied to your clipboard.`,
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 lg:w-96 flex flex-col shadow-lg
        h-[calc(100vh-200px)] lg:h-[calc(100vh-200px)]
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Legal Templates</h2>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credits Display */}
          <CreditsDisplay />

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search legal templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Type Filter */}
            <div className="flex gap-2">
              {(["all", "prompt", "form"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {type === "all" ? "All" : type === "prompt" ? "Prompts" : "Forms"}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {template.type === "prompt" ? (
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Layout className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                    {template.name}
                  </h3>
                  {template.isPopular && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
                </div>
              </div>

              {/* Legal Area Badge */}
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {template.legalArea}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                             text-xs rounded-full uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {template.creditCost} credits
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTemplate(template);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Use Template Button */}
              <Button
                onClick={() => handleRequestUseTemplate(template)}
                disabled={userCredits < template.creditCost || isProcessingFor(template.id)}
                className="w-full mt-3 text-sm"
                size="sm"
              >
                {isProcessingFor(template.id) ? "Processing..." : 
                 userCredits < template.creditCost ? "Insufficient Credits" : 
                 `Use Template (${template.creditCost} credits)`}
              </Button>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No templates found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 z-[9999]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-500">{previewTemplate.legalArea}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full mb-2">
                  {previewTemplate.type === "prompt" ? "AI Prompt" : "Legal Form"}
                </span>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {previewTemplate.description}
                </p>
                
                {/* Requirements Section */}
                {previewTemplate.requirements && previewTemplate.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required Documentation:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {previewTemplate.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Legal Citations Section */}
                {previewTemplate.legalCitations && previewTemplate.legalCitations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Citations:</h4>
                    <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      {previewTemplate.legalCitations.map((citation, index) => (
                        <li key={index}>{citation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Template Content:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  <code className="text-gray-900 dark:text-white">{previewTemplate.fullContent}</code>
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleCopyTemplate(previewTemplate)}
              >
                Copy Template
              </Button>
              <Button
                onClick={() => {
                  setConfirmTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                disabled={userCredits < previewTemplate.creditCost || isProcessingFor(previewTemplate.id)}
              >
                {isProcessingFor(previewTemplate.id) ? "Processing..." :
                 userCredits < previewTemplate.creditCost ? 
                  "Insufficient Credits" : 
                  `Use Template (${previewTemplate.creditCost} credits)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Use Template Dialog */}
      <AlertDialog open={!!confirmTemplate} onOpenChange={(open) => { if (!open) setConfirmTemplate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use Template?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTemplate ? (
                <>
                  "{confirmTemplate.name}" will use <strong>{confirmTemplate.creditCost}</strong> credits.
                  <div className="mt-2 text-sm text-gray-700">
                    {confirmCreditsLoading ? 'Checking your credits...' : (
                      confirmUserCredits !== null ? (
                        confirmUserCredits >= confirmTemplate.creditCost ? (
                          <span className="text-sm text-green-700">You have {confirmUserCredits} credits available.</span>
                        ) : (
                          <span className="text-sm text-red-700">You have {confirmUserCredits} credits — insufficient to proceed.</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-700">Unable to fetch credits.</span>
                      )
                    )}
                  </div>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="pt-2" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmUseTemplate(confirmTemplate)} disabled={confirmUserCredits !== null && confirmTemplate !== null && confirmUserCredits < confirmTemplate.creditCost}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}