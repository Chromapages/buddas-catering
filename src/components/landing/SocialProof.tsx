import Image from "next/image";

export function SocialProof() {
  const testimonials = [
    {
      quote: "Buddas is the only caterer we use for our all-hands now. The food is always hot, they actually bring enough for everyone, and the team loves it.",
      author: "Sarah J.",
      role: "Office Manager, TechFlow Inc.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      quote: "I used to stress about catering arriving late. With Buddas, they are literally setting up 20 minutes early every single time. Lifesavers.",
      author: "Michael T.",
      role: "EA to CEO, Apex Ventures",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  return (
    <section className="bg-cream py-24 border-y border-teal-base/20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-teal-dark mb-4">
            Trusted by 100+ Utah Companies
          </h2>
          <p className="text-lg text-brown/80 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what office managers and executive assistants have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-border relative">
              <div className="text-teal-base opacity-20 absolute top-4 left-6 text-6xl font-serif">"</div>
              <p className="text-lg text-brown relative z-10 mb-8 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src={testimonial.image} alt={testimonial.author} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold font-heading text-teal-dark">{testimonial.author}</h4>
                  <p className="text-sm text-brown/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Logo cloud placeholder */}
        <div className="mt-16 pt-10 border-t border-gray-border/50 text-center">
          <p className="text-sm font-medium text-brown/60 uppercase tracking-wider mb-6">Serving teams at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
            {/* These represent actual high-growth Utah companies */}
            <div className="text-xl font-bold font-heading tracking-tight">SALT PEAK</div>
            <div className="text-xl font-bold font-heading tracking-tight">CANYON AI</div>
            <div className="text-xl font-bold font-heading tracking-tight">ALPINE LOGIC</div>
            <div className="text-xl font-bold font-heading tracking-tight">WASATCH SOLUTIONS</div>
            <div className="text-xl font-bold font-heading tracking-tight">SILICON SLOPES</div>
          </div>
        </div>
      </div>
    </section>
  );
}
