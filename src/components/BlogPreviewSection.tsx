import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const BlogPreviewSection = () => {
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="section-label">Blog</span>
            <h2 className="section-heading mt-3">Recent Posts</h2>
          </div>
          <Link to="/blog" className="flex items-center gap-2 text-primary font-body font-semibold hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow group"
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
                <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-3">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm font-body text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 mt-4 text-sm font-body font-semibold text-primary hover:gap-2 transition-all">
                  Read More <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreviewSection;
