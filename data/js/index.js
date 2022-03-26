import Dialog from "./dialog.js";
import Menu from "./menu.js";

const menu = new Menu();
const dialog = new Dialog();

window.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "menu": {
      menu.onData(event.data);
      break;
    }
    case "dialog": {
      dialog.onData(event.data);
      break;
    }
  }
});
