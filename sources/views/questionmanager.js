/**
 @name: questionmanager.js
 @editor: PyCharm
 @Date: 2019/3/7 15:49
 @Author: ly
 @Description:
 */
import {JetView} from 'webix-jet';
import JudgeManager from 'views/judgemanager';
import ChoiceManger from "views/choicemanager";
import MultiManager from "views/multimanager";
import ShortManager from "views/shortmanager";


export default class QuestionManager extends JetView {
  config() {
    return {
      rows: [
        {
          view: 'tabview', id: 'tab:paper',
          tabbar: {optionWidth: 100},
          cells: [
            {
              header: '判断题',
              body: {
                rows: [
                  JudgeManager
                ]
              }
            },
            {
              header: '单选题',
              body: {
                rows: [
                  ChoiceManger
                ]
              }
            },
            {
              header: '多选题',
              body: {
                rows: [
                  MultiManager
                ]
              }
            },
            {
              header: '简答题',
              body: {
                rows: [
                  ShortManager
                ]
              }
            }
          ]
        }
      ]
    };
  }
  ready(_$view, _$url) {
    $$('admin:menu').select('questionmanager');
  }
}