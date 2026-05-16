import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Project } from "@vertgrow/database/types"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  const list = (projects ?? []) as Project[]

  const STATUS_BADGE: Record<Project["status"], { bg: string; text: string; label: string }> = {
    planning:    { bg: "bg-[#fef9c3]",     text: "text-[#854d0e]",      label: "Planning"     },
    in_progress: { bg: "bg-vg-green-light", text: "text-vg-green-dark",  label: "In Progress"  },
    completed:   { bg: "bg-[#dce2f3]",     text: "text-vg-body",        label: "Completed"    },
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Projects</h1>
          <p className="mt-1 text-base text-vg-body">Track installations, plant lists, and project progress.</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 self-start sm:self-auto bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-vg-green transition-colors shrink-0"
        >
          <PlusIcon />
          New Project
        </Link>
      </div>

      {/* Content */}
      {list.length === 0 ? (
        <div className="bg-white border border-vg-border rounded-xl shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
          <div className="size-16 rounded-full bg-vg-green-light flex items-center justify-center">
            <FolderIcon />
          </div>
          <div>
            <p className="text-lg font-semibold text-vg-heading">No projects yet</p>
            <p className="text-sm text-vg-body mt-1 max-w-xs">
              Create your first project to track installations, plant selections, and progress from start to finish.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-vg-green transition-colors"
          >
            <PlusIcon />
            Create first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => {
            const badge = STATUS_BADGE[project.status]
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white border border-vg-border rounded-xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-vg-green transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-vg-heading leading-snug">{project.title}</p>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                {project.notes && (
                  <p className="text-xs text-vg-body line-clamp-2">{project.notes}</p>
                )}
                <p className="text-[11px] text-vg-muted mt-auto">
                  Created {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}
