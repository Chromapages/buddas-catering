import Image from "next/image";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream pt-16 md:pt-24 lg:pt-32 pb-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center lg:justify-start">
                <Badge variant="warning" className="uppercase tracking-wider">Now serving Utah County</Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-teal-dark sm:text-5xl xl:text-6xl font-heading leading-tight">
                Premium Hawaiian Catering for Your Office
              </h1>
              <p className="max-w-[600px] text-lg text-brown/80 md:text-xl leading-relaxed mx-auto lg:mx-0">
                From breakfast meetings to all-hands lunches. Zero stress, reliable delivery, and food your team actually wants to eat.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="w-full sm:w-auto shadow-md">
                <Link href="#book">Book Catering</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="#memberships">View Memberships</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm font-medium text-brown/60">
              <span className="flex h-2 w-2 rounded-full bg-teal-base animate-pulse"></span>
              Starting at just $12 / person
            </div>
            
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-sm text-brown/70 font-medium">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-teal-base" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Setup Included</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-teal-base" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span>On-time Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none aspect-[4/3] lg:aspect-square">
            <div className="absolute inset-0 rounded-3xl bg-teal-base/10 shadow-2xl transform rotate-3 scale-105 transition-transform duration-700 ease-in-out hover:rotate-6"></div>
            <div className="absolute inset-0 rounded-3xl overflow-hidden border-8 border-white shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Delicious Hawaiian catering spread"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Quick floating stat card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-teal-dark font-heading">100+ Offices</p>
                <p className="text-xs text-brown/70">Fed in Utah</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
