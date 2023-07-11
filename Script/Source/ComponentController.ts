namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class ComponentController extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentController);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "CustomComponentScript added to ";

    private walkSpeed: number;

    private cmpAnimator: ƒ.ComponentAnimator;

    readonly avatarSpeed: number;

    private avatarIdleL: ƒ.AnimationSprite;
    private avatarIdleR: ƒ.AnimationSprite;
    private avatarWalkL: ƒ.AnimationSprite;
    private avatarWalkR: ƒ.AnimationSprite;

    private currentAnimation: ƒ.AnimationSprite;



    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;
      // Avatar Stats
      this.walkSpeed = 2.5;
      //get Components

      //get resources
      this.avatarIdleL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleL")[0];
      this.avatarIdleR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleR")[0];
      this.avatarWalkL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkL")[0];

      console.log(this.avatarWalkL);

      this.currentAnimation = this.avatarIdleR;
      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Debug.log(this.message, this.node);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          this.cmpAnimator = this.node.getComponent(ƒ.ComponentAnimator);
          this.avatarWalkR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkR")[0];
          console.log(this.avatarWalkR);

          break;
      }
    }

    public update = (_event: Event): void => {
      let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
      let inputDirection: ƒ.Vector3 = ƒ.Vector3.ZERO();
      let x = 0;
      let y = 0;

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
        x = -1;
      }
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
        x = 1;
      }
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]))
        y = 1;

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]))
        y = -1;
      // else
      //   this.node.mtxLocal.translation = ƒ.Vector3.ZERO();
      inputDirection = new ƒ.Vector3(x, y, 0);
      if (x != 0 || y != 0) {
        inputDirection.normalize();
      }
      //check face direction
      if (x > 0) {
        this.currentAnimation = this.avatarWalkR;
      }
      else if (x < 0) {
        this.currentAnimation = this.avatarWalkL;
      }

      this.cmpAnimator.animation = this.currentAnimation;
      this.node.mtxLocal.translate(ƒ.Vector3.SCALE(inputDirection, deltaTime * this.walkSpeed));



      // protected reduceMutator(_mutator: ƒ.Mutator): void {
      //   // delete properties that should not be mutated
      //   // undefined properties and private fields (#) will not be included by default
      // }
    }

  }
}