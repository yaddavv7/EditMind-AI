import fs from "fs";
import path from "path";
import { Project, SourceAsset, RenderJob, ProjectVersion, EditDecisionList } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const RENDER_JOBS_FILE = path.join(DATA_DIR, "render_jobs.json");
const PREFERENCES_FILE = path.join(DATA_DIR, "preferences.json");

// Ensure directories exist
function ensureDirs() {
  const dirs = [
    DATA_DIR,
    path.join(process.cwd(), "public", "uploads"),
    path.join(process.cwd(), "public", "renders"),
    path.join(process.cwd(), "public", "audio"),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// In-memory cache with disk sync
let projectsCache: Record<string, Project> | null = null;
let renderJobsCache: Record<string, RenderJob> | null = null;

function loadProjects(): Record<string, Project> {
  if (projectsCache) return projectsCache;
  ensureDirs();
  if (fs.existsSync(PROJECTS_FILE)) {
    try {
      const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
      projectsCache = JSON.parse(data);
      return projectsCache!;
    } catch {
      projectsCache = {};
    }
  } else {
    projectsCache = {};
  }
  return projectsCache;
}

function saveProjects(projects: Record<string, Project>) {
  ensureDirs();
  projectsCache = projects;
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

function loadRenderJobs(): Record<string, RenderJob> {
  if (renderJobsCache) return renderJobsCache;
  ensureDirs();
  if (fs.existsSync(RENDER_JOBS_FILE)) {
    try {
      const data = fs.readFileSync(RENDER_JOBS_FILE, "utf-8");
      renderJobsCache = JSON.parse(data);
      return renderJobsCache!;
    } catch {
      renderJobsCache = {};
    }
  } else {
    renderJobsCache = {};
  }
  return renderJobsCache;
}

function saveRenderJobs(jobs: Record<string, RenderJob>) {
  ensureDirs();
  renderJobsCache = jobs;
  fs.writeFileSync(RENDER_JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

export const ProjectStorage = {
  getAll: (): Project[] => {
    const map = loadProjects();
    return Object.values(map).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById: (id: string): Project | null => {
    const map = loadProjects();
    return map[id] || null;
  },

  save: (project: Project): Project => {
    const map = loadProjects();
    project.updatedAt = new Date().toISOString();
    map[project.id] = project;
    saveProjects(map);
    return project;
  },

  delete: (id: string): boolean => {
    const map = loadProjects();
    if (map[id]) {
      delete map[id];
      saveProjects(map);
      return true;
    }
    return false;
  },

  duplicate: (id: string): Project | null => {
    const original = ProjectStorage.getById(id);
    if (!original) return null;

    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: Project = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return ProjectStorage.save(duplicated);
  },

  addAsset: (projectId: string, asset: SourceAsset): Project | null => {
    const project = ProjectStorage.getById(projectId);
    if (!project) return null;
    project.assets = [...project.assets, asset];
    return ProjectStorage.save(project);
  },

  removeAsset: (projectId: string, assetId: string): Project | null => {
    const project = ProjectStorage.getById(projectId);
    if (!project) return null;
    project.assets = project.assets.filter((a) => a.id !== assetId);
    return ProjectStorage.save(project);
  },

  addVersion: (projectId: string, title: string, changeSummary: string, edl: EditDecisionList): Project | null => {
    const project = ProjectStorage.getById(projectId);
    if (!project) return null;
    const newVersion: ProjectVersion = {
      id: `ver_${Date.now()}`,
      versionNumber: (project.versions?.length || 0) + 1,
      title,
      changeSummary,
      createdAt: new Date().toISOString(),
      edl: JSON.parse(JSON.stringify(edl)),
    };
    project.versions = [newVersion, ...(project.versions || [])];
    return ProjectStorage.save(project);
  },
};

export const RenderJobStorage = {
  create: (job: RenderJob): RenderJob => {
    const map = loadRenderJobs();
    map[job.id] = job;
    saveRenderJobs(map);
    return job;
  },

  getById: (id: string): RenderJob | null => {
    const map = loadRenderJobs();
    return map[id] || null;
  },

  update: (id: string, updates: Partial<RenderJob>): RenderJob | null => {
    const map = loadRenderJobs();
    if (!map[id]) return null;
    map[id] = { ...map[id], ...updates };
    saveRenderJobs(map);
    return map[id];
  },

  getByProject: (projectId: string): RenderJob[] => {
    const map = loadRenderJobs();
    return Object.values(map)
      .filter((j) => j.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
