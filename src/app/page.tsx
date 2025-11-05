import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, Database, BarChart2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const inventoryImage = PlaceHolderImages.find(img => img.id === 'feature-inventory');
  const assessmentImage = PlaceHolderImages.find(img => img.id === 'feature-assessment');
  const reportingImage = PlaceHolderImages.find(img => img.id === 'feature-reporting');

  const features = [
    {
      icon: <Database className="h-10 w-10 text-primary" />,
      title: "Manajemen Inventaris Terpusat",
      description: "Kelola semua aset TIK Anda, dari perangkat keras hingga data, dalam satu platform yang mudah diakses.",
      image: inventoryImage
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Penilaian Keamanan Otomatis",
      description: "Lakukan penilaian keamanan dengan 5 kriteria standar dan dapatkan klasifikasi nilai aset secara otomatis.",
      image: assessmentImage
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      title: "Dasbor & Pelaporan Intuitif",
      description: "Pantau kondisi keamanan aset melalui dasbor interaktif dan hasilkan laporan profesional untuk pimpinan.",
      image: reportingImage
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Shield className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold font-headline text-primary">SI-PAKAT</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            prefetch={false}
          >
            <Button>
              Login
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full pt-24 lg:pt-32 pb-16 md:pb-24 lg:pb-32">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Sistem Cerdas untuk Keamanan Aset TIK
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    SI-PAKAT (Sistem Informasi Pengelolaan Keamanan Aset TIK) membantu mengelola, menilai, dan melindungi aset digital paling berharga dengan efisien.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Mulai Kelola Aset
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Fitur Unggulan</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Platform Lengkap untuk Pengamanan Aset</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Dari inventarisasi hingga pelaporan, SI-PAKAT menyediakan semua alat yang Anda butuhkan untuk menjaga keamanan aset TIK secara proaktif.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  {feature.image && (
                     <Image
                      src={feature.image.imageUrl}
                      alt={feature.image.description}
                      width={600}
                      height={400}
                      className="w-full h-40 object-cover"
                      data-ai-hint={feature.image.imageHint}
                    />
                  )}
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ambil Kendali Penuh Atas Keamanan Aset Anda
              </h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Tingkatkan postur keamanan organisasi Anda. Masuk untuk mulai mengelola aset.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/login" prefetch={false}>
                 <Button type="submit" className="w-full" size="lg">
                    Login
                  </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SI-PAKAT Digital. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
