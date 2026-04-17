import { Link } from "wouter";
import { useGetFeaturedPeppers, useGetPepperStats, useGetPepperCategories } from "@workspace/api-client-react";
import { PepperCard } from "@/components/pepper/PepperCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Package, ShieldAlert, Sparkles, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredPeppers, isLoading: isLoadingFeatured } = useGetFeaturedPeppers();
  const { data: stats, isLoading: isLoadingStats } = useGetPepperStats();
  const { data: categories, isLoading: isLoadingCategories } = useGetPepperCategories();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img 
            src="/images/hero.png" 
            alt="Fresh colorful peppers" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4 md:px-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Flame className="mr-2 h-4 w-4 fill-primary" />
              <span>Fresh harvest arrived today</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Embrace the <span className="text-primary italic">Heat.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              We source the world's most exotic, vibrant, and dangerous peppers. From sweet & mild to face-melting superhots. Find your next obsession.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="text-lg px-8 py-6 h-auto font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Shop All Peppers <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/shop?category=superhot">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto font-bold border-border hover:bg-muted hover:text-foreground">
                  View Superhots
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-4 md:px-8">
          {isLoadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalPeppers}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Sprout className="w-4 h-4" /> Varieties
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.avgHeatLevel)}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Avg SHU
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {stats.hottestPepper ? new Intl.NumberFormat('en-US', { notation: "compact" }).format(stats.hottestPepper.heatLevel) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Max Heat (SHU)
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-4xl font-bold text-foreground mb-2">{stats.totalInStock}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" /> Total In Stock
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Featured Harvest</h2>
              <p className="text-muted-foreground max-w-2xl text-lg">Hand-picked by our growers for exceptional flavor, heat, and freshness this week.</p>
            </div>
            <Link href="/shop" className="hidden md:flex">
              <Button variant="ghost" className="font-bold">View Catalog <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[400px] w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPeppers?.map((pepper, index) => (
                <PepperCard key={pepper.id} pepper={pepper} index={index} />
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-center md:hidden">
             <Link href="/shop">
              <Button variant="outline" className="w-full font-bold">View Full Catalog <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-muted border-t border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <ShieldAlert className="w-12 h-12 mx-auto text-primary mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Know Your Heat</h2>
            <p className="text-muted-foreground text-lg">From sweet bells that add crunch to meals, to terrifying superhots that require protective gear. We organize our peppers by their Scoville Heat Units (SHU).</p>
          </div>

          {isLoadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories?.map((cat, i) => (
                <Link key={cat.name} href={`/shop?category=${cat.name}`}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
                  >
                    <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 text-foreground">{cat.name}</h3>
                    <div className="font-mono text-sm text-primary mb-4 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {new Intl.NumberFormat('en-US', { notation: "compact" }).format(cat.minHeat)} - {new Intl.NumberFormat('en-US', { notation: "compact" }).format(cat.maxHeat)} SHU
                    </div>
                    <div className="mt-auto pt-4 border-t border-border/50 text-muted-foreground font-medium flex justify-between items-center">
                      <span>{cat.count} varieties</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
