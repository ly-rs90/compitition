/**
 @name: paperpublish.js
 @editor: PyCharm
 @Date: 2019/3/4 15:44
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import * as webix from 'webix';
import {post} from "../models/post";

let custom_checkbox = function (obj, common, value) {
  if (value) {
    return "<div class='fas fa-check-circle custom-check'></div>";
  }
  else {
    return "";
  }
};

let judge = [];
let choice = [];
let multiChoice = [];
let shortAns = [];

let updateScore = function() {
  let sum = 0;
  sum += judge.length * $$('judge:score').getValue();
  sum += choice.length * $$('choice:score').getValue();
  sum += multiChoice.length * $$('multiChoice:score').getValue();
  sum += shortAns.length * $$('shortAns:score').getValue();
  $$('total:score').define('label', '总分：' + sum);
  $$('total:score').refresh();
};


let updateJudge = function () {
  let len = judge.length;
  if (len > 0) {
    document.querySelectorAll('div.tab-header')[0].innerHTML = '判断题<span class="badge-num">'+ len + '</span>';
  }
  else {
    document.querySelectorAll('div.tab-header')[0].innerHTML = '判断题';
  }
};

let updateChoice = function () {
  let len = choice.length;
  if (len > 0) {
    document.querySelectorAll('div.tab-header')[1].innerHTML = '单选题<span class="badge-num">'+ len + '</span>';
  }
  else {
    document.querySelectorAll('div.tab-header')[1].innerHTML = '单选题';
  }
};

let updateMutliChoice = function () {
  let len = multiChoice.length;
  if (len > 0) {
    document.querySelectorAll('div.tab-header')[2].innerHTML = '多选题<span class="badge-num">'+ len + '</span>';
  }
  else {
    document.querySelectorAll('div.tab-header')[2].innerHTML = '多选题';
  }
};

let updateShortAns = function () {
  let len = shortAns.length;
  if (len > 0) {
    document.querySelectorAll('div.tab-header')[3].innerHTML = '简答题<span class="badge-num">'+ len + '</span>';
  }
  else {
    document.querySelectorAll('div.tab-header')[3].innerHTML = '简答题';
  }
};
export default class PaperPublish extends JetView {
  config() {
    return {
      rows: [
        {
          cols: [
            {width: 20},
            {
              view: 'counter', label: '判断题分值：', labelWidth: 100, min: 1, max: 100, step: 1,
              value: 1, id: 'judge:score',
              on: {
                onChange: function () {
                  updateScore();
                }
              }
            },
            {
              view: 'counter', label: '单选题分值：', labelWidth: 100, min: 1, max: 100, step: 1,
              value: 2, id: 'choice:score',
              on: {
                onChange: function () {
                  updateScore();
                }
              }
            },
            {
              view: 'counter', label: '多选题分值：', labelWidth: 100, min: 1, max: 100, step: 1,
              value: 3, id: 'multiChoice:score',
              on: {
                onChange: function () {
                  updateScore();
                }
              }
            },
            {
              view: 'counter', label: '简答题分值：', labelWidth: 100, min: 1, max: 100, step: 1,
              value: 10, id: 'shortAns:score',
              on: {
                onChange: function () {
                  updateScore();
                }
              }
            }
          ]
        },
        {
          cols: [
            {width: 20},
            {view: 'counter', label: '及格分数线：', labelWidth: 100, min: 0, max: 100, step: 1, value: 95, id: 'pass:score'},
            {
              cols: [
                // {view: 'button', value: '试题预览', autowidth: 1},
                // {width: 10},
                {
                  view: 'button', value: '发布试卷', autowidth: 1,
                  click: function () {
                    webix.ui({
                      view:"window",
                      id:"win1",
                      height:250, width:350,
                      position: 'center', modal: 1,
                      head:{
                        view:"toolbar", margin:-4, cols:[
                          { view:"label", label: "请命名该试卷" },
                          { view:"icon", icon:"fas fa-times", click:function(){
                              $$('win1').close();
                            }}
                        ]
                      },
                      body: {
                        rows: [
                          {height: 5},
                          {
                            cols: [
                              {width: 5},
                              {view: 'textarea', id: 'paper:name'},
                              {width: 5}
                            ]
                          },
                          {height: 5},
                          {
                            cols: [
                              {},
                              {
                                view: 'button', value: '确定', width: 100,
                                click: function () {
                                  let judgeValue = $$('judge:score').getValue();
                                  let choiceValue = $$('choice:score').getValue();
                                  let multiValue = $$('multiChoice:score').getValue();
                                  let shortValue = $$('shortAns:score').getValue();
                                  let passScore = $$('pass:score').getValue();
                                  let totalScore = judgeValue*judge.length + choiceValue*choice.length + multiValue*multiChoice.length
                                    + shortValue*shortAns.length;
                                  let name = $$('paper:name').getValue();
                                  let param = {
                                    name: name,
                                    judge: judge, judgeValue: judgeValue,
                                    choice: choice, choiceValue: choiceValue,
                                    multiChoice: multiChoice, multiValue: multiValue,
                                    shortAns: shortAns, shortValue: shortValue,
                                    passScore: passScore, totalScore: totalScore
                                  };
                                  post('/paperpublish', param).then(function (r) {
                                    let res = r.json();
                                    if (res.code === 0) {
                                      webix.alert('试卷发布成功！');
                                    }
                                    else {
                                      webix.alert('试卷发布失败，原因：' + res.info);
                                    }
                                  });
                                  $$('win1').close();
                                }
                              },
                              {}
                            ]
                          },
                          {height: 10}
                        ]
                      }
                    }).show();
                  }
                },
                {}
              ]
            },
            {},
            {view: 'label', label: '总分：0', id: 'total:score'}
          ]
        },
        {
          view: 'tabview', id: 'tab:paper',
          tabbar: {optionWidth: 100},
          cells: [
            {
              header: '<div class="tab-header">判断题</div>',
              body: {
                view: 'datatable', id: 'paper:judge', checkboxRefresh: 1, editable: 1, scroll: 'y', css: 'table',
                columns: [
                  {id: 'check', header: '', template: custom_checkbox, width: 40},
                  {id: 'index', header: '#', adjust: 1},
                  {id: 'content', header: '题目', fillspace: 1}
                ],
                // scheme:{
                //   $init:function(obj){ obj.index = this.count(); }
                // },
                on:{
                  "data->onStoreUpdated":function(){
                    this.data.each(function(obj, i){
                      obj.index = i+1;
                    });
                  },
                  onItemClick: function (obj) {
                    let item = this.getItem(obj);
                    if (item.check) {
                      this.updateItem(obj.row, {check: 0});
                      for (let i = 0; i < judge.length; i++) {
                        if (judge[i] === obj.row) {
                          judge.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else {
                      this.updateItem(obj.row, {check: 1});
                      judge.push(obj.row);
                    }
                    updateJudge();
                    updateScore();
                  }
                },
                url: '/judge',
                datafetch: 30, datathrottle: 500, loadhead: 30
              }
            },
            {
              header: '<div class="tab-header">单选题</div>',
              body: {
                view: 'datatable', id: 'paper:choice', checkboxRefresh: 1, editable: 1, scroll: 'y', css: 'table',
                columns: [
                  {id: 'check', header: '', template: custom_checkbox, width: 40},
                  {id: 'index', header: '#', adjust: 1},
                  {id: 'content', header: '题目', fillspace: 1}
                ],
                // scheme:{
                //   $init:function(obj){ obj.index = this.count(); }
                // },
                on:{
                  "data->onStoreUpdated":function(){
                    this.data.each(function(obj, i){
                      obj.index = i+1;
                    });
                  },
                  onItemClick: function (obj) {
                    let item = this.getItem(obj);
                    if (item.check) {
                      this.updateItem(obj.row, {check: 0});
                      for (let i = 0; i < choice.length; i++) {
                        if (choice[i] === obj.row) {
                          choice.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else {
                      this.updateItem(obj.row, {check: 1});
                      choice.push(obj.row);
                    }
                    updateChoice();
                    updateScore();
                  }
                },
                url: '/choice',
                datafetch: 30, datathrottle: 500, loadhead: 30
              }
            },
            {
              header: '<div class="tab-header">多选题</div>',
              body: {
                view: 'datatable', id: 'paper:mutlichoice', checkboxRefresh: 1, editable: 1, scroll: 'y', css: 'table',
                columns: [
                  {id: 'check', header: '', template: custom_checkbox, width: 40},
                  {id: 'index', header: '#', adjust: 1},
                  {id: 'content', header: '题目', fillspace: 1}
                ],
                // scheme:{
                //   $init:function(obj){ obj.index = this.count(); }
                // },
                on:{
                  "data->onStoreUpdated":function(){
                    this.data.each(function(obj, i){
                      obj.index = i+1;
                    });
                  },
                  onItemClick: function (obj) {
                    let item = this.getItem(obj);
                    if (item.check) {
                      this.updateItem(obj.row, {check: 0});
                      for (let i = 0; i < multiChoice.length; i++) {
                        if (multiChoice[i] === obj.row) {
                          multiChoice.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else {
                      this.updateItem(obj.row, {check: 1});
                      multiChoice.push(obj.row);
                    }
                    updateMutliChoice();
                    updateScore();
                  }
                },
                url: '/multichoice',
                datafetch: 30, datathrottle: 500, loadhead: 30
              }
            },
            {
              header: '<div class="tab-header">简答题</div>',
              body: {
                view: 'datatable', id: 'paper:shortans', checkboxRefresh: 1, editable: 1, scroll: 'y', css: 'table',
                columns: [
                  {id: 'check', header: '', template: custom_checkbox, width: 40},
                  {id: 'index', header: '#', adjust: 1},
                  {id: 'content', header: '题目', fillspace: 1}
                ],
                // scheme:{
                //   $init:function(obj){ obj.index = this.count(); }
                // },
                on:{
                  "data->onStoreUpdated":function(){
                    this.data.each(function(obj, i){
                      obj.index = i+1;
                    });
                  },
                  onItemClick: function (obj) {
                    let item = this.getItem(obj);
                    if (item.check) {
                      this.updateItem(obj.row, {check: 0});
                      for (let i = 0; i < shortAns.length; i++) {
                        if (shortAns[i] === obj.row) {
                          shortAns.splice(i, 1);
                          break;
                        }
                      }
                    }
                    else {
                      this.updateItem(obj.row, {check: 1});
                      shortAns.push(obj.row);
                    }
                    updateShortAns();
                    updateScore();
                  }
                },
                url: '/shortans',
                datafetch: 30, datathrottle: 500, loadhead: 30
              }
            }
          ]
        }
      ]
    };
  }
  init(_$view, _$) {
    judge = [];
    choice = [];
    multiChoice = [];
    shortAns = [];
    window.onresize = function () {
      updateJudge();
      updateChoice();
      updateMutliChoice();
      updateShortAns();
    };
  }
  ready(_$view, _$url) {
    $$('admin:menu').select('paperpublish');
  }

  destroy() {
    window.onresize = null;
  }
}