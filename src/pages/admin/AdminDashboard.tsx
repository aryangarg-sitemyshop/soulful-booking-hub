import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Users, UserPlus, TrendingUp } from "lucide-react";

type Stats = {
  totalBookings: number;
  onlineBookings: number;
  walkInBookings: number;
  totalPatients: number;
  pendingAppointments: number;
  completedAppointments: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0, onlineBookings: 0, walkInBookings: 0,
    totalPatients: 0, pendingAppointments: 0, completedAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [appts, patients] = await Promise.all([
        supabase.from("appointments").select("*"),
        supabase.from("patients").select("id", { count: "exact", head: true }),
      ]);

      const appointments = appts.data || [];
      setStats({
        totalBookings: appointments.length,
        onlineBookings: appointments.filter(a => a.booking_type === "online").length,
        walkInBookings: appointments.filter(a => a.booking_type === "walk-in").length,
        totalPatients: patients.count || 0,
        pendingAppointments: appointments.filter(a => a.status === "pending").length,
        completedAppointments: appointments.filter(a => a.status === "completed").length,
      });

      setRecentAppointments(
        appointments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
      );
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Bookings", value: stats.totalBookings, icon: CalendarDays, sub: `${stats.onlineBookings} online · ${stats.walkInBookings} walk-in` },
    { title: "Total Patients", value: stats.totalPatients, icon: Users, sub: "Registered patients" },
    { title: "Pending", value: stats.pendingAppointments, icon: UserPlus, sub: "Awaiting confirmation" },
    { title: "Completed", value: stats.completedAppointments, icon: TrendingUp, sub: "Finished visits" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-foreground">{a.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{a.reason_for_visit} · {a.appointment_date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === "confirmed" ? "bg-green-100 text-green-700" :
                    a.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
