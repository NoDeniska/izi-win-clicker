<script setup>
import bottomBar from '../components/bottomBar.vue'
import { useUserStore } from '@/stores/user'
import { ref, onMounted, onUnmounted } from 'vue'

const userStore = useUserStore()
const isAnimating = ref(false)
const clickInterval = ref(null)
const lastClickTime = ref(0)
const clickTimestamps = ref([])
const isBlocked = ref(false)

// Константы
const MAX_CPS = 16
const PENALTY_TIME = 10000

// Геттеры
const profilePhoto = computed(() => userStore.user?.photo_url || '../assets/default-avatar.png')
const userName = computed(() => userStore.user?.first_name || 'Гость')
const userId = computed(() => userStore.user?.id)

const handleCoinClick = (e) => {
  const now = Date.now()

  // Проверка блокировки
  if (isBlocked.value || isAnimating.value) {
    e.preventDefault()
    return
  }

  // Проверка скорости кликов
  clickTimestamps.value.push(now)
  clickTimestamps.value = clickTimestamps.value.filter((t) => now - t < 1000)

  if (clickTimestamps.value.length > MAX_CPS) {
    blockUserTemporarily()
    return
  }

  // Защита от двойных кликов
  if (now - lastClickTime.value < 100) return
  lastClickTime.value = now

  // Обработка клика
  isAnimating.value = true
  userStore.addClick()

  setTimeout(() => {
    isAnimating.value = false
  }, 50)
}

const blockUserTemporarily = () => {
  isBlocked.value = true
  setTimeout(() => {
    isBlocked.value = false
    clickTimestamps.value = []
  }, PENALTY_TIME)
}

const startClickInterval = () => {
  clickInterval.value = setInterval(() => {
    if (userId.value && userStore.clickCount > 0) {
      userStore.sendClicks(userId.value)
    }
  }, 15000)
}

onMounted(() => {
  startClickInterval()
  if (userId.value) {
    userStore.fetchBalance(userId.value)
  }
})

onUnmounted(() => {
  clearInterval(clickInterval.value)
  if (userId.value && userStore.clickCount > 0) {
    userStore.sendClicks(userId.value)
  }
})
</script>

<template>
  <div class="container">
    <div v-if="isBlocked" class="blocked-message">Слишком много кликов! Подождите 10 секунд.</div>

    <div class="profile-container" v-if="userStore.user">
      <img :src="profilePhoto" alt="Profile" class="profile-avatar" />
      <span class="profile-name">{{ userName }}</span>
    </div>

    <div class="logo-container">
      <img src="../assets/logo.png" alt="Logo" class="logo-image" />
    </div>

    <div class="balance-container">
      <span class="balance-amount" :class="{ 'balance-update': isAnimating }">
        {{ userStore.formattedBalance }}
      </span>
      <span class="balance-currency">coin</span>
    </div>

    <img
      src="../assets/coin.png"
      alt="Coin"
      class="coin-image"
      :class="{ 'coin-click': isAnimating, 'coin-blocked': isBlocked }"
      @click="handleCoinClick"
      @touchstart="handleCoinClick"
      @touchend.prevent
    />

    <bottomBar />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  position: relative;
  user-select: none;
}

.balance-container {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
}

.balance-amount {
  font-family: yandex-bold;
  font-size: 36px;
  color: white;
  transition: transform 0.1s;
}

.balance-update {
  transform: scale(1.1);
  color: #ffc324;
}

.balance-currency {
  font-family: yandex-bold;
  font-size: 36px;
  color: #ffc324;
}

.coin-image {
  width: 270px;
  height: 270px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.05s;
  touch-action: manipulation;
}

.coin-image.coin-click {
  transform: scale(0.95);
}

.blocked-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 100;
  font-family: yandex-bold;
}

.coin-blocked {
  opacity: 0.5;
  filter: grayscale(70%);
  cursor: not-allowed;
}

.profile-container {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  margin-left: 10px;
  font-family: yandex-medium;
  font-size: 20px;
  color: white;
}

.logo-container {
  position: absolute;
  top: 10px;
  right: 10px;
}

.logo-image {
  height: 40px;
  width: auto;
}
</style>
