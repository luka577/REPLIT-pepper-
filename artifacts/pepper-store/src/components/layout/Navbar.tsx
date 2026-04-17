import { Link } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingCart, Flame, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { data: cart } = useGetCart();
  const cartItemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <Flame className="w-6 h-6 fill-primary" />
          <span className="font-bold text-xl tracking-tight text-foreground">Pepper Palace</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/shop" className="text-foreground/80 hover:text-primary transition-colors">Shop</Link>
          <Link href="/orders" className="text-foreground/80 hover:text-primary transition-colors">Orders</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/orders" className="md:hidden">
            <Button variant="ghost" size="icon" className="relative">
              <Package className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
