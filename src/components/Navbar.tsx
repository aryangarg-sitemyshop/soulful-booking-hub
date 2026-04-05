import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/contexts/BookingContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Our Services", to: "/services" },
  { label: "Blog", to: "/blog" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { openBooking } = useBooking();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-heading font-bold text-primary">
            Radiance
          </span>
          <span className="text-xs font-body text-muted-foreground tracking-widest uppercase hidden sm:block">
            Skin Clinic
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-body font-medium tracking-wide transition-colors hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href="tel:+911234567890" className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            +91 123 456 7890
          </a>
          <Button onClick={openBooking} className="gradient-rose text-primary-foreground font-body font-semibold px-6">
            Book Appointment
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <a href="tel:+911234567890" className="py-2 text-sm font-body font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> +91 123 456 7890
              </a>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`py-2 text-sm font-body font-medium ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button onClick={() => { setOpen(false); openBooking(); }} className="w-full gradient-rose text-primary-foreground font-body font-semibold mt-2">
                Book Appointment
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
