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
    class ComponentHealth extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private maxHealth;
        health: Entity.Health;
        constructor();
    }
}
declare namespace Script {
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
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
declare namespace TestGame {
}
