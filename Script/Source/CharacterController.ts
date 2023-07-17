namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);



    export class CharacterController extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(CharacterController);

        public message: string = "CustomComponentScript added to ";

        public walkSpeed: number;
        private isFacingRight: boolean;
        public health: Script.ComponentHealth;
        public damageCooldown: Cooldown;


        private cmpAnimator: ƒ.ComponentAnimator;

        //Animation Sprites
        private avatarWalkL: ƒ.AnimationSprite
        private avatarWalkR: ƒ.AnimationSprite
        private avatarIdleL: ƒ.AnimationSprite
        private avatarIdleR: ƒ.AnimationSprite


        private currentAnimation: ƒ.AnimationSprite;


        private mousePosition: ƒ.Vector3;


        constructor() {
            super();

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Avatar Stats
            this.walkSpeed = 2.5;
            this.damageCooldown = new Cooldown(2 * 60);
            //get Components

            //get resources          

            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.hndEvent);
            ƒ.Project.addEventListener("OnCollisionEvent", <EventListener>this.getDamage);
            document.addEventListener("mousedown", this.attack);
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
                    this.cmpAnimator = TestGame.getNode(this.node, "Sprite").getComponent(ƒ.ComponentAnimator);
                    break;
                case ƒ.EVENT.RESOURCES_LOADED:
                    // start method
                    this.health = this.node.getComponent(ComponentHealth);

                    this.avatarWalkL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkL")[0];
                    this.avatarIdleL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleL")[0];
                    this.avatarIdleR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleR")[0];
                    this.avatarWalkR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkR")[0];
                    break;
            }
        }

        public getDamage = (_event: CustomEvent) => {
            // console.log(_event.detail);
            // console.log(_event.detail);
            let enemy: ƒ.Node = _event.detail;
            if (this.damageCooldown.hasCooldown) {
                return;
            }
            this.health.getDamage(enemy.getComponent(Script.ComponentEnemy).damage, this.node);
            this.damageCooldown.startCooldown();
        }


        public update = (_event: Event): void => {
            let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
            let inputDirection: ƒ.Vector3 = ƒ.Vector3.ZERO();
            let x = 0;
            let y = 0;



            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                x = -1;
                this.isFacingRight = false;
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                x = 1;
                this.isFacingRight = true;
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
            if (x != 0 || y != 0) {
                this.isFacingRight ? this.currentAnimation = this.avatarWalkR : this.currentAnimation = this.avatarWalkL;
            }
            else {
                this.isFacingRight ? this.currentAnimation = this.avatarIdleR : this.currentAnimation = this.avatarIdleL;
            }

            this.cmpAnimator.animation = this.currentAnimation;
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(inputDirection, deltaTime * this.walkSpeed));



            // protected reduceMutator(_mutator: ƒ.Mutator): void {
            //   // delete properties that should not be mutated
            //   // undefined properties and private fields (#) will not be included by default
            // }
        }
        public getMousePosition = (_mouseEvent: MouseEvent): void => {
            let ray: ƒ.Ray = TestGame.viewport.getRayFromClient(new ƒ.Vector2(_mouseEvent.pageX - TestGame.canvas.offsetLeft, _mouseEvent.pageY - TestGame.canvas.offsetTop));
            this.mousePosition = ray.intersectPlane(new ƒ.Vector3(0, 0, 0), new ƒ.Vector3(0, 0, 1));
            console.log(this.mousePosition);
        }
        public attack = (_event: MouseEvent): void => {
            this.getMousePosition(_event);
        }

    }
}