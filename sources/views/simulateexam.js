/**
 @name: simulateexam.js
 @editor: PyCharm
 @Date: 2019/3/25 16:10
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from '../models/post';


export default class SimulateExam extends JetView {
  config() {
    return {
      cols: [
        {css: 'judge-bg'},
        {
          width: 800,
          view: 'scrollview', scroll: 'y', borderless: 1, css: 'judge-bg',
          body: {
            type: 'wide', id: 'paper:question', css: 'judge-bg',
            rows: []
          }

        },
        {css: 'judge-bg'}
      ]
    };
  }
  init(_$view, _$) {
    post('/simulate', {type: 'get-paper'}).then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert('错误提示：' + res.info);
      }
      else {
        let p = $$('paper:question');
        let index = 1;
        p.addView({height: 5});
        res.data.judge.forEach(function (item) {
          p.addView({
            rows: [
              {
                css: 'white-bg question-panel',
                rows: [
                  {template: '', css: 'question-tip'},
                  {template: '判断', css: 'question-type'},
                  {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_judge', hidden: 1},
                  {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, height: 100, css: 'question-content'},
                  {
                    height: 40,
                    cols: [
                      {},
                      {
                        view: 'radio', label: '', width: 140, align: 'center', id: item.id, options: [
                          {id: '0', value: '错'},
                          {id: '1', value: '对'}
                        ],
                      },
                      {}
                    ]
                  },
                  {height: 10}
                ]
              }
            ]
          });
        });
        res.data.multi.forEach(function (item) {
          p.addView({
            css: 'white-bg question-panel',
            rows: [
              {template: '', css: 'question-tip'},
              {template: '多选', css: 'question-type'},
              {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_multi', hidden: 1},
              {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, autoheight: 1, css: 'question-content'},
              {
                view: 'form', id: item.id, borderless: 1,
                elements: [
                  {view: 'checkbox', label: '', name: 'a', labelWidth: 0, labelRight: 'A、' + item.c1},
                  {view: 'checkbox', label: '', name: 'b', labelWidth: 0, labelRight: 'B、' + item.c2},
                  {view: 'checkbox', label: '', name: 'c', labelWidth: 0, labelRight: 'C、' + item.c3},
                  {view: 'checkbox', label: '', name: 'd', labelWidth: 0, labelRight: 'D、' + item.c4},
                ]
              }
            ]
          });
        });
        res.data.choice.forEach(function (item) {
          p.addView({
            css: 'white-bg question-panel',
            rows: [
              {template: '', css: 'question-tip'},
              {template: '单选', css: 'question-type'},
              {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_choice', hidden: 1},
              {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, autoheight: 1, css: 'question-content'},
              {
                cols: [
                  {width: 10},
                  {
                    view: 'radio', label: '', id: item.id, vertical: 1,
                    options: [
                      {id: '1', value: 'A、' + item.c1},
                      {id: '2', value: 'B、' + item.c2},
                      {id: '3', value: 'C、' + item.c3},
                      {id: '4', value: 'D、' + item.c4}
                    ]
                  }
                ]
              }
            ]
          });
        });
        res.data.short.forEach(function (item) {
          p.addView({
            css: 'white-bg question-panel',
            rows: [
              {template: '', css: 'question-tip'},
              {template: '简答', css: 'question-type'},
              {
                view: 'template', template: `第${index++}题：` + item.content,
                borderless: 1, autoheight: 1, css: 'question-content'
              },
              {
                cols: [
                  {width: 10},
                  {view: 'textarea', label: '', id: item.id, height: 240},
                  {width: 10}
                ]
              },
              {height: 10}
            ]
          });
        });
        p.addView({
          cols: [
            {},
            {
              view: 'button', value: '交卷', width: 120,
              click: function () {
                let score = 0;
                res.data.judge.forEach(function (item) {
                  let ans = $$(item.id).getValue();
                  if (ans === item.ans.toString()) {
                    score++;
                    $$(item.id + '_judge').define('template', '<span class="fas fa-check"></span>');
                    $$(item.id + '_judge').refresh();
                    $$(item.id + '_judge').show();
                  }
                  else {
                    $$(item.id + '_judge').define('template', '<span class="fas fa-times"></span>');
                    $$(item.id + '_judge').refresh();
                    $$(item.id + '_judge').show();
                  }
                });
                res.data.choice.forEach(function (item) {
                  let ans = $$(item.id).getValue();
                  if (ans === item.ans) {
                    score++;
                    $$(item.id + '_choice').define('template', '<span class="fas fa-check"></span>');
                    $$(item.id + '_choice').refresh();
                    $$(item.id + '_choice').show();
                  }
                  else {
                    $$(item.id + '_choice').define('template', '<span class="fas fa-times"></span>');
                    $$(item.id + '_choice').refresh();
                    $$(item.id + '_choice').show();
                  }
                });
                res.data.multi.forEach(function (item) {
                  let ans = $$(item.id).getValues();
                  let ansStr = (ans.a===1?'1':'') + (ans.b===1?'2':'') + (ans.c===1?'3':'') + (ans.d===1?'4':'');
                  if (ansStr === item.ans) {
                    score += 2;
                    $$(item.id + '_multi').define('template', '<span class="fas fa-check"></span>');
                    $$(item.id + '_multi').refresh();
                    $$(item.id + '_multi').show();
                  }
                  else {
                    $$(item.id + '_multi').define('template', '<span class="fas fa-times"></span>');
                    $$(item.id + '_multi').refresh();
                    $$(item.id + '_multi').show();
                  }
                });

                let complete = true;
                let shortResult = [];

                res.data.judge.forEach(function (item) {
                  let value = $$(item.id).getValue();
                  if (value === '') complete = false;
                });
                res.data.choice.forEach(function (item) {
                  let value = $$(item.id).getValue();
                  if (value === '') complete = false;
                });
                res.data.multi.forEach(function (item) {
                  let a = $$(item.id).getValues().a;
                  let b = $$(item.id).getValues().b;
                  let c = $$(item.id).getValues().c;
                  let d = $$(item.id).getValues().d;
                  let value = (a=='1'?'1':'') + (b=='1'?'2':'') + (c=='1'?'3':'') + (d=='1'?'4':'');
                  if (value === '') complete = false;
                });
                res.data.short.forEach(function (item) {
                  let value = $$(item.id).getValue();
                  if (value === '') complete = false;
                  shortResult.push({id: item.id, r: value});
                });
                let postPaper = function () {
                  post('/simulate', {short: shortResult, type: 'post-paper'}).then(function (r1) {
                    let res = r1.json();
                    if (res.code === 0) {
                      res.data.forEach(function (item) {
                        score += item.score;
                      });
                      let title = score===100?'无敌是多么寂寞？':score>=90?'学霸养成记！':score>=60?'人生不如意十之八九！':'我为自己代言！';
                      webix.confirm({title: `<span style="color: #07dcad;font-weight: 700">${title}</span>`, text: `<h2 style="color: red">${score}分</h2>`, ok: '确定', cancel: '取消'});
                    }
                    else {
                      webix.alert('提交失败，原因：' + res.info);
                    }
                  });
                };
                if (!complete) {
                  webix.confirm({text: '您还有题目未完成，是否交卷？', title: '友情提示',
                    ok: '确定', cancel: '取消', callback: function (r) {
                      if (r) {
                        postPaper();
                      }
                    }
                  });
                }
                else {
                  postPaper();
                }
              }
            },
            {}
          ]
        });
        p.addView({height: 5});
      }
    });
  }
}