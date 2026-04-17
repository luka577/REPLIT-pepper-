import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle2, Truck, Package, MapPin, Mail, User } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useGetOrder(Number(id), {
    query: {
      enabled: !!id && !isNaN(Number(id)),
      queryKey: ["/api/orders", id]
    }
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link href="/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" disabled className="mb-6"><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
        <Skeleton className="h-48 w-full mb-8 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock };
      case 'confirmed': return { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: CheckCircle2 };
      case 'shipped': return { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Truck };
      case 'delivered': return { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 };
      default: return { color: 'bg-muted text-muted-foreground', icon: Package };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 w-4 h-4"/> Back to Orders</Button>
      </Link>

      <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order #{order.id.toString().padStart(6, '0')}</h1>
          <p className="text-muted-foreground">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <Badge className={`px-4 py-2 text-sm flex items-center gap-2 ${statusConfig.color}`} variant="outline">
          <StatusIcon className="w-4 h-4" />
          {order.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold">Items Ordered</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground bg-muted/10">
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Product</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs text-center">Price</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs text-center">Qty</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <Link href={`/shop/${item.pepperId}`} className="font-bold hover:text-primary transition-colors">
                          {item.pepperName}
                        </Link>
                      </td>
                      <td className="p-4 text-center font-mono text-muted-foreground">${item.priceAtOrder.toFixed(2)}</td>
                      <td className="p-4 text-center font-mono">{item.quantity}</td>
                      <td className="p-4 text-right font-mono font-medium">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-muted/10 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono text-primary font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="font-mono">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-0.5">Name</div>
                  <div className="font-medium">{order.customerName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-0.5">Email</div>
                  <div className="font-medium">{order.customerEmail}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Delivery Address</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="font-medium whitespace-pre-wrap">{order.customerAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
