import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data";

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-lime-500/10 text-lime-500 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
      {children}
    </span>
  );
}

export function BlogPreviewSection() {
  return (
    <section className="py-20 bg-brand-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <SectionTag>Blog</SectionTag>
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-tight">
              LATEST FROM<br /><span className="text-lime-500">THE CLUB</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="border border-brand-border text-muted-foreground font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:border-lime-500/50 hover:text-lime-500 transition-all duration-200 tracking-wide"
          >
            ALL POSTS →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-brand-card border border-brand-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-xl hover:shadow-lime-500/5"
            >
              <div className="h-36 bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center text-4xl">
                {post.icon}
              </div>
              <div className="p-5">
                <div className="text-[10px] font-bold text-teal-500 tracking-widest uppercase mb-2">
                  {post.category}
                </div>
                <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-lime-500 transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span className="text-brand-border">·</span>
                  <span>{post.date}</span>
                  <span className="text-brand-border">·</span>
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
