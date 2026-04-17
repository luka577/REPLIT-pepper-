import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Flame className="w-6 h-6 fill-primary" />
              <span className="font-bold text-xl tracking-tight text-foreground">Pepper Palace</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The boldest, freshest, and most exotic peppers sourced directly from growers who respect the heat. 
              Find your next obsession.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/shop?category=superhot" className="hover:text-primary transition-colors">Superhots</a></li>
              <li><a href="/shop?category=hot" className="hover:text-primary transition-colors">Hot Peppers</a></li>
              <li><a href="/shop?category=medium" className="hover:text-primary transition-colors">Medium Heat</a></li>
              <li><a href="/shop?category=mild" className="hover:text-primary transition-colors">Mild & Sweet</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Help</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/orders" className="hover:text-primary transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pepper Palace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
