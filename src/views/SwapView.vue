<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Обмен койнов</h1>
    </div>

    <div class="form-container">
      <div class="input-group">
        <label class="input-label">Реферальная ссылка с сайта</label>
        <input
          v-model="referralLink"
          type="text"
          class="input-field"
          placeholder="https://iziwin.casino/r/..."
          :class="{ 'input-error': showErrors && !referralLink }"
        />
      </div>

      <div class="input-group">
        <label class="input-label">Сумма обмена</label>
        <input
          v-model.number="exchangeAmount"
          type="number"
          class="input-field"
          placeholder="0"
          :class="{ 'input-error': showErrors && !exchangeAmount }"
          @input="calculateResult"
        />
        <div class="exchange-rate">4,000 койнов = 1 рубль</div>
        <div class="balance-info">Ваш баланс: {{ formattedBalance }} койнов</div>
      </div>

      <div class="input-group">
        <label class="input-label">К получению</label>
        <div class="input-field result-field">{{ resultAmount.toFixed(2) }}₽</div>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <button class="exchange-button" @click="handleExchange" :disabled="isProcessing">
        {{ isProcessing ? 'Обработка...' : 'Обмен' }}
      </button>

      <div class="hint-text">
        Перейдите на
        <a href="https://iziwin.casino/r/" target="_blank" class="iziwin-link">IziWin</a>, и
        скопируйте свою реферальную ссылку для получения вывода
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user.js'
import { computed, ref } from 'vue'

export default {
  data() {
    return {
      showBackButton: false,
      isPressed: false,
      exchangeAmount: null,
      resultAmount: 0,
      referralLink: '',
      showErrors: false,
      errorMessage: '',
      isProcessing: false,
    }
  },
  setup() {
    const userStore = useUserStore()
    const userId = computed(() => userStore.user?.id)
    const balance = computed(() => userStore.balance)
    const formattedBalance = computed(() => userStore.formattedBalance)

    return {
      userId,
      balance,
      formattedBalance,
    }
  },
  methods: {
    calculateResult() {
      // Конвертация: 4000 койнов = 1 рубль
      if (this.exchangeAmount && this.exchangeAmount > 0) {
        this.resultAmount = this.exchangeAmount / 4000
      } else {
        this.resultAmount = 0
      }
    },
    async handleExchange() {
      this.showErrors = true
      this.errorMessage = ''

      // Проверка заполнения полей
      if (!this.referralLink || !this.exchangeAmount) {
        this.errorMessage = 'Заполните все поля'
        return
      }

      // Проверка что сумма обмена положительная
      if (this.exchangeAmount <= 0) {
        this.errorMessage = 'Сумма обмена должна быть больше 0'
        return
      }

      // Проверка минимальной суммы (20 рублей)
      if (this.resultAmount < 20) {
        this.errorMessage = 'Минимальная сумма для обмена 20 рублей'
        return
      }

      // Проверка баланса
      if (this.exchangeAmount > this.balance) {
        this.errorMessage = 'Недостаточно койнов для обмена'
        return
      }

      // Проверка реферальной ссылки
      if (!this.isValidReferralLink(this.referralLink)) {
        this.errorMessage = 'Введите корректную реферальную ссылку IziWin'
        return
      }

      this.isProcessing = true

      try {
        const response = await this.processExchange()

        if (response && response.success) {
          // Обновляем баланс в хранилище
          const userStore = useUserStore()
          userStore.setBalance(this.balance - this.exchangeAmount)

          // Очищаем форму
          this.exchangeAmount = null
          this.referralLink = ''
          this.resultAmount = 0
          this.showErrors = false

          // Можно показать уведомление об успехе
          alert('Заявка на вывод успешно создана')
        } else {
          this.errorMessage = response?.error || 'Ошибка при обработке обмена'
        }
      } catch (error) {
        console.error('Ошибка при обмене:', error)
        this.errorMessage = 'Произошла ошибка при обмене'
      } finally {
        this.isProcessing = false
      }
    },
    async processExchange() {
      try {
        const response = await fetch(
          'https://impressive-furnished-restaurant-triple.trycloudflare.com/exchange-coins',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: this.userId,
              amount: this.exchangeAmount,
              rubAmount: this.resultAmount,
              referralLink: this.referralLink,
            }),
          },
        )

        if (!response.ok) {
          throw new Error('Ошибка сервера')
        }

        return await response.json()
      } catch (error) {
        console.error('Ошибка при отправке запроса:', error)
        throw error
      }
    },
    isValidReferralLink(link) {
      try {
        const url = new URL(link)
        return url.hostname.includes('iziwin.casino') && url.pathname.startsWith('/r/')
      } catch {
        return false
      }
    },
    initTelegramBackButton() {
      if (!window.Telegram || !Telegram.WebApp) return

      const BackButton = Telegram.WebApp.BackButton
      BackButton.show()

      const handleBack = () => {
        this.redirectToHome()
        BackButton.hide()
      }

      BackButton.onClick(handleBack)
      Telegram.WebApp.onEvent('backButtonClicked', handleBack)
    },
    handleBackClick() {
      this.redirectToHome()
      this.showBackButton = false
    },
    redirectToHome() {
      this.$router.push('/')
    },
  },
  mounted() {
    if (window.Telegram && Telegram.WebApp) {
      this.initTelegramBackButton()
    } else {
      this.showBackButton = true
    }
  },
  beforeUnmount() {
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.BackButton.offClick()
      Telegram.WebApp.offEvent('backButtonClicked')
    }
  },
}
</script>

<style scoped>
.container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 10px;
  text-align: center;
}

.title {
  font-family: yandex-bold;
  font-size: 24px;
  color: white;
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-family: yandex-medium;
  font-size: 14px;
  color: white;
}

.balance-info {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 5px;
}

.exchange-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-field {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px;
  font-size: 16px;
  color: white;
  outline: none;
}

.input-field:focus {
  border-color: #2e58ad;
}

.input-error {
  border-color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
}

.referral-field {
  color: #8c8c8c;
}

.result-field {
  color: white;
  opacity: 0.8;
}

.exchange-rate {
  font-size: 14px;
  color: #ffc324;
  margin-top: 5px;
}

.exchange-button {
  background-color: #2e58ad;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 15px;
  font-family: yandex-medium;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.exchange-button:active {
  opacity: 0.8;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  margin-top: -10px;
}

.hint-text {
  font-size: 16px;
  font-family: yandex-medium;
  color: white;
  text-align: left;
  margin-top: 10px;
}

.iziwin-link {
  color: #ffc324;
  text-decoration: none;
  font-family: yandex-medium;
}
</style>
