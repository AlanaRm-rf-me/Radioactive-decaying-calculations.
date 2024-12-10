<template>
  <div class="max-w-7xl mx-auto p-8 font-normal">
    <header class="text-center text-gray-800 mb-8">
      <h1 class="text-4xl font-bold">Radioactive Decay Calculator</h1>
      <div class="text-lg text-gray-600 mt-4">
        Current Time: {{ formattedTime }}
      </div>
    </header>
    <DecayCalculator />
  </div>
</template>

<script>
import DecayCalculator from './components/DecayCalculator.vue'

export default {
  name: 'App',
  components: {
    DecayCalculator
  },
  data() {
    return {
      timestamp: '2024-12-09T14:57:41-08:00'
    }
  },
  computed: {
    formattedTime() {
      const date = new Date(this.timestamp)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }).format(date)
    }
  }
}
</script>
