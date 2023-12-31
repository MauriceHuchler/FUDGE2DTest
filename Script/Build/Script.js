"use strict";
var TestGame;
(function (TestGame) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    TestGame.viewport = new ƒ.Viewport();
    window.addEventListener("load", init);
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
        let avatar;
        avatar = getNode(TestGame.graph, "Avatar");
        let cmpCamera;
        cmpCamera = avatar.getComponent(ƒ.ComponentCamera);
        if (!TestGame.graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        TestGame.viewport.initialize("MyViewport", TestGame.graph, cmpCamera, canvas);
        ƒ.Project.dispatchEvent(new CustomEvent("GraphReady"));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        scanCollider();
    }
    function scanCollider() {
        collider = getAllComponentCollider();
        // console.log(collider);
    }
    TestGame.scanCollider = scanCollider;
    function collisionEvents() {
        if (collider != null && collider.length > 0) {
            let avatarCollider = collider.find(col => col.node.name == "Avatar");
            let enemyCollider = collider.filter(col => col.node.name == "Enemy");
            for (let collision of collider) {
                if (avatarCollider != null && avatarCollider.collides(collision)) {
                    ƒ.Project.dispatchEvent(new CustomEvent("AvatarCollisionEvent", { detail: collision.node }));
                }
                //enemies
                for (let enemy of enemyCollider) {
                    if (enemyCollider.length > 0 && enemy.collides(collision)) {
                        enemy.node.dispatchEvent(new CustomEvent("EnemyCollisionEvent", { detail: collision.node }));
                    }
                    ;
                }
            }
        }
    }
    /**
     * returns node out of _searchable node
     */
    function getNode(_searchable, _name) {
        let result;
        for (let n of _searchable.getIterator()) {
            if (n.name == _name) {
                result = n;
            }
        }
        return result;
    }
    TestGame.getNode = getNode;
    function getAllComponentCollider() {
        let result = [];
        for (let node of TestGame.graph) {
            let collider = node.getComponent(Script.ComponentCollider);
            if (collider != null) {
                result.push(collider);
            }
        }
        return result;
    }
    function update(_event) {
        scanCollider();
        collisionEvents();
        // ƒ.Physics.simulate();  // if physics is included and used
        TestGame.viewport.draw();
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
        tag;
        walkSpeed;
        isFacingRight;
        health;
        damageCooldown;
        shootCooldown;
        projectilePrefab;
        healthNumberHTML;
        cmpAnimator;
        //Animation Sprites
        avatarWalkL;
        avatarWalkR;
        avatarIdleL;
        avatarIdleR;
        currentAnimation;
        mousePosition;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Avatar Stats
            this.walkSpeed = 2.5;
            this.damageCooldown = new Script.Cooldown(2 * 60);
            this.shootCooldown = new Script.Cooldown(1.5 * 60);
            this.tag = Script.TAG.AVATAR;
            //get Components
            //get resources          
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("resourcesLoaded" /* RESOURCES_LOADED */, this.hndEvent);
            ƒ.Project.addEventListener("AvatarCollisionEvent", this.getDamage);
            ƒ.Project.addEventListener("GraphReady", this.start);
            document.addEventListener("mousedown", this.attack);
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
                    this.cmpAnimator = TestGame.getNode(this.node, "Sprite").getComponent(ƒ.ComponentAnimator);
                    break;
                case "resourcesLoaded" /* RESOURCES_LOADED */:
                    // start method
                    this.health = this.node.getComponent(Script.ComponentHealth);
                    this.healthNumberHTML = document.getElementById("HealthNumber");
                    this.healthNumberHTML.innerText = this.health.health.currentHealth.toString();
                    this.avatarWalkL = ƒ.Project.getResourcesByName("AvatarWalkL")[0];
                    this.avatarIdleL = ƒ.Project.getResourcesByName("AvatarIdleL")[0];
                    this.avatarIdleR = ƒ.Project.getResourcesByName("AvatarIdleR")[0];
                    this.avatarWalkR = ƒ.Project.getResourcesByName("AvatarWalkR")[0];
                    break;
            }
        };
        start = () => {
            this.projectilePrefab = ƒ.Project.getResourcesByName("ArrowPrefab")[0];
        };
        getDamage = (_event) => {
            // console.log(_event.detail);
            // console.log(_event.detail);
            let enemy = _event.detail;
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
        };
        setHealthHTML(_health) {
            this.healthNumberHTML.innerText = _health.toString();
            if (_health < 6) {
                this.healthNumberHTML.setAttribute("style", "color:orange;");
            }
            if (_health < 4) {
                this.healthNumberHTML.setAttribute("style", "color:red;");
            }
        }
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
        };
        getMousePosition = (_mouseEvent) => {
            let canvas = document.getElementById("Canvas");
            let ray = TestGame.viewport.getRayFromClient(new ƒ.Vector2(_mouseEvent.pageX - canvas.offsetLeft, _mouseEvent.pageY - canvas.offsetTop));
            this.mousePosition = ray.intersectPlane(new ƒ.Vector3(0, 0, 0), new ƒ.Vector3(0, 0, 1));
            let shootDirection = ƒ.Vector3.DIFFERENCE(this.mousePosition, this.node.mtxLocal.translation);
            return shootDirection;
        };
        attack = (_event) => {
            if (this.shootCooldown.hasCooldown) {
                return;
            }
            let mousePos = this.getMousePosition(_event);
            let direction = this.calcDegree(this.node.mtxLocal.translation, this.mousePosition);
            this.spawnProejctile(direction);
            this.shootCooldown.startCooldown();
            let sound = TestGame.getSoundByName(TestGame.SOUNDS.AVATARSHOOT);
            sound.play(true);
        };
        async spawnProejctile(_direction) {
            let instance = await ƒ.Project.createGraphInstance(this.projectilePrefab);
            instance.mtxLocal.translation = this.node.mtxLocal.translation;
            instance.mtxLocal.rotateZ(_direction + 90);
            TestGame.graph.addChild(instance);
        }
        calcDegree(_center, _target) {
            let xDistance = _target.x - _center.x;
            let yDistance = _target.y - _center.y;
            let degrees = Math.atan2(yDistance, xDistance) * (180 / Math.PI) - 90;
            return degrees;
        }
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
    class ComponentBullet extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ComponentBullet);
        speed;
        damage;
        lifetime;
        tag;
        constructor() {
            super();
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            this.speed = 15;
            this.lifetime = new Script.Cooldown(3 * 60);
            this.lifetime.onEndCooldown = this.remove;
            this.damage = 5;
            this.tag = Script.TAG.BULLET;
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
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.lifetime.startCooldown();
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        update = () => {
            let deltaTime = ƒ.Loop.timeFrameGame / 1000;
            this.node.mtxLocal.translateX(this.speed * deltaTime);
        };
        remove = () => {
            TestGame.graph.removeChild(this.node);
        };
    }
    Script.ComponentBullet = ComponentBullet;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    let TAG;
    (function (TAG) {
        TAG[TAG["ENEMY"] = 0] = "ENEMY";
        TAG[TAG["BULLET"] = 1] = "BULLET";
        TAG[TAG["AVATAR"] = 2] = "AVATAR";
    })(TAG = Script.TAG || (Script.TAG = {}));
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
                    this.radius = this.node.mtxLocal.scaling.x / 3;
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    break;
            }
        };
        collides(_collider) {
            let distance = ƒ.Vector2.DIFFERENCE(this.position.toVector2(), _collider.position.toVector2());
            if (this.radius + _collider.radius > distance.magnitude) {
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
        tag;
        enemy;
        walkSpeed;
        damage;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.damage = 1;
            this.tag = Script.TAG.ENEMY;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("resourcesLoaded" /* RESOURCES_LOADED */, this.hndEvent);
            ƒ.Project.addEventListener("SetTarget", this.setTarget);
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
                    this.node.addEventListener("EnemyCollisionEvent", this.getDamage);
                    break;
                case "resourcesLoaded" /* RESOURCES_LOADED */:
                    break;
            }
        };
        getDamage = (_event) => {
            let bullet = _event.detail;
            let cmpBullet = bullet.getComponent(Script.ComponentBullet);
            if (cmpBullet == null) {
                return;
            }
            let cmpHealth;
            for (let node of this.node.getIterator()) {
                let cmp = node.getComponent(Script.ComponentHealth);
                if (cmp != null) {
                    cmpHealth = cmp;
                    break;
                }
            }
            if (cmpHealth == null) {
                return;
            }
            cmpHealth.getDamage(cmpBullet.damage, this.node);
            TestGame.graph.removeChild(bullet);
        };
        setTarget = (_event) => {
            this.enemy = new Entity.Enemy(this.walkSpeed, this.node.cmpTransform);
            this.enemy.target = TestGame.getNode(TestGame.graph, "Avatar");
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
        health;
        maxHealth;
        healthSprite;
        cmpAnimation;
        constructor() {
            super();
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.maxHealth = 10;
            this.health = new Entity.Health(this.maxHealth);
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("resourcesLoaded" /* RESOURCES_LOADED */, this.hndEvent);
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
                    this.cmpAnimation = TestGame.getNode(this.node, "Sprite").getComponent(ƒ.ComponentAnimator);
                    break;
                case "resourcesLoaded" /* RESOURCES_LOADED */:
                    this.healthSprite = ƒ.Project.getResourcesByName("HealthBarSprite")[0];
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
            // console.log(this.node.getAllComponents());
            //TODO: set healthbar sprite
            // console.log(this.cmpAnimation.animation);
        }
    }
    Script.ComponentHealth = ComponentHealth;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);
    class ComponentSpawner extends ƒ.ComponentScript {
        static iSubclass = ƒ.Component.registerSubclass(ComponentSpawner);
        enemyPrefab;
        enemySpawnpoints;
        counter;
        spawnCooldown;
        numberOfEnemies;
        numberEnemiesHTML;
        constructor() {
            super();
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
            ƒ.Project.addEventListener("GraphReady", this.start);
            this.counter = 0;
            this.numberOfEnemies = 4;
            this.spawnCooldown = new Script.Cooldown(3 * 60);
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
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.numberEnemiesHTML = document.getElementById("EnemyNumber");
                    this.numberEnemiesHTML.innerText = this.numberOfEnemies.toString();
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        start = (_event) => {
            let spawnParent = TestGame.getNode(TestGame.graph, "Spawn Points");
            this.enemySpawnpoints = spawnParent.getChildren();
            this.enemyPrefab = ƒ.Project.getResourcesByName("Enemy")[0];
        };
        update = (_event) => {
            if (this.numberOfEnemies > 0) {
                if (this.spawnCooldown.hasCooldown) {
                    return;
                }
                this.spawnEnemies();
            }
        };
        async spawnEnemies() {
            let nextSpawnPosition = this.enemySpawnpoints[this.counter % 3].mtxLocal.translation;
            this.counter++;
            this.enemyPrefab.mtxLocal.translation = nextSpawnPosition;
            this.spawnCooldown.startCooldown();
            this.numberOfEnemies--;
            this.setHTMLText(this.numberOfEnemies);
            let instance = await ƒ.Project.createGraphInstance(this.enemyPrefab);
            TestGame.graph.addChild(instance);
            ƒ.Project.dispatchEvent(new CustomEvent("SetTarget"));
            TestGame.scanCollider();
        }
        setHTMLText(_number) {
            this.numberEnemiesHTML.innerText = _number.toString();
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
    var ƒ = FudgeCore;
    class Health extends ƒ.Mutable {
        maxHealth;
        currentHealth;
        constructor(_maxHealth) {
            super();
            this.maxHealth = _maxHealth;
            this.currentHealth = this.maxHealth;
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        reduceMutator(_mutator) {
            return;
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
var TestGame;
(function (TestGame) {
    let SOUNDS;
    (function (SOUNDS) {
        SOUNDS[SOUNDS["AVATARWALK"] = 0] = "AVATARWALK";
        SOUNDS[SOUNDS["AVATARSHOOT"] = 1] = "AVATARSHOOT";
        SOUNDS[SOUNDS["ENEMYWALK"] = 2] = "ENEMYWALK";
        SOUNDS[SOUNDS["ENEMYSHOOT"] = 3] = "ENEMYSHOOT";
    })(SOUNDS = TestGame.SOUNDS || (TestGame.SOUNDS = {}));
    const avatarWalkAudio = new ƒ.Audio("Sounds/avatarWalk.mp3");
    const cmpAvatarWalk = new ƒ.ComponentAudio(avatarWalkAudio, true, false);
    cmpAvatarWalk.connect(true);
    cmpAvatarWalk.volume = .08;
    const avatarShootAudio = new ƒ.Audio("Sounds/avatarShoot.mp3");
    const cmpAvatarShoot = new ƒ.ComponentAudio(avatarShootAudio, false, false);
    cmpAvatarShoot.connect(true);
    cmpAvatarShoot.volume = .4;
    function getSoundByName(_name) {
        switch (_name) {
            case SOUNDS.AVATARWALK:
                return cmpAvatarWalk;
            case SOUNDS.AVATARSHOOT:
                return cmpAvatarShoot;
            case SOUNDS.ENEMYSHOOT:
                break;
            case SOUNDS.ENEMYWALK:
                break;
        }
    }
    TestGame.getSoundByName = getSoundByName;
})(TestGame || (TestGame = {}));
//# sourceMappingURL=Script.js.map