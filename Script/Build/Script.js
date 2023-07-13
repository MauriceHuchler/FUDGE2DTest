"use strict";
var TestGame;
(function (TestGame) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    window.addEventListener("load", init);
    let viewport = new ƒ.Viewport();
    let collider;
    function init(_event) {
        let dialog /* : HTMLDialogElement */ = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            dialog.close();
            let graphId /* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView");
            start(graphId);
        });
        dialog.showModal();
    }
    async function start(_graphID) {
        await ƒ.Project.loadResourcesFromHTML();
        let canvas /* : HTMLCanvasElement */ = document.querySelector("canvas");
        TestGame.graph = ƒ.Project.resources[_graphID];
        let cmpCamera = TestGame.graph.getChildrenByName("Avatar")[0].getChildrenByName("Sprite")[0].getComponent(ƒ.ComponentCamera);
        if (!TestGame.graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        viewport.initialize("MyViewport", TestGame.graph, cmpCamera, canvas);
        ƒ.Project.dispatchEvent(new CustomEvent("GraphReady"));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        let tgt = deepSearch(TestGame.graph);
        collider = getComponentCollider(tgt);
        console.log(collider);
    }
    function deepSearch(_node) {
        let result = [];
        function search(_node) {
            let children = [];
            children = _node.getChildren();
            if (children.length > 0) {
                result.push(...children);
                for (let child of children) {
                    search(child);
                }
            }
        }
        search(_node);
        return result;
    }
    function getComponentCollider(_nodes) {
        let result = [];
        for (let node of _nodes) {
            let value = node.getComponent(Script.ComponentCollider);
            if (value != null) {
                result.push(value);
            }
        }
        return result;
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        if (collider.length > 0) {
            let avatarCollider = collider.find(col => col.node.name == "Sprite");
            for (let collision of collider) {
                if (avatarCollider.position.magnitude - collision.position.magnitude != 0) {
                    avatarCollider.collides(collision);
                }
            }
        }
        viewport.draw();
        // ƒ.AudioManager.default.update();
    }
})(TestGame || (TestGame = {}));
var Entity;
(function (Entity_1) {
    var ƒ = FudgeCore;
    class Entity extends ƒ.Node {
        health;
        walkSpeed;
        constructor(_health, _walkSpeed) {
            super("Entity");
            this.health = _health;
            this.walkSpeed = _walkSpeed;
            this.attach(new ƒ.ComponentTransform());
        }
    }
    Entity_1.Entity = Entity;
})(Entity || (Entity = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class CharacterController extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(CharacterController);
        message = "CustomComponentScript added to ";
        walkSpeed;
        isFacingRight;
        health;
        damageCooldown;
        cmpAnimator;
        //Animation Sprites
        avatarWalkL;
        avatarWalkR;
        avatarIdleL;
        avatarIdleR;
        currentAnimation;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Avatar Stats
            this.walkSpeed = 2.5;
            this.damageCooldown = new Script.Cooldown(2 * 60);
            //get Components
            //get resources          
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("resourcesLoaded" /* RESOURCES_LOADED */, this.hndEvent);
            ƒ.Project.addEventListener("OnCollisionEvent", this.getDamage);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
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
                case "resourcesLoaded" /* RESOURCES_LOADED */:
                    // start method
                    this.health = this.node.getComponent(Script.ComponentHealth);
                    this.avatarWalkL = ƒ.Project.getResourcesByName("AvatarWalkL")[0];
                    this.avatarIdleL = ƒ.Project.getResourcesByName("AvatarIdleL")[0];
                    this.avatarIdleR = ƒ.Project.getResourcesByName("AvatarIdleR")[0];
                    this.avatarWalkR = ƒ.Project.getResourcesByName("AvatarWalkR")[0];
                    break;
            }
        };
        getDamage = (_event) => {
            // console.log(_event.detail);
            // console.log(_event.detail);
            let enemy = _event.detail;
            if (this.damageCooldown.hasCooldown) {
                return;
            }
            this.health.getDamage(enemy.getComponent(Script.ComponentEnemy).damage, this.node);
            this.damageCooldown.startCooldown();
        };
        update = (_event) => {
            let deltaTime = ƒ.Loop.timeFrameGame / 1000;
            let inputDirection = ƒ.Vector3.ZERO();
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
        };
    }
    Script.CharacterController = CharacterController;
})(Script || (Script = {}));
var Collider;
(function (Collider_1) {
    var ƒ = FudgeCore;
    class Collider {
        position;
        radius;
        constructor(_position, _radius) {
            this.position = _position;
            this.radius = _radius;
        }
        collides(_collider) {
            let distance = ƒ.Vector2.DIFFERENCE(this.position, _collider.position);
            if (this.radius + _collider.radius > distance.magnitude) {
                return true;
            }
            return false;
        }
    }
    Collider_1.Collider = Collider;
})(Collider || (Collider = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ComponentCollider extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ComponentCollider);
        position;
        radius;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    this.position = this.node.mtxLocal.translation;
                    this.radius = this.node.mtxLocal.scaling.x / 2;
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    break;
            }
        };
        collides(_collider) {
            let distance = ƒ.Vector2.DIFFERENCE(this.position.toVector2(), _collider.position.toVector2());
            if (this.radius + _collider.radius > distance.magnitude) {
                ƒ.Project.dispatchEvent(new CustomEvent("OnCollisionEvent", { detail: _collider.node }));
                return true;
            }
            return false;
        }
        update = () => {
            this.position = this.node.mtxLocal.translation;
            // console.log(this.position.toString());
        };
    }
    Script.ComponentCollider = ComponentCollider;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ComponentEnemy extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ComponentEnemy);
        enemy;
        walkSpeed;
        damage;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.damage = 1;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("resourcesLoaded" /* RESOURCES_LOADED */, this.hndEvent);
            ƒ.Project.addEventListener("GraphReady", this.setTarget);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
                case "resourcesLoaded" /* RESOURCES_LOADED */:
                    break;
            }
        };
        setTarget = (_event) => {
            this.enemy = new Entity.Enemy(this.walkSpeed, this.node.cmpTransform);
            this.enemy.target = TestGame.graph.getChildrenByName("Avatar")[0].getChildrenByName("Sprite")[0];
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        };
        update = () => {
            this.enemy.walkTowards();
        };
    }
    Script.ComponentEnemy = ComponentEnemy;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ComponentHealth extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ComponentHealth);
        maxHealth;
        health;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.maxHealth = 5;
            this.health = new Entity.Health(this.maxHealth);
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
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
        getDamage(_damage, _node) {
            this.health.getDamage(_damage);
            if (this.health.currentHealth <= 0) {
                let parent = _node.getParent();
                if (parent != null) {
                    parent.removeChild(_node);
                }
                // delete Node
            }
        }
    }
    Script.ComponentHealth = ComponentHealth;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ComponentSpawner extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(Script.CustomComponentScript);
        enemyPrefab;
        enemySpawnpoints;
        constructor() {
            super();
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("GraphReady", this.start);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
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
        start = () => {
            this.enemyPrefab;
        };
        spawnEnemies() {
        }
    }
    Script.ComponentSpawner = ComponentSpawner;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Cooldown {
        hasCooldown;
        cooldown;
        get getMaxCoolDown() { return this.cooldown; }
        ;
        set setMaxCoolDown(_param) { this.cooldown = _param; }
        currentCooldown;
        get getCurrentCooldown() { return this.currentCooldown; }
        ;
        onEndCooldown;
        constructor(_number) {
            this.cooldown = _number;
            this.currentCooldown = _number;
            this.hasCooldown = false;
        }
        startCooldown() {
            this.hasCooldown = true;
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.eventUpdate);
        }
        endCooldown() {
            if (this.onEndCooldown != undefined) {
                this.onEndCooldown();
            }
            this.hasCooldown = false;
            this.currentCooldown = this.cooldown;
            ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.eventUpdate);
        }
        resetCooldown() {
            this.hasCooldown = false;
            this.currentCooldown = this.cooldown;
            ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.eventUpdate);
        }
        eventUpdate = (_event) => {
            this.updateCooldown();
        };
        updateCooldown() {
            if (this.hasCooldown && this.currentCooldown > 0) {
                this.currentCooldown--;
            }
            if (this.currentCooldown <= 0 && this.hasCooldown) {
                this.endCooldown();
            }
        }
    }
    Script.Cooldown = Cooldown;
})(Script || (Script = {}));
var Script;
(function (Script) {
    // Register the namespace to FUDGE for serialization
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
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
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Entity;
(function (Entity) {
    class Enemy extends Entity.Entity {
        target;
        myPos;
        constructor(_walkSpeed, _transform) {
            super(new Entity.Health(5), _walkSpeed);
            this.myPos = _transform;
        }
        walkTowards() {
            let deltaTime = ƒ.Loop.timeFrameGame / 1000;
            let tgtVector = ƒ.Vector2.DIFFERENCE(new ƒ.Vector2(this.target.mtxLocal.translation.x, this.target.mtxLocal.translation.y), new ƒ.Vector2(this.myPos.mtxLocal.translation.x, this.myPos.mtxLocal.translation.y));
            if (tgtVector.x == 0 && tgtVector.y == 0) {
                return;
            }
            if (tgtVector.magnitudeSquared < 0.1) {
                return;
            }
            tgtVector.normalize();
            // console.log(this.myPos.mtxLocal.toString());
            this.myPos.mtxLocal.translate(ƒ.Vector3.SCALE(tgtVector.toVector3(), deltaTime * this.walkSpeed));
        }
    }
    Entity.Enemy = Enemy;
})(Entity || (Entity = {}));
var Entity;
(function (Entity) {
    class Health {
        maxHealth;
        currentHealth;
        constructor(_maxHealth) {
            this.maxHealth = _maxHealth;
            this.currentHealth = this.maxHealth;
        }
        getDamage(_damage) {
            this.currentHealth -= _damage;
            if (this.currentHealth > this.maxHealth) {
                this.currentHealth = this.maxHealth;
            }
            console.log("Health:" + this.currentHealth);
        }
    }
    Entity.Health = Health;
})(Entity || (Entity = {}));
//# sourceMappingURL=Script.js.map