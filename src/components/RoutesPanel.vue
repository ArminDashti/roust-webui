<script setup lang="ts">
import type { RouteItem } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Plus, Route, Trash2 } from 'lucide-vue-next'

defineProps<{
  routes: RouteItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  add: []
  edit: [route: RouteItem]
  remove: [route: RouteItem]
}>()
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-start justify-between gap-4 space-y-0">
      <div class="space-y-1.5">
        <CardTitle class="flex items-center gap-2">
          <Route class="size-5" />
          Routes
        </CardTitle>
        <CardDescription>
          Packet routing rules from <code class="text-xs">routes.json</code>
        </CardDescription>
      </div>
      <Button size="sm" @click="emit('add')">
        <Plus class="size-4" />
        Add route
      </Button>
    </CardHeader>
    <CardContent>
      <div v-if="loading && routes.length === 0" class="text-sm text-muted-foreground">
        Loading routes…
      </div>
      <div v-else-if="routes.length === 0" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No routes yet. Add a CIDR or IP rule to get started.
      </div>
      <div v-else class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-14">#</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead class="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="route in routes" :key="route.index">
              <TableCell class="font-mono text-muted-foreground">
                {{ route.index }}
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{{ route.target }}</Badge>
                  <span class="font-mono text-sm">{{ route['target-value'] }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{{ route.destination }}</Badge>
                  <span class="font-mono text-sm">{{ route['destination-value'] }}</span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Edit"
                    @click="emit('edit', route)"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Delete"
                    @click="emit('remove', route)"
                  >
                    <Trash2 class="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
