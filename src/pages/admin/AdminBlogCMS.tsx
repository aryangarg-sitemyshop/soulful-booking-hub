import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  author_name: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

const emptyForm = {
  title: "", slug: "", excerpt: "", content: "", cover_image: "",
  category: "", author_name: "", is_published: false,
};

const AdminBlogCMS = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt || "",
      content: post.content, cover_image: post.cover_image || "",
      category: post.category || "", author_name: post.author_name || "",
      is_published: post.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error("Title and content required"); return; }
    setSaving(true);
    const slug = form.slug || generateSlug(form.title);
    const payload = {
      title: form.title, slug, excerpt: form.excerpt || null,
      content: form.content, cover_image: form.cover_image || null,
      category: form.category || null, author_name: form.author_name || null,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Post updated" : "Post created");
    setDialogOpen(false);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Post deleted");
    fetchPosts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Blog CMS</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <Card className="border-border/50"><CardContent className="p-6 text-center text-muted-foreground">No blog posts yet. Create your first one!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                    {post.is_published ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><Eye className="w-3 h-3" /> Published</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="w-3 h-3" /> Draft</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {post.category && `${post.category} · `}
                    {format(new Date(post.created_at), "MMM d, yyyy")}
                    {post.author_name && ` · by ${post.author_name}`}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title *" value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value, slug: f.slug || generateSlug(e.target.value) })); }} />
            <Input placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            <Input placeholder="Excerpt" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            <Textarea placeholder="Content *" className="min-h-[200px]" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <Input placeholder="Cover Image URL" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              <Input placeholder="Author Name" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
              <span className="text-sm">Publish immediately</span>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogCMS;
