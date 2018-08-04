//Watcher
function Watcher(vm, exp, cb) {
	this.vm = vm;
	this.cb = cb;
	this.exp = exp;
	this.value = this.get();//将自己添加进订阅器
};

Watcher.prototype = {
	update: function(){
		this.run();
	},
	run: function(){
		const value = this.vm[this.exp];
		//console.log('me:'+value);//测试代码，忽略
		if (value != this.value){
			this.value = value;
			this.cb.call(this.vm,value);
		}
	},
	get: function() { 
        Dep.target = this;  // 缓存自己
        var value = this.vm[this.exp];  // 强制访问自己,执行defineProperty里的get函数         
        Dep.target = null;  // 释放自己
        return value;
    }
}