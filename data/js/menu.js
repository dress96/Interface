export default class Menu {

    constructor() {
        this.MenuTpl =
		'<div id="menu_{{_namespace}}_{{_name}}">' +
				'<div class="menu-items">' +
					'{{#elements}}' +
						'<div class="menu-item {{#selected}}selected{{/selected}}">' +
							'{{{label}}}{{#isSlider}} : &lt;{{{sliderLabel}}}&gt;{{/isSlider}}' +
						'</div>' +
					'{{/elements}}' +
				'</div>'+
			'</div>' +
		'</div>'
	;
    
	this.ResourceName = 'interface';
	this.opened = {};
	this.focus = [];
	this.pos = {};
    }

	open (namespace, name, data) {
		if (typeof this.opened[namespace] == 'undefined') {
			this.opened[namespace] = {};
		}

		if (typeof this.opened[namespace][name] != 'undefined') {
			this.close(namespace, name);
		}

		if (typeof this.pos[namespace] == 'undefined') {
			this.pos[namespace] = {};
		}

		for (let i=0; i<data.elements.length; i++) {
			if (typeof data.elements[i].type == 'undefined') {
				data.elements[i].type = 'default';
			}
		}

		data._index = this.focus.length;
		data._namespace = namespace;
		data._name = name;

		for (let i=0; i<data.elements.length; i++) {
			data.elements[i]._namespace = namespace;
			data.elements[i]._name = name;
		}

		this.opened[namespace][name] = data;
		this.pos[namespace][name] = 0;

		for (let i=0; i<data.elements.length; i++) {
			if (data.elements[i].selected) {
				this.pos[namespace][name] = i;
			} else {
				data.elements[i].selected = false;
			}
		}

		this.focus.push({
			namespace: namespace,
			name: name
		});

		this.render();
	};

	close (namespace, name) {
		delete this.opened[namespace][name];

		for (let i=0; i<this.focus.length; i++) {
			if (this.focus[i].namespace == namespace && this.focus[i].name == name) {
				this.focus.splice(i, 1);
				break;
			}
		}

		this.render();
	};

	render () {
		let menuContainer = document.getElementById('body-menu');
		let focused = this.getFocused();
		menuContainer.innerHTML = '';
		$(menuContainer).hide();

		for (let namespace in this.opened) {
			for (let name in this.opened[namespace]) {
				let menuData = this.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));

				for (let i=0; i<menuData.elements.length; i++) {
					let element = view.elements[i];

					switch (element.type) {
						case 'default': break;

						case 'slider': {
							element.isSlider = true;
							element.sliderLabel = (typeof element.options == 'undefined') ? element.value : element.options[element.value];

							break;
						}

						default: break;
					}

					if (i == this.pos[namespace][name]) {
						element.selected = true;
					}
				}

				let menu = $(Mustache.render(this.MenuTpl, view))[0];
				$(menu).hide();
				menuContainer.appendChild(menu);
			}
		}

		if (typeof focused != 'undefined') {
			$('#menu_' + focused.namespace + '_' + focused.name).show();
		}

		$(menuContainer).show();

	};

    submit (namespace, name, data){
		$.post('http://' + this.ResourceName + '/menu_submit', JSON.stringify({
			_namespace: namespace,
			_name     : name,
			current   : data,
			elements  : this.opened[namespace][name].elements
		}));
	}

	cancel (namespace, name){
		$.post('http://' + this.ResourceName + '/menu_cancel', JSON.stringify({
			_namespace: namespace,
			_name     : name
		}));
	}

	change (namespace, name, data){
		$.post('http://' + this.ResourceName + '/menu_change', JSON.stringify({
			_namespace: namespace,
			_name     : name,
			current   : data,
			elements  : this.opened[namespace][name].elements
		}));
	}

	getFocused () {
		return this.focus[this.focus.length - 1];
	};

	onData (data)  {
		switch (data.action) {

			case 'openMenu': {
				this.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenu': {
				this.close(data.namespace, data.name);
				break;
			}

			case 'controlPressed': {
				switch (data.control) {

					case 'ENTER': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							let menu = this.opened[focused.namespace][focused.name];
							let pos = this.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							if (menu.elements.length > 0) {
								this.submit(focused.namespace, focused.name, elem);
							}
						}

						break;
					}

					case 'BACKSPACE': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							this.cancel(focused.namespace, focused.name);
						}

						break;
					}

					case 'TOP': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							let menu = this.opened[focused.namespace][focused.name];
							let pos = this.pos[focused.namespace][focused.name];

							if (pos > 0) {
								this.pos[focused.namespace][focused.name]--;
							} else {
								this.pos[focused.namespace][focused.name] = menu.elements.length - 1;
							}

							let elem = menu.elements[this.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == this.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							this.change(focused.namespace, focused.name, elem);
							this.render();
						}

						break;
					}

					case 'DOWN': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							let menu = this.opened[focused.namespace][focused.name];
							let pos = this.pos[focused.namespace][focused.name];
							let length = menu.elements.length;

							if (pos < length - 1) {
								this.pos[focused.namespace][focused.name]++;
							} else {
								this.pos[focused.namespace][focused.name] = 0;
							}

							let elem = menu.elements[this.pos[focused.namespace][focused.name]];

							for (let i=0; i<menu.elements.length; i++) {
								if (i == this.pos[focused.namespace][focused.name]) {
									menu.elements[i].selected = true;
								} else {
									menu.elements[i].selected = false;
								}
							}

							this.change(focused.namespace, focused.name, elem);
							this.render();
						}

						break;
					}

					case 'LEFT': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							let menu = this.opened[focused.namespace][focused.name];
							let pos = this.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									let min = (typeof elem.min == 'undefined') ? 0 : elem.min;

									if (elem.value > min) {
										elem.value--;
										this.change(focused.namespace, focused.name, elem);
									}

									this.render();
									break;
								}

								default: break;
							}
						}

						break;
					}

					case 'RIGHT': {
						let focused = this.getFocused();

						if (typeof focused != 'undefined') {
							let menu = this.opened[focused.namespace][focused.name];
							let pos = this.pos[focused.namespace][focused.name];
							let elem = menu.elements[pos];

							switch(elem.type) {
								case 'default': break;

								case 'slider': {
									if (typeof elem.options != 'undefined' && elem.value < elem.options.length - 1) {
										elem.value++;
										this.change(focused.namespace, focused.name, elem);
									}

									if (typeof elem.max != 'undefined' && elem.value < elem.max) {
										elem.value++;
										this.change(focused.namespace, focused.name, elem);
									}

									this.render();
									break;
								}

								default: break;
							}
						}

						break;
					}

					default: break;
				}

				break;
			}
		}
	};

}
