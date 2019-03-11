/**
 @name: judge.js
 @editor: PyCharm
 @Date: 2019/2/28 13:54
 @Author: ly
 @Description: 判断题
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from "../models/post";

let getContent = function (num) {
  post('/judge', {mode: 'train', num: num}).then(function (r) {
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
        $$('judge:content').define('template', '第' + (num+1) + '题：' + res.data.content);
        $$('judge:content').refresh();
        webix.storage.session.put('ans', res.data.ans);
      }
    }
  });
};
export default class Judge extends JetView {
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
                  view: 'template', borderless: 1, height: 200, template: '', id: 'judge:content', css: 'judge-content'
                },
                {
                  cols: [
                    {},
                    {
                      view: 'radio', label: '', width: 140, align: 'center', id: 'ans', options: [
                        {id: '0', value: '错'},
                        {id: '1', value: '对'}
                      ],
                      on: {
                        onChange: function (newv) {
                          let ans = webix.storage.session.get('ans');
                          if (newv != ans) {
                            webix.alert('回答错误！');
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
                        let num = webix.storage.session.get('num');
                        getContent(num+1);
                        webix.storage.session.put('num', num+1);
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
    getContent(0);
    webix.storage.session.put('num', 0);
  }
}
