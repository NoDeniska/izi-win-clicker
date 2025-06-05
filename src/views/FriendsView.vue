<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Друзья</h1>
      <p class="subtitle">
        Приглашайте друзей, и получайте <span class="reward-text">награду</span>
      </p>
    </div>

    <div class="rectangle">
      <div class="content">
        <IconConfetti class="icon" />
        <div class="text-content">
          <div class="top-text">
            <span class="invite-text">Пригласи друга и получи</span>
          </div>
          <div class="bottom-text">
            <span class="coin-amount">5,000</span>
            <span class="coin-text">coin</span>
          </div>
        </div>
      </div>
    </div>
    <div class="rectangle">
      <div class="content">
        <IconTG class="icon" />
        <div class="text-content">
          <div class="top-text">
            <span class="invite-text">Пригласи друга с premiun и получи</span>
          </div>
          <div class="bottom-text">
            <span class="coin-amount">20,000</span>
            <span class="coin-text">coin</span>
          </div>
        </div>
      </div>
    </div>

    <button
      class="copy-button"
      @click="copyLink"
      @mousedown="scaleDown"
      @mouseup="scaleUp"
      @mouseleave="scaleUp"
    >
      Скопировать ссылку
    </button>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user.js'
import IconTG from '../components/icons/IconTG.vue'
import IconConfetti from '../components/icons/IconConfetti.vue'
import { computed } from 'vue'

export default {
  components: {
    IconTG,
    IconConfetti,
  },
  data() {
    return {
      showBackButton: false,
      isPressed: false,
    }
  },
  setup() {
    const userStore = useUserStore()
    const userId = computed(() => userStore.user?.id)

    return {
      userId,
    }
  },
  mounted() {
    if (window.Telegram && Telegram.WebApp) {
      this.initTelegramBackButton()
    } else {
      this.showBackButton = true
    }
  },
  methods: {
    initTelegramBackButton() {
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
    copyLink() {
      const link = `https://t.me/IziWinCoinBot?start=r_${this.userId}`
      navigator.clipboard.writeText(link).catch((err) => {
        console.error('Ошибка при копировании: ', err)
      })
    },
    scaleDown() {
      this.isPressed = true
    },
    scaleUp() {
      this.isPressed = false
    },
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
  gap: 10px;
}

.reward-text {
  color: #ffc324;
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

.subtitle {
  font-family: yandex-medium;
  margin-top: 10px;
  font-size: 14px;
  color: white;
  text-align: left;
}

.rectangle {
  width: 100%;
  min-height: 60px;
  background: #21244f;
  border: 1px solid #2e58ad;
  border-radius: 15px;
  display: flex;
  align-items: center;
  padding: 20px 10px;
}

.icon {
  margin-right: 10px;
}

.content {
  display: flex;
  align-items: center;
  width: 100%;
}

.text-content {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.top-text {
  margin-bottom: 5px;
}

.invite-text {
  color: white;
  font-family: yandex-medium;
  font-size: 16px;
}

.bottom-text {
  display: flex;
  align-items: baseline;
}

.coin-amount {
  color: #ffffff;
  font-size: 18px;
  font-family: yandex-bold;
  margin-right: 5px;
}

.coin-text {
  color: #ffc324;
  font-family: yandex-medium;
  font-size: 14px;
}

.copy-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(90deg, #2e58ad, #3a7bd5);
  color: white;
  border: none;
  border-radius: 15px;
  font-family: yandex-medium;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.1s ease;
  margin-top: 10px;
}

.copy-button:active {
  transform: scale(0.95);
}
</style>
