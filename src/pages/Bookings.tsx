import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Loader2, ExternalLink, Clock, User, Mail, Phone, Video, Plus, XCircle, CalendarClock, CalendarIcon, Globe } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO, addDays, isValid } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [bookingTimeSlot, setBookingTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Record<string, unknown>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Check if Cal.com is connected
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "calcom")
      .maybeSingle()
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

  const fetchAvailableSlots = useCallback(async (eventTypeId: string, date: Date) => {
    setLoadingSlots(true);
    setAvailableSlots({});
    setBookingTimeSlot("");
    try {
      const startTime = format(date, "yyyy-MM-dd");
      const endDate = addDays(date, 1);
      const endTime = format(endDate, "yyyy-MM-dd");
      const { data, error } = await supabase.functions.invoke("calcom-sync", {
        body: {
          action: "fetch_slots",
          eventTypeId: Number(eventTypeId),
          startTime,
          endTime,
          timeZone: userTimezone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAvailableSlots(data?.slots || {});
    } catch (err: any) {
      console.error("Failed to fetch slots:", err);
      toast.error("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [userTimezone]);

  // Fetch slots when date or event type changes
  useEffect(() => {
    if (bookingDate && newBooking.eventTypeId) {
      fetchAvailableSlots(newBooking.eventTypeId, bookingDate);
    }
  }, [bookingDate, newBooking.eventTypeId, fetchAvailableSlots]);

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

  // Realtime subscription for instant updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Bookings</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Appointments booked by your AI agents via Cal.com</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
            Sync
          </Button>
          <Button size="sm" onClick={() => setShowNewBooking(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Book Meeting
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Total</p>
          <p className="mt-0.5 sm:mt-1 font-display text-lg sm:text-2xl font-bold text-foreground">{totalBookings}</p>
        </div>
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Upcoming</p>
          <p className="mt-0.5 sm:mt-1 font-display text-lg sm:text-2xl font-bold text-success">{upcoming}</p>
        </div>
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Cancelled</p>
          <p className="mt-0.5 sm:mt-1 font-display text-lg sm:text-2xl font-bold text-destructive">{cancelled}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
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
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
            setRescheduling(false);
            setRescheduleDate(undefined);
            setRescheduleTime("");
          }
        }}
      >
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
                <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                  <label className="text-sm font-medium text-foreground">New Date & Time</label>

                  <div className="rounded-lg border bg-background p-1">
                    <CalendarComponent
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={(day) => {
                        if (day) setRescheduleDate(day);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="p-2 pointer-events-auto"
                      initialFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Time</label>
                    <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRescheduling(false);
                        setRescheduleDate(undefined);
                        setRescheduleTime("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!rescheduleDate || !rescheduleTime}
                      onClick={async () => {
                        if (!selectedBooking || !rescheduleDate || !rescheduleTime) return;

                        const [hoursRaw, minutesRaw] = rescheduleTime.split(":");
                        const hours = Number(hoursRaw);
                        const minutes = Number(minutesRaw);

                        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
                          toast.error("Please choose a valid time");
                          return;
                        }

                        const nextStart = new Date(rescheduleDate);
                        nextStart.setHours(hours, minutes, 0, 0);

                        if (Number.isNaN(nextStart.getTime())) {
                          toast.error("Please choose a valid date and time");
                          return;
                        }

                        const selectedEvent = eventTypes.find((et) => et.id === selectedBooking.event_type_id);
                        const newStart = nextStart.toISOString();
                        const newEnd = new Date(nextStart.getTime() + (selectedEvent?.length || 30) * 60000).toISOString();

                        // Reschedule on Cal.com first if it has a calcom_booking_id and booking UID
                        if (selectedBooking.calcom_booking_id) {
                          const bookingUid = selectedBooking.metadata?.uid;
                          if (!bookingUid) {
                            toast.error("This booking is missing a Cal.com UID and cannot be rescheduled.");
                            return;
                          }

                          try {
                            const { data: rescheduleData, error: rescheduleError } = await supabase.functions.invoke("calcom-sync", {
                              body: {
                                action: "reschedule_booking",
                                calcomBookingId: selectedBooking.calcom_booking_id,
                                bookingUid,
                                newStart,
                                newEnd,
                                rescheduledBy: user?.email || selectedBooking.attendee_email || undefined,
                              },
                            });
                            if (rescheduleError || rescheduleData?.error) {
                              toast.error(rescheduleData?.error || "Failed to reschedule on Cal.com");
                              return;
                            }
                          } catch (err: any) {
                            toast.error(err.message || "Failed to reschedule on Cal.com");
                            return;
                          }
                        }
                        setRescheduling(false);
                        setRescheduleDate(undefined);
                        setRescheduleTime("");
                        setSelectedBooking(null);
                        refetch();
                      }}
                    >
                      Confirm Reschedule
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {selectedBooking.status !== "cancelled" && !rescheduling && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedBooking) return;
                      const currentStart = parseISO(selectedBooking.start_time);
                      setRescheduleDate(isValid(currentStart) ? currentStart : new Date());
                      setRescheduleTime(isValid(currentStart) ? format(currentStart, "HH:mm") : "09:00");
                      setRescheduling(true);
                    }}
                  >
                    <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> Reschedule
                  </Button>
                  <Button variant="destructive" size="sm" disabled={cancellingBooking} onClick={async () => {
                    if (!selectedBooking) return;
                    setCancellingBooking(true);
                    try {
                      // Cancel on Cal.com first if it has a calcom_booking_id
                      if (selectedBooking.calcom_booking_id) {
                        const { data: cancelData, error: cancelError } = await supabase.functions.invoke("calcom-sync", {
                          body: { action: "cancel_booking", calcomBookingId: selectedBooking.calcom_booking_id },
                        });
                        if (cancelError || cancelData?.error) {
                          toast.error(cancelData?.error || "Failed to cancel on Cal.com");
                          setCancellingBooking(false);
                          return;
                        }
                      }
                      // Update local DB
                      const { error } = await supabase.from("bookings").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", selectedBooking.id);
                      if (error) { toast.error("Failed to update booking locally"); setCancellingBooking(false); return; }
                      toast.success("Booking cancelled on Cal.com");
                      setSelectedBooking(null); refetch();
                    } catch (err) {
                      toast.error("Failed to cancel booking");
                    } finally {
                      setCancellingBooking(false);
                    }
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
      <Dialog open={showNewBooking} onOpenChange={(open) => { setShowNewBooking(open); if (!open) { setCustomFieldValues({}); setBookingDate(undefined); setBookingTimeSlot(""); setAvailableSlots({}); } }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {eventTypes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Event Type</label>
                <Select value={newBooking.eventTypeId} onValueChange={(v) => { setNewBooking({ ...newBooking, eventTypeId: v }); setCustomFieldValues({}); }}>
                  <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((et) => (
                      <SelectItem key={et.id} value={String(et.id)}>{et.title} ({et.length} min)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dynamic booking fields from Cal.com event type */}
            {(() => {
              const selectedEvent = eventTypes.find((et) => String(et.id) === newBooking.eventTypeId);
              const fields = selectedEvent?.bookingFields || [];
              // Filter out system fields we handle separately and hidden fields
              const customFields = fields.filter(
                (f) => !["name", "email", "attendeePhoneNumber", "smsReminderNumber", "rescheduleReason"].includes(f.name) && !f.hidden && f.editable !== "system"
              );

              return (
                <>
                  {/* Always show core fields */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Attendee Name <span className="text-destructive">*</span></label>
                    <Input placeholder="John Doe" value={newBooking.name} onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Attendee Email <span className="text-destructive">*</span></label>
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

                  {/* Render custom booking fields */}
                  {customFields.length > 0 && (
                    <div className="border-t pt-3 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Additional Information</p>
                      {customFields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">
                            {field.label}
                            {field.required && <span className="text-destructive"> *</span>}
                          </label>
                          {field.type === "select" || field.type === "radio" ? (
                            <Select value={customFieldValues[field.name] || ""} onValueChange={(v) => setCustomFieldValues({ ...customFieldValues, [field.name]: v })}>
                              <SelectTrigger><SelectValue placeholder={field.placeholder || `Select ${field.label}`} /></SelectTrigger>
                              <SelectContent>
                                {(field.options || []).map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === "textarea" || field.type === "multiline" ? (
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              placeholder={field.placeholder || ""}
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                            />
                          ) : field.type === "boolean" || field.type === "checkbox" ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={customFieldValues[field.name] === "true"}
                                onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: String(e.target.checked) })}
                                className="h-4 w-4 rounded border-border"
                              />
                              <span className="text-sm text-muted-foreground">{field.placeholder || field.label}</span>
                            </div>
                          ) : field.type === "number" ? (
                            <Input
                              type="number"
                              placeholder={field.placeholder || ""}
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                            />
                          ) : field.type === "phone" ? (
                            <Input
                              type="tel"
                              placeholder={field.placeholder || "+1234567890"}
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                            />
                          ) : (
                            <Input
                              type={field.type === "email" ? "email" : "text"}
                              placeholder={field.placeholder || ""}
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Date picker - inline to avoid Popover-in-Dialog focus conflicts */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Select Date <span className="text-destructive">*</span></label>
                    {bookingDate ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                          onClick={() => setBookingDate(undefined)}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(bookingDate, "PPP")}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setBookingDate(undefined); setBookingTimeSlot(""); }}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-background p-1">
                        <CalendarComponent
                          mode="single"
                          selected={bookingDate}
                          onSelect={setBookingDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="p-2 pointer-events-auto"
                        />
                      </div>
                    )}
                  </div>

                  {/* Time slots */}
                  {bookingDate && newBooking.eventTypeId && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Select Time <span className="text-destructive">*</span></label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading available slots...</span>
                        </div>
                      ) : (() => {
                        const dateKey = format(bookingDate, "yyyy-MM-dd");
                        const rawDaySlots = availableSlots[dateKey];
                        const daySlots = Array.isArray(rawDaySlots) ? rawDaySlots : [];

                        if (daySlots.length === 0) {
                          return (
                            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                              <Clock className="mx-auto h-5 w-5 text-muted-foreground/50 mb-1" />
                              <p className="text-sm text-muted-foreground">No available slots on this date</p>
                              <p className="text-xs text-muted-foreground mt-1">Try selecting a different date</p>
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
                            {daySlots.map((slot: unknown, idx: number) => {
                              const slotIso = typeof slot === "string"
                                ? slot
                                : (slot && typeof slot === "object" && "time" in slot && typeof (slot as { time?: unknown }).time === "string"
                                    ? (slot as { time: string }).time
                                    : null);
                              if (!slotIso) return null;

                              const slotTime = parseISO(slotIso);
                              if (!isValid(slotTime)) return null;

                              const timeLabel = format(slotTime, "h:mm a");
                              const isSelected = bookingTimeSlot === slotIso;
                              return (
                                <Button
                                  key={`${slotIso}-${idx}`}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  className={cn("text-xs", isSelected && "ring-2 ring-primary")}
                                  onClick={() => setBookingTimeSlot(slotIso)}
                                >
                                  {timeLabel}
                                </Button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Timezone indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Timezone: {userTimezone}</span>
                  </div>
                </>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBooking(false)}>Cancel</Button>
            <Button
              disabled={creatingBooking || !newBooking.name || !newBooking.email || !newBooking.phone || (!bookingTimeSlot && !!newBooking.eventTypeId) || (!bookingDate && !newBooking.eventTypeId)}
              onClick={async () => {
                setCreatingBooking(true);
                try {
                  const selectedEvent = eventTypes.find((et) => String(et.id) === newBooking.eventTypeId);
                  const fullPhone = `${newBooking.countryCode}${newBooking.phone}`;

                  if (!bookingTimeSlot && selectedEvent) {
                    toast.error("Please select an available time slot");
                    setCreatingBooking(false);
                    return;
                  }
                  if (!bookingDate && !selectedEvent) {
                    toast.error("Please select a date");
                    setCreatingBooking(false);
                    return;
                  }

                  const startTime = selectedEvent ? bookingTimeSlot : (bookingDate ? bookingDate.toISOString() : "");

                  // Validate required custom fields
                  if (selectedEvent?.bookingFields) {
                    const customFields = selectedEvent.bookingFields.filter(
                      (f) => !["name", "email", "attendeePhoneNumber", "smsReminderNumber", "rescheduleReason"].includes(f.name) && !f.hidden && f.editable !== "system"
                    );
                    for (const field of customFields) {
                      if (field.required && !customFieldValues[field.name]?.trim()) {
                        toast.error(`Please fill in "${field.label}"`);
                        setCreatingBooking(false);
                        return;
                      }
                    }
                  }

                  if (selectedEvent) {
                    const { data, error } = await supabase.functions.invoke("calcom-sync", {
                      body: {
                        action: "create_booking",
                        eventTypeId: selectedEvent.id,
                        startTime,
                        attendeeName: newBooking.name,
                        attendeeEmail: newBooking.email,
                        attendeePhone: fullPhone,
                        timeZone: userTimezone,
                        customResponses: customFieldValues,
                      },
                    });
                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);

                    await supabase.functions.invoke("calcom-sync", { body: { action: "sync_bookings" } });
                  } else {
                    const endTime = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString();
                    let leadId: string | null = null;
                    const { data: leadByEmail } = await supabase.from("leads").select("id").eq("user_id", user!.id).eq("email", newBooking.email).limit(1).maybeSingle();
                    if (leadByEmail) { leadId = leadByEmail.id; }
                    else {
                      const { data: leadByPhone } = await supabase.from("leads").select("id").eq("user_id", user!.id).eq("phone", fullPhone).limit(1).maybeSingle();
                      if (leadByPhone) leadId = leadByPhone.id;
                    }
                    const { error } = await supabase.from("bookings").insert({
                      user_id: user!.id,
                      title: `Meeting with ${newBooking.name}`,
                      start_time: startTime,
                      end_time: endTime,
                      status: "accepted",
                      attendee_name: newBooking.name,
                      attendee_email: newBooking.email,
                      attendee_phone: fullPhone,
                      lead_id: leadId,
                    });
                    if (error) throw error;
                  }

                  toast.success("Meeting booked successfully!");
                  setShowNewBooking(false);
                  setNewBooking({ name: "", email: "", phone: "", countryCode: "+1", eventTypeId: "" });
                  setCustomFieldValues({});
                  setBookingDate(undefined);
                  setBookingTimeSlot("");
                  setAvailableSlots({});
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
