import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetPepper, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Flame, Globe, Info, Package, ShoppingCart, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PepperDetail() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: pepper, isLoading, error } = useGetPepper(Number(id), {
    query: {
      enabled: !!id && !isNaN(Number(id)),
      queryKey: ["/api/peppers", id]
    }
  });

  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart", {
          description: `${quantity}x ${pepper?.name} added to your cart.`,
        });
      },
    }
  });

  const handleAddToCart = () => {
    if (!pepper || !pepper.inStock) return;
    addToCart.mutate({ data: { pepperId: pepper.id, quantity } });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Pepper not found</h2>
        <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  if (isLoading || !pepper) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12">
        <Button variant="ghost" className="mb-8" disabled><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = pepper.imageUrl || "/images/fallback.png";

  const getHeatColor = (category: string) => {
    switch (category) {
      case "superhot": return "bg-red-950 text-red-100 border-red-900";
      case "hot": return "bg-red-600 text-white border-red-500";
      case "medium": return "bg-orange-500 text-white border-orange-400";
      case "mild": return "bg-green-600 text-white border-green-500";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <Button variant="ghost" className="mb-8 hover:bg-muted" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 w-4 h-4"/> Back to Catalog
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-muted relative sticky top-24">
            <img 
              src={imageUrl} 
              alt={pepper.name} 
              className="w-full h-full object-cover object-center"
            />
            {!pepper.inStock && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-xl py-2 px-6">Out of Stock</Badge>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <div className="flex gap-2 mb-4">
            <Badge className={getHeatColor(pepper.category)}>
              {pepper.category.toUpperCase()}
            </Badge>
            {pepper.isFeatured && (
              <Badge variant="secondary" className="bg-yellow-500 text-white border-yellow-400">
                FEATURED
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">{pepper.name}</h1>
          <div className="text-3xl font-mono font-bold text-foreground mb-6">${pepper.price.toFixed(2)} <span className="text-lg text-muted-foreground font-sans font-normal">/ unit</span></div>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {pepper.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-muted p-6 rounded-xl border border-border">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1"><Flame className="w-4 h-4"/> Heat Level</span>
              <span className="font-mono font-bold text-lg">{new Intl.NumberFormat('en-US').format(pepper.heatLevel)} SHU</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1"><Globe className="w-4 h-4"/> Origin</span>
              <span className="font-bold text-lg">{pepper.origin}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/50 flex flex-col gap-1 mt-2">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1"><InfoIcon className="w-4 h-4"/> Flavor Profile</span>
              <span className="font-bold">{pepper.flavorProfile}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-input rounded-md overflow-hidden bg-background">
                <Button 
                  variant="ghost" 
                  className="rounded-none px-4 py-2 h-auto text-lg" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!pepper.inStock || quantity <= 1}
                >
                  -
                </Button>
                <div className="w-12 text-center font-mono font-bold text-lg">{quantity}</div>
                <Button 
                  variant="ghost" 
                  className="rounded-none px-4 py-2 h-auto text-lg" 
                  onClick={() => setQuantity(Math.min(pepper.stockCount, quantity + 1))}
                  disabled={!pepper.inStock || quantity >= pepper.stockCount}
                >
                  +
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {pepper.inStock ? (
                  <span className="text-green-600 font-medium flex items-center gap-1"><Package className="w-4 h-4"/> {pepper.stockCount} available</span>
                ) : (
                  <span className="text-destructive font-medium">Currently unavailable</span>
                )}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg py-6 font-bold shadow-lg transition-all"
              disabled={!pepper.inStock || addToCart.isPending}
              onClick={handleAddToCart}
            >
              {addToCart.isPending ? "Adding to Cart..." : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart — ${(pepper.price * quantity).toFixed(2)}
                </>
              )}
            </Button>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
