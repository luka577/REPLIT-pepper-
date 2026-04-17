import { Link } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowRight, ShoppingCart, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  
  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    }
  });

  const removeItem = useRemoveFromCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    }
  });

  const clearCart = useClearCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    }
  });

  const cartTotal = cart?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
  const itemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleUpdateQuantity = (pepperId: number, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) return;
    updateItem.mutate({ pepperId, data: { quantity: newQuantity } });
  };

  const handleRemove = (pepperId: number) => {
    removeItem.mutate({ pepperId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl flex flex-col items-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added any fire to your order yet.</p>
        <Link href="/shop">
          <Button size="lg" className="font-bold">Browse Peppers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Your Cart</h1>
          <p className="text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout</p>
        </div>
        <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => clearCart.mutate({})}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-4 md:gap-6 items-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.pepper.imageUrl || "/images/fallback.png"} 
                    alt={item.pepper.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/${item.pepper.id}`}>
                    <h3 className="font-bold text-lg hover:text-primary transition-colors truncate">{item.pepper.name}</h3>
                  </Link>
                  <div className="text-sm font-mono text-muted-foreground flex items-center gap-1 mt-1">
                    <Flame className="w-3 h-3 text-primary"/> {new Intl.NumberFormat('en-US', { notation: "compact" }).format(item.pepper.heatLevel)} SHU
                  </div>
                  <div className="font-mono font-bold mt-2">${item.pepper.price.toFixed(2)}</div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(item.pepper.id)}
                    disabled={removeItem.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center border border-input rounded bg-background h-9">
                    <Button 
                      variant="ghost" 
                      className="px-2 h-full rounded-none" 
                      onClick={() => handleUpdateQuantity(item.pepper.id, item.quantity - 1, item.pepper.stockCount)}
                      disabled={item.quantity <= 1 || updateItem.isPending}
                    >
                      -
                    </Button>
                    <div className="w-8 text-center font-mono font-medium text-sm">{item.quantity}</div>
                    <Button 
                      variant="ghost" 
                      className="px-2 h-full rounded-none" 
                      onClick={() => handleUpdateQuantity(item.pepper.id, item.quantity + 1, item.pepper.stockCount)}
                      disabled={item.quantity >= item.pepper.stockCount || updateItem.isPending}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono font-medium text-primary">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="font-mono">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              Secure checkout powered by Replit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
