import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ArrowRight, Clock, CheckCircle2, Truck } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock };
      case 'confirmed': return { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: CheckCircle2 };
      case 'shipped': return { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Truck };
      case 'delivered': return { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 };
      default: return { color: 'bg-muted text-muted-foreground', icon: Package };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-2xl flex flex-col items-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No orders yet</h1>
        <p className="text-muted-foreground mb-8 text-lg">You haven't placed any orders with us. Time to bring the heat!</p>
        <Link href="/shop">
          <Button size="lg" className="font-bold">Shop Peppers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Order History</h1>
      <p className="text-muted-foreground mb-8">Track and review your past purchases.</p>

      <div className="space-y-6">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <Card key={order.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader className="bg-muted/50 p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order Placed</div>
                    <div className="font-medium text-sm">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total</div>
                    <div className="font-mono font-medium text-sm">${order.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order #</div>
                    <div className="font-mono font-medium text-sm">{order.id.toString().padStart(6, '0')}</div>
                  </div>
                </div>
                <Badge variant="outline" className={`py-1 px-3 flex items-center gap-1.5 ${statusConfig.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {order.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-2">Items</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-background border border-border rounded-md px-3 py-1.5 text-sm flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.pepperName}</span>
                          <span className="text-muted-foreground font-mono text-xs">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-muted text-muted-foreground border border-border rounded-md px-3 py-1.5 text-sm font-medium">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" className="w-full md:w-auto">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
