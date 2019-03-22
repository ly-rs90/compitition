/**
 @name: compitition.js
 @editor: PyCharm
 @Date: 2019/2/28 10:21
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import * as webix from 'webix';

export default class Compitition extends JetView {
  config() {
    return {
      rows: [
        {
          view: 'toolbar', id: 'toolbar', css: 'toolbar', height: 60, margin: 3,
          cols: [
            {width: 20},
            {view: 'icon', icon: 'fas fa-trophy', css: 'toolbar-logo'},
            {view: 'label', label: '华东竞赛系统', css: 'toolbar-title', width: 200},
            {
              // hidden: 1,
              cols: [
                {
                  view: 'label', label: '首页', css: 'label', width: 50, align: 'center',
                  click: function () {
                    this.$scope.show('./mode');
                  }
                },
                {view: 'label', label: '退出', css: 'label', width: 50, align: 'center'},
              ]
            },
            {},
            {view: 'label', label: '您好，XX用户！', align: 'center', css: 'toolbar-welcome', width: 200, id: 'hello:user'}
          ]
        },
        {$subview: true}
      ]
    };
  }
  ready(_$view, _$url) {
    let user = webix.storage.cookie.get('name');
    $$('hello:user').define('label', `您好，${user}！`);
    $$('hello:user').refresh();
  }
}