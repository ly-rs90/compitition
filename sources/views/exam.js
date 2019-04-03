/**
 @name: exam.js
 @editor: PyCharm
 @Date: 2019/2/28 10:11
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from '../models/post';

let timeInterval;

export default class Exam extends JetView {
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
    post('/paper').then(function (r) {
      let res = r.json();
      if (res.code !== 0) {
        webix.alert('错误提示：' + res.info);
        return;
      }
      let p = $$('paper:question');
      if (res.data.num === 0) {
        p.addView({
          rows: [
            {},{view: 'label', label: '当前时间点没有考试！', align: 'center'},{}
          ]
        });
      }
      if (res.data.num >= 1) {
        let data = [];
        let len = res.data.paper.length;
        res.data.paper.forEach(function (item) {
          let bTime = new Date(item.bTime*1000);
          let eTime = new Date(item.eTime*1000);
          let bMin = bTime.getMinutes()>9?bTime.getMinutes():'0'+bTime.getMinutes();
          let eMin = eTime.getMinutes()>9?eTime.getMinutes():'0'+eTime.getMinutes();
          data.push({id: item.id, name: item.name,
            time: bTime.toLocaleDateString()+ ' ' + bTime.getHours() + ':' + bMin + ' ~ ' +
              eTime.toLocaleDateString()+ ' ' + eTime.getHours() + ':' + eMin});
        });
        p.addView({
          type: 'wide',
          rows: [
            {view: 'template', template: `当前时间点有${len}个考试，请选择！`, type: 'header', borderless: 1},
            {
              view: 'list', borderless: 1, type: {height: 80}, autoheight: 1, select: 1,
              template: "<div style='color:#555;font-size:20px;'>#name#</div><div>考试时间：#time#</div>",
              data: data,
              on: {
                onItemClick: function (id) {
                  post('/paper', {paperID: id, time: parseInt(new Date().getTime()/1000)}).then(function (r1) {
                    let res = r1.json();
                    if (res.code !== 0) {
                      webix.alert(res.info);
                    }
                    else {
                      let index = 1;
                      let c = p.getChildViews()[0];
                      p.removeView(c);
                      p.addView({height: 5});
                      res.data.judge.forEach(function (item) {
                        p.addView({
                          rows: [
                            {
                              css: 'white-bg question-panel',
                              rows: [
                                {template: '', css: 'question-tip'},
                                {template: '判断', css: 'question-type'},
                                {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, height: 100, css: 'question-content'},
                                {
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
                            },
                            {height: 10}
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
                              let complete = true;
                              let judgeResult = [];
                              let choiceResult = [];
                              let multiResult = [];
                              let shortResult = [];
                              res.data.judge.forEach(function (item) {
                                let value = $$(item.id).getValue();
                                if (value === '') complete = false;
                                judgeResult.push({id: item.id, r: value});
                              });
                              res.data.choice.forEach(function (item) {
                                let value = $$(item.id).getValue();
                                if (value === '') complete = false;
                                choiceResult.push({id: item.id, r: value});
                              });
                              res.data.multi.forEach(function (item) {
                                let a = $$(item.id).getValues().a;
                                let b = $$(item.id).getValues().b;
                                let c = $$(item.id).getValues().c;
                                let d = $$(item.id).getValues().d;
                                let value = (a=='1'?'1':'') + (b=='1'?'2':'') + (c=='1'?'3':'') + (d=='1'?'4':'');
                                if (value === '') complete = false;
                                multiResult.push({id: item.id, r: value});
                              });
                              res.data.short.forEach(function (item) {
                                let value = $$(item.id).getValue();
                                if (value === '') complete = false;
                                shortResult.push({id: item.id, r: value});
                              });
                              let postPaper = function () {
                                post('/exam', {id: id,
                                  judge: judgeResult, choice: choiceResult,
                                  multi: multiResult, short: shortResult
                                }).then(function (r1) {
                                  let res = r1.json();
                                  if (res.code === 0) {
                                    webix.alert('提交成功！');
                                    p.$scope.show('/login');
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
                                webix.confirm({text: '交卷后将不能再修改答案，是否交卷？', title: '友情提示',
                                  ok: '确定', cancel: '取消', callback: function (r) {
                                    if (r) {
                                      postPaper();
                                    }
                                  }
                                });
                              }
                            }
                          },
                          {}
                        ]
                      });
                      p.addView({height: 5});

                      // 显示考试时间
                      let setTime = function() {
                        let timeLeft = 90*60 + res.data.time - parseInt(new Date().getTime()/1000);
                        let hourLeft = parseInt(timeLeft / 3600);
                        let minLeft = parseInt((timeLeft - hourLeft*3600) / 60);
                        let secLeft = parseInt(timeLeft - hourLeft*3600 - minLeft*60);
                        if (hourLeft < 0) hourLeft = 0;
                        if (minLeft < 0) minLeft = 0;
                        if (secLeft < 0) secLeft = 0;
                        if (minLeft < 10) minLeft = '0' + minLeft;
                        if (secLeft < 10) secLeft = '0' + secLeft;
                        let timeLeftStr = '0' + hourLeft + ':' + minLeft + ':' + secLeft;
                        $$('exam:time').define('label', `倒计时：${timeLeftStr}`);
                        $$('exam:time').refresh();
                        $$('exam:time').show();
                      };
                      setTime();
                      timeInterval = setInterval(function () {
                        try {
                          setTime();
                        }catch (e) {
                          console.log(e.toString());
                        }
                      }, 1000);
                    }
                  });
                }
              }
            }
          ]
        });
      }
    });
  }
  destroy() {
    try {
      $$('exam:time').hide();
    }catch (e) {
      console.log(e.toString());
    }
    if (timeInterval) clearInterval(timeInterval);
  }
}