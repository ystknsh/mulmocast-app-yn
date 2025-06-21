<template>
  <Layout>
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <button
              @click="
                showNewProjectDialog = true;
                newProjectName = '';
              "
              class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus class="w-5 h-5" />
              <span>Create New</span>
            </button>
            <div class="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600',
                ]"
              >
                <List class="w-5 h-5" />
              </button>
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600',
                ]"
              >
                <Grid class="w-5 h-5" />
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-500">{{ projects.length }} projects</div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="text-gray-500">Loading projects...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="projects.length === 0" class="text-center py-16">
          <p class="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
        </div>

        <!-- Project List -->
        <div v-else-if="viewMode === 'list'">
          <ListView :projects="sortedProjects" @open="handleOpenProject" @delete="handleDeleteProject" />
        </div>

        <!-- Project Grid -->
        <div v-else>
          <GridView :projects="sortedProjects" @open="handleOpenProject" @delete="handleDeleteProject" />
        </div>
      </div>
    </div>

    <!-- New Project Dialog -->
    <NewProjectDialog
      v-if="showNewProjectDialog"
      v-model="newProjectName"
      :creating="creating"
      @create="handleCreateProject"
      @cancel="handleCancelDialog"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Plus, List, Grid } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Layout from "@/components/layout.vue";
import ListView from "./components/list_view.vue";
import GridView from "./components/grid_view.vue";
import NewProjectDialog from "./components/new_project_dialog.vue";
import { projectApi, type Project } from "@/lib/project_api";
import dayjs from "dayjs";

const router = useRouter();
const viewMode = ref<"list" | "grid">("list");
const projects = ref<Project[]>([]);
const loading = ref(true);
const showNewProjectDialog = ref(false);
const creating = ref(false);
const newProjectName = ref("");

const loadProjects = async () => {
  try {
    loading.value = true;
    projects.value = await projectApi.list();
  } catch (error) {
    console.error("Failed to load projects:", error);
  } finally {
    loading.value = false;
  }
};

const sortedProjects = computed(() => {
  return projects.value.toSorted((a, b) => {
    return dayjs(b.metadata.updatedAt).valueOf() - dayjs(a.metadata.updatedAt).valueOf();
  });
});

const handleCreateProject = async () => {
  const title = newProjectName.value.trim() || "[untitled]";

  try {
    creating.value = true;
    const project = await projectApi.create(title);
    // Close dialog and refresh project list
    showNewProjectDialog.value = false;
    newProjectName.value = "";
    await loadProjects();
    // Navigate to the new project
    router.push(`/project/${project.metadata.id}`);
  } catch (error) {
    console.error("Failed to create project:", error);
    alert("Failed to create project. Please try again.");
  } finally {
    creating.value = false;
  }
};

const handleCancelDialog = () => {
  showNewProjectDialog.value = false;
  newProjectName.value = "";
  creating.value = false;
};

// TODO remove this
const handleOpenProject = (project: Project) => {
  router.push(`/project/${project.metadata.id}`);
};

const handleDeleteProject = async (project: Project) => {
  if (confirm(`Are you sure you want to delete "${project.metadata.title}"?`)) {
    try {
      await projectApi.delete(project.metadata.id);
      await loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    }
  }
};

onMounted(() => {
  loadProjects();
});
</script>
