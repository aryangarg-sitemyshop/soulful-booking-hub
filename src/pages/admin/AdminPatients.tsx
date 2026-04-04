import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, User, ArrowLeft, Plus, Loader2, FileText } from "lucide-react";

type Patient = {
  id: string;
  patient_code: string;
  name: string;
  email: string | null;
  phone: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  medical_notes: string | null;
  created_at: string;
};

type AppointmentHistory = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason_for_visit: string;
  status: string;
  doctor_id: string;
  notes: string | null;
  booking_type: string;
};

type TreatmentNote = {
  id: string;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  notes: string | null;
  created_at: string;
  doctor_id: string | null;
};

type Doctor = { id: string; name: string };

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<AppointmentHistory[]>([]);
  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ diagnosis: "", treatment: "", prescription: "", notes: "" });
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [pRes, dRes] = await Promise.all([
        supabase.from("patients").select("*").order("created_at", { ascending: false }),
        supabase.from("doctors").select("id, name"),
      ]);
      setPatients((pRes.data as Patient[]) || []);
      setDoctors((dRes.data as Doctor[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const openPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    const [aRes, tRes] = await Promise.all([
      supabase.from("appointments").select("*").eq("patient_id", patient.id).order("appointment_date", { ascending: false }),
      supabase.from("treatment_notes").select("*").eq("patient_id", patient.id).order("created_at", { ascending: false }),
    ]);
    setHistory((aRes.data as AppointmentHistory[]) || []);
    setTreatmentNotes((tRes.data as TreatmentNote[]) || []);
  };

  const saveNote = async () => {
    if (!selectedPatient) return;
    setSavingNote(true);
    const { error } = await supabase.from("treatment_notes").insert({
      patient_id: selectedPatient.id,
      diagnosis: noteForm.diagnosis || null,
      treatment: noteForm.treatment || null,
      prescription: noteForm.prescription || null,
      notes: noteForm.notes || null,
    });
    setSavingNote(false);
    if (error) { toast.error("Failed to save note"); return; }
    toast.success("Treatment note saved");
    setShowNoteForm(false);
    setNoteForm({ diagnosis: "", treatment: "", prescription: "", notes: "" });
    // Refresh
    const { data } = await supabase.from("treatment_notes").select("*").eq("patient_id", selectedPatient.id).order("created_at", { ascending: false });
    setTreatmentNotes((data as TreatmentNote[]) || []);
  };

  const filtered = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.patient_code.toLowerCase().includes(q) || (p.email?.toLowerCase().includes(q));
  });

  const getDoctorName = (id: string | null) => doctors.find(d => d.id === id)?.name || "—";

  if (selectedPatient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedPatient(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patient Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Patient Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient ID</span>
                <span className="font-mono font-medium text-primary">{selectedPatient.patient_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{selectedPatient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{selectedPatient.phone}</span>
              </div>
              {selectedPatient.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate ml-2">{selectedPatient.email}</span>
                </div>
              )}
              {selectedPatient.gender && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span>{selectedPatient.gender}</span>
                </div>
              )}
              {selectedPatient.date_of_birth && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DOB</span>
                  <span>{selectedPatient.date_of_birth}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Since</span>
                <span>{format(new Date(selectedPatient.created_at), "MMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Visit History */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">Visit History</CardTitle>
              <span className="text-sm text-muted-foreground">{history.length} visits</span>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm">No visits recorded.</p>
              ) : (
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{h.appointment_date} at {h.appointment_time.slice(0, 5)}</p>
                        <p className="text-xs text-muted-foreground">{h.reason_for_visit} · {getDoctorName(h.doctor_id)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          h.booking_type === "walk-in" ? "bg-accent/20" : "bg-primary/10 text-primary"
                        }`}>{h.booking_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          h.status === "completed" ? "bg-green-100 text-green-700" :
                          h.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          h.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{h.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Treatment Notes */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Treatment Notes & Prescriptions
            </CardTitle>
            <Button size="sm" onClick={() => setShowNoteForm(true)} className="gap-1">
              <Plus className="w-4 h-4" /> Add Note
            </Button>
          </CardHeader>
          <CardContent>
            {showNoteForm && (
              <div className="mb-4 p-4 border border-border/50 rounded-lg space-y-3">
                <Input placeholder="Diagnosis" value={noteForm.diagnosis} onChange={e => setNoteForm(p => ({ ...p, diagnosis: e.target.value }))} />
                <Input placeholder="Treatment" value={noteForm.treatment} onChange={e => setNoteForm(p => ({ ...p, treatment: e.target.value }))} />
                <Textarea placeholder="Prescription" value={noteForm.prescription} onChange={e => setNoteForm(p => ({ ...p, prescription: e.target.value }))} />
                <Textarea placeholder="Additional notes" value={noteForm.notes} onChange={e => setNoteForm(p => ({ ...p, notes: e.target.value }))} />
                <div className="flex gap-2">
                  <Button onClick={saveNote} disabled={savingNote} size="sm">
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowNoteForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {treatmentNotes.length === 0 && !showNoteForm ? (
              <p className="text-muted-foreground text-sm">No treatment notes yet.</p>
            ) : (
              <div className="space-y-3">
                {treatmentNotes.map(n => (
                  <div key={n.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), "MMM d, yyyy h:mm a")}</span>
                      {n.doctor_id && <span className="text-xs text-primary">{getDoctorName(n.doctor_id)}</span>}
                    </div>
                    {n.diagnosis && <p className="text-sm"><strong>Dx:</strong> {n.diagnosis}</p>}
                    {n.treatment && <p className="text-sm"><strong>Tx:</strong> {n.treatment}</p>}
                    {n.prescription && <p className="text-sm"><strong>Rx:</strong> {n.prescription}</p>}
                    {n.notes && <p className="text-sm text-muted-foreground mt-1">{n.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-foreground">Patients</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or Patient ID..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Patient ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Since</th>
                    <th className="text-left p-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No patients found.</td></tr>
                  ) : filtered.map(p => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30 cursor-pointer" onClick={() => openPatient(p)}>
                      <td className="p-3 font-mono text-primary font-medium">{p.patient_code}</td>
                      <td className="p-3 font-medium text-foreground">{p.name}</td>
                      <td className="p-3 text-foreground">{p.phone}</td>
                      <td className="p-3 text-muted-foreground">{p.email || "—"}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                      <td className="p-3"><Button variant="ghost" size="sm">View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPatients;
