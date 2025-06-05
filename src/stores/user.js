import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Состояние
  const _user = ref(null)
  const _balance = ref(0)
  const _tempBalance = ref(0) // Для мгновенного отображения кликов
  const _pendingClicks = ref(0) // Клики, ожидающие отправки
  const _isLoading = ref(false)
  const _error = ref(null)
  const _clickCount = ref(0)

  // Геттеры
  const user = computed(() => _user.value)
  const balance = computed(() => _balance.value)
  const displayBalance = computed(() => _balance.value + _tempBalance.value)
  const isLoading = computed(() => _isLoading.value)
  const error = computed(() => _error.value)
  const clickCount = computed(() => _clickCount.value)

  const formattedBalance = computed(() => {
    return new Intl.NumberFormat('en-US').format(displayBalance.value)
  })

  const formattedClickCount = computed(() => {
    return new Intl.NumberFormat('en-US').format(_clickCount.value)
  })

  // Действия
  const setUser = (userData) => {
    if (!userData || typeof userData !== 'object') return
    _user.value = Object.freeze({ ...userData })
  }

  const addClick = () => {
    _clickCount.value++
    _pendingClicks.value++
    _tempBalance.value += 1
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        },
      )

      if (!response.ok) throw new Error('Ошибка при получении баланса')

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
    if (_pendingClicks.value === 0 || !userId) return

    const clicksToSend = _pendingClicks.value
    _pendingClicks.value = 0

    try {
      const response = await fetch(
        'https://impressive-furnished-restaurant-triple.trycloudflare.com/add-clicks',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, clicks: clicksToSend }),
        },
      )

      if (!response.ok) throw new Error('Ошибка при отправке кликов')

      const data = await response.json()
      _balance.value = data.newBalance
      _tempBalance.value = 0
    } catch (err) {
      // Возвращаем клики в очередь при ошибке
      _pendingClicks.value += clicksToSend
      console.error('Ошибка при отправке кликов:', err)
    }
  }

  return {
    // Геттеры
    user,
    balance,
    formattedBalance,
    formattedClickCount,
    isLoading,
    error,
    clickCount,

    // Действия
    setUser,
    addClick,
    resetClickCount,
    fetchBalance,
    sendClicks,
  }
})
