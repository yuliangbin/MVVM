function MVVM(options) {
	this.$options = options || {};
	var data = this._data = this.$options.data;
	var _this = this;//当前实例vm

	// 数据代理
	// 实现 vm._data.xxx -> vm.xxx 
	Object.keys(data).forEach(function(key) {
		_this._proxyData(key);
	});
	observe(data, this);
	this.$compile = new Compile(options.el || document.body, this);

}

MVVM.prototype = {

//数据代理函数实现
_proxyData: function(key) {
	var _this = this;
	if (typeof key == 'object' && !(key instanceof Array)){//这里只实现了对对象的监听，没有实现数组的
		this._proxyData(key);
	}
	Object.defineProperty(_this, key, {
		configurable: false,
		enumerable: true,
		get: function proxyGetter() {
			return _this._data[key];
		},
		set: function proxySetter(newVal) {
			_this._data[key] = newVal;
		}
	});
},


};


