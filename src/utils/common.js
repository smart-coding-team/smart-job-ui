/**
 * 通用js方法封装处理
 */

const baseURL = process.env.VUE_APP_BASE_API

// 日期格式化
export function parseTime(time, pattern) {
	if (arguments.length === 0 || !time) {
		return null
	}
	const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		} else if (typeof time === 'string') {
			time = time.replace(new RegExp(/[0-9]T[0-9]/),' ').replace(new RegExp(/-/gm), '/');
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str
}

// 表单重置
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields();
	}
}

// 添加日期范围
export function addDateRange(params = {}, dateRange) {
	if (dateRange != null && dateRange !== '') {
		params.beginTime = this.dateRange[0]
		params.endTime = this.dateRange[1]
	}else{
		delete params.beginTime;
		delete params.endTime;
	}
	return params
}

// 回显数据字典
export function selectDictLabel(datas, value) {
	var actions = [];
	Object.keys(datas).some((key) => {
		if (datas[key].dictValue == ('' + value)) {
			actions.push(datas[key].dictLabel);
			return true;
		}
	})
	return actions.join('');
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
	var actions = [];
	var currentSeparator = undefined === separator ? "," : separator;
	var temp = value.split(currentSeparator);
	Object.keys(value.split(currentSeparator)).some((val) => {
		Object.keys(datas).some((key) => {
			if (datas[key].dictValue == ('' + temp[val])) {
				actions.push(datas[key].dictLabel + currentSeparator);
			}
		})
	})
	return actions.join('').substring(0, actions.join('').length - 1);
}

// 通用下载方法
export function download(fileName) {
	window.location.href = baseURL + "/api/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
}

// 字符串格式化(%s )
export function sprintf(str) {
	var args = arguments, flag = true, i = 1;
	str = str.replace(/%s/g, function () {
		var arg = args[i++];
		if (typeof arg === 'undefined') {
			flag = false;
			return '';
		}
		return arg;
	});
	return flag ? str : '';
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
	if (!str || str == "undefined" || str == "null") {
		return "";
	}
	return str;
}
//判断字符是否为空的方法
export function isEmpty(obj) {
	if (typeof obj == "undefined" || obj == null || obj == "") {
		return true;
	} else {
		return false;
	}
}
//判断字符是否为数字的方法
export function isNumber(number) {
   const numReg = /^[0-9]*$/
   return numReg.test(number)		
}
/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
	id = id || 'id'
	parentId = parentId || 'parentId'
	children = children || 'children'
	rootId = rootId || 0
	//对源数据深度克隆
	const cloneData = JSON.parse(JSON.stringify(data))
	//循环所有项
	const treeData = cloneData.filter(father => {
		let branchArr = cloneData.filter(child => {
			//返回每一项的子级数组
			return father[id] === child[parentId]
		});
		branchArr.length > 0 ? father.children = branchArr : '';
		//返回第一层
		return father[parentId] === rootId;
	});
	return treeData != '' ? treeData : data;
}



// 把value转成label
export function parseCodeToLabel(list, code, label) {
	if (isEmpty(list)) {
		return "";
	}
	let obj = list.find(t => t.value === code)
	if (typeof obj == "undefined") {
		return ""
	}
	if (isEmpty(label)) {
		return obj.label
	} else {
		return obj[label]
	}
}
// 判断是否是数组
export function isArray(obj) {

	return Object.prototype.toString.call(obj) == '[object Array]';

}

//拆分成数组并转成数字
export function splitToInt(obj) {
	let array = obj.split(",");
	if (!isArray(array)) {
		return ''
	}
	for (let i = 0; i < array.length; i++) {
		if (!isEmpty(array[i])) {
			array[i] = parseInt(array[i]);
		}
	}
	return array;
}

export function initQueryList(self,beforeCallback, afterCallback) {
	let loading = true;
	clearTimeout("");
	setTimeout(() => {
	  loading = false;
	  console.log("beforeCallback:"+ typeof beforeCallback)
	   let list= beforeCallback('')
	   console.log("list0:"+list)
	   afterCallback(self, list); 
	}, 100 * Math.random());
  }

export function remoteQueryMethod(queryString, self, beforeCallback, afterCallback) {
	queryString = queryString ? queryString.trim() : "";
	let loading = true;
	clearTimeout("");
	setTimeout(() => {
		loading = false;
		let data = beforeCallback(queryString)
		let list = data.filter((item) => {
			return new RegExp(queryString, "i").test(item.label);
		});
		afterCallback(self, list);
	}, 100 * Math.random());
}