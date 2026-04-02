import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 section-padding text-center">
          <h1 className="section-heading">Post Not Found</h1>
          <Link to="/blog">
            <Button className="mt-6 gradient-rose text-primary-foreground font-body">Back to Blog</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            width={1920}
            height={640}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-xs font-body font-semibold text-primary bg-card/80 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-4 max-w-3xl">
                  {post.title}
                </h1>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Meta & Content */}
        <section className="section-padding bg-background">
          <div className="container mx-auto max-w-3xl">
            {/* Author / Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-body text-muted-foreground mb-10 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs">{post.authorTitle}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
            </div>

            {/* Article Body */}
            <article className="prose prose-lg max-w-none font-body text-foreground">
              {post.content.map((block, i) => {
                if (block.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-xl md:text-2xl font-heading font-bold text-foreground mt-8 mb-3">
                      {block.replace("## ", "")}
                    </h2>
                  );
                }
                return (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                    {block}
                  </p>
                );
              })}
            </article>

            {/* CTA */}
            <div className="mt-12 p-8 rounded-2xl gradient-rose-subtle text-center">
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">Ready to Begin Your Journey?</h3>
              <p className="font-body text-muted-foreground mb-6">Book a personalised consultation with our expert dermatologists today.</p>
              <Link to="/contact">
                <Button size="lg" className="gradient-rose text-primary-foreground font-body font-semibold px-10">
                  Book a Consultation
                </Button>
              </Link>
            </div>

            {/* Back */}
            <Link to="/blog" className="inline-flex items-center gap-2 mt-8 text-sm font-body font-semibold text-primary hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to All Posts
            </Link>
          </div>
        </section>

        {/* Suggested Articles */}
        <section className="section-padding bg-secondary">
          <div className="container mx-auto">
            <h2 className="section-heading text-center mb-10">Suggested Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPosts.map((p, i) => (
                <motion.article
                  key={p.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow group"
                >
                  <Link to={`/blog/${p.slug}`}>
                    <img src={p.image} alt={p.title} className="w-full h-48 object-cover" loading="lazy" width={800} height={600} />
                    <div className="p-5">
                      <span className="text-xs font-body font-semibold text-primary">{p.category}</span>
                      <h3 className="font-heading font-bold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm font-body font-semibold text-primary">
                        Read More <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
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

export default BlogPost;
