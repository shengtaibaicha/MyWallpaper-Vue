// 引入defineStore用于创建store
import {defineStore} from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user',()=>{
  // talkList就是state
  const token = ref('')
  const redisKey = ref('')

  return {token,redisKey}
},{
  persist:true
})