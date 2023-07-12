declare namespace TestGame {
    import ƒ = FudgeCore;
    let graph: ƒ.Graph;
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
        private cmpAnimator;
        private avatarWalkL;
        private avatarWalkR;
        private avatarIdleL;
        private avatarIdleR;
        private currentAnimation;
        constructor();
        hndEvent: (_event: Event) => void;
        update: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentEnemy extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private enemy;
        walkSpeed: number;
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
        constructor();
        hndEvent: (_event: Event) => void;
        getDamage(_damage: number, _node: ƒ.Node): void;
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
