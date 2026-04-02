import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import heroContact from "@/assets/hero-contact.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    concern: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you shortly.");
    setFormData({ name: "", email: "", phone: "", concern: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
          <img src={heroContact} alt="Clinic reception" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="section-label text-white/90">Contact Us</span>
              <h1 className="section-heading mt-3 mb-4 text-white">Get In Touch</h1>
              <p className="text-lg font-body text-white/80 max-w-xl mx-auto">
                Book a consultation or reach out with any questions. We're here to help.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Contact Information</h2>
                <div className="space-y-6">
                  {[
                    { icon: MapPin, label: "Address", value: "123 Skin Care Road, New Delhi, India - 110001", href: undefined },
                    { icon: Phone, label: "Phone", value: "+91 123 456 7890", href: "tel:+911234567890" },
                    { icon: Mail, label: "Email", value: "info@radianceclinic.com", href: "mailto:info@radianceclinic.com" },
                    { icon: Clock, label: "Hours", value: "Monday - Saturday, 10:30 AM - 7:00 PM", href: undefined },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-rose-subtle flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-body font-semibold text-foreground">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="font-body text-muted-foreground text-sm hover:text-primary transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-body text-muted-foreground text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Maps Embed */}
                <div className="mt-8 rounded-xl overflow-hidden border border-border h-64">
                  <iframe
                    title="Radiance Skin Clinic Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.1785991903913!2d77.22951!3d28.6328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b741d057%3A0xcdee88e47393c3f1!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Book Your Consultation</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Full Name</label>
                      <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="font-body" />
                    </div>
                    <div>
                      <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Phone Number</label>
                      <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="font-body" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Email Address</label>
                    <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="font-body" />
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Concern</label>
                    <select
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select your concern</option>
                      <option value="skin">Skin Care</option>
                      <option value="hair">Hair Care</option>
                      <option value="body">Body Care</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Message</label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us about your concerns..." rows={4} className="font-body" />
                  </div>
                  <Button type="submit" size="lg" className="w-full gradient-rose text-primary-foreground font-body font-semibold py-6">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Enquiry
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
