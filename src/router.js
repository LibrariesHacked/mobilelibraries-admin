import Vue from "vue";
import Router from "vue-router";

// Our pages/views
import Home from "./views/Home.vue";
import LibrariesData from "./views/LibrariesData.vue";
import MembershipMap from "./views/MembershipMap.vue";
import MembershipPostcodeToLsoa from "./views/MembershipPostcodeToLsoa.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/postcode-to-lsoa",
      name: "postcode-to-lsoa",
      component: MembershipPostcodeToLsoa
    },
    {
      path: "/libraries",
      name: "libraries",
      component: LibrariesData
    },
    {
      path: "/membership-map",
      name: "membership-map",
      component: MembershipMap
    }
  ]
});
