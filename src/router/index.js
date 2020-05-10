import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]
/**
 *  mode: 'history', removes /#/ from the URL
 * The default mode for vue-router is hash mode - it uses the URL hash to simulate a full URL so
 *  that the page won't be reloaded when the URL changes.
 */
const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
