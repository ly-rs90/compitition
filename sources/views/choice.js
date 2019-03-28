/**
 @name: choice.js
 @editor: PyCharm
 @Date: 2019/3/1 9:47
 @Author: ly
 @Description: 单选题
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from "../models/post";


let getContent = function (num) {
  post('/choice', {mode: 'train', num: num}).then(function (r) {
    let res = r.json();
    if (res.code === 0) {
      if (JSON.stringify(res.data) === '{}') {
        webix.alert('没有更多题目了！');
        let num = webix.storage.session.get('num');
        webix.storage.session.put('num', num-1);
      }
      else {
        $$('ans').blockEvent();
        $$('ans').setValue(-1);
        $$('ans').unblockEvent();
        let num = webix.storage.session.get('num');
        $$('choice:content').define('template', '第' + (num+1) + '题：' + res.data.content);
        $$('choice:content').refresh();
        $$('ans:a').define('label', 'A、' + res.data.c1);
        $$('ans:a').refresh();
        $$('ans:b').define('label', 'B、' + res.data.c2);
        $$('ans:b').refresh();
        $$('ans:c').define('label', 'C、' + res.data.c3);
        $$('ans:c').refresh();
        $$('ans:d').define('label', 'D、' + res.data.c4);
        $$('ans:d').refresh();
        webix.storage.session.put('ans', res.data.ans);
      }
    }
  });
};
export default class Choice extends JetView {
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
                  view: 'template', borderless: 1, height: 180, template: '', id: 'choice:content', css: 'choice-content'
                },
                {
                  height: 120,
                  cols: [
                    {width: 40},
                    {
                      rows: [
                        {view: 'label', id: 'ans:a', label: '', height: 30},
                        {view: 'label', id: 'ans:b', label: '', height: 30},
                        {view: 'label', id: 'ans:c', label: '', height: 30},
                        {view: 'label', id: 'ans:d', label: '', height: 30},
                      ]
                    }
                  ]
                },
                {height: 20},
                {
                  cols: [
                    {},
                    {
                      view: 'radio', label: '', width: 280, align: 'center', id: 'ans', options: [
                        {id: '1', value: 'A'},
                        {id: '2', value: 'B'},
                        {id: '3', value: 'C'},
                        {id: '4', value: 'D'},
                      ],
                      on: {
                        onChange: function (newv) {
                          let ans = webix.storage.session.get('ans');
                          let ans_str = ['', 'A', 'B', 'C', 'D'];
                          if (newv != ans) {
                            webix.alert('回答错误！正确答案是：' + ans_str[ans]);
                          }
                        }
                      }
                    },
                    {}
                  ]
                },
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
                        if ($$('ans').getValue() === '1' || $$('ans').getValue() === '2' ||
                          $$('ans').getValue() === '3' || $$('ans').getValue() === '4') {
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
    post('/choice', {mode: 'get-num'}).then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert(res.info);
      }
      getContent(res.data);
      webix.storage.session.put('num', res.data);
    });
  }
}