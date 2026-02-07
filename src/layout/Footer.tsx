import { Facebook, Twitter, Linkedin, Shield, FileText, AlertCircle, HelpCircle, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">ConsumerAI</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Empowering consumers with AI-driven tools for credit building, dispute resolution, and financial protection.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/mhemediainc/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com/disputeai_ai" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/coinvestinno/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Consumer Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">
              Consumer Protection
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Federal Trade Commission
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  Consumer Financial Protection
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://www.identitytheft.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Identity Theft Resources
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">
              File Complaints
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  CFPB Complaints
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov/consumer-complaints" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  General Complaints
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov/online-purchase-complaints" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Online Purchase Issues
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/#pricing" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="mailto:info@disputeai.xyz" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/terms" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="https://www.usa.gov" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4" />
                  USA.gov Resources
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <a href="https://www.buymeacoffee.com/coinvest" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium transition-colors duration-200">
                <span>☕</span>
                <span>Support Our Work</span>
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} ConsumerAI. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                ConsumerAI provides information about consumer protection laws but is not a substitute for professional legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
