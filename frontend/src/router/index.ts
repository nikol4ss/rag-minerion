import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import DocumentsView from '../views/DocumentsView.vue';
import UploadView from '../views/UploadView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/documents',
      name: 'documents',
      component: DocumentsView
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView
    }
  ]
});

export default router;
