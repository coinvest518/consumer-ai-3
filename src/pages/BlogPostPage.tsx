import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen, Facebook, Twitter, Linkedin, Link2, Copy } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  author: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: 'debt-collection-rights',
    title: 'Know Your Rights: Debt Collection Harassment Protection',
    excerpt: 'Understanding your rights under the Fair Debt Collection Practices Act and how to protect yourself from illegal harassment.',
    content: `
# Know Your Rights: Debt Collection Harassment Protection

If you're being contacted by debt collectors, it's important to understand your rights under the Fair Debt Collection Practices Act (FDCPA). This federal law protects consumers from abusive, unfair, or deceptive debt collection practices.

## Most Common Problems

Debt collectors often engage in illegal practices such as:
- Calling before 8 a.m. or after 9 p.m.
- Contacting you at work when you've asked them not to
- Threatening arrest or violence
- Contacting third parties about your debt
- Using obscene or profane language

## What Debt Collectors Cannot Do

### Harassment
Debt collectors may not harass, oppress, or abuse you. This includes:
- Threats of violence or harm
- Use of obscene or profane language
- Repeated phone calls to annoy you
- False accusations of criminal activity

### False Statements
Collectors cannot lie about:
- Their identity or authority
- The amount you owe
- Legal consequences of non-payment
- Your rights as a consumer

### Unfair Practices
Debt collectors cannot:
- Add unauthorized fees or interest
- Deposit post-dated checks early
- Contact you by postcard
- Garnish protected income sources

## How to Stop Debt Collectors

If you want collectors to stop contacting you:
1. Send a written letter requesting they cease contact
2. Keep copies of all correspondence
3. Send via certified mail with return receipt

## Federal Benefits Protection

Many federal benefits are exempt from garnishment:
- Social Security Benefits
- Veterans' Benefits
- Disability payments
- Student loans (in most cases)

## What to Do If You're Sued

If a debt collector sues you:
- Respond to the lawsuit by the deadline
- Consider consulting an attorney
- Know your defenses and rights
- Don't ignore court papers

## Resources

- Federal Trade Commission (FTC)
- Consumer Financial Protection Bureau (CFPB)
- State Attorney General offices
- Legal aid organizations

Remember, even if a debt collector violates the FDCPA, the underlying debt doesn't disappear if you legitimately owe it. However, you have the right to be treated fairly and respectfully during the collection process.
    `,
    date: 'Dec 21, 2024',
    readTime: '8 min read',
    category: 'Debt Collection',
    image: '📋',
    author: 'NACA Legal Team',
    tags: ['debt collection', 'FDCPA', 'consumer rights', 'harassment']
  },
  {
    id: 'credit-score-myths',
    title: 'Credit Score Myths Debunked: What Really Matters',
    excerpt: 'Separating fact from fiction in the world of credit scoring and financial health.',
    content: `
# Credit Score Myths Debunked: What Really Matters

Credit scores can feel mysterious, but understanding how they work is crucial for financial health. Let's debunk some common myths and focus on what actually impacts your credit.

## Myth #1: All Credit Scores Are the Same

**Reality:** There are multiple credit scoring models:
- FICO scores (most common)
- VantageScore (alternative model)
- Industry-specific scores

Different lenders use different models, so your score can vary depending on who's checking it.

## Myth #2: Closing Old Accounts Helps Your Score

**Reality:** Closing old accounts can hurt your score by:
- Reducing your credit history length
- Lowering your average account age
- Potentially increasing your credit utilization ratio

Keep old accounts open if they're not costing you money.

## Myth #3: You Need Multiple Credit Cards

**Reality:** Quality matters more than quantity. Focus on:
- Responsible credit use
- Paying on time
- Keeping balances low
- Having a mix of credit types

One well-managed credit card is better than several maxed-out cards.

## Myth #4: Credit Inquiries Always Hurt Your Score

**Reality:** Not all inquiries are equal:
- Hard inquiries (from lenders) can temporarily lower your score by a few points
- Soft inquiries (from pre-approvals) don't affect your score
- Multiple inquiries within 14-45 days are treated as one

## What Really Matters

### Payment History (35% of FICO score)
- Pay all bills on time
- Never miss payments
- Set up automatic payments

### Credit Utilization (30%)
- Keep balances below 30% of limits
- Pay down balances regularly
- Consider requesting credit limit increases

### Length of Credit History (15%)
- Keep old accounts open
- Become authorized user on family member's accounts
- Consider tradelines for established credit history

### New Credit (10%)
- Don't open too many new accounts at once
- Space out new credit applications
- Only apply for credit you need

### Credit Mix (10%)
- Have both revolving and installment accounts
- Consider a small personal loan if you have good credit

## Building Credit from Scratch

If you're starting with no credit:
1. Get a secured credit card
2. Become an authorized user
3. Consider credit builder loans
4. Use tradelines strategically

## Monitoring Your Credit

Regularly check your credit reports from:
- AnnualCreditReport.com (free)
- Credit monitoring services
- Credit bureaus directly

## Final Thoughts

Credit building takes time and patience. Focus on responsible financial habits rather than quick fixes. Your credit score reflects your financial reliability over time.
    `,
    date: 'Dec 18, 2024',
    readTime: '6 min read',
    category: 'Credit Education',
    image: '💡',
    author: 'Credit Experts',
    tags: ['credit score', 'myths', 'FICO', 'credit building']
  },
  {
    id: 'building-credit-zero',
    title: 'Building Credit from Zero: A Step-by-Step Approach',
    excerpt: 'Practical strategies for establishing and improving your credit profile from scratch.',
    content: `
# Building Credit from Zero: A Step-by-Step Approach

Starting with no credit can feel overwhelming, but it's absolutely possible to build a strong credit foundation. Here's a comprehensive guide to get you started.

## Step 1: Get Your Credit Reports

Before you begin, understand your starting point:
- Order free credit reports from AnnualCreditReport.com
- Check all three bureaus: Equifax, Experian, TransUnion
- Review for any errors or negative items
- Dispute inaccuracies immediately

## Step 2: Establish Credit Basics

### Secured Credit Cards
- Require a deposit (usually $200-$500)
- Become unsecured after 6-12 months of responsible use
- Start with small limits and build from there

### Credit Builder Loans
- Fixed-term loans designed to build credit
- Funds held in savings account
- Make regular payments to establish payment history

## Step 3: Become an Authorized User

### Family Member Accounts
- Ask family members with good credit to add you as authorized user
- No impact on their credit
- Builds your credit history instantly
- Great for account age and credit mix

### Tradelines
- Purchase seasoned credit accounts
- Adds immediate positive payment history
- Increases account age
- Professional service for credit building

## Step 4: Establish Payment History

### Pay Everything on Time
- Set up automatic payments
- Pay more than minimum when possible
- Never miss a payment
- Payment history is 35% of your FICO score

## Step 5: Manage Credit Utilization

### Keep Balances Low
- Aim for under 30% of credit limits
- Pay down balances monthly
- Request credit limit increases as you prove responsibility

## Step 6: Build Credit Mix

### Different Account Types
- Revolving credit (credit cards)
- Installment loans (auto, personal)
- Mortgage (if applicable)

## Step 7: Monitor and Maintain

### Regular Monitoring
- Check credit scores monthly
- Review credit reports quarterly
- Set up credit alerts
- Address issues promptly

## Common Mistakes to Avoid

### Opening Too Many Accounts
- Spread applications over time
- Multiple hard inquiries hurt scores
- Quality over quantity

### Maxing Out Cards
- High utilization hurts scores
- Keep balances below 30%
- Pay more than minimum

### Closing Old Accounts
- Reduces credit history length
- Can increase utilization
- Keep accounts open if no annual fees

## Timeline Expectations

### First 3-6 Months
- Establish secured card or credit builder loan
- Make all payments on time
- Build small positive history

### 6-12 Months
- Credit scores begin to rise
- May qualify for unsecured cards
- Consider small personal loan

### 1-2 Years
- Significant score improvement
- Qualify for better rates
- Access to larger credit amounts

## Resources and Tools

### Free Resources
- Credit Karma, Credit Sesame (free score monitoring)
- AnnualCreditReport.com
- FTC Consumer Information
- State-specific credit counseling

### Professional Services
- Credit counseling agencies
- Credit repair companies (beware of scams)
- Financial advisors
- Tradeline services

## Final Tips

- Be patient - credit building takes time
- Focus on financial education
- Avoid "quick fix" scams
- Celebrate small victories
- Stay consistent with good habits

Remember, building credit is about demonstrating financial responsibility over time. Stay committed to good financial habits, and your credit will improve steadily.
    `,
    date: 'Dec 15, 2024',
    readTime: '10 min read',
    category: 'Beginners Guide',
    image: '🚀',
    author: 'Financial Advisors',
    tags: ['credit building', 'beginners', 'secured cards', 'tradelines']
  },
  {
    id: 'avoiding-arbitration',
    title: '12 Ways to Avoid Arbitration Even After Congress Overturned the CFPB Arbitration Rule',
    excerpt: 'Learn practical strategies to defeat forced arbitration clauses and protect your right to sue, even after recent legislative changes affecting consumer financial protections.',
    content: `
# 12 Ways to Avoid Arbitration Even After Congress Overturned the CFPB Arbitration Rule

Congress recently overturned the CFPB's arbitration rule, which would have allowed consumers to bring class actions challenging abuses in the financial services sector. However, consumers still have numerous ways to defeat forced arbitration requirements.

## Federal Prohibitions on Arbitration

### Mortgage Lenders (Post-2013)
As of June 1, 2013, federal law prohibits mortgage lenders from using or enforcing arbitration clauses. This includes second mortgages, reverse mortgages, and other security interests in a dwelling.

### Manufactured Home Loans
The same federal prohibition applies to manufactured home loans and even loans for trailers, vacation and second homes, and boats used as dwellings.

### Military Personnel Protections
As of October 3, 2016, federal law prohibits arbitration requirements applied to active military personnel or their dependents in contracts involving almost all types of non-purchase-money, closed-end credit. As of October 3, 2017, the prohibition also applies to credit cards and other open-end credit.

## Contract Law Defenses

### Lack of Agreement
An arbitration agreement is a matter of contract, and it is not enforceable if the defendant cannot establish the existence of an agreement. The language of the arbitration agreement determines its enforceability, and there can be no analysis of that language without production of the agreement.

Debt collectors and debt buyers particularly may have difficulty producing the underlying credit agreement containing the arbitration requirement. A surprising number of consumer contracts do not contain an arbitration requirement.

### Improper Formation
The party seeking to compel arbitration must establish that the consumer entered into the agreement. The contract cannot have been obtained through duress, minority, incompetency, or fraud in the factum.

The agreement is not binding if it is never finalized, or where the agreement containing the arbitration requirement is superseded by another agreement that does not contain it.

### Non-Party Issues
Defendants who are not parties to the agreement will have difficulty enforcing the agreement, and even defendants who are parties to the agreement will have difficulty enforcing it against consumers not parties to the agreement.

## Practical Defenses

### Waiver
A defendant can waive the arbitration requirement by engaging in court litigation that the consumer initiates, by refusing to pay arbitration fees or refusing to participate in the arbitration.

### Unconscionability
An unconscionable arbitration agreement may be unenforceable or the court may excise the unconscionable provisions, such as requirements for inconvenient forums, one-sided rules, unaffordable costs on the consumer, and loser-pay rules.

An arbitration requirement may be unenforceable where it conflicts with federal statutory rights, such as where remedies are limited or the arbitration is too costly for the consumer.

### Class Action Waivers
The National Labor Relations Board has ruled that the National Labor Relations Act prohibits the use and enforcement of class waivers in agreements between employees and employers.

### Bankruptcy Court Discretion
Bankruptcy courts have discretion in certain cases to refuse to enforce an arbitration clause and instead hear the matter themselves.

### Warranty Claims
The FTC and several federal district courts have held that there can be no binding arbitration of written warranty claims.

### Student Loan Protections
The Department of Education has finalized a rule limiting the ability of schools that receive federal student loan funds from enforcing arbitration requirements.

## When Arbitration May Benefit Consumers

While generally stacked against consumers, arbitration can sometimes work in their favor:

### Class Arbitration
Some arbitration clauses that are silent as to the availability of class arbitration may allow class arbitration, which can provide a practical remedy.

### Punitive Damages
Arbitrators may be more likely to award punitive damages than juries, and there is extremely limited review of such awards.

## Key Takeaways

Even after the overturning of the CFPB arbitration rule, consumers retain significant protections and strategies to avoid forced arbitration. Understanding these defenses is crucial for protecting consumer rights in an increasingly arbitration-heavy legal landscape.

The deck may be stacked against consumers in arbitration proceedings, but knowledge of these 12 strategies can help level the playing field and ensure access to justice.
    `,
    date: 'Dec 20, 2024',
    readTime: '10 min read',
    category: 'Legal Rights',
    image: '⚖️',
    author: 'Jonathan Sheldon',
    tags: ['arbitration', 'consumer rights', 'CFPB', 'legal protection', 'class actions']
  },
  {
    id: 'credit-reporting-rights',
    title: 'Credit Reporting: Protecting Your Credit Information',
    excerpt: 'Learn your rights under the Fair Credit Reporting Act and how to correct errors, dispute inaccurate information, and protect your credit file from unauthorized access.',
    content: `
# Credit Reporting: Protecting Your Credit Information

Ensuring consumers' credit and personal identifying information is protected, accurate, and available to them is crucial in today's financial landscape.

## Common Problems

Do you have a charge on your credit report that you did not make and the credit reporting agencies are refusing to delete it? Were you denied credit because of charges that don't belong to you? Have you declared bankruptcy but still see debt that was supposed to be eliminated?

## Know Your Rights!

You have the right to get one free credit report from each of the credit reporting agencies every year.

The Fair Credit Reporting Act (FCRA) is the primary law that addresses credit reports. It has three primary purposes:

### Ensure that credit reports provide accurate information
### Safeguard consumers' credit and personal identifying information
### Give consumers the information that is being reported on them (Disclosure)

## Consumer Rights in the FCRA

### Information to be Disclosed to You
Upon your request, a Credit Reporting Agency (CRA) shall clearly and accurately disclose:

- All information in your file at that time
- The sources of the information
- Identification of each person who procured a consumer report for employment purposes within the previous two years and for any other purpose within the previous year
- A record of all inquiries received within the previous year that identified you in connection with a transaction that was not initiated by you

### Reinvestigation
CRAs must conduct a reasonable reinvestigation after receiving a dispute. They must:
- Delete or modify information that is found to be inaccurate or incomplete or that cannot be verified
- Complete reinvestigation within thirty days or forty-five days if it is for a free annual report
- Send consumer written results of reinvestigation

### Identity Theft
CRAs must block information you identify as resulting from identity theft when they receive:
- Appropriate proof of identity
- Copy of an identity theft report
- Identification of such information by the consumer
- A statement by the consumer that the information is not related to any transaction by the consumer

The information must be blocked within four business days after receipt.

### Exclusions from Consumer Reports
No consumer report should include:
- Any adverse information, collection, or charge off that is more than seven years old
- Paid tax liens that are more than seven years old
- Bankruptcy cases more than ten years from the date of relief or adjudication
- Civil suits, judgments, or records of arrest that were released more than seven years before the report or until the statute of limitations expires, whichever is longer

## Correcting Your Credit

### Main Reporting Agencies
There are three main, national consumer credit reporting agencies (CRAs): Experian Information Solutions, Inc.; Equifax Information Services, LLC; and TransUnion LLC (the "Big Three").

### How CRAs Get Information
Experian, Equifax, and TransUnion collect information from court records, banks, credit card companies, finance companies, department stores, cellular phone companies, court records, and many other companies issuing credit.

The "Big Three" do not necessarily have the same credit information because not all creditors send reports to all three agencies and the agencies do not all collect information from the same public records.

### STEP 1: Get a Credit Report
Get a copy of your Report: Consumers may obtain a free copy of their consumer report online at annualcreditreport.com once every twelve months from Equifax, Experian, and TransUnion.

You are also entitled to a free report within sixty days of credit denial.

### STEP 2: Locate the Causes of Credit Mistakes
Errors in Credit Reports occur often. Common causes include:

**Creditor Error:** Problems with database formats or incorrect data entry
**Incorrect Names:** Incomplete names or similar identifiers causing misattribution
**Collection Agency Error:** Improper reporting or intentional false reporting
**CRA Error:** Incorrect merging of information with similar identifiers
**Public Records Error:** Outdated information not properly updated

### STEP 3: Always Document
Keep detailed records of all communications and disputes. Documentation is crucial for:
- Showing seriousness of your concern
- Tracking the case accurately
- Triggering legal obligations
- Supporting future legal action

### STEP 4: Send Dispute Letters
Send disputes to CRAs by certified mail return receipt requested. Include:
- Your name, social security number, address, and date of birth
- Name of the company reporting the inaccurate entry
- Credit account number
- Statement that the account was in error
- Why you believe the credit report is in error
- What you want done
- Request for investigation details
- Any supporting documents

Send disputes to both the CRA and the company furnishing the information to ensure proper handling.
    `,
    date: 'Dec 19, 2024',
    readTime: '12 min read',
    category: 'Credit Education',
    image: '📊',
    author: 'NACA Legal Team',
    tags: ['credit reporting', 'FCRA', 'credit repair', 'consumer rights']
  },
  {
    id: 'identity-theft-protection',
    title: 'Identity Theft: Protecting Your Personal Information',
    excerpt: 'Learn to recognize signs of identity theft, understand your rights under the law, and take action to protect and recover your stolen identity.',
    content: `
# Identity Theft: Protecting Your Personal Information

Identity theft is an ever-growing problem in today's information-sharing age. It takes a consumer's own vigilance to uncover a theft of their identity and their willingness to fight to get their identity back.

## How Can Identity Theft Hurt Me?

Identity theft can cause a variety of problems:
- Unknown credit accounts appearing on your credit report
- Ruined credit rating making future purchases difficult
- Higher insurance rates due to lower credit scores
- Denied employment or termination due to false credit information
- Serious harassment by debt collectors

Even after discovering the theft, corporate predators may have you take counter-productive actions that hurt your ability to recover your identity and obtain compensation.

## Signs of Identity Theft

If you have experienced any of the below, it is possible that you have been a victim of identity theft:

- Unknown credit accounts have popped up on your credit report
- You have been receiving mail or pre-approved credit offers with someone else's name at your home or office
- Companies that you have not done business with have been looking at your credit report
- Debt collectors have started sending you collection notices for accounts you do not have
- Your credit report lists an alias name or address that you have never used
- You have received bills, statements, or other account information in the mail relating to accounts you didn't open

However, any of the above could have occurred by mistake. Credit grantors and credit bureaus regularly make errors.

## What To Do If You're a Victim

### Learn Your Rights
Under the revised Fair Credit Reporting Act (FCRA), victims of identity theft are entitled to:
- Free copies of your credit file (credit reports)
- Place a fraud block in your credit report file
- Notify potential creditors that someone has been using your identity

### The Dangers of Disputing an Item
If you dispute an item on your credit report directly to the creditor and claim identity theft, you open yourself up to an open-ended inquiry from that creditor. Under the FCRA, consumers must provide all information requested by the creditor if there is a credit reporting dispute.

### Starting a Lawsuit
You may need to launch a lawsuit to get what you deserve. Gather all documents that relate to:
- The dispute
- Your damages (how you were harmed)
- Copies of your credit report
- Letters denying you credit

### Important Warnings
- Never execute any "identity theft affidavit" or "fraud affidavit" until you have seen the actual application which is believed to be forged
- Never execute those affidavits without consulting an attorney first
- Be cautious about providing information that could be used against you

## Prevention and Protection

### Monitor Your Credit Regularly
- Get free credit reports annually from AnnualCreditReport.com
- Review your credit reports for unauthorized activity
- Set up credit monitoring alerts

### Protect Your Personal Information
- Shred documents containing personal information before disposal
- Use strong, unique passwords for online accounts
- Be cautious about sharing personal information online
- Monitor your mail and bank statements regularly

### Secure Your Devices
- Use antivirus software and keep it updated
- Be wary of phishing emails and suspicious links
- Use two-factor authentication when available
- Avoid using public Wi-Fi for sensitive transactions

## Legal Protections

The Fair Credit Reporting Act provides specific protections for identity theft victims:

### Fraud Alerts
You can place an initial 90-day fraud alert on your credit reports, which tells creditors to take extra steps to verify your identity before extending credit.

### Credit Freezes
You can freeze your credit, which prevents new accounts from being opened in your name without your express permission.

### Victim Statements
You can add a statement to your credit report explaining that you are a victim of identity theft.

## Recovery Steps

1. **Report the Theft:** File a report with the Federal Trade Commission at IdentityTheft.gov and local police
2. **Contact Credit Bureaus:** Place fraud alerts and review your credit reports
3. **Contact Creditors:** Notify all financial institutions and close compromised accounts
4. **Monitor and Repair:** Regularly monitor your credit and work to repair any damage

## Resources

- Federal Trade Commission (FTC) Identity Theft Resources
- Annual Credit Report website
- Local consumer protection agencies
- Credit counseling services

Remember, early detection and quick action are key to minimizing the damage caused by identity theft. Stay vigilant and protect your personal information.
    `,
    date: 'Dec 18, 2024',
    readTime: '8 min read',
    category: 'Identity Protection',
    image: '🛡️',
    author: 'NACA Legal Team',
    tags: ['identity theft', 'fraud protection', 'credit security', 'consumer rights']
  }
];

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || 'Credit Building Guide';
    const text = post?.excerpt || 'Learn about credit building and financial literacy';

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        // You could add a toast notification here
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      }
      setShowShareOptions(false);
      return;
    }

    // Check if Web Share API is available
    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
      setShowShareOptions(false);
      return;
    }

    // Fallback to direct links
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Article Not Found | ConsumerAI Blog</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The article you're looking for doesn't exist.
              </p>
              <Link to="/blog">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const pageUrl = `https://consumerai.info/blog/${post.id}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": "https://consumerai.info/Landing.png",
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ConsumerAI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://consumerai.info/Landing.png"
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "keywords": post.tags.join(', '),
    "articleSection": post.category
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | ConsumerAI Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://consumerai.info/Landing.png" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://consumerai.info/Landing.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
          </div>
        </div>

        {/* Article Image */}
        <div className="mb-8">
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-8xl shadow-lg">
            {post.image}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div
            className="text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.content
                .split('\n')
                .map(line => {
                  // Convert markdown-style headers
                  if (line.startsWith('# ')) {
                    return `<h1 class="text-3xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">${line.substring(2)}</h1>`;
                  }
                  if (line.startsWith('## ')) {
                    return `<h2 class="text-2xl font-bold mt-6 mb-3 text-slate-900 dark:text-white">${line.substring(3)}</h2>`;
                  }
                  if (line.startsWith('### ')) {
                    return `<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white">${line.substring(4)}</h3>`;
                  }

                  // Convert bullet points
                  if (line.startsWith('- ')) {
                    return `<li class="ml-4">${line.substring(2)}</li>`;
                  }

                  // Convert numbered lists (basic)
                  if (/^\d+\./.test(line)) {
                    return `<li class="ml-4 list-decimal">${line}</li>`;
                  }

                  // Empty lines become paragraphs
                  if (line.trim() === '') {
                    return '</p><p>';
                  }

                  // Bold text
                  line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                  return line;
                })
                .join('')
                .replace(/<\/p><p>/g, '</p><p class="mb-4">')
                .replace(/^/, '<p class="mb-4">')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Share this article</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Help others learn about credit building
                </p>
              </div>
              <div className="relative" ref={shareRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareOptions(!showShareOptions)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {showShareOptions && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-4">
                      <h4 className="font-medium mb-3 text-sm">Share on social media</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('facebook')}
                          className="flex items-center justify-start"
                        >
                          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                          Facebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('twitter')}
                          className="flex items-center justify-start"
                        >
                          <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('linkedin')}
                          className="flex items-center justify-start"
                        >
                          <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                          LinkedIn
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('copy')}
                          className="flex items-center justify-start"
                        >
                          <Copy className="w-4 h-4 mr-2 text-slate-600" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles / Call to Action */}
        <Card className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Credit?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Take the next step in your credit building journey. Explore our free tools and premium services designed to help you achieve your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/credit-builder">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Building Credit
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline">
                  Read More Articles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}