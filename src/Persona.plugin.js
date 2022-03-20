// @ts-check
module.exports = class Persona {
    onMessage(message) {
      const content = message.firstElementChild;
      content?.classList.add("groupStart-3Mlgv1")
      message.appendChild(createDecorater());
      console.log(message);
    }

    load() {

    }

    start() {
      const pluginDir = path.join(BdApi.Plugins.folder, "/Persona/styles.css");
      const css = fs.readFileSync(pluginDir).toString();
    }

    stop() {
    }

    observer(changes) {
      if(!changes.addedNodes.length) {
        return;
      }
      const target = changes.target;
      if(!target.classList.contains("scrollerInner-2PPAp2")) {
        return;
      }
      const $element = changes.addedNodes[0];
      if(!$element) return;
      if(!$element.classList.contains("messageListItem-ZZ7v6g")) return;
      if(!$element.childNodes.length) return;
      this.onMessage($element);
    }
};


function createDecorater() {
    const $decorater = document.createElement("div");
    $decorater.className = "PersonaDecorator";
    return $decorater;
}
