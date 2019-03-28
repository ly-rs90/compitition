/**
 @name: examresult.js
 @editor: PyCharm
 @Date: 2019/3/7 15:49
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
import {JetView} from 'webix-jet';
import {post} from '../models/post';


export default class ExamResult extends JetView {
  config() {
    return {
      rows: [
        {
          view: 'tabview', tabbar: {optionWidth: 120},
          cells: [
            {
              header: '结果汇总',
              body: {}
            },
            {
              header: '分数分布',
              body: {}
            }
          ]
        }
      ]
    };
  }
  init(_$view, _$) {

  }
  ready(_$view, _$url) {
    $$('admin:menu').select('examresult');
  }
}