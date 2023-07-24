namespace Entity {
    import ƒ = FudgeCore;

    export class Health extends ƒ.Mutable implements ƒ.Serializable {
        private maxHealth: number;
        public currentHealth: number;
        constructor(_maxHealth: number) {
            super();
            this.maxHealth = _maxHealth;
            this.currentHealth = this.maxHealth;
        }
        public serialize(): ƒ.Serialization {
            return this.getMutator();
          }
      
          public async deserialize(_serialization: ƒ.Serialization): Promise<ƒ.Serializable> {
            this.mutate(_serialization);
            return this;
          }
        protected reduceMutator(_mutator: ƒ.Mutator): void {
            return;
        }

        public getDamage(_damage: number) {
            this.currentHealth -= _damage;
            if (this.currentHealth > this.maxHealth) {
                this.currentHealth = this.maxHealth;
            }
            console.log("Health:" + this.currentHealth);
        }
    }
}