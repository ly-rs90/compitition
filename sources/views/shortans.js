/**
 @name: shortans.js
 @editor: PyCharm
 @Date: 2019/3/1 14:18
 @Author: ly
 @Description: 简答题
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from "../models/post";


let getContent = function (num) {
  post('/shortans', {mode: 'train', num: num}).then(function (r) {
    let res = r.json();
    if (res.code === 0) {
      if (JSON.stringify(res.data) === '{}') {
        webix.alert('没有更多题目了！');
        let num = webix.storage.session.get('num');
        webix.storage.session.put('num', num-1);
      }
      else {
        $$('ans').blockEvent();
        $$('ans').setValue('');
        $$('ans').unblockEvent();
        let num = webix.storage.session.get('num');
        $$('short:content').define('template', '第' + (num+1) + '题：' + res.data.content);
        $$('short:content').refresh();
        webix.storage.session.put('ans', res.data.ans);
      }
    }
  });
};
export default class ShortAns extends JetView {
  config() {
    return {
      css: 'judge-bg',
      rows: [
        {},
        {
          cols: [
            {},
            {
              type: 'wide', css: 'train-table', height: 500, width: 800,
              rows: [
                {
                  view: 'template', borderless: 1, height: 180, template: '', id: 'short:content', css: 'short-content'
                },
                {
                  height: 180,
                  cols: [
                    {width: 40},
                    {
                      view: 'textarea', id: 'ans'
                    },
                    {width: 40},
                  ]
                },
                {height: 20},
                {},
                {
                  cols: [
                    {},
                    {
                      view: 'button', value: '上一题',
                      click: function () {
                        let num = webix.storage.session.get('num');
                        if (num <= 0) {
                          webix.alert('没有更多题了！');
                        }
                        else {
                          getContent(num-1);
                          webix.storage.session.put('num', num-1);
                        }
                      }
                    },
                    {width: 50},
                    {
                      view: 'button', value: '下一题',
                      click: function () {
                        if ($$('ans').getValue().trim() !== '') {
                          let num = webix.storage.session.get('num');
                          getContent(num+1);
                          webix.storage.session.put('num', num+1);
                        }
                        else {
                          webix.confirm({title: '友情提示', text: '本题您未给出答案，是否跳过？',
                            ok: '确定', cancel: '取消',
                            callback: function (r) {
                              if (r) {
                                let num = webix.storage.session.get('num');
                                getContent(num+1);
                                webix.storage.session.put('num', num+1);
                              }
                            }
                          });
                        }
                      }
                    },
                    {width: 50},
                    {
                      view: 'button', value: '答案',
                      click: function () {
                        let ans = webix.storage.session.get('ans');
                        webix.alert({text: ans, width: 600});
                      }
                    },
                    {}
                  ]
                },
                {}
              ]
            },
            {}
          ]
        },
        {}
      ]
    };
  }
  init(_$view, _$) {
    post('/shortans', {mode: 'get-num'}).then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert(res.info);
      }
      getContent(res.data);
      webix.storage.session.put('num', res.data);
    });
  }
}