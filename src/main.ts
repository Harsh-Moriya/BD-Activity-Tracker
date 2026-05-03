import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

const splash = document.getElementById('splash')
if (splash) {
  splash.addEventListener('transitionend', () => splash.remove(), { once: true })
  setTimeout(() => { splash.style.opacity = '0' }, 80)
}
