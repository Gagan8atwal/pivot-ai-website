import { CheckCircle2, X } from 'lucide-react'

const comparisonRows = [
  { label: 'Available 24/7', pivotAi: true, answeringService: false, voicemail: false },
  { label: 'Books appointments automatically', pivotAi: true, answeringService: false, voicemail: false },
  { label: 'Sends SMS follow-up to callers', pivotAi: true, answeringService: false, voicemail: false },
  { label: 'Knows your business & services', pivotAi: true, answeringService: 'Scripted only', voicemail: false },
  { label: 'Notifies you in real time', pivotAi: true, answeringService: true, voicemail: false },
  { label: 'No per-call overage fees', pivotAi: true, answeringService: false, voicemail: true },
  { label: 'Starts at $49/month', pivotAi: true, answeringService: false, voicemail: true },
  { label: 'Founder-led onboarding', pivotAi: true, answeringService: false, voicemail: false },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <td className="px-4 py-3.5 text-center">
        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" aria-label="Yes" />
      </td>
    )
  }
  if (value === false) {
    return (
      <td className="px-4 py-3.5 text-center">
        <X className="h-4 w-4 text-slate-300 mx-auto" aria-label="No" />
      </td>
    )
  }
  return (
    <td className="px-4 py-3.5 text-center">
      <span className="text-xs text-slate-400">{value}</span>
    </td>
  )
}

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            How We Compare
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Why Pivot AI beats the alternatives
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Traditional answering services cost more and do less. Voicemail loses leads.
            Pivot AI is purpose-built for local service businesses — always on, always capturing.
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide w-1/2">
                  Feature
                </th>
                <th className="px-4 py-3 text-center bg-navy-900 text-amber-400 font-bold rounded-t-xl text-sm">
                  Pivot AI
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium text-xs">
                  Answering Service
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium text-xs">
                  Voicemail
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="px-4 py-3.5 text-navy-900 font-medium text-sm">
                    {row.label}
                  </td>
                  <td className="px-4 py-3.5 text-center bg-navy-900/5">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" aria-label="Yes" />
                  </td>
                  <Cell value={row.answeringService} />
                  <Cell value={row.voicemail} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              heading: 'Pilot Program',
              body: 'We\'re onboarding our first cohort of local service businesses. Every pilot customer works directly with our founding team.',
            },
            {
              heading: 'Founder-led',
              body: 'Your AI receptionist is configured personally by the founders — not outsourced or automated onboarding.',
            },
            {
              heading: 'Honest early access',
              body: 'We\'re transparent about being early stage. Our focus is delivering real results for the businesses we onboard.',
            },
          ].map(({ heading, body }) => (
            <div key={heading} className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-sm">
              <p className="text-base font-bold text-navy-900 mb-2">{heading}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
