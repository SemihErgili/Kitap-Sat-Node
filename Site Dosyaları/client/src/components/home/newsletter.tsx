import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Başarılı",
        description: "E-bültenimize başarıyla kaydoldunuz.",
        variant: "default",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Fırsatlardan Haberdar Olun
          </h2>
          <p className="text-white/80 mb-6">
            E-bültenimize kaydolarak özel indirimlerden ve yeni ürünlerden ilk siz haberdar olun.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-lg transition duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Gönderiliyor..." : "Abone Ol"}
            </Button>
          </form>
          <p className="text-white/70 text-sm mt-4">
            Kişisel verileriniz, Gizlilik Politikamıza uygun şekilde işlenecektir.
          </p>
        </div>
      </div>
    </section>
  );
}
