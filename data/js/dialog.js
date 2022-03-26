export default class Dialog {
  constructor() {
    this.DialogTpl =
      '<div id="dialogMenu_{{_namespace}}_{{_name}}" class="dialog {{#isBig}}big{{/isBig}}">' +
      '<div class="head"><span>{{title}}</span></div>' +
      '{{#isDefault}}<input type="text" name="value" id="inputText"/>{{/isDefault}}' +
      '{{#isBig}}<textarea name="value"/>{{/isBig}}' +
      '<div class ="buttons-panel">' +
      '<button type="button" name="submit">Aceptar</button>' +
      '<button type="button" name="cancel">Cancelar</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    this.ResourceName = "interface";
    this.opened = {};
    this.focus = [];
    this.pos = {};
  }

  open(namespace, name, data) {
    if (typeof this.opened[namespace] == "undefined") {
      this.opened[namespace] = {};
    }

    if (typeof this.opened[namespace][name] != "undefined") {
      this.close(namespace, name);
    }

    if (typeof this.pos[namespace] == "undefined") {
      this.pos[namespace] = {};
    }

    if (typeof data.type == "undefined") {
      data.type = "default";
    }

    if (typeof data.align == "undefined") {
      data.align = "top-left";
    }

    data._index = this.focus.length;
    data._namespace = namespace;
    data._name = name;

    this.opened[namespace][name] = data;
    this.pos[namespace][name] = 0;

    this.focus.push({
      namespace: namespace,
      name: name,
    });

    document.onkeyup = (key) => {
      if (key.which == 27) {
        // Escape key
        this.cancel(data);
      } else if (key.which == 13) {
        // Enter key
        this.submit(data);
      }
    };

    this.render();
  }

  close(namespace, name) {
    delete this.opened[namespace][name];

    for (let i = 0; i < this.focus.length; i++) {
      if (this.focus[i].namespace == namespace && this.focus[i].name == name) {
        this.focus.splice(i, 1);
        break;
      }
    }

    this.render();
  }

  render() {
    let menuContainer = $("#body-dialog")[0];
    $(menuContainer).find('button[name="submit"]').unbind("click");
    $(menuContainer).find('button[name="cancel"]').unbind("click");
    $(menuContainer).find('[name="value"]').unbind("input propertychange");
    menuContainer.innerHTML = "";
    $(menuContainer).hide();

    for (let namespace in this.opened) {
      for (let name in this.opened[namespace]) {
        let menuData = this.opened[namespace][name];
        let view = JSON.parse(JSON.stringify(menuData));

        switch (menuData.type) {
          case "default": {
            view.isDefault = true;
            break;
          }

          case "big": {
            view.isBig = true;
            break;
          }

          default:
            break;
        }

        let menu = $(Mustache.render(this.DialogTpl, view))[0];

        $(menu).css("z-index", 1000 + view._index);

        $(menu)
          .find('button[name="submit"]')
          .click(() => {
            this.submit(menuData);
          });

        $(menu)
          .find('button[name="cancel"]')
          .click(() => {
            this.cancel(menuData);
          });

        $(menu)
          .find('[name="value"]')
          .bind("input propertychange", () => {
            menuData.value = $(menu).find('[name="value"]').val();
            this.change(menuData);
          });

        if (typeof menuData.value != "undefined") {
          $(menu).find('[name="value"]').val(menuData.value);
        }

        menuContainer.appendChild(menu);
      }
    }

    $(menuContainer).show();
    $("#inputText").focus();
  }

  submit(data) {
    $.post(
      "http://" + this.ResourceName + "/dialog_submit",
      JSON.stringify(data)
    );
  }

  cancel(data) {
    $.post(
      "http://" + this.ResourceName + "/dialog_cancel",
      JSON.stringify(data)
    );
  }

  change(data) {
    $.post(
      "http://" + this.ResourceName + "/dialog_change",
      JSON.stringify(data)
    );
  }

  getFocused() {
    return this.focus[this.focus.length - 1];
  }

  onData(data) {
    switch (data.action) {
      case "openDialog": {
        this.open(data.namespace, data.name, data.data);
        break;
      }

      case "closeDialog": {
        this.close(data.namespace, data.name);
        break;
      }
    }
  }
}
