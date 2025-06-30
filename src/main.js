import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入Font Awesome核心和Vue集成
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 导入需要使用的图标
import { 
  faBolt, faHeart, faExclamationCircle, faStar, 
  faTimes, faPlus, faExclamationTriangle, faUndoAlt, faFolderOpen 
} from '@fortawesome/free-solid-svg-icons'

// 将图标添加到Font Awesome库中
library.add(
  faBolt, faHeart, faExclamationCircle, faStar, 
  faTimes, faPlus, faExclamationTriangle, faUndoAlt, faFolderOpen
)

// 创建Vue应用
const app = createApp(App)

// 全局注册Font Awesome组件
app.component('font-awesome-icon', FontAwesomeIcon)

// 挂载应用
app.mount('#app')