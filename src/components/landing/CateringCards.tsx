import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

export function CateringCards() {
  const paths = [
    {
      title: "Breakfast & Meetings",
      description: "Start the day right with tropical fruit platters, Hawaiian sweet bread egg sliders, and fresh Kona-blend coffee.",
      image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "Book Breakfast"
    },
    {
      title: "All-Hands Lunch",
      description: "Our signature kalua pork, teriyaki chicken, macaroni salad, and plenty of sides to keep the whole office full and focused.",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "Book Lunch"
    },
    {
      title: "Pastries & Rolls",
      description: "Need something lighter? An assortment of our famous malasadas, guava rolls, and coconut turnovers perfect for mid-day breaks.",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      cta: "Book Pastries"
    }
  ];

  return (
    <section id="menu" className="bg-gray-bg py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-teal-dark mb-4">
            Simple, Crowd-Pleasing Menus
          </h2>
          <p className="text-lg text-brown/80 max-w-2xl">
            We've simplified catering into three main paths so you don't have to endlessly scroll through PDFs. Pick your path, tell us how many people, and we'll handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path, i) => (
            <Card key={i} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-gray-border/60">
              <div className="relative w-full h-56">
                <Image
                  src={path.image}
                  alt={path.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{path.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-base text-brown/80">
                  {path.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary" asChild>
                  <Link href={`#book?need=${encodeURIComponent(path.title)}`}>
                    {path.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
