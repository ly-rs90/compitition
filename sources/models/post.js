/**
 @name: post.js
 @editor: PyCharm
 @Date: 2019/2/28 14:22
 @Author: ly
 @Description:
 */
import * as webix from 'webix';
export const post = function (url, param) {
  return webix.ajax().post(url, param);
};