namespace TestGame {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");


  export let viewport = new ƒ.Viewport();
  export let graph: ƒ.Graph;
  window.addEventListener("load", init);


  let collider: Script.ComponentCollider[];


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
    let avatar: ƒ.Node;
    avatar = getNode(graph, "Avatar");

    let cmpCamera: ƒ.ComponentCamera;
    cmpCamera = avatar.getComponent(ƒ.ComponentCamera);

    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }

    viewport.initialize("MyViewport", graph, cmpCamera, canvas);
    ƒ.Project.dispatchEvent(new CustomEvent("GraphReady"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    scanCollider();
  }

  export function scanCollider() {
    collider = getAllComponentCollider();
    // console.log(collider);
  }

  /**
   * returns node out of _searchable node
   */
  export function getNode(_searchable: ƒ.Node, _name: string): ƒ.Node {
    let result: ƒ.Node;
    for (let n of _searchable.getIterator()) {
      if (n.name == _name) {
        result = n;
      }
    }
    return result;
  }

  // function deepSearch(_node: ƒ.Graph): ƒ.Node[] {
  //   let result: ƒ.Node[] = [];

  //   function search(_node: ƒ.Node) {
  //     let children: ƒ.Node[] = [];
  //     children = _node.getChildren();
  //     if (children.length > 0) {
  //       result.push(...children);
  //       for (let child of children) {
  //         search(child);
  //       }
  //     }
  //   }

  //   search(_node);
  //   return result;
  // }

  function getAllComponentCollider(): Script.ComponentCollider[] {
    let result: Script.ComponentCollider[] = [];
    for (let node of graph) {
      let collider = node.getComponent(Script.ComponentCollider);
      if (collider != null) {
        result.push(collider);
      }
    }
    return result;
  }

  function update(_event: Event): void {
    scanCollider();
    // ƒ.Physics.simulate();  // if physics is included and used
    if (collider != null && collider.length > 0) {
      let avatarCollider: Script.ComponentCollider = collider.find(col => col.node.name == "Avatar");
      let enemyCollider: Script.ComponentCollider[] = collider.filter(col => col.node.name == "Enemy");
      for (let collision of collider) {
        if (avatarCollider != null && avatarCollider.collides(collision)) {
          ƒ.Project.dispatchEvent(new CustomEvent("AvatarCollisionEvent", { detail: collision.node }));
        }
        for (let enemy of enemyCollider) {
          if (enemyCollider.length > 0 && enemy.collides(collision)) {
            enemy.node.dispatchEvent(new CustomEvent("EnemyCollisionEvent", { detail: collision.node }));
          };
        }
      }
    }
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }
}