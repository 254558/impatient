<template>
  <!-- 关键调整：去掉 max-w-4xl mx-auto 等限制宽度和居中的类，添加 style 让其占满屏幕 -->
  <div 
    style="min-height: 100vh; background-color: white;"
    class="p-6 md:p-8 bg-white shadow-xl border border-gray-100"
  >
    <div class="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-8">
      <div
        class="h-full transition-all duration-500 ease-in-out"
        :style="{
          width: (patience / maxPatience * 100) + '%',
          backgroundColor: progressBarColor
        }"
      ></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 生存 -->
      <section class="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">
          <i class="fas fa-shield-alt text-blue-500 mr-1"></i>生存
        </h3>
        <ul class="mb-3 space-y-1">
          <li v-if="surviveTasks.length === 0" class="text-gray-400 italic">暂无事项</li>
          <li
            v-for="(item, index) in surviveTasks"
            :key="index"
            class="flex justify-between items-center text-gray-800"
          >
            <span>{{ item.text }}（{{ item.cost > 0 ? '+' : '' }}{{ item.cost }}）</span>
            <button @click="removeSurviveTask(index)" class="text-red-500 hover:text-red-700 transition">
              <i class="fas fa-trash"></i>
            </button>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <input
            v-model="surviveInput"
            class="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[120px] text-black"
            placeholder="事项"
          />
          <input
            v-model.number="surviveCost"
            type="number"
            class="border border-gray-300 rounded-md px-3 py-2 w-36 text-black"
            placeholder="耐烦"
          />
          <button
            @click="addSurviveTask"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center gap-1"
          >
            <i class="fas fa-plus"></i> 添加
          </button>
        </div>
        <p v-if="surviveInput && surviveCost === null" class="text-red-500 text-sm mt-1">
          请输入一个数值
        </p>
      </section>

      <!-- 生活 -->
      <section class="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">
          <i class="fas fa-heart text-pink-500 mr-1"></i>生活
        </h3>
        <ul class="mb-3 space-y-1">
          <li v-if="lifeTasks.length === 0" class="text-gray-400 italic">暂无事项</li>
          <li
            v-for="(item, index) in lifeTasks"
            :key="index"
            class="flex justify-between items-center text-gray-800"
          >
            <span>{{ item.text }}（{{ item.cost > 0 ? '+' : '' }}{{ item.cost }}）</span>
            <button @click="removeLifeTask(index)" class="text-red-500 hover:text-red-700 transition">
              <i class="fas fa-trash"></i>
            </button>
          </li>
        </ul>
        <div class="flex flex-wrap gap-2">
          <input
            v-model="lifeInput"
            class="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[120px] text-black"
            placeholder="事项"
          />
          <input
            v-model.number="lifeCost"
            type="number"
            class="border border-gray-300 rounded-md px-3 py-2 w-36 text-black"
            placeholder="耐烦度"
          />
          <button
            @click="addLifeTask"
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center gap-1"
          >
            <i class="fas fa-plus"></i> 添加
          </button>
        </div>
        <p v-if="lifeInput && lifeCost === null" class="text-red-500 text-sm mt-1">
          请输入一个数值
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const maxPatience = 100
const patience = ref(30) // 初始耐烦度

const surviveTasks = ref([])
const lifeTasks = ref([])

const surviveInput = ref('')
const surviveCost = ref(null)

const lifeInput = ref('')
const lifeCost = ref(null)

const STORAGE_KEY = 'patience-data'

// 获取今天的日期字符串 (YYYY-MM-DD)
function todayKey() {
  return new Date().toISOString().split('T')[0]
}

// 判断日期是否在一年内
function isWithinOneYear(dateStr) {
  if (!dateStr) return false
  
  const savedDate = new Date(dateStr)
  const today = new Date()
  
  // 计算时间差（毫秒）
  const diffMs = today - savedDate
  // 转换为天数
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  // 判断是否在365天内
  return diffDays <= 365
}

function saveToLocalStorage() {
  const data = {
    date: todayKey(),
    patience: patience.value,
    surviveTasks: surviveTasks.value,
    lifeTasks: lifeTasks.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (data && isWithinOneYear(data.date)) {
    // 数据在一年内，正常加载
    patience.value = data.patience
    surviveTasks.value = data.surviveTasks
    lifeTasks.value = data.lifeTasks
  } else {
    // 数据超过一年或无效，重置数据
    localStorage.removeItem(STORAGE_KEY)
    resetData()
  }
}

// 重置数据到初始状态
function resetData() {
  patience.value = 30
  surviveTasks.value = []
  lifeTasks.value = []
}

onMounted(loadFromLocalStorage)
watch([patience, surviveTasks, lifeTasks], saveToLocalStorage, { deep: true })

// 通用添加函数
function addTask(listRef, inputRef, costRef) {
  const cost = Number(costRef.value)
  if (inputRef.value.trim() !== '' && Number.isFinite(cost)) {
    listRef.value.push({ text: inputRef.value.trim(), cost })
    patience.value = Math.min(maxPatience, Math.max(0, patience.value + cost))
    inputRef.value = ''
    costRef.value = null
  }
}

// 模板用添加函数
function addSurviveTask() {
  addTask(surviveTasks, surviveInput, surviveCost)
}
function addLifeTask() {
  addTask(lifeTasks, lifeInput, lifeCost)
}

// 单独删除函数，确保响应式正确
function removeSurviveTask(index) {
  const cost = surviveTasks.value[index].cost
  patience.value = Math.min(maxPatience, Math.max(0, patience.value - cost))
  surviveTasks.value.splice(index, 1)
}

function removeLifeTask(index) {
  const cost = lifeTasks.value[index].cost
  patience.value = Math.min(maxPatience, Math.max(0, patience.value - cost))
  lifeTasks.value.splice(index, 1)
}

// 进度条颜色
const progressBarColor = computed(() => {
  if (patience.value > 70) return '#22c55e' // 绿
  if (patience.value > 40) return '#facc15' // 黄
  return '#ef4444' // 红
})
</script>    