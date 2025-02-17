import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';
import i18n from '@/helpers/i18n';
import { useNotifications } from '@/composables/useNotifications';
import allProjects from '@/config/allProjects.json'
const { notify } = useNotifications();

const state = {
  init: false,
  loading: false,
  authLoading: false,
  spaces: {},
  strategies: {}
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  },
  SEND_REQUEST() {
    console.debug('SEND_REQUEST');
  },
  SEND_SUCCESS() {
    console.debug('SEND_SUCCESS');
  },
  SEND_FAILURE(_state, payload) {
    console.debug('SEND_FAILURE', payload);
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    const auth = getInstance();
    commit('SET', { loading: true });
    await Promise.all([dispatch('getSpaces'), dispatch('getStrategies')]);
    auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  getSpaces: async ({ commit }) => {
    const _spaces: any = await client.getSpaces();
    // update
    let spaces = Object.fromEntries(allProjects.map(project=>[project,_spaces[project]]))
    //@ts-ignore
    spaces = Object.fromEntries(
      Object.entries(spaces).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );
    commit('SET', { spaces });
    return spaces;
  },
  getStrategies: async ({ commit }) => {
    const strategies: any = await fetch(
      'https://score.snapshot.org/api/strategies'
    ).then(res => res.json());
    commit('SET', { strategies });
    return strategies;
  },
  send: async ({ commit, rootState }, { space, type, payload }) => {
    const auth = getInstance();
    commit('SEND_REQUEST');
    try {
      const result = await client.broadcast(
        auth.web3,
        rootState.web3.account,
        space,
        type,
        payload
      );
      commit('SEND_SUCCESS');
      notify([
        'green',
        type === 'delete-proposal'
          ? i18n.global.t('notify.proposalDeleted')
          : i18n.global.t('notify.yourIsIn', [type])
      ]);
      return result;
    } catch (e) {
      commit('SEND_FAILURE', e);
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : i18n.global.t('notify.somethingWentWrong');
      notify(['red', errorMessage]);
      return;
    }
  }
};

export default {
  state,
  mutations,
  actions
};
