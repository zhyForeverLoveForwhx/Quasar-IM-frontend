import { defineStore } from 'pinia';
import { User_State } from 'src/components/models';
import { store } from 'quasar/wrappers';
import { LStorage } from '../utils/Storage';
export default store;

export const useMainStore = defineStore({
  id: 'main',

  /**
   * 类似于组件的data，用来存储全局状态的
   * 1.必须是函数：这是为了在服务端渲染的时候避免交叉请求导致的主句状态污染
   * 2.必须是箭头函数，这是为了更好的ts类型更改
   *
   */

  state: () => {
    return {
      userstate: {} as User_State,
    };
  },

  /**
   * 类似于组件的computed用来封装计算属性，有缓存的功能
   */
  getters: {
    getUsername(): string {
      return this.userstate.username;
    },
    getToken(): string {
      return this.userstate.token;
    },
  },

  /**
   * 类似于组建的methods，封装业务逻辑，修改state
   */
  actions: {
    initUserstate(userState: User_State) {
      this.userstate.username = userState.username;
      this.userstate.token = userState.token;
    },
    storageUserinfo() {
      LStorage.set('main', {
        username: this.userstate.username,
        token: this.userstate.token,
      });
    },
  },
});
