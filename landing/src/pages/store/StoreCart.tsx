import { Link } from "react-router-dom";
import { useCartContext } from "@/context/CartContext";
import { cartLinesWithProducts, updateQty, removeFromCart, cartTotalCents } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const StoreCart = () => {
  const { refresh } = useCartContext();
  const items = cartLinesWithProducts();
  const total = cartTotalCents();

  const bump = (productId: string, qty: number) => {
    updateQty(productId, qty);
    refresh();
  };

  const remove = (productId: string) => {
    removeFromCart(productId);
    refresh();
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl mb-8">Cart</h1>
      {items.length === 0 ? (
        <Card className="bg-card/80">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">Your cart is empty.</p>
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
              <Link to="/store">Browse catalog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(({ line, product }) => (
            <Card key={product.id} className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="font-display text-base">{product.name}</CardTitle>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(product.id)}>
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-muted-foreground">${product.price} each</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Qty</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={line.qty}
                    onChange={(e) => bump(product.id, Number(e.target.value) || 1)}
                  />
                </div>
                <span className="ml-auto font-semibold">${(product.price * line.qty).toFixed(2)}</span>
              </CardContent>
            </Card>
          ))}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
            <p className="text-lg">
              Total <span className="font-semibold">${total.toFixed(2)}</span>
            </p>
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
              <Link to="/store/checkout">Continue to checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreCart;
