/**
 @name: register.js
 @editor: PyCharm
 @Date: 2019/2/26 17:02
 @Author: ly
 @Description: 用户注册
 */
import {JetView} from "webix-jet";

export default class Register extends JetView {
	config() {
		return {
			type: 'space',
			rows: [
				{},
				{}
			]
		};
	}
}
