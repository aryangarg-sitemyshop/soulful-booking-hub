import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Clock, User, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  available_days: number[];
  available_start_time: string;
  available_end_time: string;
  slot_duration_minutes: number;
};

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASONS = [
  "Skin Consultation",
  "Hair Loss / Hair Transplant",
  "Acne Treatment",
  "Laser Treatment",
  "Anti-Aging / Botox",
  "Pigmentation / Dark Spots",
  "Body Contouring",
  "General Dermatology",
  "Other",
];

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    consent: false,
  });

  // Fetch doctors
  useEffect(() => {
    if (!open) return;
    const fetchDoctors = async () => {
      setLoading(true);
      const { data } = await supabase.from("doctors").select("id, name, specialty, available_days, available_start_time, available_end_time, slot_duration_minutes");
      if (data) setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, [open]);

  // Fetch booked slots for selected doctor + date
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const fetchBooked = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("doctor_id", selectedDoctor.id)
        .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"))
        .in("status", ["pending", "confirmed"]);
      setBookedSlots(data?.map((a) => a.appointment_time) || []);
    };
    fetchBooked();
  }, [selectedDoctor, selectedDate]);

  // Generate time slots
  const generateSlots = () => {
    if (!selectedDoctor) return [];
    const [startH, startM] = selectedDoctor.available_start_time.split(":").map(Number);
    const [endH, endM] = selectedDoctor.available_end_time.split(":").map(Number);
    const dur = selectedDoctor.slot_duration_minutes;
    const slots: string[] = [];
    let h = startH, m = startM;
    while (h * 60 + m + dur <= endH * 60 + endM) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
      slots.push(t);
      m += dur;
      if (m >= 60) { h += Math.floor(m / 60); m %= 60; }
    }
    return slots;
  };

  const availableSlots = generateSlots().filter((s) => !bookedSlots.includes(s));

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctor) return false;
    if (isBefore(date, startOfDay(new Date()))) return false;
    const day = date.getDay(); // 0=Sun
    return selectedDoctor.available_days.includes(day === 0 ? 7 : day);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !form.consent) return;
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      doctor_id: selectedDoctor.id,
      patient_name: form.name,
      patient_email: form.email,
      patient_phone: form.phone,
      reason_for_visit: form.reason,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      data_consent: true,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Booking failed. Please try again.");
      return;
    }
    setStep(4);
    toast.success("Appointment booked successfully!");
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setForm({ name: "", email: "", phone: "", reason: "", consent: false });
    onOpenChange(false);
  };

  const canProceedStep2 = selectedDoctor && selectedDate && selectedTime;
  const canProceedStep3 = form.name && form.email && form.phone && form.reason && form.consent;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {step === 4 ? "Booking Confirmed!" : "Book Your Appointment"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        {step < 4 && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", s <= step ? "bg-primary" : "bg-muted")} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* Step 1: Select Doctor */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-body text-muted-foreground">Choose your doctor</p>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-3">
                    {doctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDoctor(doc); setSelectedDate(undefined); setSelectedTime(""); }}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all",
                          selectedDoctor?.id === doc.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-rose-subtle flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-body font-semibold text-foreground">{doc.name}</p>
                            <p className="text-xs font-body text-muted-foreground">{doc.specialty}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedDoctor && (
                  <>
                    <p className="text-sm font-body text-muted-foreground mt-4">Select date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-body", !selectedDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(d) => { setSelectedDate(d); setSelectedTime(""); }}
                          disabled={(date) => !isDateAvailable(date)}
                          fromDate={new Date()}
                          toDate={addDays(new Date(), 60)}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    {selectedDate && (
                      <>
                        <p className="text-sm font-body text-muted-foreground">Available slots</p>
                        {availableSlots.length === 0 ? (
                          <p className="text-sm text-destructive font-body">No slots available on this date.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {availableSlots.map((slot) => {
                              const [h, m] = slot.split(":");
                              const display = `${h}:${m}`;
                              return (
                                <button
                                  key={slot}
                                  onClick={() => setSelectedTime(slot)}
                                  className={cn(
                                    "py-2 px-3 rounded-lg border text-sm font-body transition-all",
                                    selectedTime === slot
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border hover:border-primary/40 text-foreground"
                                  )}
                                >
                                  <Clock className="w-3 h-3 inline mr-1" />{display}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <Button onClick={() => setStep(2)} disabled={!canProceedStep2} className="w-full gradient-rose text-primary-foreground font-body font-semibold">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Patient Details */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-body text-muted-foreground">Your information</p>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Full Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="font-body" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Email *</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="font-body" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Phone *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="font-body" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Reason for Visit *</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select reason</option>
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={form.consent}
                    onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
                  />
                  <label htmlFor="consent" className="text-xs font-body text-muted-foreground leading-relaxed cursor-pointer">
                    I consent to the collection and processing of my personal data for appointment scheduling and medical records purposes.
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="font-body">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceedStep3} className="flex-1 gradient-rose text-primary-foreground font-body font-semibold">
                    Review <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-body text-muted-foreground">Review your booking</p>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm font-body">
                  <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span className="font-semibold text-foreground">{selectedDoctor?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold text-foreground">{selectedDate && format(selectedDate, "PPP")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold text-foreground">{selectedTime.slice(0, 5)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reason</span><span className="font-semibold text-foreground">{form.reason}</span></div>
                  <hr className="border-border" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{form.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{form.phone}</span></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="font-body">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1 gradient-rose text-primary-foreground font-body font-semibold">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground">You're all set!</h3>
                <p className="text-sm font-body text-muted-foreground">
                  Your appointment with <strong>{selectedDoctor?.name}</strong> on{" "}
                  <strong>{selectedDate && format(selectedDate, "PPP")}</strong> at{" "}
                  <strong>{selectedTime.slice(0, 5)}</strong> has been booked.
                </p>
                <p className="text-xs font-body text-muted-foreground">
                  We'll send a confirmation to <strong>{form.email}</strong>.
                </p>
                <Button onClick={resetAndClose} className="gradient-rose text-primary-foreground font-body font-semibold">
                  Done
                </Button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
