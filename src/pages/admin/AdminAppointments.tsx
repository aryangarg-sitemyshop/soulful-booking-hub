import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Plus, Search, List, CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  reason_for_visit: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  booking_type: string;
  notes: string | null;
  doctor_id: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  available_days: number[];
  available_start_time: string;
  available_end_time: string;
  slot_duration_minutes: number;
};

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const REASONS = [
  "Skin Consultation", "Hair Loss / Hair Transplant", "Acne Treatment",
  "Laser Treatment", "Anti-Aging / Botox", "Pigmentation / Dark Spots",
  "Body Contouring", "General Dermatology", "Other",
];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [walkInOpen, setWalkInOpen] = useState(false);

  // Walk-in form state
  const [wiName, setWiName] = useState("");
  const [wiPhone, setWiPhone] = useState("");
  const [wiEmail, setWiEmail] = useState("");
  const [wiDoctor, setWiDoctor] = useState("");
  const [wiDate, setWiDate] = useState<Date | undefined>(new Date());
  const [wiTime, setWiTime] = useState("");
  const [wiReason, setWiReason] = useState("");
  const [wiNotes, setWiNotes] = useState("");
  const [wiSubmitting, setWiSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [apptRes, docRes] = await Promise.all([
      supabase.from("appointments").select("*").order("appointment_date", { ascending: false }),
      supabase.from("doctors").select("*").eq("is_active", true),
    ]);
    setAppointments((apptRes.data as Appointment[]) || []);
    setDoctors((docRes.data as Doctor[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Calculate available time slots for walk-in
  useEffect(() => {
    if (!wiDoctor || !wiDate) { setAvailableSlots([]); return; }
    const doc = doctors.find(d => d.id === wiDoctor);
    if (!doc) return;

    const dayOfWeek = wiDate.getDay();
    if (!doc.available_days.includes(dayOfWeek)) { setAvailableSlots([]); return; }

    const [startH, startM] = doc.available_start_time.split(":").map(Number);
    const [endH, endM] = doc.available_end_time.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const slots: string[] = [];
    for (let m = startMin; m + doc.slot_duration_minutes <= endMin; m += doc.slot_duration_minutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }

    const dateStr = format(wiDate, "yyyy-MM-dd");
    const booked = appointments
      .filter(a => a.doctor_id === wiDoctor && a.appointment_date === dateStr && a.status !== "cancelled")
      .map(a => a.appointment_time.slice(0, 5));

    setAvailableSlots(slots.filter(s => !booked.includes(s)));
  }, [wiDoctor, wiDate, doctors, appointments]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: status as any })
      .eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Status updated to ${status}`);
    fetchData();
  };

  const handleWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wiDoctor || !wiDate || !wiTime || !wiName || !wiPhone || !wiReason) {
      toast.error("Please fill all required fields"); return;
    }
    setWiSubmitting(true);

    // Find or create patient
    const { data: existingPatient } = await supabase
      .from("patients").select("id").eq("phone", wiPhone).maybeSingle();

    let patientId = existingPatient?.id;
    if (!patientId) {
      const { data: newPatient, error: pErr } = await supabase
        .from("patients").insert({ name: wiName, phone: wiPhone, email: wiEmail || null }).select("id").single();
      if (pErr) { toast.error("Failed to create patient record"); setWiSubmitting(false); return; }
      patientId = newPatient.id;
    }

    const { error } = await supabase.from("appointments").insert({
      patient_name: wiName,
      patient_phone: wiPhone,
      patient_email: wiEmail || "walk-in@clinic.local",
      doctor_id: wiDoctor,
      appointment_date: format(wiDate, "yyyy-MM-dd"),
      appointment_time: wiTime,
      reason_for_visit: wiReason,
      notes: wiNotes || null,
      booking_type: "walk-in",
      status: "confirmed" as any,
      data_consent: true,
      patient_id: patientId,
    });

    setWiSubmitting(false);
    if (error) { toast.error("Failed to create appointment"); return; }
    toast.success("Walk-in appointment created!");
    setWalkInOpen(false);
    setWiName(""); setWiPhone(""); setWiEmail(""); setWiDoctor(""); setWiTime(""); setWiReason(""); setWiNotes("");
    fetchData();
  };

  const filtered = appointments.filter(a => {
    if (filterDoctor !== "all" && a.doctor_id !== filterDoctor) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterDate && a.appointment_date !== filterDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.patient_name.toLowerCase().includes(q) || a.patient_phone.includes(q) || a.patient_email.toLowerCase().includes(q);
    }
    return true;
  });

  // Calendar view: group by date
  const groupedByDate = filtered.reduce((acc, a) => {
    if (!acc[a.appointment_date]) acc[a.appointment_date] = [];
    acc[a.appointment_date].push(a);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Appointments</h1>
        <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Walk-In Booking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Walk-In / Phone Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleWalkIn} className="space-y-3">
              <Input placeholder="Patient Name *" value={wiName} onChange={e => setWiName(e.target.value)} required />
              <Input placeholder="Phone *" value={wiPhone} onChange={e => setWiPhone(e.target.value)} required />
              <Input placeholder="Email (optional)" type="email" value={wiEmail} onChange={e => setWiEmail(e.target.value)} />
              <Select value={wiDoctor} onValueChange={setWiDoctor}>
                <SelectTrigger><SelectValue placeholder="Select Doctor *" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>)}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start", !wiDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {wiDate ? format(wiDate, "PPP") : "Select date *"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={wiDate} onSelect={setWiDate} /></PopoverContent>
              </Popover>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {availableSlots.map(slot => (
                    <Button key={slot} type="button" variant={wiTime === slot ? "default" : "outline"} size="sm"
                      onClick={() => setWiTime(slot)}>{slot}</Button>
                  ))}
                </div>
              ) : wiDoctor && wiDate ? (
                <p className="text-sm text-destructive">No slots available for this date.</p>
              ) : null}
              <Select value={wiReason} onValueChange={setWiReason}>
                <SelectTrigger><SelectValue placeholder="Reason for Visit *" /></SelectTrigger>
                <SelectContent>
                  {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes (optional)" value={wiNotes} onChange={e => setWiNotes(e.target.value)} />
              <Button type="submit" className="w-full" disabled={wiSubmitting}>
                {wiSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Appointment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterDoctor} onValueChange={setFilterDoctor}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Doctors" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px]" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <div className="flex gap-1 border rounded-lg p-0.5">
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")}><List className="w-4 h-4" /></Button>
          <Button variant={view === "calendar" ? "default" : "ghost"} size="sm" onClick={() => setView("calendar")}><CalendarDays className="w-4 h-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : view === "list" ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Patient</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Doctor</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No appointments found.</td></tr>
                  ) : filtered.map(a => {
                    const doc = doctors.find(d => d.id === a.doctor_id);
                    return (
                      <tr key={a.id} className="border-b border-border/30 hover:bg-muted/30">
                        <td className="p-3">
                          <p className="font-medium text-foreground">{a.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{a.patient_phone}</p>
                        </td>
                        <td className="p-3 text-foreground">{doc?.name || "—"}</td>
                        <td className="p-3 text-foreground">{a.appointment_date}<br /><span className="text-xs text-muted-foreground">{a.appointment_time}</span></td>
                        <td className="p-3 text-foreground">{a.reason_for_visit}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${a.booking_type === "walk-in" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                            {a.booking_type}
                          </span>
                        </td>
                        <td className="p-3">
                          <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                            <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedByDate).sort().reverse().map(date => (
            <Card key={date} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedByDate[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map(a => {
                  const doc = doctors.find(d => d.id === a.doctor_id);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-primary font-medium">{a.appointment_time.slice(0, 5)}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{doc?.name} · {a.reason_for_visit}</p>
                        </div>
                      </div>
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
          {Object.keys(groupedByDate).length === 0 && (
            <p className="text-center text-muted-foreground py-12">No appointments found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
