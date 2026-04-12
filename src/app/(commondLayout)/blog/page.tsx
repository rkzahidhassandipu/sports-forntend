import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data";

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="bg-brand-mid border-b border-brand-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-lime-500/10 text-lime-500 border border-lime-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Blog
          </span>
          <h1 className="font-display font-black text-5xl sm:text-6xl leading-tight mb-4">
            SPORTS &<br /><span className="text-lime-500">FITNESS</span> BLOG
          </h1>
          <p className="text-muted-foreground max-w-md">
            Training tips, nutrition guides, technique breakdowns, and athlete stories from our coaches.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured post */}
        <div className="mb-10">
          <Link
            href={`/blog/${featured.id}`}
            className="group flex flex-col sm:flex-row gap-6 bg-brand-mid border border-brand-border rounded-2xl overflow-hidden hover:border-lime-500/30 hover:shadow-xl hover:shadow-lime-500/5 transition-all duration-300"
          >
            <div className="sm:w-72 h-48 sm:h-auto bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center text-6xl flex-shrink-0">
              {featured.icon}
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold bg-lime-500 text-brand-dark px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{featured.category}</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-lime-500 transition-colors duration-200">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xl">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{featured.author}</span>
                <span className="text-brand-border">·</span>
                <span>{featured.date}</span>
                <span className="text-brand-border">·</span>
                <span>{featured.readTime} read</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Categories filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["All", "Training Tips", "Nutrition", "Mental Fitness", "Technique", "Strength", "Football"].map((cat) => (
            <button key={cat} className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-brand-border text-muted-foreground hover:border-lime-500/50 hover:text-lime-500 transition-all duration-200 bg-brand-mid first:bg-lime-500 first:text-brand-dark first:border-lime-500">
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-brand-mid border border-brand-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/30 hover:shadow-xl hover:shadow-lime-500/5"
            >
              <div className="h-36 bg-gradient-to-br from-brand-card to-brand-mid flex items-center justify-center text-4xl">
                {post.icon}
              </div>
              <div className="p-5">
                <div className="text-[10px] font-bold text-teal-500 tracking-widest uppercase mb-2">{post.category}</div>
                <h3 className="font-display font-bold text-xl leading-tight mb-2 group-hover:text-lime-500 transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
    </div>
  );
}
