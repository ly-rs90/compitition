/**
 @name: admin.js
 @editor: PyCharm
 @Date: 2019/3/4 9:50
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';

export default class Admin extends JetView {
  config() {
    return {
      cols: [
        {
          width: 200, view: 'sidebar', id: 'admin:menu',
          data: [
            {id: 'paperpublish', value: '发布试卷', icon: 'fas fa-file-alt'},
            {id: 'papermanager', value: '试卷管理', icon: 'fas fa-cog'},
            {id: 'questionmanager', value: '试题管理', icon: 'fas fa-download'},
            {id: 'examresult', value: '考试结果', icon: 'fas fa-graduation-cap'},
            {id: 'logout', value: '安全退出', icon: 'fas fa-power-off'}
          ],
          on: {
            onAfterSelect: function (id) {
              if (id !== 'logout') {
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
}
