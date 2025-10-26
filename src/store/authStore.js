// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      accessToken: null,
      followingSet: new Set(),

      login: (user, accessToken) => {
        console.log("✅ authStore: login 실행됨", { user, accessToken }); // 진단 로그
        set({ isLoggedIn: true, user, accessToken });
      },
      logout: () => {
        console.log("✅ authStore: logout 실행됨"); // 진단 로그
        set({ isLoggedIn: false, user: null, accessToken: null, followingSet: new Set() });
      },

      setFollowing: (userIds) => {
        console.log("✅ authStore: 팔로잉 목록 설정됨", userIds); // 진단 로그
        set({ followingSet: new Set(userIds) });
      },
      addFollowing: (userId) => set(state => ({ followingSet: new Set(state.followingSet).add(userId) })),
      removeFollowing: (userId) => {
        const newSet = new Set(get().followingSet);
        newSet.delete(userId);
        set({ followingSet: newSet });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;