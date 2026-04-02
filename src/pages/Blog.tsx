import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import heroBlog from "@/assets/hero-blog.jpg";

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
          <img src={heroBlog} alt="Skincare and beauty" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="section-label text-white/90">Blog</span>
              <h1 className="section-heading mt-3 mb-4 text-white">Latest Insights & Tips</h1>
              <p className="text-lg font-body text-white/80 max-w-xl mx-auto">
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
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow group"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-body font-semibold text-primary group-hover:gap-2 transition-all"
                    >
                      Read More <ArrowRight className="w-3 h-3" />
                    </Link>
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
