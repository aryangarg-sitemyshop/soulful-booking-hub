import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Loader2 } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  image_url: string | null;
  available_days: number[];
  available_start_time: string;
  available_end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm = {
  name: "", specialty: "", bio: "", image_url: "",
  available_days: [1, 2, 3, 4, 5, 6] as number[],
  available_start_time: "10:30", available_end_time: "19:00",
  slot_duration_minutes: 30, is_active: true,
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from("doctors").select("*").order("name");
    setDoctors((data as Doctor[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({
      name: doc.name, specialty: doc.specialty, bio: doc.bio || "",
      image_url: doc.image_url || "", available_days: doc.available_days,
      available_start_time: doc.available_start_time.slice(0, 5),
      available_end_time: doc.available_end_time.slice(0, 5),
      slot_duration_minutes: doc.slot_duration_minutes, is_active: doc.is_active,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter(d => d !== day)
        : [...f.available_days, day].sort(),
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.specialty) { toast.error("Name and specialty required"); return; }
    setSaving(true);
    const payload = {
      name: form.name, specialty: form.specialty,
      bio: form.bio || null, image_url: form.image_url || null,
      available_days: form.available_days,
      available_start_time: form.available_start_time,
      available_end_time: form.available_end_time,
      slot_duration_minutes: form.slot_duration_minutes,
      is_active: form.is_active,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("doctors").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("doctors").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success(editing ? "Doctor updated" : "Doctor added");
    setDialogOpen(false);
    fetchDoctors();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Doctors</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Doctor</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <Card key={doc.id} className="border-border/50">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-heading">{doc.name}</CardTitle>
                  <p className="text-sm text-primary">{doc.specialty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${doc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {doc.is_active ? "Active" : "Inactive"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Days: {doc.available_days.map(d => DAYS[d]).join(", ")}</p>
                <p>Hours: {doc.available_start_time.slice(0, 5)} – {doc.available_end_time.slice(0, 5)}</p>
                <p>Slot: {doc.slot_duration_minutes} min</p>
                {doc.bio && <p className="mt-2 line-clamp-2">{doc.bio}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Specialty *" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
            <Textarea placeholder="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
            <div>
              <label className="text-sm font-medium mb-1 block">Available Days</label>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <Button key={i} type="button" variant={form.available_days.includes(i) ? "default" : "outline"} size="sm"
                    onClick={() => toggleDay(i)} className="w-10">{d}</Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Time</label>
                <Input type="time" value={form.available_start_time} onChange={e => setForm(f => ({ ...f, available_start_time: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Time</label>
                <Input type="time" value={form.available_end_time} onChange={e => setForm(f => ({ ...f, available_end_time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slot Duration (minutes)</label>
              <Input type="number" value={form.slot_duration_minutes} onChange={e => setForm(f => ({ ...f, slot_duration_minutes: parseInt(e.target.value) || 30 }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <span className="text-sm">Active</span>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Update Doctor" : "Add Doctor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDoctors;
