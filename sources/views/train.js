/**
 @name: train.js
 @editor: PyCharm
 @Date: 2019/2/28 9:41
 @Author: ly
 @Description: 培训模式
 */
import {JetView} from 'webix-jet';

export default class Train extends JetView {
  config() {
    return {
      css: 'train-bg',
      rows: [
        {},
        {
          cols: [
            {},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-pencil-alt',
              label: '判断题', width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./judge');
              }
            },
            {width: 20},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-check', label: '单选题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./choice');
              }
            },
            {width: 20},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-check-double', label: '多选题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./multichoice');
              }
            },
            {}
          ]
        },
        {height: 15},
        {
          cols: [
            {},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-edit', label: '简答题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./shortans');
              }
            },
            {width: 20},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-rocket', label: '错题回顾',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./errorbook');
              }
            },
            {width: 20},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-user-edit', label: '模拟考试',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./simulateexam');
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
