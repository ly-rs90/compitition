/**
 @name: mode.js
 @editor: PyCharm
 @Date: 2019/2/27 16:57
 @Author: ly
 @Description: 模式选择
 */
import {JetView} from 'webix-jet';

export default class Mode extends JetView {
  config() {
    return {
      css: 'mode-bg',
      rows: [
        {},
        {
          height: 300,
          cols: [
            {},
            {
              width: 300, css: 'mode-btn',
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-globe', label: '培训模式',
              click: function () {
                this.$scope.show('/compitition/train');
              }
            },
            {width: 60},
            // {
            //   width: 300, css: 'mode-btn',
            //   view: 'button', type: 'iconButtonTop', icon: 'fas fa-user-edit', label: '模拟考试',
            //   click: function () {
            //     this.$scope.show('/compitition/simulateexam');
            //   }
            // },
            // {width: 60},
            {
              width: 300, css: 'mode-btn',
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-user-clock', label: '考试模式',
              click: function () {
                this.$scope.show('/compitition/exam');
              }
            },
            {}
          ]
        },
        {}
      ]
    };
  }
}