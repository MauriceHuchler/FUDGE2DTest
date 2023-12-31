namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);



    export class CharacterController extends ƒ.ComponentScript implements Tagable {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(CharacterController);

        public message: string = "CustomComponentScript added to ";
        tag: TAG;
        public walkSpeed: number;
        private isFacingRight: boolean;
        public health: Script.ComponentHealth;
        public damageCooldown: Cooldown;
        public shootCooldown: Cooldown;

        public projectilePrefab: ƒ.Graph;
        public healthNumberHTML: HTMLElement;

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
            this.shootCooldown = new Cooldown(1.5 * 60);
            this.tag = TAG.AVATAR;
            //get Components

            //get resources          

            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.hndEvent);
            ƒ.Project.addEventListener("AvatarCollisionEvent", <EventListener>this.getDamage);
            ƒ.Project.addEventListener("GraphReady", <EventListener>this.start);
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
                    this.healthNumberHTML = document.getElementById("HealthNumber");
                    this.healthNumberHTML.innerText = this.health.health.currentHealth.toString();

                    this.avatarWalkL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkL")[0];
                    this.avatarIdleL = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleL")[0];
                    this.avatarIdleR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarIdleR")[0];
                    this.avatarWalkR = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("AvatarWalkR")[0];
                    break;
            }
        }

        public start = (): void => {
            this.projectilePrefab = <ƒ.Graph>ƒ.Project.getResourcesByName("ArrowPrefab")[0];
        }

        public getDamage = (_event: CustomEvent) => {
            // console.log(_event.detail);
            // console.log(_event.detail);
            let enemy: ƒ.Node = _event.detail;
            if (this.damageCooldown.hasCooldown) {
                return;
            }
            let cmpEnemy = enemy.getComponent(Script.ComponentEnemy);
            if (cmpEnemy == null) {
                return;
            }
            this.health.getDamage(cmpEnemy.damage, this.node);
            this.damageCooldown.startCooldown();
            this.setHealthHTML(this.health.health.currentHealth);
        }

        protected setHealthHTML(_health: number) {
            this.healthNumberHTML.innerText = _health.toString();
            if (_health < 6) {
                this.healthNumberHTML.setAttribute("style", "color:orange;");
            }
            if (_health < 4) {
                this.healthNumberHTML.setAttribute("style", "color:red;");
            }
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
                let sound = TestGame.getSoundByName(TestGame.SOUNDS.AVATARWALK);
                if (!sound.isPlaying) {
                    sound.play(true);
                }
            }
            else {
                this.isFacingRight ? this.currentAnimation = this.avatarIdleR : this.currentAnimation = this.avatarIdleL;
                TestGame.getSoundByName(TestGame.SOUNDS.AVATARWALK).play(false);

            }

            this.cmpAnimator.animation = this.currentAnimation;
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(inputDirection, deltaTime * this.walkSpeed));



            // protected reduceMutator(_mutator: ƒ.Mutator): void {
            //   // delete properties that should not be mutated
            //   // undefined properties and private fields (#) will not be included by default
            // }
        }
        public getMousePosition = (_mouseEvent: MouseEvent): ƒ.Vector3 => {
            let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("Canvas");
            let ray: ƒ.Ray = TestGame.viewport.getRayFromClient(new ƒ.Vector2(_mouseEvent.pageX - canvas.offsetLeft, _mouseEvent.pageY - canvas.offsetTop));
            this.mousePosition = ray.intersectPlane(new ƒ.Vector3(0, 0, 0), new ƒ.Vector3(0, 0, 1));
            let shootDirection = ƒ.Vector3.DIFFERENCE(this.mousePosition, this.node.mtxLocal.translation);
            return shootDirection;
        }
        public attack = (_event: MouseEvent): void => {
            if (this.shootCooldown.hasCooldown) {
                return;
            }
            let mousePos = this.getMousePosition(_event);
            let direction = this.calcDegree(this.node.mtxLocal.translation, this.mousePosition);
            this.spawnProejctile(direction);
            this.shootCooldown.startCooldown();
            let sound = TestGame.getSoundByName(TestGame.SOUNDS.AVATARSHOOT);
            sound.play(true);

        }

        async spawnProejctile(_direction: number) {
            let instance = await ƒ.Project.createGraphInstance(this.projectilePrefab);
            instance.mtxLocal.translation = this.node.mtxLocal.translation;
            instance.mtxLocal.rotateZ(_direction + 90);
            TestGame.graph.addChild(instance);
        }

        public calcDegree(_center: ƒ.Vector3, _target: ƒ.Vector3): number {
            let xDistance: number = _target.x - _center.x;
            let yDistance: number = _target.y - _center.y;
            let degrees: number = Math.atan2(yDistance, xDistance) * (180 / Math.PI) - 90;
            return degrees;

        }

    }
}