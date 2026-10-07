import { EVENT } from "@/lib/data"

export default function QRPosterPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-4">QR Poster</h1>
      <div className="bg-white rounded-xl border shadow-sm p-8 text-center space-y-6">
        <div className="flex justify-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#FEDB00] flex items-center justify-center font-bold text-[#211F20]">TIQ</div>
        </div>
        <h2 className="text-2xl font-bold">{EVENT.name}</h2>
        <p className="text-muted-foreground">{EVENT.date} · {EVENT.location}</p>
        <p className="text-sm">Scan the QR code to submit your information and schedule an interview.</p>

        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-400 text-sm">
            QR Code Placeholder
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>1. Scan the QR code with your phone camera</p>
          <p>2. Fill out the intake form</p>
          <p>3. Upload your resume</p>
          <p>4. A recruiter will follow up shortly</p>
        </div>
      </div>
    </div>
  )
}
