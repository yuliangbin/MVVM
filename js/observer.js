function observe(data){
	if (typeof data != 'object') {
		return ;
	}
	return new Observe(data);
}

function Observe(data){
	this.data = data;
	this.walk(data);
}

Observe.prototype = {
	walk: function(data){
		let _this  = this;
		for (key in data) {
			if (data.hasOwnProperty(key)){
				let dep = new Dep();
				let value = data[key];
				if (typeof value == 'object'){
					observe(value);
				}
				_this.defineReactive(data,key,data[key]);
			}
		}
	},
	defineReactive: function(data,key,value){
		let dep = new Dep();//在data的属性key内形成闭包，因此每个key都对应一个唯一的订阅器
		Object.defineProperty(data,key,{
			enumerable: true,//可枚举
			configurable: false,//不能再define
			get: function(){
				//console.log('你访问了' + key);//测试代码，忽略
				//如果是是初始化一个Watcher时引起的，则添加进订阅器
				if (Dep.target){
					dep.addSub(Dep.target);
				}
				//console.log(dep);//测试代码，忽略
				return value;
			},
			set: function(newValue){
				//console.log('你设置了' + key);//测试代码，忽略
				if (newValue == value) return;
				value = newValue;
				observe(newValue);//监听新设置的值
				//console.log(dep);//测试代码，忽略
				dep.notify();//通知所有的订阅者
			}
		})
	}
}

function Dep(){
	this.subs = [];
}

Dep.prototype = {
	addSub: function(sub){
		this.subs.push(sub);
	},
	notify: function(){
		this.subs.forEach(function(sub) {
			sub.update();
		})
	}
}











