export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Project</h1>
      <p className="text-gray-500">Implemented via /new-feature — project id: {params.id}</p>
    </div>
  )
}
