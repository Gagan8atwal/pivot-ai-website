export interface IndustryData {
  slug: string
  name: string
  shortName: string
  metaTitle: string
  metaDescription: string
  heroHeading: string
  heroSubheading: string
  painPoints: { title: string; description: string }[]
  benefits: { title: string; description: string }[]
  faqs: { question: string; answer: string }[]
  ctaHeading: string
  ctaSubheading: string
  jsonLdKeywords: string[]
}

export const industries: IndustryData[] = [
  {
    slug: 'dental',
    name: 'Dental Practices',
    shortName: 'Dental',
    metaTitle: 'AI Receptionist for Dental Practices — 24/7 Patient Call Answering | Pivot AI',
    metaDescription:
      'Pivot AI answers patient calls 24/7 for dental offices. Schedule appointments, handle new patient inquiries, and capture every lead — without adding front-desk staff.',
    heroHeading: 'Your Dental Practice Deserves a Receptionist That Never Misses a Call',
    heroSubheading:
      'Pivot AI answers patient calls 24/7, schedules appointments, and handles new patient inquiries — so your front desk can focus on the patients already in your chair.',
    painPoints: [
      {
        title: 'Missed calls mean missed patients',
        description:
          'When your front desk is with a patient, calls go to voicemail. Most people won\'t leave a message — they call the next dentist on Google instead.',
      },
      {
        title: 'After-hours inquiries go unanswered',
        description:
          'New patients often search for a dentist in the evening or on weekends. Without after-hours coverage, those leads evaporate by morning.',
      },
      {
        title: 'Scheduling calls pull staff off critical tasks',
        description:
          'Appointment reminders, reschedules, and routine scheduling questions tie up your front-desk team and slow down check-in.',
      },
      {
        title: 'New patient intake is time-consuming',
        description:
          'Capturing basic information, insurance details, and the reason for the visit over the phone takes time — time that could be better spent on care.',
      },
    ],
    benefits: [
      {
        title: '24/7 patient call answering',
        description:
          'Pivot AI picks up every call — morning, evening, or weekend — and handles it professionally, so patients always reach someone.',
      },
      {
        title: 'Instant appointment scheduling',
        description:
          'Callers can schedule, reschedule, or confirm appointments without waiting on hold or speaking to a human receptionist.',
      },
      {
        title: 'New patient intake on every call',
        description:
          'The AI gathers the patient\'s name, contact info, reason for visit, and insurance type, then delivers a clean summary to your team.',
      },
      {
        title: 'After-hours lead capture',
        description:
          'Every after-hours caller is logged, qualified, and followed up with an SMS confirmation — so no lead is ever lost to a voicemail.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle HIPAA-sensitive patient information?',
        answer:
          'Pivot AI collects basic scheduling and contact information on calls — name, phone, reason for visit. We do not store clinical or diagnostic data. All collected data is encrypted in transit and at rest. For specific HIPAA compliance requirements, we recommend discussing your use case with our team during onboarding.',
      },
      {
        question: 'Will it integrate with our existing scheduling software?',
        answer:
          'During your 14-day trial, our team works with you to connect Pivot AI to your scheduling workflow. We currently support Google Calendar and can log appointment requests to your existing system.',
      },
      {
        question: 'What happens when a patient has an emergency or needs to speak to a dentist?',
        answer:
          'Pivot AI can be configured to recognize urgent keywords and immediately transfer the call to you or an on-call number. It will never leave a patient stranded if they indicate a dental emergency.',
      },
    ],
    ctaHeading: 'Stop Losing Patients to Voicemail',
    ctaSubheading: 'See how Pivot AI handles a real patient call for your dental practice — free 14-day trial, no credit card required.',
    jsonLdKeywords: ['dental receptionist', 'dental appointment scheduling', 'patient call answering', 'dental practice AI'],
  },
  {
    slug: 'medical',
    name: 'Medical Offices',
    shortName: 'Medical',
    metaTitle: 'AI Receptionist for Medical Offices — 24/7 Patient Scheduling | Pivot AI',
    metaDescription:
      'Pivot AI answers patient calls around the clock for medical practices. Handle appointment scheduling, after-hours inquiries, and new patient intake without extra staff.',
    heroHeading: 'Every Patient Call Answered — Even When Your Staff Can\'t',
    heroSubheading:
      'Pivot AI handles patient scheduling, after-hours calls, and new patient intake 24/7 — letting your clinical staff focus on care, not the phone.',
    painPoints: [
      {
        title: 'Phone lines stay busy during peak hours',
        description:
          'Morning rushes, lunch breaks, and end-of-day surges mean patients wait on hold or give up. Those missed connections mean missed revenue and frustrated patients.',
      },
      {
        title: 'After-hours calls go unanswered',
        description:
          'Patients don\'t get sick on a schedule. After-hours inquiries — from prescription refill questions to appointment requests — fall through the cracks.',
      },
      {
        title: 'Routine calls consume staff time',
        description:
          'Appointment confirmations, address and hours questions, and prescription refill requests are high-volume and low-complexity — but they still take up your team\'s time.',
      },
      {
        title: 'New patient onboarding is slow',
        description:
          'Collecting new patient information over the phone is manual, error-prone, and time-consuming for both staff and the patient.',
      },
    ],
    benefits: [
      {
        title: 'Always-on call answering',
        description:
          'Pivot AI answers every call immediately — no hold music, no voicemail — and handles it professionally whether it\'s 9 AM or 9 PM.',
      },
      {
        title: 'Appointment scheduling and reminders',
        description:
          'Patients can schedule, reschedule, or confirm appointments on the call. Reminders go out automatically via SMS to reduce no-shows.',
      },
      {
        title: 'After-hours triage',
        description:
          'Urgent calls are escalated to an on-call line. Routine requests are logged and delivered to your team first thing in the morning.',
      },
      {
        title: 'New patient intake on the first call',
        description:
          'The AI collects name, contact details, insurance, and reason for visit — delivering a clean summary so your staff is prepared before the appointment.',
      },
    ],
    faqs: [
      {
        question: 'How does Pivot AI handle urgent or emergency medical calls?',
        answer:
          'You configure which keywords or situations trigger a live transfer to an on-call clinician or emergency line. Pivot AI will never prevent a patient from reaching help in an emergency — it follows the escalation rules you set.',
      },
      {
        question: 'Can it handle calls in languages other than English?',
        answer:
          'Multilingual support is on our roadmap. Currently Pivot AI operates in English. We recommend discussing your patient population during onboarding so we can tailor the setup to your needs.',
      },
      {
        question: 'What happens to the call data Pivot AI collects?',
        answer:
          'All call data — transcripts, contact details, and appointment requests — is stored securely and accessible only to your practice. We do not sell or share patient information with third parties.',
      },
    ],
    ctaHeading: 'Give Your Patients the Responsiveness They Expect',
    ctaSubheading: 'See Pivot AI handle a real patient call for your medical practice — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['medical office receptionist', 'patient scheduling AI', 'medical call answering', 'healthcare phone answering'],
  },
  {
    slug: 'chiropractic',
    name: 'Chiropractic Offices',
    shortName: 'Chiropractic',
    metaTitle: 'AI Receptionist for Chiropractors — Fill Your Schedule 24/7 | Pivot AI',
    metaDescription:
      'Pivot AI answers calls and fills appointment slots for chiropractic offices around the clock. Handle new patient inquiries, scheduling, and after-hours calls automatically.',
    heroHeading: 'Fill Every Appointment Slot — Without Hiring Another Receptionist',
    heroSubheading:
      'Pivot AI answers new patient calls, books appointments, and handles follow-ups 24/7 so your chiropractic practice never loses a lead to voicemail.',
    painPoints: [
      {
        title: 'New patients call once and move on',
        description:
          'Someone searching for a chiropractor calls your number. If no one answers, they call the next practice — and they\'re gone.',
      },
      {
        title: 'Treatment sessions leave calls unanswered',
        description:
          'When you\'re in a treatment room, every call that rings unanswered is a potential new patient walking out the door.',
      },
      {
        title: 'Scheduling calls interrupt your workflow',
        description:
          'Taking time out of your day to answer routine scheduling questions breaks concentration and slows your practice.',
      },
      {
        title: 'Evenings and weekends are dead zones',
        description:
          'People research chiropractors after work and on weekends. Your office is closed — and so is your ability to capture those leads.',
      },
    ],
    benefits: [
      {
        title: '24/7 new patient intake',
        description:
          'Pivot AI answers every call, captures new patient details, and books them into your schedule — even on Saturday night.',
      },
      {
        title: 'Appointment booking and confirmation',
        description:
          'Callers hear your availability and can book or confirm appointments on the spot. Confirmation SMS is sent automatically.',
      },
      {
        title: 'Existing patient self-service',
        description:
          'Regular patients can reschedule, cancel, or ask about their upcoming appointment without waiting on hold.',
      },
      {
        title: 'Lead capture for every missed-call scenario',
        description:
          'If a caller can\'t book right away, Pivot AI captures their information and sends an SMS follow-up so your team can reconnect.',
      },
    ],
    faqs: [
      {
        question: 'How do I set my availability for the AI to book into?',
        answer:
          'During onboarding, we sync with your Google Calendar and configure your available appointment slots. The AI books only into open times, so there\'s no risk of double-booking.',
      },
      {
        question: 'Can Pivot AI explain my services to new patients?',
        answer:
          'Yes. We build a knowledge base for your practice — your services, pricing, intake requirements, and common questions — so the AI can answer accurately on your behalf.',
      },
      {
        question: 'What if a caller needs to speak to me directly?',
        answer:
          'You set the rules. Pivot AI can transfer calls to you at any time, or log the request for a callback. It follows your instructions for every scenario.',
      },
    ],
    ctaHeading: 'Stop Losing New Patients to Voicemail',
    ctaSubheading: 'Watch Pivot AI book a chiropractic appointment on a live call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['chiropractor receptionist', 'chiropractic scheduling AI', 'chiropractic call answering', 'new patient booking'],
  },
  {
    slug: 'hvac',
    name: 'HVAC Companies',
    shortName: 'HVAC',
    metaTitle: 'AI Receptionist for HVAC Companies — 24/7 Emergency Call Answering | Pivot AI',
    metaDescription:
      'Pivot AI answers HVAC calls 24/7 — emergency service requests, tune-up scheduling, and new customer inquiries captured and routed automatically.',
    heroHeading: 'Never Miss an Emergency HVAC Call — Day or Night',
    heroSubheading:
      'Pivot AI answers every HVAC service call 24/7, captures leads, and dispatches urgent requests — so you\'re always first on the scene, never the contractor who didn\'t pick up.',
    painPoints: [
      {
        title: 'Emergency calls happen at the worst times',
        description:
          'A broken AC in August or a failed furnace in January — customers call at all hours. Missing that call means losing the job to whoever picks up first.',
      },
      {
        title: 'Technicians can\'t answer calls from job sites',
        description:
          'When your team is on a roof or in a crawl space, calls go unanswered. Every missed call is a missed service ticket.',
      },
      {
        title: 'Seasonal spikes overwhelm your phone line',
        description:
          'Summer heat waves and winter cold snaps create call surges. One phone line and one dispatcher can\'t keep up.',
      },
      {
        title: 'After-hours inquiries get no follow-up',
        description:
          'A homeowner calling at 10 PM for a tune-up quote expects a response. If they get voicemail, they\'ll book with someone else by morning.',
      },
    ],
    benefits: [
      {
        title: '24/7 emergency call handling',
        description:
          'Pivot AI immediately captures emergency service requests and sends you an alert — so urgent calls never wait until morning.',
      },
      {
        title: 'Automatic scheduling for tune-ups and maintenance',
        description:
          'Non-emergency calls are handled in full: the AI captures details, checks availability, and books the appointment without involving your dispatcher.',
      },
      {
        title: 'Surge capacity during peak seasons',
        description:
          'No matter how many calls come in simultaneously, Pivot AI handles every one — no busy signals, no voicemail.',
      },
      {
        title: 'Lead qualification and routing',
        description:
          'The AI identifies the service type, urgency, and location, then routes the call or alert to the right technician or dispatcher.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle emergency dispatch?',
        answer:
          'Yes. You configure what counts as an emergency (e.g., "no heat," "AC not working," "gas smell") and Pivot AI immediately sends you an SMS or phone alert so you can call back or dispatch within minutes.',
      },
      {
        question: 'What if a caller needs an immediate callback?',
        answer:
          'Pivot AI captures the caller\'s name, number, and issue, then sends you an alert in real time. You can call back within minutes, or configure an auto-callback for certain request types.',
      },
      {
        question: 'Does it work with my existing HVAC dispatch software?',
        answer:
          'Pivot AI delivers call data as structured summaries to your email or phone. During onboarding, we explore integration options with your existing tools.',
      },
    ],
    ctaHeading: 'Be the HVAC Company That Always Picks Up',
    ctaSubheading: 'See how Pivot AI handles a live HVAC service call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['HVAC call answering', 'HVAC receptionist AI', 'HVAC emergency dispatch', 'HVAC lead capture'],
  },
  {
    slug: 'electrical',
    name: 'Electrical Contractors',
    shortName: 'Electrical',
    metaTitle: 'AI Receptionist for Electricians — Capture Every Service Call | Pivot AI',
    metaDescription:
      'Pivot AI answers calls 24/7 for electrical contractors. Capture service requests, emergency calls, and new customer leads — even while your crew is on the job.',
    heroHeading: 'Every Electrical Service Call Captured — Even While You\'re on the Job',
    heroSubheading:
      'Pivot AI answers calls for your electrical business 24/7, captures service requests, and notifies you of emergencies in real time — so no lead slips through while your crew is on-site.',
    painPoints: [
      {
        title: 'Calls go unanswered while crews are on-site',
        description:
          'Electricians can\'t leave a job to answer the phone. Every unanswered call is a potential customer who books a competitor instead.',
      },
      {
        title: 'Emergency calls require immediate response',
        description:
          'A tripped panel or electrical outage is an emergency. If you don\'t answer, the homeowner calls the next electrician on Google.',
      },
      {
        title: 'After-hours leads have nowhere to go',
        description:
          'Homeowners and property managers often call for quotes and service in the evening. Without coverage, those leads evaporate overnight.',
      },
      {
        title: 'Quoting calls take time away from the job',
        description:
          'Taking service details and scheduling estimates over the phone while on a job site is disruptive and error-prone.',
      },
    ],
    benefits: [
      {
        title: 'Immediate emergency call alerts',
        description:
          'Pivot AI identifies urgent keywords and texts you an alert within seconds, so you can call back before the customer books someone else.',
      },
      {
        title: 'Service request capture on every call',
        description:
          'The AI captures the job type, address, contact info, and urgency level for every caller — delivered as a clean summary to your team.',
      },
      {
        title: '24/7 coverage with zero staffing cost',
        description:
          'Your AI receptionist works nights, weekends, and holidays without overtime or benefits — so you\'re always reachable.',
      },
      {
        title: 'Professional caller experience',
        description:
          'Callers hear a professional greeting and get their question answered or their information captured immediately — not voicemail.',
      },
    ],
    faqs: [
      {
        question: 'Can the AI handle calls about specific electrical services I offer?',
        answer:
          'Yes. We build a knowledge base for your business during onboarding — your services, service area, rates if applicable, and common questions — so the AI answers accurately and represents your company well.',
      },
      {
        question: 'How do I get notified of emergency calls?',
        answer:
          'Pivot AI sends an SMS alert to your phone (or any number you designate) with the caller\'s details and the nature of the emergency. You can call back immediately or configure the AI to offer a callback window.',
      },
      {
        question: 'Does it work if I have multiple technicians?',
        answer:
          'Yes. You configure which calls or emergencies get routed to which team member. Pivot AI can handle multi-location or multi-crew setups.',
      },
    ],
    ctaHeading: 'Never Miss Another Service Call',
    ctaSubheading: 'See Pivot AI handle a real electrical service inquiry — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['electrician call answering', 'electrical contractor receptionist', 'electrician lead capture', 'electrical service AI'],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing Companies',
    shortName: 'Plumbing',
    metaTitle: 'AI Receptionist for Plumbers — 24/7 Emergency & Service Call Answering | Pivot AI',
    metaDescription:
      'Pivot AI answers plumbing calls around the clock. Capture emergency service requests, schedule non-urgent jobs, and follow up on every missed call automatically.',
    heroHeading: 'Stop Losing Plumbing Leads — 24/7 Call Answering for Plumbers',
    heroSubheading:
      'Pivot AI answers every plumbing call immediately, captures the service request, and alerts you to emergencies in real time — so you\'re always the plumber that picked up.',
    painPoints: [
      {
        title: 'Burst pipes and leaks don\'t wait for business hours',
        description:
          'Plumbing emergencies happen at midnight, on weekends, and during the holidays. If you don\'t have after-hours coverage, you\'re handing emergency jobs to competitors.',
      },
      {
        title: 'Plumbers can\'t answer calls while under the sink',
        description:
          'Your best technicians are on the job. Every call that rings while they\'re working is a missed opportunity.',
      },
      {
        title: 'Service call details get lost in voicemail',
        description:
          'Callers leaving voicemails often leave incomplete information. You spend time calling back to get the details you need.',
      },
      {
        title: 'Seasonal demand spikes cause phone chaos',
        description:
          'Cold snaps freeze pipes. Spring rains flood basements. When demand spikes, your phone line can\'t scale — Pivot AI can.',
      },
    ],
    benefits: [
      {
        title: '24/7 emergency alert system',
        description:
          'Pivot AI detects emergency calls ("burst pipe," "flooding," "no hot water") and sends you an immediate SMS alert with the caller\'s details.',
      },
      {
        title: 'Complete service request capture',
        description:
          'Every caller\'s name, address, issue type, and urgency is captured and delivered to you as a clean, actionable summary.',
      },
      {
        title: 'Automatic appointment scheduling',
        description:
          'For non-emergency calls, Pivot AI books the appointment directly into your calendar without any back-and-forth.',
      },
      {
        title: 'SMS follow-up on every call',
        description:
          'Callers who can\'t be scheduled immediately receive an SMS confirmation, keeping the lead warm until your team can connect.',
      },
    ],
    faqs: [
      {
        question: 'How fast can I respond to emergency alerts?',
        answer:
          'You set your alert preferences. Pivot AI can send you an SMS, call your cell phone, or alert a dispatcher — all within seconds of the original call coming in.',
      },
      {
        question: 'What if my coverage area changes or I add services?',
        answer:
          'We update your knowledge base whenever your services, coverage area, or pricing changes. You contact us and we handle the update — usually within one business day.',
      },
      {
        question: 'Can it tell callers about my pricing or give estimates?',
        answer:
          'Yes, if you want it to. Many plumbers prefer to give estimates in person. We configure the AI to either quote your standard rates or to capture the job details and promise a callback for pricing.',
      },
    ],
    ctaHeading: 'Be the Plumber That Always Picks Up',
    ctaSubheading: 'Watch Pivot AI handle a real plumbing service call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['plumber call answering', 'plumbing receptionist AI', 'plumbing emergency dispatch', 'plumbing lead capture'],
  },
  {
    slug: 'roofing',
    name: 'Roofing Contractors',
    shortName: 'Roofing',
    metaTitle: 'AI Receptionist for Roofing Companies — Capture Every Lead | Pivot AI',
    metaDescription:
      'Pivot AI answers roofing calls 24/7. Capture storm damage inquiries, schedule inspections, and follow up on every lead — automatically.',
    heroHeading: 'Capture Every Roofing Lead — Before Your Competition Does',
    heroSubheading:
      'After a storm, every roofer\'s phone rings. Pivot AI answers every call immediately, captures the details, and schedules inspections automatically — so you win more jobs.',
    painPoints: [
      {
        title: 'Storm season creates a call avalanche',
        description:
          'After hail or high winds, every homeowner in your area calls for an inspection. One phone line and one person can\'t keep up — and every missed call goes to the next roofer on Google.',
      },
      {
        title: 'Project inquiries come in at all hours',
        description:
          'Homeowners research and call in the evening and on weekends. Without after-hours coverage, those leads are gone by morning.',
      },
      {
        title: 'Insurance work requires precise information capture',
        description:
          'Getting the right details on the first call — storm date, insurance company, damage type — is critical. Rushed calls and voicemails lead to incomplete information.',
      },
      {
        title: 'Crews are on rooftops, not answering phones',
        description:
          'Your team is doing the work. Every call that rings while they\'re on a job is a potential new customer who moves on without waiting.',
      },
    ],
    benefits: [
      {
        title: 'Unlimited call capacity during storm season',
        description:
          'Pivot AI handles every call simultaneously — no busy signals, no hold queues — no matter how many homeowners call at once.',
      },
      {
        title: 'Inspection scheduling on every call',
        description:
          'Callers get their inspection scheduled during the call. Pivot AI books into your open slots and sends confirmation via SMS.',
      },
      {
        title: 'Insurance and damage detail capture',
        description:
          'The AI captures the storm date, damage description, insurance carrier, and contact info — so your estimator arrives prepared.',
      },
      {
        title: 'After-hours and weekend lead capture',
        description:
          'Every after-hours inquiry is captured and followed up with an SMS, so no storm lead sits in a voicemail until Monday.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle volume spikes during storm season?',
        answer:
          'Yes. Pivot AI scales automatically — there\'s no limit to how many simultaneous calls it can handle. Whether you get 10 calls or 200 in a day, every call gets answered immediately.',
      },
      {
        question: 'Can it capture insurance information from callers?',
        answer:
          'Yes. We configure the AI to ask for relevant details based on your workflow — including the caller\'s insurance company, claim number if available, and description of the damage.',
      },
      {
        question: 'What if a homeowner wants a same-day inspection?',
        answer:
          'You control your availability. Pivot AI can check your calendar for same-day slots or capture the urgent request and alert you via SMS so you can respond immediately.',
      },
    ],
    ctaHeading: 'Win More Roofing Jobs This Season',
    ctaSubheading: 'See how Pivot AI handles a storm damage inquiry call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['roofing call answering', 'roofing contractor AI', 'roofing lead capture', 'roof inspection scheduling'],
  },
  {
    slug: 'landscaping',
    name: 'Landscaping & Lawn Care',
    shortName: 'Landscaping',
    metaTitle: 'AI Receptionist for Landscaping & Lawn Care — Never Miss a Quote Request | Pivot AI',
    metaDescription:
      'Pivot AI answers landscaping and lawn care calls 24/7. Capture quote requests, schedule seasonal services, and follow up on every inquiry — automatically.',
    heroHeading: 'Never Miss a Lawn Care Lead — AI Call Answering for Landscapers',
    heroSubheading:
      'Pivot AI answers every landscaping inquiry 24/7, books estimates, and schedules recurring services — so you spend less time on the phone and more time on the job.',
    painPoints: [
      {
        title: 'Spring rush means calls you can\'t keep up with',
        description:
          'Every spring, homeowners want estimates before the season starts. A flooded phone line means lost quotes and unhappy customers.',
      },
      {
        title: 'Crews are outside — not near a phone',
        description:
          'When your crew is mowing, trimming, or planting, calls go to voicemail. Most people won\'t leave a message — they\'ll call someone else.',
      },
      {
        title: 'Recurring customers call to reschedule all the time',
        description:
          'Weather cancellations, vacation holds, and service adjustments generate constant scheduling calls that pull your focus off the job.',
      },
      {
        title: 'Quote requests come in at all hours',
        description:
          'Homeowners think about their lawn on Saturday afternoon — not during your business hours. Without after-hours coverage, those leads vanish.',
      },
    ],
    benefits: [
      {
        title: '24/7 quote request capture',
        description:
          'Every caller who wants an estimate has their details captured — property address, service type, and preferred timing — so your estimator arrives prepared.',
      },
      {
        title: 'Seasonal service booking',
        description:
          'Pivot AI books customers into your seasonal schedule — spring cleanups, mowing packages, fall leaf removal — based on your availability.',
      },
      {
        title: 'Recurring customer self-service',
        description:
          'Existing customers can reschedule, cancel, or adjust their service without waiting on hold or playing phone tag with your office.',
      },
      {
        title: 'Automatic SMS follow-up',
        description:
          'Every caller who requests a quote or service gets an SMS confirmation, keeping the lead warm until your team is ready to follow up.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle calls about different service types — mowing, landscaping, hardscaping?',
        answer:
          'Yes. During onboarding, we build a knowledge base with all of your services, so the AI can answer questions about each one and route the call appropriately.',
      },
      {
        question: 'What if I need to limit the service area?',
        answer:
          'We configure your service area during setup. The AI will politely let callers outside your coverage area know that you don\'t currently serve their location.',
      },
      {
        question: 'Can it handle bilingual callers?',
        answer:
          'English is fully supported today. Bilingual (English/Spanish) support is on our roadmap. Let us know during your demo if this is important for your customer base.',
      },
    ],
    ctaHeading: 'Keep Your Schedule Full All Season',
    ctaSubheading: 'Watch Pivot AI capture a landscaping quote request on a real call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['landscaping call answering', 'lawn care AI receptionist', 'landscaping lead capture', 'lawn care scheduling'],
  },
  {
    slug: 'law-firm',
    name: 'Law Firms',
    shortName: 'Law Firms',
    metaTitle: 'AI Receptionist for Law Firms — 24/7 New Client Intake | Pivot AI',
    metaDescription:
      'Pivot AI answers calls 24/7 for law firms. Capture new client inquiries, screen potential cases, and schedule consultations without adding front-desk staff.',
    heroHeading: 'Professional Client Intake Around the Clock — Without a Full-Time Receptionist',
    heroSubheading:
      'Pivot AI answers calls for your law firm 24/7, screens new client inquiries, captures case details, and schedules consultations — so no potential client goes unanswered.',
    painPoints: [
      {
        title: 'Missed calls mean missed cases',
        description:
          'Someone calling after an accident, a DUI, or a business dispute is ready to hire. If they hit voicemail, they call the next firm on the list.',
      },
      {
        title: 'Attorney time is too valuable for intake calls',
        description:
          'Spending billable time on initial screening calls is expensive. But every screening call needs professional handling.',
      },
      {
        title: 'After-hours inquiries go cold',
        description:
          'Legal crises happen at night and on weekends. Without coverage, those potential clients retain someone else before your office opens.',
      },
      {
        title: 'Intake forms and callbacks slow the process',
        description:
          'Every delay between a call and a scheduled consultation is a chance for the potential client to retain a faster-responding competitor.',
      },
    ],
    benefits: [
      {
        title: '24/7 new client intake',
        description:
          'Pivot AI answers every call professionally, collects the client\'s name, contact info, and nature of the legal matter, and delivers a clean summary to your intake team.',
      },
      {
        title: 'Consultation scheduling on the first call',
        description:
          'Callers can book an initial consultation during the call — no callbacks, no forms, no delay.',
      },
      {
        title: 'After-hours case capture',
        description:
          'Potential clients who call evenings and weekends get a professional response and have their information captured immediately.',
      },
      {
        title: 'Consistent, professional call handling',
        description:
          'Every caller receives the same professional, empathetic greeting — ensuring consistent first impressions regardless of when they call.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI provide legal advice to callers?',
        answer:
          'No — and it won\'t. Pivot AI is configured to capture intake information and schedule consultations, not provide legal guidance. It will clearly communicate that legal advice comes from the attorney during the consultation.',
      },
      {
        question: 'Can it screen for case types we don\'t handle?',
        answer:
          'Yes. We configure the AI to identify practice areas and politely refer callers outside your specialty to appropriate resources, while capturing leads that fall within your areas of practice.',
      },
      {
        question: 'How does it handle emotionally distressed callers?',
        answer:
          'We train the AI to be calm, empathetic, and professional — collecting the necessary information without rushing. For callers in crisis, you can configure immediate escalation to a live line.',
      },
    ],
    ctaHeading: 'Never Let a Case Walk Out the Door Unanswered',
    ctaSubheading: 'See how Pivot AI handles a new client intake call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['law firm receptionist AI', 'attorney intake answering', 'legal call answering service', 'law firm lead capture'],
  },
  {
    slug: 'insurance',
    name: 'Insurance Agencies',
    shortName: 'Insurance',
    metaTitle: 'AI Receptionist for Insurance Agencies — Capture Every Policy Inquiry | Pivot AI',
    metaDescription:
      'Pivot AI answers calls for insurance agents 24/7. Capture quote requests, handle existing policy questions, and schedule follow-ups — automatically.',
    heroHeading: 'Every Policy Inquiry Captured — AI Call Answering for Insurance Agents',
    heroSubheading:
      'Pivot AI answers calls for your insurance agency 24/7, captures quote requests, routes policy questions, and schedules follow-ups — so you spend time closing, not answering phones.',
    painPoints: [
      {
        title: 'Quote inquiries come in at all hours',
        description:
          'People shop for insurance in the evening and on weekends. Without after-hours coverage, those leads go to the carrier or agency that answers first.',
      },
      {
        title: 'Policy service calls consume agent time',
        description:
          'Existing clients calling about their policy, payments, or claims take up your agents\' time that could be spent selling.',
      },
      {
        title: 'Missed callbacks erode client relationships',
        description:
          'When clients can\'t reach someone, they question whether their agent is truly available when it counts — especially during a claim.',
      },
      {
        title: 'Prospecting leads go cold quickly',
        description:
          'An inbound inquiry that doesn\'t get a response within hours is significantly less likely to convert than one answered immediately.',
      },
    ],
    benefits: [
      {
        title: '24/7 quote request capture',
        description:
          'Pivot AI captures the caller\'s coverage needs, contact information, and preferred follow-up time — delivering hot leads to your agents.',
      },
      {
        title: 'Existing client self-service',
        description:
          'Policy questions, payment reminders, and claim intake can be handled without agent involvement — freeing your team for higher-value work.',
      },
      {
        title: 'Instant lead follow-up via SMS',
        description:
          'Every inquiry gets an immediate SMS response confirming receipt and next steps — keeping leads warm and demonstrating responsiveness.',
      },
      {
        title: 'Professional first impression on every call',
        description:
          'A professional AI receptionist reinforces your agency\'s credibility — no hold music, no voicemail, just a helpful, immediate response.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI quote rates to callers?',
        answer:
          'Quoting insurance rates typically requires licensed agents and specific carrier integrations. Pivot AI is configured to capture the lead and schedule a follow-up with a licensed agent — not to generate quotes directly.',
      },
      {
        question: 'Can it handle claims calls?',
        answer:
          'Yes. We configure Pivot AI to collect initial claim information — policy number, date of incident, description — and route urgent claims to the appropriate contact or carrier line.',
      },
      {
        question: 'Does it work for independent agencies or captive agents?',
        answer:
          'Both. Pivot AI is configured to your specific carriers, products, and workflows during onboarding — whether you\'re independent or captive.',
      },
    ],
    ctaHeading: 'Stop Letting Inbound Leads Go Unanswered',
    ctaSubheading: 'See Pivot AI capture an insurance inquiry on a real call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['insurance agent call answering', 'insurance agency AI receptionist', 'insurance lead capture', 'policy inquiry answering'],
  },
  {
    slug: 'real-estate',
    name: 'Real Estate Agents',
    shortName: 'Real Estate',
    metaTitle: 'AI Receptionist for Real Estate Agents — Never Miss a Buyer or Seller Call | Pivot AI',
    metaDescription:
      'Pivot AI answers calls for real estate agents 24/7. Capture buyer and seller inquiries, schedule showings, and follow up on every lead automatically.',
    heroHeading: 'Never Miss a Buyer or Seller Call — AI Answering for Real Estate',
    heroSubheading:
      'Pivot AI answers every real estate inquiry 24/7, captures buyer and seller details, and schedules showings — so you never lose a lead because you were with another client.',
    painPoints: [
      {
        title: 'Buyers call at all hours',
        description:
          'Real estate searches happen in the evening and on weekends. If you can\'t answer, the buyer calls the agent who can.',
      },
      {
        title: 'Showings require immediate coordination',
        description:
          'Every delay in scheduling a showing is a chance for another agent to get the buyer in the door first.',
      },
      {
        title: 'Seller leads are high-stakes and time-sensitive',
        description:
          'A seller comparing agents will move quickly. A missed call can mean a listing that goes to a competitor.',
      },
      {
        title: 'Open house leads need immediate follow-up',
        description:
          'Open house visitors who call for more information expect a response within hours — not the next business day.',
      },
    ],
    benefits: [
      {
        title: '24/7 buyer and seller intake',
        description:
          'Pivot AI captures every inquiry — property address of interest, buyer vs. seller, timeline, and contact details — and delivers it to you immediately.',
      },
      {
        title: 'Showing scheduling on the call',
        description:
          'Interested buyers can request a showing and get confirmation during the call, based on your real-time availability.',
      },
      {
        title: 'Instant SMS follow-up on every lead',
        description:
          'Every caller receives an SMS confirmation, keeping the lead warm and demonstrating the responsiveness that closes deals.',
      },
      {
        title: 'After-hours coverage for weekend inquiries',
        description:
          'Open house traffic, online listing inquiries, and referral calls don\'t stop on Saturday. Pivot AI is available every hour of every day.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI give information about specific listings?',
        answer:
          'Yes. During onboarding, we build a knowledge base with your active listings, price ranges, and key features. The AI can provide high-level information and capture the lead for follow-up.',
      },
      {
        question: 'How does it handle calls from both buyers and sellers?',
        answer:
          'Pivot AI is configured to identify whether the caller is a buyer, seller, or renter and follows the appropriate intake flow for each — capturing the details most relevant to your follow-up.',
      },
      {
        question: 'Can I use it for a team or brokerage?',
        answer:
          'Yes. Pivot AI can route leads to specific agents based on property type, location, or other criteria you define during setup.',
      },
    ],
    ctaHeading: 'Capture Every Lead, Close More Deals',
    ctaSubheading: 'Watch Pivot AI handle a real estate inquiry call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['real estate agent AI', 'real estate call answering', 'realtor lead capture', 'property showing scheduling'],
  },
  {
    slug: 'automotive',
    name: 'Auto Repair Shops',
    shortName: 'Automotive',
    metaTitle: 'AI Receptionist for Auto Repair Shops — Fill Your Service Bay | Pivot AI',
    metaDescription:
      'Pivot AI answers calls for auto repair shops 24/7. Book service appointments, answer vehicle questions, and capture every lead — even while your techs are in the bay.',
    heroHeading: 'Fill Your Service Bay — AI Call Answering for Auto Repair Shops',
    heroSubheading:
      'Pivot AI answers every call for your auto shop 24/7, books service appointments, and answers vehicle questions — so your techs can stay under the hood where they belong.',
    painPoints: [
      {
        title: 'Calls come in all day while techs are working',
        description:
          'Your service advisors are busy with customers at the desk. Calls ring unanswered — and customers go to the shop that picks up.',
      },
      {
        title: 'Appointment scheduling is slow and manual',
        description:
          'Customers calling to book an oil change or tire rotation shouldn\'t need to wait on hold. Every friction point loses a customer.',
      },
      {
        title: 'After-hours calls for next-day service go nowhere',
        description:
          'Customers calling Sunday evening to drop off their car Monday morning need somewhere to leave their request. Without coverage, those calls go to voicemail or competitors.',
      },
      {
        title: 'Service questions eat up advisor time',
        description:
          '"How much is an oil change?" "Do you work on foreign cars?" These routine questions can be answered by AI, freeing your advisor for complex service interactions.',
      },
    ],
    benefits: [
      {
        title: 'Appointment booking on every call',
        description:
          'Pivot AI books service appointments directly into your schedule — oil changes, tire rotations, diagnostics — based on your available slots.',
      },
      {
        title: '24/7 service inquiry handling',
        description:
          'Customers can call anytime to ask about services, get pricing info, or drop off a vehicle — even when your shop is closed.',
      },
      {
        title: 'Vehicle and service question answering',
        description:
          'We build a knowledge base with your services, pricing, and vehicle types you work on — so the AI answers common questions accurately.',
      },
      {
        title: 'Lead capture for every call',
        description:
          'Even if a customer can\'t schedule right away, Pivot AI captures their contact info and sends an SMS follow-up, so no lead goes cold.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle calls about specific car makes and models?',
        answer:
          'Yes. You configure the vehicle types and makes you service during onboarding. The AI will confirm whether you work on a caller\'s vehicle and route the inquiry appropriately.',
      },
      {
        question: 'Can it capture vehicle information from callers?',
        answer:
          'Yes. For service appointments, Pivot AI asks for the vehicle year, make, model, and mileage — so your advisors have the details they need before the car arrives.',
      },
      {
        question: 'What if my shop is full and I can\'t take new appointments?',
        answer:
          'You control your availability. Pivot AI only books into open slots. When your calendar is full, it captures the caller\'s info and follows up when a slot opens.',
      },
    ],
    ctaHeading: 'Keep Your Bays Full With Less Phone Work',
    ctaSubheading: 'See Pivot AI book a service appointment on a real call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['auto repair call answering', 'auto shop AI receptionist', 'automotive service scheduling', 'car repair lead capture'],
  },
  {
    slug: 'restaurants',
    name: 'Restaurants',
    shortName: 'Restaurants',
    metaTitle: 'AI Phone Answering for Restaurants — Reservations, Takeout & Catering | Pivot AI',
    metaDescription:
      'Pivot AI answers restaurant calls 24/7. Handle reservations, takeout orders, catering inquiries, and hours questions — without interrupting your service staff.',
    heroHeading: 'Never Miss a Reservation or Takeout Call — AI Answering for Restaurants',
    heroSubheading:
      'Pivot AI answers restaurant phone calls 24/7 — reservations, hours, takeout info, and catering inquiries handled automatically, so your team stays focused on the guests in front of them.',
    painPoints: [
      {
        title: 'Calls during service disrupt your front-of-house team',
        description:
          'During a busy dinner rush, every phone call is a distraction from the guests in front of your staff. Missed calls mean missed reservations.',
      },
      {
        title: 'After-hours reservation requests get no response',
        description:
          'Guests look up restaurants and call for reservations in the evening and on weekends. If no one answers, they book somewhere else — or use your competitor\'s online booking.',
      },
      {
        title: 'Catering inquiries require immediate follow-up',
        description:
          'A catering opportunity can be worth thousands of dollars. If the first contact doesn\'t get a fast response, the business goes elsewhere.',
      },
      {
        title: 'Staff waste time answering repetitive questions',
        description:
          '"What are your hours?" "Do you have parking?" "Is the patio open?" These calls take your staff away from the floor — Pivot AI handles them automatically.',
      },
    ],
    benefits: [
      {
        title: 'Reservation handling 24/7',
        description:
          'Pivot AI takes reservation requests, captures guest details, and confirms bookings — even during dinner service when your staff can\'t answer.',
      },
      {
        title: 'Automatic answers for common questions',
        description:
          'Hours, location, parking, menu highlights, and dietary accommodations — all answered accurately without involving your team.',
      },
      {
        title: 'Catering inquiry capture',
        description:
          'Every catering inquiry is captured with event date, guest count, and contact details — so no large-order opportunity slips through.',
      },
      {
        title: 'Takeout and pickup information',
        description:
          'Pivot AI communicates your takeout process, hours, and order-ahead options so callers get the information they need and convert.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI take actual food orders?',
        answer:
          'Pivot AI is designed to capture order intentions and direct callers to your ordering process — whether that\'s an online ordering link, a direct staff line, or a pickup window. It does not integrate with POS systems for live order entry during the pilot phase.',
      },
      {
        question: 'Can it handle calls about special events and private dining?',
        answer:
          'Yes. We configure Pivot AI to capture private event inquiries — including the type of event, date, guest count, and budget — and route them to your events team for follow-up.',
      },
      {
        question: 'What if a caller has a specific allergy question I can\'t pre-program?',
        answer:
          'For allergy questions that go beyond what\'s in your knowledge base, Pivot AI is configured to offer a callback from a staff member who can answer with certainty — prioritizing guest safety.',
      },
    ],
    ctaHeading: 'Keep Tables Filled and Phones Off the Floor',
    ctaSubheading: 'See Pivot AI handle a restaurant reservation call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['restaurant call answering', 'restaurant AI receptionist', 'restaurant reservation AI', 'catering inquiry capture'],
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    shortName: 'Home Services',
    metaTitle: 'AI Receptionist for Home Service Companies — 24/7 Call Answering | Pivot AI',
    metaDescription:
      'Pivot AI answers calls for home service companies 24/7. Capture leads, schedule jobs, and handle emergency requests — automatically, for any home service trade.',
    heroHeading: 'Capture Every Home Service Lead — AI Call Answering for Service Pros',
    heroSubheading:
      'Pivot AI handles calls for your home service business 24/7 — capturing leads, scheduling jobs, and routing urgent requests — so your team stays focused on delivering great work.',
    painPoints: [
      {
        title: 'Technicians are on the job, not answering calls',
        description:
          'Your best people are in the field. Every call that rings while they\'re working is a lead that might walk out the door.',
      },
      {
        title: 'Emergency service requests need instant response',
        description:
          'Home service emergencies — a broken garage door, a flooded basement, a pest infestation — need immediate attention. Homeowners call the first company that answers.',
      },
      {
        title: 'Evenings and weekends generate unqualified leads',
        description:
          'Homeowners browse and call outside of business hours. Without coverage, those leads either go to voicemail or to a competitor.',
      },
      {
        title: 'Quoting and scheduling calls consume dispatcher time',
        description:
          'Routine scheduling and basic quoting questions are low-complexity but high-volume. AI handles them — freeing your dispatcher for complex coordination.',
      },
    ],
    benefits: [
      {
        title: '24/7 lead capture and qualification',
        description:
          'Every caller gets their service type, address, and urgency captured — delivered to your team as a clean, actionable lead summary.',
      },
      {
        title: 'Emergency call routing',
        description:
          'Pivot AI identifies urgent requests and sends an immediate SMS alert so your on-call team can respond within minutes.',
      },
      {
        title: 'Job scheduling without dispatcher involvement',
        description:
          'Routine service calls get booked directly into your calendar based on crew availability — reducing the load on your dispatcher.',
      },
      {
        title: 'SMS follow-up on every inquiry',
        description:
          'Every caller receives an SMS confirmation of their request, keeping the lead warm and building trust before the job is even booked.',
      },
    ],
    faqs: [
      {
        question: 'Does Pivot AI work for multi-service companies?',
        answer:
          'Yes. We configure the AI to handle multiple service categories — cleaning, pest control, garage doors, painting, etc. — with appropriate intake flows for each.',
      },
      {
        question: 'Can it handle both residential and commercial service calls?',
        answer:
          'Yes. Pivot AI can be configured to distinguish between residential and commercial inquiries and route them to the appropriate team or intake flow.',
      },
      {
        question: 'What if my service area is expanding?',
        answer:
          'We update your knowledge base and service area configuration anytime. Just contact us and we\'ll make the change — usually within one business day.',
      },
    ],
    ctaHeading: 'Be the Home Service Company That Always Picks Up',
    ctaSubheading: 'Watch Pivot AI handle a home service inquiry — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['home services call answering', 'home service AI receptionist', 'home services lead capture', 'service company call handling'],
  },
  {
    slug: 'trucking',
    name: 'Trucking & Logistics',
    shortName: 'Trucking',
    metaTitle: 'AI Receptionist for Trucking Companies — 24/7 Dispatch & Customer Calls | Pivot AI',
    metaDescription:
      'Pivot AI answers calls for trucking and logistics companies around the clock. Handle dispatch inquiries, customer service calls, and driver check-ins automatically.',
    heroHeading: '24/7 Call Handling for Trucking Companies — Without Adding Dispatch Staff',
    heroSubheading:
      'Pivot AI handles customer inquiries, load requests, and after-hours calls for your trucking business — automatically capturing details and routing urgent requests so your operations never stall.',
    painPoints: [
      {
        title: 'Customer calls come in 24/7',
        description:
          'Shippers, brokers, and receivers call at all hours to ask about loads, delivery status, and availability. Missing those calls can cost you freight.',
      },
      {
        title: 'Dispatcher bandwidth is a bottleneck',
        description:
          'Your dispatchers are coordinating loads, not answering routine questions. Every call they have to take slows down operations.',
      },
      {
        title: 'After-hours inquiries go unanswered',
        description:
          'A broker with a hot load calls at 8 PM. If no one answers, they move on to the next carrier on their list.',
      },
      {
        title: 'New freight customer calls get slow follow-up',
        description:
          'A new shipper calling to establish a carrier relationship expects a fast, professional response. Voicemail doesn\'t convey reliability.',
      },
    ],
    benefits: [
      {
        title: '24/7 customer and broker call handling',
        description:
          'Pivot AI answers every call — load inquiries, rate questions, new shipper onboarding — professionally and immediately, day or night.',
      },
      {
        title: 'Freight inquiry capture',
        description:
          'The AI captures load details — origin, destination, weight, date, and contact info — and delivers a structured summary to your dispatcher.',
      },
      {
        title: 'After-hours urgent load alerts',
        description:
          'When a shipper needs same-day or after-hours coverage, Pivot AI captures the urgency and alerts your on-call dispatcher via SMS.',
      },
      {
        title: 'Professional first impression for new shippers',
        description:
          'Every call is answered professionally, giving new shippers confidence that your company is responsive and reliable before they\'ve committed a single load.',
      },
    ],
    faqs: [
      {
        question: 'Can Pivot AI handle load status inquiries?',
        answer:
          'Pivot AI can provide standard status updates based on information your dispatcher provides to the system. For real-time GPS tracking integration, we recommend discussing your TMS software during onboarding.',
      },
      {
        question: 'Can it route calls to specific drivers or dispatchers?',
        answer:
          'Yes. You configure routing rules — by load type, region, urgency, or time of day — and Pivot AI routes alerts and transfers accordingly.',
      },
      {
        question: 'Does it work for owner-operators as well as fleets?',
        answer:
          'Yes. Pivot AI works for businesses of any size — from a single owner-operator looking for a professional answering solution to a multi-truck fleet handling high call volume.',
      },
    ],
    ctaHeading: 'Keep the Freight Moving — Even After Hours',
    ctaSubheading: 'See how Pivot AI handles a freight inquiry call — 14-day free trial, no credit card required.',
    jsonLdKeywords: ['trucking call answering', 'logistics AI receptionist', 'freight inquiry answering', 'trucking dispatch AI'],
  },
]

export const industryMap = Object.fromEntries(
  industries.map((ind) => [ind.slug, ind])
)

export function getIndustry(slug: string): IndustryData | undefined {
  return industryMap[slug]
}
