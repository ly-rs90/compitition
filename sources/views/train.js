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
      // cols: [
      //   {
      //     view: 'list', scroll: false, template: '<span class="fas fa-#icon#"></span>&nbsp;&nbsp;#name#', width: 150,
      //     select: 1,
      //     data: [
      //       {id: 'judge', icon: 'pencil-alt', name: '判断题练习'},
      //       {id: '2', icon: 'check', name: '单选题练习'},
      //       {id: '3', icon: 'check-double', name: '多选题练习'},
      //       {id: '4', icon: 'edit', name: '简答题练习'}
      //     ],
      //     on: {
      //       onItemClick: function (id) {
      //         this.$scope.show('./' + id);
      //       }
      //     }
      //   },
      //   {},
      //   {
      //     width: 800,
      //     rows: [
      //       {},
      //       {$subview: true},
      //       {}
      //     ]
      //   },
      //   {}
      // ]
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
            {width: 30},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-check', label: '单选题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./choice');
              }
            },
            {width: 30},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-check-double', label: '多选题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./multichoice');
              }
            },
            {width: 30},
            {
              view: 'button', type: 'iconButtonTop', icon: 'fas fa-edit', label: '简答题',
              width: 240, height: 240, css: 'train-btn',
              click: function () {
                this.$scope.show('./shortans');
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
