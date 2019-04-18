/**
 @name: admin.js
 @editor: PyCharm
 @Date: 2019/3/4 9:50
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import * as webix from 'webix';

export default class Admin extends JetView {
  config() {
    return {
      cols: [
        {
          width: 200, view: 'sidebar', id: 'admin:menu',
          data: [
            {id: 'paperpublish', value: '发布试卷', icon: 'fas fa-file-alt'},
            {id: 'papermanager', value: '试卷管理', icon: 'fas fa-cog'},
            {id: 'questionmanager', value: '试题管理', icon: 'fas fa-th-list'},
            {id: 'examresult', value: '考试结果', icon: 'fas fa-graduation-cap'},
            {id: 'logout', value: '安全退出', icon: 'fas fa-power-off'},
          ],
          on: {
            onAfterSelect: function (id) {
              if (id === 'logout') {
                webix.storage.cookie.clear();
                this.$scope.show('/login');
              }
              else {
                this.$scope.show('./'+id);
              }
            }
          }
        },
        {
          rows: [
            {$subview: true}
          ]
        }
      ]
    };
  }
  init(_$view, _$) {
    $$('comp:menu').hide();
  }
}
