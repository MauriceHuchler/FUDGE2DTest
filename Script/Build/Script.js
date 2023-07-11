"use strict";
var Avatar;
(function (Avatar_1) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    async function loadAvatar() {
        let imgAvatar = new ƒ.TextureImage();
    }
    let ACTION;
    (function (ACTION) {
        ACTION[ACTION["IDLE"] = 0] = "IDLE";
        ACTION[ACTION["WALK"] = 1] = "WALK";
    })(ACTION = Avatar_1.ACTION || (Avatar_1.ACTION = {}));
    class Avatar extends ƒAid.NodeSprite {
        constructor() {
            super("Avatar");
            this.addComponent(new ƒ.ComponentTransform);
        }
        update(_deltaTime) {
        }
    }
    Avatar_1.Avatar = Avatar;
})(Avatar || (Avatar = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class CharacterController extends ƒ.ComponentScript {
    }
    CharacterController.iSubclass = ƒ.Component.registerSubclass(CharacterController);
    Script.CharacterController = CharacterController;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class ComponentController extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        this.cmpAnimator = this.node.getComponent(ƒ.ComponentAnimator);
                        break;
                }
            };
            this.update = (_event) => {
                let deltaTime = ƒ.Loop.timeFrameGame / 1000;
                let inputDirection = ƒ.Vector3.ZERO();
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
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Avatar Stats
            this.walkSpeed = 2.5;
            //get Components
            //get resources
            this.avatarIdleL = ƒ.Project.getResourcesByName("AvatarIdleL")[0];
            this.avatarIdleR = ƒ.Project.getResourcesByName("AvatarIdleR")[0];
            this.avatarWalkL = ƒ.Project.getResourcesByName("AvatarWalkL")[0];
            this.avatarWalkR = ƒ.Project.getResourcesByName("AvatarWalkR")[0];
            let b = ƒ.Project.getResourcesByName("MeshPyramid")[0];
            console.log(b);
            this.currentAnimation = this.avatarIdleR;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    ComponentController.iSubclass = ƒ.Component.registerSubclass(ComponentController);
    Script.ComponentController = ComponentController;
})(Script || (Script = {}));
var Script;
(function (Script) {
    // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CustomComponentScript.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var TestGame;
(function (TestGame) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(TestGame || (TestGame = {}));
//# sourceMappingURL=Script.js.map