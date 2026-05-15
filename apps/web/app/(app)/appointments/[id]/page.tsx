export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointment</h1>
      <p className="text-gray-500">Implemented in Issue #5 — appointment id: {params.id}</p>
    </div>
  )
}
