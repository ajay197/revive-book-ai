// Mock data for Ryngr AI

export const dashboardStats = {
  totalCalls: 2847,
  callsToday: 124,
  answerRate: 68.4,
  avgDuration: "1:42",
  appointmentsBooked: 312,
  totalCost: 247.83,
  activeCampaigns: 5,
  positiveSentiment: 42.1,
};

export const recentCalls = [
  { id: "1", time: "2026-03-11 09:15:23", lead: "Sarah Mitchell", phone: "+1 (602) 680-8780", duration: "2:14", outcome: "Booked", sentiment: "Positive", campaign: "Spring Reactivation", cost: 0.12 },
  { id: "2", time: "2026-03-11 09:12:05", lead: "James Cooper", phone: "+1 (480) 555-0142", duration: "0:36", outcome: "No Answer", sentiment: "Neutral", campaign: "Spring Reactivation", cost: 0.04 },
  { id: "3", time: "2026-03-11 09:08:41", lead: "Maria Garcia", phone: "+1 (623) 555-0198", duration: "3:02", outcome: "Booked", sentiment: "Positive", campaign: "FB Leads March", cost: 0.18 },
  { id: "4", time: "2026-03-11 09:05:12", lead: "Robert Chen", phone: "+1 (520) 555-0167", duration: "1:18", outcome: "Unsuccessful", sentiment: "Negative", campaign: "Spring Reactivation", cost: 0.08 },
  { id: "5", time: "2026-03-11 09:01:33", lead: "Jennifer Adams", phone: "+1 (602) 555-0134", duration: "1:55", outcome: "Booked", sentiment: "Positive", campaign: "HVAC Leads Q1", cost: 0.11 },
  { id: "6", time: "2026-03-11 08:57:08", lead: "David Wilson", phone: "+1 (480) 555-0156", duration: "0:42", outcome: "Voicemail", sentiment: "Neutral", campaign: "FB Leads March", cost: 0.05 },
  { id: "7", time: "2026-03-11 08:53:22", lead: "Lisa Thompson", phone: "+1 (623) 555-0189", duration: "2:31", outcome: "Unsuccessful", sentiment: "Neutral", campaign: "Dental Reactivation", cost: 0.14 },
  { id: "8", time: "2026-03-11 08:50:53", lead: "Michael Brown", phone: "+1 (602) 555-0178", duration: "0:36", outcome: "Unsuccessful", sentiment: "Neutral", campaign: "Spring Reactivation", cost: 0.087 },
];

export const leads = [
  { id: "1", name: "Sarah Mitchell", phone: "+1 (602) 680-8780", email: "sarah@email.com", company: "Mitchell Plumbing", city: "Phoenix", state: "AZ", source: "CSV Import", status: "Booked" as const, campaign: "Spring Reactivation", tags: ["hot", "plumbing"], createdAt: "2026-03-01" },
  { id: "2", name: "James Cooper", phone: "+1 (480) 555-0142", email: "james@cooperhvac.com", company: "Cooper HVAC", city: "Scottsdale", state: "AZ", source: "Facebook", status: "Called" as const, campaign: "HVAC Leads Q1", tags: ["hvac"], createdAt: "2026-03-02" },
  { id: "3", name: "Maria Garcia", phone: "+1 (623) 555-0198", email: "maria@garcia.com", company: "Garcia Dental", city: "Glendale", state: "AZ", source: "CSV Import", status: "Booked" as const, campaign: "Dental Reactivation", tags: ["dental", "hot"], createdAt: "2026-02-28" },
  { id: "4", name: "Robert Chen", phone: "+1 (520) 555-0167", email: "robert@chenroofing.com", company: "Chen Roofing", city: "Tucson", state: "AZ", source: "CSV Import", status: "Unsuccessful" as const, campaign: "Spring Reactivation", tags: ["roofing"], createdAt: "2026-03-03" },
  { id: "5", name: "Jennifer Adams", phone: "+1 (602) 555-0134", email: "jen@adamslaw.com", company: "Adams Legal", city: "Phoenix", state: "AZ", source: "Facebook", status: "Booked" as const, campaign: "FB Leads March", tags: ["legal"], createdAt: "2026-03-05" },
  { id: "6", name: "David Wilson", phone: "+1 (480) 555-0156", email: "david@wilsonelectric.com", company: "Wilson Electric", city: "Mesa", state: "AZ", source: "CSV Import", status: "Queued" as const, campaign: "Spring Reactivation", tags: ["electrical"], createdAt: "2026-03-06" },
  { id: "7", name: "Lisa Thompson", phone: "+1 (623) 555-0189", email: "lisa@thompsondental.com", company: "Thompson Dental", city: "Peoria", state: "AZ", source: "CSV Import", status: "No Answer" as const, campaign: "Dental Reactivation", tags: ["dental"], createdAt: "2026-03-04" },
  { id: "8", name: "Michael Brown", phone: "+1 (602) 555-0178", email: "mike@brownpainting.com", company: "Brown Painting Co", city: "Phoenix", state: "AZ", source: "Facebook", status: "New" as const, campaign: null, tags: ["painting"], createdAt: "2026-03-10" },
];

export const campaigns = [
  { id: "1", name: "Spring Reactivation", type: "Old Lead Reactivation", leadCount: 847, agent: "Cindi", script: "Old Lead Reactivation Script", status: "Running" as const, callsCompleted: 523, appointmentsBooked: 89, cost: 62.40, createdAt: "2026-03-01" },
  { id: "2", name: "FB Leads March", type: "Facebook Lead Follow-up", leadCount: 234, agent: "Emma", script: "Facebook Lead Follow-up Script", status: "Running" as const, callsCompleted: 156, appointmentsBooked: 41, cost: 18.72, createdAt: "2026-03-05" },
  { id: "3", name: "HVAC Leads Q1", type: "Lead Qualification", leadCount: 412, agent: "Mike", script: "Lead Qualification Script", status: "Completed" as const, callsCompleted: 412, appointmentsBooked: 67, cost: 49.44, createdAt: "2026-02-15" },
  { id: "4", name: "Dental Reactivation", type: "Old Lead Reactivation", leadCount: 563, agent: "Cindi", script: "Old Lead Reactivation Script", status: "Running" as const, callsCompleted: 298, appointmentsBooked: 52, cost: 35.76, createdAt: "2026-03-03" },
  { id: "5", name: "Appointment Reminders", type: "Appointment Reminder", leadCount: 89, agent: "Emma", script: "Appointment Reminder Script", status: "Paused" as const, callsCompleted: 45, appointmentsBooked: 38, cost: 5.40, createdAt: "2026-03-08" },
  { id: "6", name: "Roofing Leads Q2", type: "Old Lead Reactivation", leadCount: 0, agent: null, script: null, status: "Draft" as const, callsCompleted: 0, appointmentsBooked: 0, cost: 0, createdAt: "2026-03-10" },
];

export const agents = [
  { id: "1", name: "Cindi", purpose: "Reactivation Specialist", voice: "Female — Warm", language: "English", description: "Specializes in reconnecting with dormant leads using empathetic, conversational tone. Excels at re-engagement and appointment booking.", campaignsUsing: 2, callsMade: 821, bookingRate: 17.1, active: true },
  { id: "2", name: "Emma", purpose: "Consultation Booking", voice: "Female — Professional", language: "English", description: "Optimized for booking consultations and appointments. Direct, professional approach with strong closing skills.", campaignsUsing: 2, callsMade: 201, bookingRate: 19.4, active: true },
  { id: "3", name: "Mike", purpose: "Lead Qualification", voice: "Male — Friendly", language: "English", description: "Designed for qualifying inbound and outbound leads. Asks targeted questions to determine lead quality and intent.", campaignsUsing: 1, callsMade: 412, bookingRate: 16.3, active: true },
];

export const scripts = [
  { id: "1", name: "Old Lead Reactivation Script", category: "Old lead reactivation", description: "Re-engage dormant leads with a warm, personalized approach. References their previous interest and offers current availability.", objective: "Book appointment", active: true, createdAt: "2026-02-20" },
  { id: "2", name: "Facebook Lead Follow-up Script", category: "Facebook lead follow-up", description: "Quick follow-up for Facebook ad leads. Acknowledges their form submission and moves toward booking.", objective: "Book consultation", active: true, createdAt: "2026-02-25" },
  { id: "3", name: "Lead Qualification Script", category: "Qualification", description: "Qualify leads based on budget, timeline, and need. Routes qualified leads to booking flow.", objective: "Qualify and book", active: true, createdAt: "2026-03-01" },
  { id: "4", name: "Appointment Reminder Script", category: "Reminder", description: "Friendly reminder call for upcoming appointments. Confirms time, location, and any prep needed.", objective: "Confirm appointment", active: true, createdAt: "2026-03-05" },
  { id: "5", name: "HVAC Seasonal Campaign", category: "Old lead reactivation", description: "Seasonal reactivation for HVAC customers. Mentions upcoming weather and maintenance specials.", objective: "Book service call", active: false, createdAt: "2026-03-08" },
];

export const analyticsData = [
  { time: "2026-03-07 08:50:53", duration: "0:36", channelType: "phone_call", cost: 0.087, sessionId: "call_9e64f650f7f845f68a4f05ec193", endReason: "user hangup", sessionStatus: "ended", sentiment: "Neutral", from: "+12014929779", to: "+16026808780", direction: "outbound", outcome: "Unsuccessful", latency: "1166ms" },
  { time: "2026-03-07 09:02:11", duration: "2:14", channelType: "phone_call", cost: 0.124, sessionId: "call_a1b2c3d4e5f6g7h8i9j0k1l2m", endReason: "agent ended", sessionStatus: "ended", sentiment: "Positive", from: "+12014929779", to: "+16025550134", direction: "outbound", outcome: "Booked", latency: "892ms" },
  { time: "2026-03-07 09:15:33", duration: "1:18", channelType: "phone_call", cost: 0.076, sessionId: "call_n3o4p5q6r7s8t9u0v1w2x3y4z", endReason: "user hangup", sessionStatus: "ended", sentiment: "Negative", from: "+12014929779", to: "+14805550142", direction: "outbound", outcome: "Unsuccessful", latency: "1043ms" },
  { time: "2026-03-07 09:28:45", duration: "3:02", channelType: "phone_call", cost: 0.182, sessionId: "call_a5b6c7d8e9f0g1h2i3j4k5l6m", endReason: "agent ended", sessionStatus: "ended", sentiment: "Positive", from: "+12014929779", to: "+16235550198", direction: "outbound", outcome: "Booked", latency: "756ms" },
  { time: "2026-03-07 09:41:22", duration: "0:42", channelType: "phone_call", cost: 0.048, sessionId: "call_n7o8p9q0r1s2t3u4v5w6x7y8z", endReason: "voicemail", sessionStatus: "ended", sentiment: "Neutral", from: "+12014929779", to: "+14805550156", direction: "outbound", outcome: "Voicemail", latency: "1322ms" },
  { time: "2026-03-07 09:55:08", duration: "1:55", channelType: "phone_call", cost: 0.112, sessionId: "call_a9b0c1d2e3f4g5h6i7j8k9l0m", endReason: "agent ended", sessionStatus: "ended", sentiment: "Positive", from: "+12014929779", to: "+16025550178", direction: "outbound", outcome: "Booked", latency: "934ms" },
];

export const chartData = {
  callsOverTime: [
    { date: "Mar 1", calls: 89, answered: 62, booked: 12 },
    { date: "Mar 2", calls: 112, answered: 78, booked: 15 },
    { date: "Mar 3", calls: 134, answered: 91, booked: 18 },
    { date: "Mar 4", calls: 98, answered: 67, booked: 11 },
    { date: "Mar 5", calls: 156, answered: 108, booked: 22 },
    { date: "Mar 6", calls: 142, answered: 97, booked: 19 },
    { date: "Mar 7", calls: 167, answered: 114, booked: 24 },
    { date: "Mar 8", calls: 178, answered: 122, booked: 27 },
    { date: "Mar 9", calls: 145, answered: 99, booked: 20 },
    { date: "Mar 10", calls: 189, answered: 130, booked: 29 },
    { date: "Mar 11", calls: 124, answered: 85, booked: 16 },
  ],
  outcomeDistribution: [
    { name: "Booked", value: 312, fill: "hsl(160, 84%, 39%)" },
    { name: "Unsuccessful", value: 847, fill: "hsl(0, 84%, 60%)" },
    { name: "No Answer", value: 523, fill: "hsl(218, 11%, 65%)" },
    { name: "Voicemail", value: 312, fill: "hsl(43, 96%, 56%)" },
  ],
  costByDay: [
    { date: "Mar 1", cost: 10.68 },
    { date: "Mar 2", cost: 13.44 },
    { date: "Mar 3", cost: 16.08 },
    { date: "Mar 4", cost: 11.76 },
    { date: "Mar 5", cost: 18.72 },
    { date: "Mar 6", cost: 17.04 },
    { date: "Mar 7", cost: 20.04 },
    { date: "Mar 8", cost: 21.36 },
    { date: "Mar 9", cost: 17.40 },
    { date: "Mar 10", cost: 22.68 },
    { date: "Mar 11", cost: 14.88 },
  ],
};
