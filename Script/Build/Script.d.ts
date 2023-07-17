declare namespace TestGame {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    let graph: ƒ.Graph;
    let canvas: HTMLCanvasElement;
    function scanCollider(): void;
    /**
     * returns node out of _searchable node
     */
    function getNode(_searchable: ƒ.Node, _name: string): ƒ.Node;
}
declare namespace Entity {
    import ƒ = FudgeCore;
    class Entity extends ƒ.Node {
        health: Health;
        walkSpeed: number;
        constructor(_health: Health, _walkSpeed: number);
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CharacterController extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        walkSpeed: number;
        private isFacingRight;
        health: Script.ComponentHealth;
        damageCooldown: Cooldown;
        private cmpAnimator;
        private avatarWalkL;
        private avatarWalkR;
        private avatarIdleL;
        private avatarIdleR;
        private currentAnimation;
        private mousePosition;
        constructor();
        hndEvent: (_event: Event) => void;
        getDamage: (_event: CustomEvent) => void;
        update: (_event: Event) => void;
        getMousePosition: (_mouseEvent: MouseEvent) => void;
        attack: (_event: MouseEvent) => void;
    }
}
declare namespace Collider {
    import ƒ = FudgeCore;
    class Collider {
        position: ƒ.Vector2;
        radius: number;
        constructor(_position: ƒ.Vector2, _radius: number);
        collides(_collider: Collider): boolean;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentCollider extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        position: ƒ.Vector3;
        radius: number;
        constructor();
        hndEvent: (_event: Event) => void;
        collides(_collider: ComponentCollider): boolean;
        update: () => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentEnemy extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private enemy;
        walkSpeed: number;
        damage: number;
        constructor();
        hndEvent: (_event: Event) => void;
        setTarget: (_event: CustomEvent) => void;
        update: () => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentHealth extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private maxHealth;
        health: Entity.Health;
        private healthSprite;
        private cmpAnimation;
        constructor();
        hndEvent: (_event: Event) => void;
        getDamage(_damage: number, _node: ƒ.Node): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentSpawner extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        enemyPrefab: ƒ.Graph;
        enemySpawnpoints: ƒ.Node[];
        counter: number;
        spawnCooldown: Cooldown;
        numberOfEnemies: number;
        constructor();
        hndEvent: (_event: Event) => void;
        start: (_event: CustomEvent) => void;
        update: (_event: Event) => void;
        spawnEnemies(): Promise<void>;
    }
}
declare namespace Script {
    class Cooldown {
        hasCooldown: boolean;
        private cooldown;
        get getMaxCoolDown(): number;
        set setMaxCoolDown(_param: number);
        private currentCooldown;
        get getCurrentCooldown(): number;
        onEndCooldown: () => void;
        constructor(_number: number);
        startCooldown(): void;
        private endCooldown;
        resetCooldown(): void;
        eventUpdate: (_event: Event) => void;
        updateCooldown(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Entity {
    class Enemy extends Entity {
        target: ƒ.Node;
        myPos: ƒ.ComponentTransform;
        constructor(_walkSpeed: number, _transform: ƒ.ComponentTransform);
        walkTowards(): void;
    }
}
declare namespace Entity {
    class Health {
        private maxHealth;
        currentHealth: number;
        constructor(_maxHealth: number);
        getDamage(_damage: number): void;
    }
}
