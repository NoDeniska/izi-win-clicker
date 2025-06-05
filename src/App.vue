<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { RouterView } from 'vue-router'

const userStore = useUserStore()

onMounted(async () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.setHeaderColor('#132447')

    const tgUser = window.Telegram.WebApp.initDataUnsafe?.user
    if (tgUser) {
      userStore.setUser(tgUser)
      // Отправляем запрос на сервер для получения баланса
      await userStore.fetchBalance(tgUser.id)
    }
  }
})
</script>

<template>
  <div v-if="userStore.isLoading">Загрузка...</div>
  <div v-else-if="userStore.error">Ошибка: {{ userStore.error }}</div>
  <RouterView v-else />
</template>
