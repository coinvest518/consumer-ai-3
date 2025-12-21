import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Consumer AI – User Agreement
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Terms of Service and User Agreement
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Effective Date: December 21, 2025
          </div>
        </div>

        {/* Legal Entity Notice */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Legal Entity</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  MildHigh Entertainment LLC, a Georgia limited liability company, doing business as Consumer AI ("we," "us," "our")
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                  By accessing or using Consumer AI's website or app ("Services"), you ("User," "you," or "your") agree to these Terms. If you don't agree, do not use our Services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Eligibility & Account Types</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              You must be at least 18 years old and capable of forming a binding contract.
            </p>
            <div className="ml-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Account types:</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Individual Account:</strong> personal use, upload of your own documents, personal data.</li>
                <li><strong>Business / Organization Account:</strong> when registering on behalf of business, you represent you have authority and that business will follow these Terms.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Services & Limitations</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We offer consulting, credit education, tradeline suggestions, affiliate links, and pro se legal information.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Limitations</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    We are not: a credit bureau, credit repair organization (unless explicitly stated and fully compliant), an attorney, or providing legal representation.
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
                    Any future credit building/reporting/repair services will require explicit user opt-in and written disclosure compliant with applicable law (see Sections 5 & 6).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Prohibited Actions</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>Use Services in unlawful or fraudulent way.</li>
              <li>Provide false or misleading info.</li>
              <li>Upload documents you don't have rights to.</li>
              <li>Misuse affiliate links or impersonate others.</li>
              <li>Circumvent security or infringe on others' rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. User Data & Uploaded Content</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Ownership:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  You retain ownership of content you upload. You grant us a limited license to use it only to perform Services you request.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Storage & Security:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Documents & data are stored securely; access restricted; encryption used at rest and in transit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">No Sharing:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  We do not sell or publicly share your documents or data without consent. Only our trusted third-party service providers acting on our behalf.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Credit Repair Services Law (Georgia's Statute O.C.G.A. § 16-9-59)</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                Under Georgia Code § 16-9-59, it is a misdemeanor for any person to operate as a "credit repair services organization" unless they comply with legal restrictions.
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs mb-2">
                Reference: <a href="https://law.justia.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800">law.justia.com</a>
              </p>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">These restrictions include (but are not limited to):</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>No upfront fees before fully performing promised services. <a href="https://consumer.georgia.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">(consumer.georgia.gov)</a></li>
              <li>Written contract required, detailing business address, services to be performed, cost, and user's cancellation rights. <a href="https://consumer.georgia.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">(consumer.georgia.gov)</a></li>
              <li>No false or misleading representations (e.g. guaranteed removal of negative items that are accurate). <a href="https://consumer.georgia.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">(consumer.georgia.gov)</a></li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4 font-medium">
              Currently, we do not provide credit repair services unless explicitly disclosed and operated under full compliance with Georgia law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Future Services Clause</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If we add new Services involving credit building, reporting, or repair, we:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>Will update these Terms and Privacy Policy.</li>
              <li>Will require your explicit consent (opt-in).</li>
              <li>Shall ensure written agreements for those services align with all applicable laws (federal & Georgia).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Fees, Payment & Refunds</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>Any fees are disclosed before you commit.</li>
              <li>No payment required before Services begin (except for permitted services).</li>
              <li>Refund policy: Services are non-refundable after delivery unless otherwise specified.</li>
              <li>If a future credit repair service is offered, you'll be entitled to a cancellation window and refund terms as required under Georgia law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Disclaimers & No Guarantees</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
                <li>We make no guarantees about credit score improvements, legal outcomes, lender decisions, or report accuracy.</li>
                <li>Information, tools, or resources provided are for educational or informational purposes only.</li>
                <li>For legal advice, consult a licensed attorney.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Arbitration & Dispute Resolution</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Binding Arbitration:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Any dispute, claim or controversy arising under this Agreement shall be finally resolved by arbitration under the Federal Arbitration Act (9 U.S.C. § 1 et seq.) and Georgia Code, Title 9, Chapter 9 (Georgia Arbitration Act).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Venue & Rules:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  American Arbitration Association using its rules. Arbitration will occur in Georgia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Statute of Limitations Tolling:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Under Georgia Code § 9-9-63, filing of a petition for arbitration tolls any applicable statute of limitations.
                  <a href="https://law.justia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">(law.justia.com)</a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Small Claims Exemption:</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  Users may pursue claims in small claims court if jurisdiction allows.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Affiliate Links & Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>We may include affiliate links or referrals; any compensation will be disclosed.</li>
              <li>Third parties we partner with have their own policies; we are not responsible for those.</li>
              <li>We use third-party providers for hosting, payments, and processing; we require them to maintain security + confidentiality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Updates, Amendments & Notice</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>We may modify these Terms at any time; material changes notified via email or within the app.</li>
              <li>Continued use after notice constitutes acceptance.</li>
              <li>If any provision is held invalid, remaining provisions remain in effect.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Limitation of Liability & Indemnification</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li>Our liability is limited: maximum we owe is the sum of fees paid by you for the specific Service giving rise to the claim.</li>
              <li>We're not responsible for indirect, incidental, consequential damages.</li>
              <li>You agree to indemnify and hold us harmless against claims resulting from your misuse or breach of these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. Governing Law</h2>
            <p className="text-slate-700 dark:text-slate-300">
              These Terms governed by laws of the State of Georgia, without regard to conflicts of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Contact Information</h2>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>MildHigh Entertainment LLC</strong></p>
                <p>DBA Consumer AI</p>
                <p>1432 Shining Armor Dr, Forest Park, GA</p>
                <p>Email: <a href="mailto:info@consumerai.info" className="text-blue-600 hover:underline">info@consumerai.info</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service or need clarification, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@consumerai.info" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                <Shield className="w-5 h-5" />
                Contact Legal Team
              </a>
              <Link to="/" className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;