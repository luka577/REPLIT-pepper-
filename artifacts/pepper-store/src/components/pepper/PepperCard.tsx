import { Link } from "wouter";
import { Pepper } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Flame, AlertTriangle } from "lucide-react";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function PepperCard({ pepper, index = 0 }: { pepper: Pepper; index?: number }) {
  const queryClient = useQueryClient();
  
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart", {
          description: `${pepper.name} has been added to your cart.`,
        });
      },
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if button is clicked
    if (!pepper.inStock) return;
    addToCart.mutate({ data: { pepperId: pepper.id, quantity: 1 } });
  };

  const getHeatColor = (category: string) => {
    switch (category) {
      case "superhot": return "bg-red-950 text-red-100 border-red-900";
      case "hot": return "bg-red-600 text-white border-red-500";
      case "medium": return "bg-orange-500 text-white border-orange-400";
      case "mild": return "bg-green-600 text-white border-green-500";
      default: return "bg-primary text-primary-foreground";
    }
  };

  const formatScoville = (shus: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(shus) + " SHU";
  };
  
  const imageUrl = pepper.imageUrl || "/images/fallback.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/shop/${pepper.id}`}>
        <Card className="h-full flex flex-col overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer relative">
          {!pepper.inStock && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <Badge variant="destructive" className="text-lg py-1 px-4 shadow-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Out of Stock
              </Badge>
            </div>
          )}
          
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img 
              src={imageUrl} 
              alt={pepper.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              <Badge className={getHeatColor(pepper.category)}>
                {pepper.category.toUpperCase()}
              </Badge>
              {pepper.isFeatured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white border-yellow-400">
                  FEATURED
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-mono border-border text-foreground">
                <Flame className="w-3 h-3 mr-1 text-primary" />
                {formatScoville(pepper.heatLevel)}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors text-foreground">{pepper.name}</h3>
              <span className="font-mono font-bold text-lg text-foreground">${pepper.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {pepper.description}
            </p>
          </CardHeader>
          
          <CardContent className="p-4 pt-0 mt-auto">
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs font-normal border-border/50 text-muted-foreground">
                {pepper.origin}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal border-border/50 text-muted-foreground">
                {pepper.flavorProfile}
              </Badge>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Button 
              className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              variant="secondary"
              disabled={!pepper.inStock || addToCart.isPending}
              onClick={handleAddToCart}
            >
              {addToCart.isPending ? "Adding..." : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
