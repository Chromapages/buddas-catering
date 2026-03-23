import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { StickyCTA } from "@/components/landing/StickyCTA";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      {/* 
        This is the main public surface wrapping the landing page. 
        It does not include any auth guards, and SSG applies here.
      */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <StickyCTA />
      <Footer />
    </>
  );
}
