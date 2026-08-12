<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  api,
  type RouteItem,
  type RoutingRule,
  type StatusResponse,
} from '@/api/client'
import RouteFormDialog from '@/components/RouteFormDialog.vue'
import RoutesPanel from '@/components/RoutesPanel.vue'
import StatusPanel from '@/components/StatusPanel.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

const status = ref<StatusResponse | null>(null)
const routes = ref<RouteItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editing = ref<RouteItem | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const [nextStatus, nextRoutes] = await Promise.all([
      api.getStatus(),
      api.listRoutes(),
    ])
    status.value = nextStatus
    routes.value = nextRoutes
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialogMode.value = 'create'
  editing.value = null
  formError.value = null
  dialogOpen.value = true
}

function openEdit(route: RouteItem) {
  dialogMode.value = 'edit'
  editing.value = route
  formError.value = null
  dialogOpen.value = true
}

async function onSubmit(rule: RoutingRule) {
  saving.value = true
  formError.value = null
  try {
    if (dialogMode.value === 'create') {
      await api.createRoute(rule)
    } else if (editing.value) {
      await api.updateRoute(editing.value.index, rule)
    }
    dialogOpen.value = false
    await refresh()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
  }
}

async function onRemove(route: RouteItem) {
  const label = `${route.target}:${route['target-value']} → ${route.destination}:${route['destination-value']}`
  if (!window.confirm(`Delete route?\n\n${label}`)) return
  error.value = null
  try {
    await api.deleteRoute(route.index)
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

onMounted(refresh)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">Roust</h1>
          <p class="text-sm text-muted-foreground">
            Windows packet router — service status and route management
          </p>
        </div>
        <Button variant="outline" size="sm" :disabled="loading" @click="refresh">
          <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </div>
    </header>

    <main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <Alert v-if="error" variant="destructive">
        <AlertCircle class="size-4" />
        <AlertTitle>Could not reach API</AlertTitle>
        <AlertDescription>
          {{ error }}
          <span class="mt-1 block text-xs opacity-90">
            Ensure <code>roust-api</code> is running and
            <code>VITE_API_PROXY_TARGET</code> points at it.
          </span>
        </AlertDescription>
      </Alert>

      <StatusPanel :status="status" :loading="loading" />
      <RoutesPanel
        :routes="routes"
        :loading="loading"
        @add="openCreate"
        @edit="openEdit"
        @remove="onRemove"
      />
    </main>

    <RouteFormDialog
      v-model:open="dialogOpen"
      :mode="dialogMode"
      :initial="editing"
      :saving="saving"
      :error="formError"
      @submit="onSubmit"
    />
  </div>
</template>
