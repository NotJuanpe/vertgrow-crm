export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Client</h1>
      <p className="text-gray-500">Implemented in Issue #3 — client id: {params.id}</p>
    </div>
  )
}
