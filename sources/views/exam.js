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
        {
          css: 'judge-bg',
          view: 'scrollview', scroll: 'y', borderless: 1,
          body: {
            type: 'wide', id: 'question:num', css: 'judge-bg',
            rows: []
          }
        },
        {
          width: 800,
          view: 'scrollview', scroll: 'y', borderless: 1, css: 'judge-bg', id: 'scroll:question',
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
    $$('home:title').define('label', '<span style="color: #fff;font-size: 16px;">考试</span>');
    $$('home:title').refresh();
    let jump = function() {
      let num = this.config.value;
      if ($$(num + '_panel').isVisible())
        $$('scroll:question').showView(num + '_panel');
    };
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
                      let totalNum = res.data['judge'].length + res.data['choice'].length + res.data['multi'].length + res.data['short'].length;
                      let questionNum = $$('question:num');
                      // 添加序号
                      questionNum.addView({view: 'label', label: '<span style="color: #09ad5a">题目序号</span>', align: 'center'});
                      for (let i = 0; i < Math.ceil(totalNum/4); i++) {
                        questionNum.addView({
                          cols: [
                            {},
                            {view: 'button', with: 30, value: `${i*4+1}`, click: jump, id: `btn:num${i*4+1}`},
                            i*4+2 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+2}`, click: jump, id: `btn:num${i*4+2}`},
                            i*4+3 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+3}`, click: jump, id: `btn:num${i*4+3}`},
                            i*4+4 > totalNum? {}: {view: 'button', with: 30, value: `${i*4+4}`, click: jump, id: `btn:num${i*4+4}`},
                            {}
                          ]
                        });
                      }
                      questionNum.addView({height: 5});
                      let index = 1;
                      let c = p.getChildViews()[0];
                      p.removeView(c);
                      p.addView({height: 5});
                      let papers = {type: 'wide', rows: []};
                      res.data.judge.forEach(function (item) {
                        let num = index;
                        papers.rows.push({
                          id: index + '_panel',
                          rows: [
                            {
                              css: 'white-bg question-panel',
                              height: 150,
                              rows: [
                                {template: '', css: 'question-tip'},
                                {template: '判断', css: 'question-type'},
                                {view: 'template', template: '', css: 'result-type', borderless: 1, id: item.id + '_judge', hidden: 1},
                                {view: 'template', template: `第${index++}题：` + item.content, borderless: 1, height: 100, css: 'question-content'},
                                {
                                  cols: [
                                    {},
                                    {
                                      view: 'radio', label: '', width: 140, align: 'center', id: item.id, options: [
                                        {id: '0', value: '错'},
                                        {id: '1', value: '对'}
                                      ],
                                      on: {
                                        onChange: function () {
                                          webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                          webix.html.addCss($$('btn:num' + num).getNode(), 'done');
                                        }
                                      }
                                    },
                                    {}
                                  ]
                                },
                                {height: 10},
                                {template: `答案：${['错', '对'][item.ans]}`, css: 'question-ans', hidden: 1, id: `ans${num}`}
                              ]
                            }
                          ]
                        });

                      });
                      res.data.multi.forEach(function (item) {
                        let num = index;
                        papers.rows.push({
                          css: 'white-bg question-panel', id: index + '_panel',
                          height: 270,
                          rows: [
                            {template: '', css: 'question-tip'},
                            {template: '多选', css: 'question-type'},
                            {
                              view: 'template',
                              template: '',
                              css: 'result-type',
                              borderless: 1,
                              id: item.id + '_multi',
                              hidden: 1
                            },
                            {
                              view: 'template',
                              template: `第${index++}题：` + item.content,
                              borderless: 1,
                              autoheight: 1,
                              css: 'question-content'
                            },
                            {
                              view: 'form', id: item.id, borderless: 1,
                              elements: [
                                {view: 'checkbox', label: '', name: 'a', labelWidth: 0, labelRight: 'A、' + item.c1},
                                {view: 'checkbox', label: '', name: 'b', labelWidth: 0, labelRight: 'B、' + item.c2},
                                {view: 'checkbox', label: '', name: 'c', labelWidth: 0, labelRight: 'C、' + item.c3},
                                {view: 'checkbox', label: '', name: 'd', labelWidth: 0, labelRight: 'D、' + item.c4},
                              ],
                              on: {
                                onChange: function () {
                                  let values = this.getValues();
                                  if (values.a || values.b || values.c || values.d) {
                                    webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                    webix.html.addCss($$('btn:num' + num).getNode(), 'done');
                                  } else {
                                    webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                  }
                                }
                              }
                            },
                            {
                              hidden: 1,
                              id: `ans${num}`,
                              template: `答案：${item.ans.replace('1', 'A').replace('2', 'B').replace('3', 'C').replace('4', 'D')}`,
                              css: 'question-ans'
                            }
                          ]
                        });
                      });

                      res.data.choice.forEach(function (item) {
                        let num = index;
                        papers.rows.push({
                          css: 'white-bg question-panel', id: index + '_panel',
                          height: 220,
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
                                  ],
                                  on: {
                                    onChange: function () {
                                      webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                      webix.html.addCss($$('btn:num' + num).getNode(), 'done');
                                    }
                                  }
                                }
                              ]
                            },
                            {height: 10},
                            {template: `答案：${['A', 'B', 'C', 'D'][item.ans - 1]}`, css: 'question-ans', hidden: 1, id: `ans${num}`}
                          ]
                        });

                      });
                      res.data.short.forEach(function (item) {
                        let num = index;
                        papers.rows.push({
                          css: 'white-bg question-panel', id: index + '_panel',
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
                                {
                                  view: 'textarea', label: '', id: item.id, height: 240,
                                  on: {
                                    onChange: function (v) {
                                      if (v !== '') {
                                        webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                        webix.html.addCss($$('btn:num' + num).getNode(), 'done');
                                      }else {
                                        webix.html.removeCss($$('btn:num' + num).getNode(), 'done');
                                      }
                                    }
                                  }
                                },
                                {width: 10}
                              ]
                            },
                            {height: 10},
                            {
                              cols: [
                                {},
                                {
                                  view: 'button', value: '答案', width: 100, hidden: 1, id: `ans${num}`,
                                  click: function () {
                                    webix.alert({text: item.ans, width: 600});
                                  }
                                },
                                {}
                              ]
                            }
                          ]
                        });

                      });
                      papers.rows.push({
                        cols: [
                          {},
                          {
                            view: 'button', value: '交卷', width: 120, id: 'post:paper',
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
                                  let res1 = r1.json();
                                  if (res1.code === 0) {
                                    $$('post:paper').disable();
                                    // 显示答案
                                    for(let i = 1; i <= totalNum; i++) {
                                      $$('ans' + i).show();
                                    }
                                    let index = 1;
                                    res.data.judge.forEach(function (item) {
                                      let ans = $$(item.id).getValue();
                                      if (ans === item.ans.toString()) {
                                        $$(item.id + '_judge').define('template', '<span class="fas fa-check"></span>');
                                        $$(item.id + '_judge').refresh();
                                        $$(item.id + '_judge').show();
                                        $$(index + '_panel').hide();
                                      }
                                      else {
                                        $$(item.id + '_judge').define('template', '<span class="fas fa-times"></span>');
                                        $$(item.id + '_judge').refresh();
                                        $$(item.id + '_judge').show();
                                        post('/errorbook', {type: 'add-question', question_id: item.id, question_type: 0});
                                      }
                                      index++;
                                    });
                                    res.data.multi.forEach(function (item) {
                                      let ans = $$(item.id).getValues();
                                      let ansStr = (ans.a===1?'1':'') + (ans.b===1?'2':'') + (ans.c===1?'3':'') + (ans.d===1?'4':'');
                                      if (ansStr === item.ans) {
                                        $$(item.id + '_multi').define('template', '<span class="fas fa-check"></span>');
                                        $$(item.id + '_multi').refresh();
                                        $$(item.id + '_multi').show();
                                        $$(index + '_panel').hide();
                                      }
                                      else {
                                        $$(item.id + '_multi').define('template', '<span class="fas fa-times"></span>');
                                        $$(item.id + '_multi').refresh();
                                        $$(item.id + '_multi').show();
                                        post('/errorbook', {type: 'add-question', question_id: item.id, question_type: 2});
                                      }
                                      index++;
                                    });
                                    res.data.choice.forEach(function (item) {
                                      let ans = $$(item.id).getValue();
                                      if (ans === item.ans) {
                                        $$(item.id + '_choice').define('template', '<span class="fas fa-check"></span>');
                                        $$(item.id + '_choice').refresh();
                                        $$(item.id + '_choice').show();
                                        $$(index + '_panel').hide();
                                      }
                                      else {
                                        $$(item.id + '_choice').define('template', '<span class="fas fa-times"></span>');
                                        $$(item.id + '_choice').refresh();
                                        $$(item.id + '_choice').show();
                                        post('/errorbook', {type: 'add-question', question_id: item.id, question_type: 1});
                                      }
                                      index++;
                                    });
                                    res.data.duration = 0;
                                    webix.alert('提交成功！');
                                    //p.$scope.show('/login');
                                  }
                                  else {
                                    webix.alert('提交失败，原因：' + res1.info);
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

                      papers.rows.push({height: 5});
                      p.addView(papers);

                      // 显示考试时间
                      let setTime = function() {
                        let timeLeft = 60*res.data.duration + res.data.time - parseInt(new Date().getTime()/1000);
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
                        if (timeLeftStr === '00:00:00') {
                          clearInterval(timeInterval);
                        }
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