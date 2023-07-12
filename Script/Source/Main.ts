namespace TestGame {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");


  window.addEventListener("load", init);
  let viewport = new ƒ.Viewport();
  export let graph: ƒ.Graph;
  function init(_event: Event)/* : void */ {
    let dialog/* : HTMLDialogElement */ = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event) {
      dialog.close();
      let graphId/* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView")
      start(graphId);
    });
    dialog.showModal();
  }

  async function start(_graphID: string): Promise<void> {
    await ƒ.Project.loadResourcesFromHTML();
    let canvas/* : HTMLCanvasElement */ = document.querySelector("canvas");
    graph = <ƒ.Graph>ƒ.Project.resources[_graphID];
    let cmpCamera = graph.getChildrenByName("Avatar")[0].getChildrenByName("Sprite")[0].getComponent(ƒ.ComponentCamera);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }

    viewport.initialize("MyViewport", graph, cmpCamera, canvas);
    ƒ.Project.dispatchEvent(new CustomEvent("GraphReady"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }


  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }
}