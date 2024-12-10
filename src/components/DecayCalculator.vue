<template>
  <main class="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Decay Calculations</h2>
    <form @submit.prevent="calculate">
      <div class="mb-6">
        <label for="cboElement" class="block mb-2 text-gray-700 font-medium">Select Element</label>
        <select id="cboElement" v-model="selectedElement" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors" @change="updateIsotopes">
          <option v-for="element in elements" :key="element" :value="element">
            {{ element }}
          </option>
        </select>
      </div>

      <div class="mb-6">
        <label for="cboIsotopes" class="block mb-2 text-gray-700 font-medium">Select Isotope</label>
        <select id="cboIsotopes" v-model="selectedIsotope" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors" @change="updateHalfLife">
          <option v-for="isotope in isotopes" :key="isotope.id" :value="isotope.id">
            {{ isotope.name }}
          </option>
        </select>
      </div>

      <div class="mb-6">
        <label for="txtHLife" class="block mb-2 text-gray-700 font-medium">Half Life (Days)</label>
        <input type="number" id="txtHLife" v-model="halfLife" min="0" step="any" readonly class="w-full p-3 border border-gray-300 rounded-md text-base bg-gray-50">
      </div>

      <div class="mb-6">
        <label for="txtOrigDate" class="block mb-2 text-gray-700 font-medium">Original Date and/or Time</label>
        <input type="datetime-local" id="txtOrigDate" v-model="originalDate" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors">
      </div>

      <div class="mb-6">
        <label for="txtCalcDate" class="block mb-2 text-gray-700 font-medium">Calculation Date and/or Time</label>
        <input type="datetime-local" id="txtCalcDate" v-model="calculationDate" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors">
      </div>

      <div class="mb-6">
        <label for="cboActivityUnits2" class="block mb-2 text-gray-700 font-medium">Activity Units</label>
        <select id="cboActivityUnits2" v-model="activityUnits" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors">
          <option value="Bq">Bq (Becquerel)</option>
          <option value="kBq">kBq (kiloBecquerel)</option>
          <option value="MBq">MBq (MegaBecquerel)</option>
          <option value="GBq">GBq (GigaBecquerel)</option>
          <option value="TBq">TBq (TeraBecquerel)</option>
          <option value="PBq">PBq (PetaBecquerel)</option>
          <option value="µCi">µCi (microCurie)</option>
          <option value="mCi">mCi (milliCurie)</option>
          <option value="Ci">Ci (Curie)</option>
          <option value="kCi">kCi (kiloCurie)</option>
          <option value="MCi">MCi (MegaCurie)</option>
        </select>
      </div>

      <div class="mb-6">
        <label for="txtOrigActivity" class="block mb-2 text-gray-700 font-medium">Original Activity</label>
        <input type="number" id="txtOrigActivity" v-model="originalActivity" min="0" step="any" class="w-full p-3 border border-gray-300 rounded-md text-base bg-white focus:outline-none focus:border-green-500 transition-colors">
      </div>

      <button type="submit" class="w-full bg-green-500 text-white py-3 px-6 rounded-md text-base cursor-pointer hover:bg-green-600 transition-colors">
        Calculate
      </button>
    </form>

    <div v-if="calculatedActivity" class="mt-8 pt-8 border-t border-gray-200">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Results</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <label class="font-semibold text-gray-700">Calculated Activity:</label>
          <span>{{ formatActivity(calculatedActivity, activityUnits) }}</span>
        </div>
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <label class="font-semibold text-gray-700">Time Elapsed:</label>
          <span>{{ timeElapsed }} days ({{ halfLivesElapsed }} half-lives)</span>
        </div>
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <label class="font-semibold text-gray-700">Decay Constant (λ):</label>
          <span>{{ decayConstant }} per day</span>
        </div>
        <div class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <label class="font-semibold text-gray-700">Activity Ratio:</label>
          <span>{{ activityRatio }}% of original</span>
        </div>
      </div>
      <div class="relative w-full" style="max-height: 60vh">
        <canvas ref="decayChart" class="w-full h-full"></canvas>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { getAllElements, getIsotopesForElement, getHalfLifeInDays } from '../js/isotopes'
import { convertActivity, formatActivity } from '../js/units'
import { calculateDecayChain, getIsotopeColors } from '../js/decay-chains'

export default {
  name: 'DecayCalculator',
  setup() {
    // State
    const elements = ref(getAllElements())
    const selectedElement = ref('')
    const isotopes = ref([])
    const selectedIsotope = ref('')
    const halfLife = ref(0)
    const originalDate = ref('')
    const calculationDate = ref('')
    const activityUnits = ref('Bq')
    const originalActivity = ref(0)
    const calculatedActivity = ref(null)
    const timeElapsed = ref(0)
    const halfLivesElapsed = ref(0)
    const decayConstant = ref(0)
    const activityRatio = ref(0)
    const chart = ref(null)
    const decayChart = ref(null)

    // Methods
    const updateIsotopes = () => {
      isotopes.value = getIsotopesForElement(selectedElement.value)
      selectedIsotope.value = isotopes.value[0]?.id || ''
      updateHalfLife()
    }

    const updateHalfLife = () => {
      const isotope = isotopes.value.find(i => i.id === selectedIsotope.value)
      if (isotope) {
        halfLife.value = getHalfLifeInDays(isotope.halfLife, isotope.unit)
      }
    }

    const createOrUpdateChart = (results, unit) => {
      if (!decayChart.value) return

      if (chart.value) {
        chart.value.destroy()
      }

      const isotopes = Object.keys(results.activities)
      const colors = getIsotopeColors(isotopes)

      const datasets = isotopes.map(isotope => ({
        label: isotope,
        data: results.activities[isotope],
        borderColor: colors[isotope],
        backgroundColor: colors[isotope] + '20',
        fill: true,
        tension: 0.4
      }))

      chart.value = new Chart(decayChart.value, {
        type: 'line',
        data: {
          labels: results.timePoints.map(t => t.toFixed(1)),
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: true,
              text: 'Decay Chain Activity vs Time',
              font: {
                size: 16
              }
            },
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 8
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw
                  return `${context.dataset.label}: ${formatActivity(value, unit)}`
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time (days)'
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                autoSkipPadding: 10
              }
            },
            y: {
              title: {
                display: true,
                text: `Activity (${unit})`
              },
              type: 'logarithmic',
              ticks: {
                callback: function(value) {
                  return formatActivity(value, unit, true)
                }
              }
            }
          }
        }
      })
    }

    const calculate = () => {
      if (!selectedIsotope.value || !originalDate.value || !calculationDate.value || !originalActivity.value) {
        alert('Please fill in all required fields')
        return
      }

      const origDate = new Date(originalDate.value)
      const calcDate = new Date(calculationDate.value)
      const timeDiff = (calcDate - origDate) / (1000 * 60 * 60 * 24)

      // Generate time points for the chart (100 points)
      const timePoints = Array.from({length: 100}, (_, i) => i * (timeDiff / 99))

      // Calculate decay chain
      const chainResults = calculateDecayChain(originalActivity.value, selectedIsotope.value, timePoints)

      if (chainResults) {
        const finalActivity = chainResults.activities[selectedIsotope.value][chainResults.timePoints.length - 1]
        calculatedActivity.value = finalActivity

        timeElapsed.value = Math.abs(timeDiff)
        halfLivesElapsed.value = timeElapsed.value / halfLife.value
        decayConstant.value = (Math.log(2)/halfLife.value).toExponential(3)
        activityRatio.value = (finalActivity/originalActivity.value * 100).toFixed(2)

        createOrUpdateChart(chainResults, activityUnits.value)
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      selectedElement.value = elements.value[0]
      updateIsotopes()
      
      // Set current time as default calculation date
      const now = new Date()
      calculationDate.value = now.toISOString().slice(0, 16)
    })

    return {
      elements,
      selectedElement,
      isotopes,
      selectedIsotope,
      halfLife,
      originalDate,
      calculationDate,
      activityUnits,
      originalActivity,
      calculatedActivity,
      timeElapsed,
      halfLivesElapsed,
      decayConstant,
      activityRatio,
      decayChart,
      updateIsotopes,
      updateHalfLife,
      calculate,
      formatActivity
    }
  }
}
</script>
