import { Link } from "react-router-dom";
import { productsApi } from "@/lib/api/productsApi";
import { addToCart } from "@/lib/cart";
import { useCartContext } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const StoreCatalog = () => {
  const { refresh } = useCartContext();
  const products = productsApi.listProducts();

  const handleAdd = (id: string, name: string) => {
    addToCart(id, 1);
    refresh();
    toast.success(`${name} added to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Store</h1>
      <p className="text-muted-foreground mb-8 max-w-xl">
        Programs, gear, and digital guides. Checkout is demo-only—no charges are processed.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.filter((p) => !p.id.startsWith("pkg-")).map((p) => (
          <Card key={p.id} className="bg-card/80 border-border flex flex-col">
            <CardHeader>
              <p className="text-xs font-display tracking-widest text-white mb-1">{p.category}</p>
              <CardTitle className="font-display text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-4 text-2xl font-semibold text-foreground">${p.price}</p>
            </CardContent>
            <CardFooter className="gap-2 flex-wrap">
              <Button
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={() => handleAdd(p.id, p.name)}
              >
                Add to cart
              </Button>
              <Button variant="outline" asChild>
                <Link to="/store/cart">View cart</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoreCatalog;
