<template>
  <div class="bottom-bar">
    <router-link to="/tasks" class="icon-item">
      <iconTask />
      <span>Задания</span>
    </router-link>
    <router-link to="/friends" class="icon-item">
      <IconFriend />
      <span>Друзья</span>
    </router-link>
    <router-link to="/swap" class="icon-item">
      <IconSwap />
      <span>Обмен</span>
    </router-link>
    <a href="https://iziwin.casino" target="_blank" class="logo-item">
      <img src="../assets/logo.png" alt="iziwin logo" class="logo" />
      <span>IziWin</span>
    </a>
  </div>
</template>

<script>
import iconTask from './icons/iconTask.vue'
import IconFriend from './icons/IconFriend.vue'
import IconSwap from './icons/IconSwap.vue'

export default {
  components: {
    iconTask,
    IconFriend,
    IconSwap,
  },
}
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 10px;
  left: 10px;
  right: 10px;
  padding: 10px 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(207, 207, 207, 0.25);
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-item,
.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  text-decoration: none;
}

.icon-item span,
.logo-item span {
  font-size: 10px;
  font-family: yandex-medium;
  color: #ffffff;
}

.logo {
  width: 25px;
  height: 25px;
}

/* Стиль для активной ссылки */
.router-link-exact-active {
  opacity: 0.8;
  position: relative;
}

.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
}
</style>
