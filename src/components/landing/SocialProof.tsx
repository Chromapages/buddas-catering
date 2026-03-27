"use client";

import Image from "next/image";
import { Badge } from "@/components/shared/Badge";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export function SocialProof() {
  const testimonials = [
    {
      quote: "Buddas is the only caterer we use for our all-hands now. The food is always hot, they actually bring enough for everyone, and the team loves it.",
      author: "Sarah J.",
      role: "Office Manager, Podium",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      quote: "I used to stress about catering arriving late. With Buddas, they are literally setting up 20 minutes early every single time. Lifesavers.",
      author: "Michael T.",
      role: "EA to CEO, Entrata",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      quote: "We used Buddas for our volunteer appreciation day and couldn't believe how smooth it went. The food was incredible and they handled everything.",
      author: "Rachel M.",
      role: "Events Dir., Silicon Slopes",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-cream py-24 border-y border-teal-base/10" id="reviews">
      <div className="container-rig">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange/10 text-orange border-orange/20">Why Utah's Best Teams Come Back</Badge>
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-teal-dark mb-6 tracking-tight">
            The Caterer Utah's Office Managers Actually Recommend
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex text-orange">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="text-teal-dark font-bold">4.9/5 Average</p>
            <span className="text-brown/40">•</span>
            <p className="text-brown/60">200+ Events Served</p>
          </div>
          <p className="text-lg text-brown/70 max-w-2xl mx-auto leading-relaxed">
            Here's why teams from Silicon Slopes keep choosing Buddas — every month, every event.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-lg shadow-teal-dark/5 border border-teal-base/5 relative flex flex-col group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex text-orange mb-6">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-lg text-brown/90 relative z-10 mb-10 leading-relaxed flex-grow font-medium">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 border-t border-gray-border/30 pt-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange/20">
                  <Image src={testimonial.image} alt={testimonial.author} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold font-heading text-teal-dark text-lg">{testimonial.author}</h4>
                  <p className="text-sm text-brown/60 font-medium">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Logo cloud */}
        <div className="mt-20 pt-12 border-t border-gray-border/20 text-center">
          <p className="text-[10px] font-bold text-brown/40 uppercase tracking-[0.3em] mb-10">Trusted by Utah County teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100 px-6">
            <div className="text-2xl font-bold font-heading tracking-tighter text-teal-dark">PODIUM</div>
            <div className="text-2xl font-bold font-heading tracking-tighter text-teal-dark">ENTRATA</div>
            <div className="text-2xl font-bold font-heading tracking-tighter text-teal-dark">DOMO</div>
            <div className="text-2xl font-bold font-heading tracking-tighter text-teal-dark">VIVINT</div>
            <div className="text-2xl font-bold font-heading tracking-tighter text-teal-dark">QUALTRICS</div>
          </div>
        </div>
      </div>
    </section>
  );
}
