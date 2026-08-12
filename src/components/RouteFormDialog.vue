<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { DestinationKind, RoutingRule, TargetKind } from '@/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  initial?: RoutingRule | null
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [rule: RoutingRule]
}>()

const TARGET_KINDS: TargetKind[] = ['cidr', 'ip', 'nic', 'mac']
const DESTINATION_KINDS: DestinationKind[] = ['ip', 'nic', 'mac']

const form = reactive<{
  target: TargetKind
  'target-value': string
  destination: DestinationKind
  'destination-value': string
}>({
  target: 'cidr',
  'target-value': '',
  destination: 'ip',
  'destination-value': '',
})

const title = computed(() => (props.mode === 'create' ? 'Add route' : 'Edit route'))

watch(
  () => [props.open, props.initial] as const,
  ([open]) => {
    if (!open) return
    if (props.initial) {
      form.target = props.initial.target
      form['target-value'] = props.initial['target-value']
      form.destination = props.initial.destination
      form['destination-value'] = props.initial['destination-value']
    } else {
      form.target = 'cidr'
      form['target-value'] = ''
      form.destination = 'ip'
      form['destination-value'] = ''
    }
  },
  { immediate: true },
)

function onOpenChange(value: boolean) {
  emit('update:open', value)
}

function onSubmit() {
  emit('submit', {
    target: form.target,
    'target-value': form['target-value'].trim(),
    destination: form.destination,
    'destination-value': form['destination-value'].trim(),
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          Target selects traffic; destination is where matched packets are sent.
          Saving restarts the Roust service when it is running.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 py-2" @submit.prevent="onSubmit">
        <div class="grid gap-2">
          <Label for="target">Target kind</Label>
          <Select v-model="form.target">
            <SelectTrigger id="target" class="w-full">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="kind in TARGET_KINDS" :key="kind" :value="kind">
                {{ kind }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="target-value">Target value</Label>
          <Input
            id="target-value"
            v-model="form['target-value']"
            placeholder="e.g. 10.0.0.0/8 or 8.8.8.8"
            required
            autocomplete="off"
          />
        </div>

        <div class="grid gap-2">
          <Label for="destination">Destination kind</Label>
          <Select v-model="form.destination">
            <SelectTrigger id="destination" class="w-full">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="kind in DESTINATION_KINDS"
                :key="kind"
                :value="kind"
              >
                {{ kind }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="destination-value">Destination value</Label>
          <Input
            id="destination-value"
            v-model="form['destination-value']"
            placeholder="e.g. 192.168.1.1"
            required
            autocomplete="off"
          />
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button type="button" variant="outline" @click="onOpenChange(false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : mode === 'create' ? 'Add route' : 'Save changes' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
