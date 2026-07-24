import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartContext } from "@/context/CartContext";
import { cartLinesWithProducts, cartTotalCents, clearCart } from "@/lib/cart";
import { createDemoCheckoutOrder } from "@/lib/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type PayMethod = "stripe" | "paypal";

const StoreCheckout = () => {
  const navigate = useNavigate();
  const { refresh } = useCartContext();
  const items = cartLinesWithProducts();
  const total = cartTotalCents();
  const [payMethod, setPayMethod] = useState<PayMethod>("stripe");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in name and email.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const order = createDemoCheckoutOrder({
      customerEmail: email,
      customerName: name,
      shippingAddress: address,
      paymentProvider: payMethod,
      lines: items.map(({ line }) => line),
    });
    clearCart();
    refresh();
    toast.success("Demo order placed—no payment was processed.");
    navigate(`/store/success?order=${encodeURIComponent(order.id)}`);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg text-center">
        <p className="text-muted-foreground mb-4">Nothing to checkout.</p>
        <Button asChild variant="outline">
          <Link to="/store">Back to store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Demo only—choose PayPal or Stripe style flow. No real charges.
      </p>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="co-name">Full name</Label>
              <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-email">Email</Label>
              <Input id="co-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co-address">Address (optional)</Label>
              <Input id="co-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={payMethod} onValueChange={(v) => setPayMethod(v as PayMethod)} className="space-y-3">
              <div className="flex items-center space-x-2 rounded-md border border-border p-3">
                <RadioGroupItem value="stripe" id="pm-stripe" />
                <Label htmlFor="pm-stripe" className="flex-1 cursor-pointer">
                  Card (Stripe-style form—demo)
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border border-border p-3">
                <RadioGroupItem value="paypal" id="pm-paypal" />
                <Label htmlFor="pm-paypal" className="flex-1 cursor-pointer">
                  PayPal (redirect simulated—demo)
                </Label>
              </div>
            </RadioGroup>
            {payMethod === "stripe" && (
              <div className="mt-4 space-y-2 opacity-80">
                <Label>Card number (fake)</Label>
                <Input placeholder="4242 4242 4242 4242" disabled className="bg-muted" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY" disabled className="bg-muted" />
                  <Input placeholder="CVC" disabled className="bg-muted" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">Order summary</p>
          <ul className="text-sm space-y-1 mb-2">
            {items.map(({ line, product }) => (
              <li key={product.id} className="flex justify-between">
                <span>
                  {product.name} × {line.qty}
                </span>
                <span>${(product.price * line.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="font-semibold pt-2 border-t border-border">Total ${total.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to="/store/cart">Back to cart</Link>
          </Button>
          <Button type="submit" className="flex-1 bg-secondary text-white hover:bg-secondary/90">
            Place demo order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoreCheckout;
