import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    // Приватные рефы (не экспортируются)
    const _user = ref(null)
    const _balance = ref(0)
    const _isLoading = ref(false)
    const _error = ref(null)
    const _clickCount = ref(0)

    // Геттеры с защитой
    const user = computed(() => {
      if (import.meta.env.MODE === 'development') {
        return _user.value
      }
      return readonly(_user.value)
    })

    const balance = computed(() => {
      if (import.meta.env.MODE === 'development') {
        return _balance.value
      }
      return readonly(_balance.value)
    })

    const isLoading = computed(() => _isLoading.value)
    const error = computed(() => _error.value)
    const clickCount = computed(() => _clickCount.value)

    const formattedBalance = computed(() => {
      return new Intl.NumberFormat('en-US').format(_balance.value)
    })

    const formattedClickCount = computed(() => {
      return new Intl.NumberFormat('en-US').format(_clickCount.value)
    })

    // Методы с валидацией
    const setUser = (userData) => {
      if (!userData || typeof userData !== 'object') {
        console.error('Invalid user data')
        return
      }
      _user.value = Object.freeze({ ...userData })
    }

    const setBalance = (newBalance) => {
      if (import.meta.env.MODE === 'development') {
        _balance.value = newBalance
        return
      }

      console.error('setBalance can only be used in development mode')
    }

    const incrementClickCount = () => {
      _clickCount.value++
    }

    const resetClickCount = () => {
      _clickCount.value = 0
    }

    const fetchBalance = async (userId) => {
      if (!userId) {
        _error.value = 'User ID is required'
        return
      }

      _isLoading.value = true
      _error.value = null
      try {
        const response = await fetch(
          'https://impressive-furnished-restaurant-triple.trycloudflare.com/get-balance',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          },
        )

        if (!response.ok) {
          throw new Error('Ошибка при получении баланса')
        }

        const data = await response.json()
        _balance.value = data.balance
      } catch (err) {
        _error.value = err.message
        console.error('Ошибка:', err)
      } finally {
        _isLoading.value = false
      }
    }

    const sendClicks = async (userId) => {
      if (_clickCount.value === 0) return
      if (!userId) {
        _error.value = 'User ID is required'
        return
      }

      try {
        const response = await fetch(
          'https://impressive-furnished-restaurant-triple.trycloudflare.com/add-clicks',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              clicks: _clickCount.value,
            }),
          },
        )

        if (!response.ok) {
          throw new Error('Ошибка при отправке кликов')
        }

        const data = await response.json()
        _balance.value = data.newBalance
        resetClickCount()
      } catch (err) {
        console.error('Ошибка при отправке кликов:', err)
      }
    }

    return {
      // Только геттеры и методы
      user: readonly(user),
      balance: readonly(balance),
      formattedBalance: readonly(formattedBalance),
      formattedClickCount: readonly(formattedClickCount),
      isLoading: readonly(isLoading),
      error: readonly(error),
      clickCount: readonly(clickCount),

      // Методы
      setUser,
      setBalance,
      incrementClickCount,
      resetClickCount,
      fetchBalance,
      sendClicks,
    }
  },
  {
    // Дополнительные настройки Pinia для защиты
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'userStore',
          storage: localStorage,
          paths: ['user', 'balance', 'clickCount'],
        },
      ],
    },
  },
)
