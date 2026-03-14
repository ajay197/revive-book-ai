import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Loader2, ExternalLink, Clock, User, Mail, Phone, Video, Plus, XCircle, CalendarClock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder: string;
  options?: { label: string; value: string }[];
  hidden: boolean;
  editable: string;
}

interface EventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  description?: string;
  bookingFields?: BookingField[];
}

interface Booking {
  id: string;
  calcom_booking_id: number | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: string;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  event_type_name: string | null;
  event_type_id: number | null;
  meeting_url: string | null;
  location: string | null;
  metadata: any;
}

const statusColors: Record<string, string> = {
  accepted: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const Bookings = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [calcomConnected, setCalcomConnected] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({ name: "", email: "", phone: "", countryCode: "+1", eventTypeId: "" });
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");

  // Check if Cal.com is connected
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "calcom")
      .single()
      .then(({ data }) => {
        setCalcomConnected(!!data);
        if (data) fetchEventTypes();
      });
  }, [user]);

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("calcom-sync", {
        body: { action: "fetch_event_types" },
      });
      if (!error && data?.event_types) setEventTypes(data.event_types);
    } catch {}
  };

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcom-sync", {
        body: { action: "sync_bookings" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Synced ${data.synced} booking(s) from Cal.com`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync bookings");
    } finally {
      setSyncing(false);
    }
  };

  // Calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const key = format(parseISO(b.start_time), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [bookings]);

  const selectedDateBookings = selectedDate
    ? bookingsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  const totalBookings = bookings.length;
  const upcoming = bookings.filter((b) => new Date(b.start_time) > new Date() && b.status !== "cancelled").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  if (!calcomConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">View appointments booked by your AI agents</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-card">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">Connect Cal.com</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Connect your Cal.com account in the Integrations page to see bookings made by your AI agents here.
          </p>
          <Button className="mt-4" onClick={() => window.location.href = "/app/integrations"}>
            Go to Integrations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Appointments booked by your AI agents via Cal.com</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync from Cal.com
          </Button>
          <Button onClick={() => setShowNewBooking(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Book Meeting
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalBookings}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
          <p className="mt-1 font-display text-2xl font-bold text-success">{upcoming}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
          <p className="mt-1 font-display text-2xl font-bold text-destructive">{cancelled}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayBookings = bookingsByDate.get(dateKey) || [];
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center p-2 min-h-[72px] border border-border/30 transition-colors
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isSelected ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"}
                    ${isToday ? "font-bold" : ""}
                  `}
                >
                  <span className={`text-xs ${isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground" : "text-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5 w-full px-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-primary/15 text-primary"
                        >
                          {format(parseISO(b.start_time), "HH:mm")}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[10px] text-muted-foreground text-center">
                          +{dayBookings.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day sidebar */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : selectedDateBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {selectedDate ? "No bookings on this day" : "Click a date to view bookings"}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDateBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="w-full text-left rounded-lg border bg-background p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{booking.title}</p>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColors[booking.status] || "bg-muted text-muted-foreground"}`}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(booking.start_time), "h:mm a")} – {format(parseISO(booking.end_time), "h:mm a")}
                  </p>
                  {booking.attendee_name && (
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {booking.attendee_name}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking detail dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBooking?.title}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColors[selectedBooking.status] || ""}>
                  {selectedBooking.status}
                </Badge>
                {selectedBooking.event_type_name && (
                  <Badge variant="secondary">{selectedBooking.event_type_name}</Badge>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(parseISO(selectedBooking.start_time), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(parseISO(selectedBooking.start_time), "h:mm a")} – {format(parseISO(selectedBooking.end_time), "h:mm a")}
                  </span>
                </div>

                {selectedBooking.attendee_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedBooking.attendee_name}</span>
                  </div>
                )}
                {selectedBooking.attendee_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedBooking.attendee_email}</span>
                  </div>
                )}
                {selectedBooking.attendee_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedBooking.attendee_phone}</span>
                  </div>
                )}
                {selectedBooking.meeting_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <a href={selectedBooking.meeting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      Join Meeting <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {selectedBooking.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{selectedBooking.description}</p>
                </div>
              )}

              {/* Reschedule form */}
              {rescheduling && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <label className="text-sm font-medium text-foreground">New Date & Time</label>
                  <Input type="datetime-local" value={rescheduleDateTime} onChange={(e) => setRescheduleDateTime(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setRescheduling(false); setRescheduleDateTime(""); }}>Cancel</Button>
                    <Button size="sm" disabled={!rescheduleDateTime} onClick={async () => {
                      if (!rescheduleDateTime || !selectedBooking) return;
                      const selectedEvent = eventTypes.find((et) => et.id === selectedBooking.event_type_id);
                      const newStart = new Date(rescheduleDateTime).toISOString();
                      const newEnd = new Date(new Date(rescheduleDateTime).getTime() + (selectedEvent?.length || 30) * 60000).toISOString();
                      const { error } = await supabase.from("bookings").update({ start_time: newStart, end_time: newEnd, updated_at: new Date().toISOString() }).eq("id", selectedBooking.id);
                      if (error) { toast.error("Failed to reschedule"); return; }
                      toast.success("Booking rescheduled!");
                      setRescheduling(false); setRescheduleDateTime(""); setSelectedBooking(null); refetch();
                    }}>Confirm Reschedule</Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {selectedBooking.status !== "cancelled" && !rescheduling && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setRescheduling(true)}>
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Reschedule
                  </Button>
                  <Button variant="destructive" size="sm" disabled={cancellingBooking} onClick={async () => {
                    if (!selectedBooking) return;
                    setCancellingBooking(true);
                    const { error } = await supabase.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", selectedBooking.id);
                    setCancellingBooking(false);
                    if (error) { toast.error("Failed to cancel booking"); return; }
                    toast.success("Booking cancelled");
                    setSelectedBooking(null); refetch();
                  }}>
                    {cancellingBooking ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-1.5 h-3.5 w-3.5" />}
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {eventTypes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Event Type</label>
                <Select value={newBooking.eventTypeId} onValueChange={(v) => setNewBooking({ ...newBooking, eventTypeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((et) => (
                      <SelectItem key={et.id} value={String(et.id)}>{et.title} ({et.length} min)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Attendee Name</label>
              <Input placeholder="John Doe" value={newBooking.name} onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Attendee Email</label>
              <Input type="email" placeholder="john@example.com" value={newBooking.email} onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone number <span className="text-destructive">*</span></label>
              <div className="flex gap-2">
                <Select value={newBooking.countryCode} onValueChange={(v) => setNewBooking({ ...newBooking, countryCode: v })}>
                  <SelectTrigger className="w-[100px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { code: "+1", label: "🇺🇸 +1" },
                      { code: "+44", label: "🇬🇧 +44" },
                      { code: "+91", label: "🇮🇳 +91" },
                      { code: "+61", label: "🇦🇺 +61" },
                      { code: "+49", label: "🇩🇪 +49" },
                      { code: "+33", label: "🇫🇷 +33" },
                      { code: "+81", label: "🇯🇵 +81" },
                      { code: "+86", label: "🇨🇳 +86" },
                      { code: "+55", label: "🇧🇷 +55" },
                      { code: "+971", label: "🇦🇪 +971" },
                      { code: "+966", label: "🇸🇦 +966" },
                      { code: "+234", label: "🇳🇬 +234" },
                      { code: "+27", label: "🇿🇦 +27" },
                      { code: "+52", label: "🇲🇽 +52" },
                      { code: "+65", label: "🇸🇬 +65" },
                    ].map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="tel" placeholder="1234567890" value={newBooking.phone} onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value.replace(/\D/g, "") })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date & Time</label>
              <Input type="datetime-local" id="booking-datetime" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBooking(false)}>Cancel</Button>
            <Button
              disabled={creatingBooking || !newBooking.name || !newBooking.email || !newBooking.phone}
              onClick={async () => {
                setCreatingBooking(true);
                try {
                  const datetimeInput = (document.getElementById("booking-datetime") as HTMLInputElement)?.value;
                  if (!datetimeInput) { toast.error("Please select a date and time"); setCreatingBooking(false); return; }
                  
                  const selectedEvent = eventTypes.find((et) => String(et.id) === newBooking.eventTypeId);
                  const startTime = new Date(datetimeInput).toISOString();

                  if (selectedEvent) {
                    // Create booking on Cal.com via edge function
                    const { data, error } = await supabase.functions.invoke("calcom-sync", {
                      body: {
                        action: "create_booking",
                        eventTypeId: selectedEvent.id,
                        startTime,
                        attendeeName: newBooking.name,
                        attendeeEmail: newBooking.email,
                        attendeePhone: `${newBooking.countryCode}${newBooking.phone}`,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      },
                    });
                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);

                    // Sync bookings after creating to pull the new one
                    await supabase.functions.invoke("calcom-sync", { body: { action: "sync_bookings" } });
                  } else {
                    // No event type selected - create local-only booking
                    const endTime = new Date(new Date(datetimeInput).getTime() + 30 * 60000).toISOString();
                    const { error } = await supabase.from("bookings").insert({
                      user_id: user!.id,
                      title: `Meeting with ${newBooking.name}`,
                      start_time: startTime,
                      end_time: endTime,
                      status: "accepted",
                      attendee_name: newBooking.name,
                      attendee_email: newBooking.email,
                      attendee_phone: `${newBooking.countryCode}${newBooking.phone}`,
                    });
                    if (error) throw error;
                  }

                  toast.success("Meeting booked successfully!");
                  setShowNewBooking(false);
                  setNewBooking({ name: "", email: "", phone: "", countryCode: "+1", eventTypeId: "" });
                  refetch();
                } catch (err: any) {
                  toast.error(err.message || "Failed to book meeting");
                } finally {
                  setCreatingBooking(false);
                }
              }}
            >
              {creatingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Book Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
