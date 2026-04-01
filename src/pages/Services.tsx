import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Sparkles, Scissors, Dumbbell, Syringe, Zap, Eye, Droplets, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const allServices = [
  {
    icon: Sparkles,
    title: "Cosmetic Dermatology",
    description: "Aesthetic treatments for ageing and skin rejuvenation including fairness treatment, anti-aging, deep scar removal, skin polishing, and wrinkle treatments.",
    treatments: ["Fairness Treatment", "Anti-Aging", "Deep Scar Removal", "Skin Polishing", "Wrinkle Treatment"],
  },
  {
    icon: Syringe,
    title: "Aesthetic Procedures",
    description: "Non-invasive anti-ageing and skin rejuvenation procedures including Botox, fillers, and advanced facial treatments.",
    treatments: ["Botox", "Dermal Fillers", "Chemical Peels", "Micro-needling", "PRP Therapy"],
  },
  {
    icon: Scissors,
    title: "Hair Restoration",
    description: "Comprehensive hair solutions from transplantation to strengthening, re-growth, and anti-dandruff treatments.",
    treatments: ["Hair Transplant (NEO DHI)", "Hair Strengthening", "Hair Re-growth", "Anti Hair Fall", "QR 678 Neo"],
  },
  {
    icon: Dumbbell,
    title: "Body Sculpting",
    description: "Advanced weight loss, inch loss, body toning, and figure correction treatments with modern technology.",
    treatments: ["Weight Loss", "Inch Loss", "Figure Correction", "Body Toning", "Cryomatic"],
  },
  {
    icon: Zap,
    title: "Laser Treatments",
    description: "Advanced laser technology for permanent hair removal, skin resurfacing, and various skin concerns.",
    treatments: ["Laser Hair Removal", "Laser Skin Resurfacing", "Laser Toning", "Tattoo Removal", "Pigmentation Laser"],
  },
  {
    icon: Eye,
    title: "Dark Circle Treatment",
    description: "Specialized treatments for under-eye dark circles and eye bags using advanced dermatological techniques.",
    treatments: ["Under Eye Treatment", "Eye Bag Reduction", "Eyelight Therapy", "Tear Trough Fillers"],
  },
  {
    icon: Droplets,
    title: "Acne & Scar Treatment",
    description: "Comprehensive acne management and scar reduction treatments for clear, smooth skin.",
    treatments: ["Acne Treatment", "Acne Scar Removal", "Chemical Peels", "Micro-needling", "LED Therapy"],
  },
  {
    icon: Sun,
    title: "Skin Rejuvenation",
    description: "Complete skin renewal treatments to restore youthful, glowing skin with minimal downtime.",
    treatments: ["HIFU Face Lift", "Hydrafacial", "V Carbon Peel", "Permanent Makeup", "Skin Brightening"],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="section-padding gradient-rose-subtle">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="section-label">Our Services</span>
              <h1 className="section-heading mt-3 mb-6">Comprehensive Skin & Hair Treatments</h1>
              <p className="section-subheading mx-auto">
                Advanced dermatological treatments tailored to your unique needs with cutting-edge technology.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allServices.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 2) * 0.15, duration: 0.5 }}
                  className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl gradient-rose-subtle flex items-center justify-center shrink-0">
                      <service.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-foreground">{service.title}</h3>
                      <p className="text-sm font-body text-muted-foreground mt-1">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {service.treatments.map((t) => (
                      <span key={t} className="text-xs font-body px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link to="/contact">
                <Button size="lg" className="gradient-rose text-primary-foreground font-body font-semibold px-10 py-6 text-base">
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Services;
