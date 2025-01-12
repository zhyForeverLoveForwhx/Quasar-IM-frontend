<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="lHh Lpr lFf" class="WAL__layout shadow-3" container>
      <q-header elevated>
        <q-toolbar class="bg-grey-3 text-black">
          <q-btn round flat>
            <q-avatar>
              <img
                v-show="currentConversation.avatar"
                :src="currentConversation.avatar"
              />
            </q-avatar>
          </q-btn>

          <span class="q-subtitle-1 q-pl-md">
            {{ currentConversation.person }}
          </span>

          <q-space />

          <q-btn round flat icon="search" />
          <q-btn round flat>
            <q-icon name="attachment" class="rotate-135" />
          </q-btn>
          <q-btn round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 0]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :breakpoint="690"
      >
        <q-toolbar class="bg-grey-3">
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
          </q-avatar>

          <span class="q-subtitle-1 q-pl-md">
            {{ userState.getUsername }}
          </span>

          <q-space />

          <q-btn
            round
            flat
            :icon="Drawer_icon"
            @click="changeDrawer"
            name="drawer_icon"
          />
          <q-btn round flat icon="more_vert">
            <q-menu auto-close :offset="[110, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>添加朋友</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>

        <q-toolbar class="bg-grey-2">
          <q-input
            rounded
            outlined
            dense
            clearable
            class="WAL__field full-width"
            bg-color="white"
            v-model="search_indrawer"
            :placeholder="Drawer_icon == 'message' ? '搜索对话' : '搜索好友'"
            @keyup.enter="search_InDrawer"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>

        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list>
            <q-item
              v-for="(conversation, index) in conversations"
              :key="conversation.id"
              clickable
              v-ripple
              @click="setCurrentConversation(index)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img :src="conversation.avatar" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">
                  {{ conversation.person }}
                </q-item-label>
                <q-item-label class="conversation__summary" caption>
                  <q-icon name="check" v-if="conversation.sent" />
                  <q-icon name="not_interested" v-if="conversation.deleted" />
                  {{ conversation.caption }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>
                  {{ conversation.time }}
                </q-item-label>
                <q-icon name="keyboard_arrow_down" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="WAL__chat bg-grey-2">
        <router-view />
      </q-page-container>

      <q-footer>
        <q-toolbar class="bg-grey-3 text-black row">
          <q-btn round flat icon="insert_emoticon" class="q-mr-sm" />
          <q-input
            rounded
            outlined
            dense
            class="WAL__field col-grow q-mr-sm"
            bg-color="white"
            v-model="message"
            placeholder="Type a message"
          />
          <q-btn round flat icon="mic" />
        </q-toolbar>
      </q-footer>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '../store/index';
import { conversationStore } from '../store/conversations';
import { api } from 'src/boot/axios';
import { Conversations, User_State } from '../components/models';
import { AxiosResponse } from 'axios';
import { LStorage } from 'src/utils/Storage';

export default {
  name: 'IMLayout',

  setup() {
    const router = useRouter();
    const userState = useMainStore();
    const conv = conversationStore();
    const $q = useQuasar();
    const search = ref('');
    const message = ref('');
    const search_indrawer = ref('');
    const Drawer_icon = ref('message');
    const conversations = ref([] as Conversations[]);
    const currentConversationIndex = computed(() => {
      return conv.conversations.length == 0 ? ref(-1) : ref(0);
    });
    const currentConversation = computed(() => {
      if (currentConversationIndex.value.value == -1) {
        return [] as Conversations[];
      } else {
        return conv.conversations[currentConversationIndex.value.value];
      }
    });

    onMounted(async () => {
      //TODO: 加载页面前，判断是否已经登陆，若无token，跳回登录页面
      //      若有token，利用token获取用户信息，根据code：200成功、404跳回登录页面、500服务器故障
      const userinfo = LStorage.get('main') as User_State;
      if (
        userinfo.token == null ||
        userinfo.token == 'undefined' ||
        userinfo.token == ''
      ) {
        await router.replace('/');
      } else {
        await api
          .post('/verify', {
            token: userinfo.token,
          })
          .then(async function (res: AxiosResponse<User_State>) {
            if (res.status == 200) {
              /**
               * 登陆成功情况：
               * 1.登录页用户名密码验证成功->登录成功
               * 2.从index页读取storage，token验证成功->登录成功
               */

              //将localstorage中userinfo存入state中
              userState.initUserstate(userinfo);

              //conversation都要重新拉取，防止消息滞后,这样conversations似乎不需要存入storage
              await api
                .get('/get_conv', {
                  params: {
                    page_id: 1,
                    page_size: 10,
                    token: userinfo.token,
                  },
                })
                .then(function (res: AxiosResponse<Conversations[]>) {
                  conv.initConvState(res.data);
                  //conv.storageConvState();
                  conversations.value = res.data;
                });
            } else if (res.status == 404 || res.status == 500) {
              await router.replace('/');
            }
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    });

    const style = computed(() => ({
      height: String($q.screen.height) + 'px',
    }));
    function setCurrentConversation(index: number) {
      currentConversationIndex.value.value = index;
    }
    function search_InDrawer() {
      if (Drawer_icon.value == 'message') {
        console.log('搜索对话:', search_indrawer.value);
      } else {
        console.log('搜索好友:', search_indrawer.value);
      }
    }
    function changeDrawer() {
      if (Drawer_icon.value == 'message') {
        Drawer_icon.value = 'group';
      } else {
        Drawer_icon.value = 'message';
      }
      search_indrawer.value = '';
    }

    return {
      userState,
      search,
      message,
      search_indrawer,
      Drawer_icon,
      currentConversationIndex,
      conv,
      conversations,
      currentConversation,
      setCurrentConversation,
      style,
      search_InDrawer,
      changeDrawer,
    };
  },
};
</script>

<style lang="sass">
.WAL
  width: 100%
  height: 100%
  padding-top: 20px

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%
    background-color: #009688
  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 90%
    max-width: 950px
    border-radius: 5px
  &__field.q-field--outlined .q-field__control:before
    border: none
  .q-drawer--standard
    .WAL__drawer-close
      display: none
@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0
@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none
.conversation__summary
  margin-top: 4px
.conversation__more
  margin-top: 0!important
  font-size: 1.4rem
</style>
