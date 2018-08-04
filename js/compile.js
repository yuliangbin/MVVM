function Compile(el,vm){
	this.$vm = vm;//vm为当前实例
	this.$el = document.querySelector(el);//获得要解析的根元素
	
	if (this.$el){
		this.$fragment = this.nodeToFragment(this.$el);
		this.init();
		this.$el.appendChild(this.$fragment);
	}
	
}

Compile.prototype = {
	nodeToFragment: function(el){
		let fragment = document.createDocumentFragment();
		let child;
		while (child = el.firstChild){
			fragment.appendChild(child);//append相当于剪切的功能
		}
		return fragment;
		
	},
	
	init: function(){
		this.compileElement(this.$fragment);
	},
	
	compileElement: function(node){
		let childNodes = node.childNodes;
		const _this = this;
		let reg = /\{\{(.*)\}\}/;
		[].slice.call(childNodes).forEach(function(node){
			
			if (_this.isElementNode(node)){//如果为元素节点，则进行相应操作
				_this.compile(node);
			} else if (_this.isTextNode(node) && reg.test(node.textContent)){
				//如果为文本节点，并且包含data属性(如{{name}}),则进行相应操作
				_this.compileText(node,reg.exec(node.textContent)[1]);
			}
			
			if (node.childNodes && node.childNodes.length){
				//如果节点内还有子节点，则递归继续解析节点
				_this.compileElement(node);
				
			}
		})
	},
	
	compileText: function(node,exp){
		compileUtil.text(node,this.$vm,exp);
	},
	
	isElementNode: function(node){
		return (node.nodeType == 1);
	},
	
	isTextNode: function(node){
		return node.nodeType == 3;
	},
	
	isDirective: function(attr){
		return (attr.indexOf('v-') == 0);
	},
	
	isEventDirective: function(attr){
		return attr.indexOf('on') == 0;
	},
	
	isLinkDirective: function(attr){
		return attr.indexOf('bind') == 0;
	},
	
	
	//编译节点内的属性
    compile: function(node) {
        var nodeAttrs = node.attributes,//获取当前节点的属性,v-on:,v-bind:,v-model,class等属性
			_this = this;

        [].slice.call(nodeAttrs).forEach(function(attr) {
            var attrName = attr.name;
			
            if (_this.isDirective(attrName)) {//判断是否为vue指令
                var exp = attr.value;
                var dir = attrName.substring(2);
                // 事件指令: v-on:
                if (_this.isEventDirective(dir)) {
					//node:当前节点， _this.$vm:当前实例, exp:指令属性值(表达式或函数), dir:指令类型(on)
                    compileUtil.eventHandler(node, _this.$vm, exp, dir);
                } 
				if (_this.isLinkDirective(dir)){
					let attr = dir.split(':')[1];
					compileUtil[attr] && compileUtil[attr](node, _this.$vm, exp);
				}else {
					//其它指令: v-bind:,v-model
					
                    compileUtil[dir] && compileUtil[dir](node, _this.$vm, exp);
                }
            }
        });
    },
};

let updater = {
	textUpdater: function(node,value){
		node.textContent = typeof value == 'undefined' ? '' : value;
	},

    modelUpdater: function(node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
	
	classUpdater: function(node, value) {
        var className = node.className;
        node.className = className + value;
    },
}
	
let compileUtil = {
	
	eventHandler: function(node,vm,exp,dir){
		let eventType = dir.split(':')[1];
		let fn = vm.$options.methods && vm.$options.methods[exp];
		if (eventType && fn){
			node.addEventListener(eventType,fn.bind(vm),false);
		}
	},
	
	class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },
	
	model: function(node,vm,exp){
		this.bind(node,vm,exp,'model');
		
		let _this = this;
		let value = node.value;
		node.addEventListener('input',function(e){
			let newValue = e.target.value;
			if (value == newValue) return;
			vm[exp] = newValue;//设置exp属性值，触发视图的更新
		},false);
	},
	
	text: function(node,vm,exp){
		this.bind(node,vm,exp,'text');
	},

	_getVMVal: function(vm,exp) {
		let arr = exp.split('.');
		let value = vm;
		arr.forEach(function(item){
			value = value[item];
		})
		//console.log(value);
		return value;
	},
	
	bind: function(node,vm,exp,dir){
		let updaterFn = updater[dir + 'Updater'];
		updaterFn && updaterFn(node,this._getVMVal(vm,exp));
		new Watcher(vm,exp,function(value){
			updaterFn && updaterFn(node,value)
		});
		//console.log('实例化了一个Watcher');//测试代码，忽略
	}
};






