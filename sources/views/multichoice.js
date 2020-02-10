/**
 @name: multichoice.js
 @editor: PyCharm
 @Date: 2019/3/1 10:47
 @Author: ly
 @Description: 多选
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from "../models/post";


let getContent = function (num) {
  post('/multichoice', {mode: 'train', num: num}).then(function (r) {
    let res = r.json();
    if (res.code === 0) {
      if (JSON.stringify(res.data) === '{}') {
        webix.alert('没有更多题目了！');
        let num = webix.storage.session.get('num');
        webix.storage.session.put('num', num-1);
      }
      else {
        // $$('ans').blockEvent();
        // $$('ans').setValue(-1);
        // $$('ans').unblockEvent();
        ['choice:a', 'choice:b', 'choice:c', 'choice:d'].map(function (v) {
          $$(v).setValue(0);
        });
        let num = webix.storage.session.get('num');
        $$('multichoice:content').define('template', '第' + (num+1) + '题：' + res.data.content);
        $$('multichoice:content').refresh();
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
export default class MultiChoice extends JetView {
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
                  view: 'template', borderless: 1, height: 180, template: '', id: 'multichoice:content', css: 'multichoice-content'
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
                    {view: 'checkbox', label: '', labelWidth: 0, labelRight: 'A', width: 80, id: 'choice:a'},
                    {view: 'checkbox', label: '', labelWidth: 0, labelRight: 'B', width: 80, id: 'choice:b'},
                    {view: 'checkbox', label: '', labelWidth: 0, labelRight: 'C', width: 80, id: 'choice:c'},
                    {view: 'checkbox', label: '', labelWidth: 0, labelRight: 'D', width: 80, id: 'choice:d'},
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
                        let a = $$('choice:a').getValue();
                        let b = $$('choice:b').getValue();
                        let c = $$('choice:c').getValue();
                        let d = $$('choice:d').getValue();
                        let ansStr = (a?'1':'') + (b?'2':'') + (c?'3':'') + (d?'4':'');

                        if (ansStr === '') {
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
                          return;
                        }
                        let ans = webix.storage.session.get('ans');
                        if (ans !== ansStr) {
                          let ans_str = ['', 'A', 'B', 'C', 'D'];
                          let r = '';
                          for (let i=0; i<ans.length;i++) {
                            r += ans_str[ans[i]];
                          }
                          webix.alert('正确答案是：' + r);
                        }
                        else {
                          let num = webix.storage.session.get('num');
                          getContent(num+1);
                          webix.storage.session.put('num', num+1);
                        }
                      }
                    },
                    {width: 50},
                    {
                      view: 'button', value: '答案',
                      click: function () {
                        let ans = webix.storage.session.get('ans');
                        let ans_str = ['', 'A', 'B', 'C', 'D'];
                        let r = '';
                        for (let i=0; i<ans.length;i++) {
                          r += ans_str[ans[i]];
                        }
                        webix.alert('正确答案是：' + r);
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
    $$('home:title').define('label', '<span style="color: #fff;font-size: 16px;">多选题练习</span>');
    $$('home:title').refresh();
    post('/multichoice', {mode: 'get-num'}).then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert(res.info);
      }
      getContent(res.data);
      webix.storage.session.put('num', res.data);
    });
  }
}