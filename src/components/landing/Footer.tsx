import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-cream text-brown py-12 border-t border-gray-border">
      <div className="container-rig">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-teal-dark mb-4 block">
              Buddas <span className="text-orange">Catering</span>
            </span>
            <p className="text-brown/70 max-w-sm text-sm leading-relaxed">
              Premium Hawaiian corporate catering serving Utah County. 
              Zero stress, reliable delivery, and food your team actually wants to eat.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-teal-dark">Menu</h4>
            <ul className="space-y-2 text-sm text-brown/70">
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">Breakfast & Meetings</Link></li>
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">All-Hands Lunch</Link></li>
              <li><Link href="#menu" className="hover:text-teal-base transition-colors">Pastries & Rolls</Link></li>
              <li><Link href="#memberships" className="hover:text-gold transition-colors">Corporate Memberships</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-teal-dark">Company</h4>
            <ul className="space-y-2 text-sm text-brown/70">
              <li><Link href="#faq" className="hover:text-teal-base transition-colors">FAQ</Link></li>
              <li><Link href="/login" className="hover:text-teal-base transition-colors underline decoration-teal-base/20 underline-offset-4 font-medium text-brown/90">Team Login</Link></li>
              <li><span>Pleasant Grove, UT</span></li>
              <li><a href="tel:18005551234" className="hover:text-teal-base transition-colors">(800) 555-1234</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-border/50 flex flex-col md:flex-row items-center justify-between text-xs text-brown/50">
          <p>© {new Date().getFullYear()} Buddas Hawaiian Bakery & Grill. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
