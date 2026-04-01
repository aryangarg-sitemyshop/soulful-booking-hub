import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "Perfect Summer Body: Tips from Our Dermatology Experts",
    excerpt: "Most people get happy when the days get longer and the weather gets nicer, but summertime might make others nervous about showing more skin. Here are our expert tips for achieving your summer body goals...",
    date: "March 2, 2024",
    category: "Body Care",
    readTime: "5 min read",
  },
  {
    title: "Your Secret Weapon for Flawless Skin This Season",
    excerpt: "As the sun shines brighter and summer festivities begin, many of us look forward to having radiant, youthful skin that glows naturally. Discover the treatments that can help...",
    date: "March 2, 2024",
    category: "Skin Care",
    readTime: "4 min read",
  },
  {
    title: "Hair Transplant Consultation Guide: What Questions to Ask",
    excerpt: "Hair loss can be a significant concern for both men and women. Hair transplants offer a permanent solution. Here's a comprehensive guide to your consultation...",
    date: "May 13, 2024",
    category: "Hair Care",
    readTime: "6 min read",
  },
  {
    title: "Understanding Hyperpigmentation: Causes and Treatments",
    excerpt: "Hyperpigmentation is the darkening of an area of skin caused by increased melanin. Learn about the different types and the most effective treatments available...",
    date: "December 28, 2023",
    category: "Skin Care",
    readTime: "7 min read",
  },
  {
    title: "Go-To Summer Treatments for Radiant Skin",
    excerpt: "Summer is just around the corner! The weather is warming up and it's almost time to put on your favorite outfits. Prepare your skin with these essential treatments...",
    date: "March 2, 2024",
    category: "Skin Care",
    readTime: "4 min read",
  },
  {
    title: "HIFU Face Lift: The Non-Surgical Alternative",
    excerpt: "High-Intensity Focused Ultrasound (HIFU) offers a non-invasive alternative to traditional facelifts. Learn how this technology can tighten and lift your skin...",
    date: "October 7, 2025",
    category: "Anti-Ageing",
    readTime: "5 min read",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="section-padding gradient-rose-subtle">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="section-label">Blog</span>
              <h1 className="section-heading mt-3 mb-6">Latest Insights & Tips</h1>
              <p className="section-subheading mx-auto">
                Expert advice on skincare, hair care, and body wellness from our dermatologists.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow group cursor-pointer"
                >
                  <div className="h-48 gradient-rose-subtle flex items-center justify-center">
                    <span className="text-sm font-body font-semibold text-primary px-4 py-1.5 bg-card/80 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold text-primary group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Blog;
