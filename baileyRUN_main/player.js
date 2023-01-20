import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';


export const player = (() => {

  class Player {
    constructor(params) {
      this.position_ = new THREE.Vector3(0, 0, 0);
      this.velocity_ = 0.0;
      this.leftMovementSpeed = -0.3;
      this.rightMovementSpeed = 0.3;
      this.jumping_ = false;
      this.inAir_ = false;

      // this.mesh_ = new THREE.Mesh(
      //     new THREE.BoxBufferGeometry(1, 1, 1),
      //     new THREE.MeshStandardMaterial({
      //         color: 0x80FF80,
      //     }),
      // );
      // this.mesh_.castShadow = true;
      // this.mesh_.receiveShadow = true;
      // params.scene.add(this.mesh_);

      this.playerBox_ = new THREE.Box3();

      this.params_ = params;

      this.LoadModel_();
      this.InitInput_();
    }

    LoadModel_() {
      const loader = new FBXLoader();
      loader.setPath('./resources/Player/FBX/');
      loader.load('baileyruncycle.fbx', (fbx) => {
        fbx.scale.setScalar(0.01);
        fbx.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), Math.PI / 2);

        this.mesh_ = fbx;
        this.params_.scene.add(this.mesh_);

      const texturePath = './resources/Player/textures/bailey/';
      const texture1 = new THREE.TextureLoader().load(texturePath + 'clothes_Color.png');
      const texture2 = new THREE.TextureLoader().load(texturePath + 'goggles_Color.png');
      const texture3 = new THREE.TextureLoader().load(texturePath + 'hat_Color.png');
      const texture4 = new THREE.TextureLoader().load(texturePath + 'skin_Color.png');
      const texture5 = new THREE.TextureLoader().load(texturePath + 'hair_Color.png');
      const texture6 = new THREE.TextureLoader().load(texturePath + 'boots_Color.png');
            fbx.traverse((child) => {
              if (child.isMesh) {
                if (child.name === "shirt_GEO" || child.name === "pants_GEO" || child.name === "bagback_GEO" || child.name === "bagfront_GEO" || child.name === "belt_GEO") {
                  child.material.map = texture1;
                } else if (child.name === "goggles_GEO" || child.name === "redstrap_GEO") {
                  child.material.map = texture2;
                } else if (child.name === "hat_base_GEO" || child.name === "hatpart_GEO") {
                  child.material.map = texture3;
                } else if (child.name === "body_transfer_GEO" || child.name === "ear_R_GEO" || child.name === "ear_L_GEO" || child.name === "leg_L_GEO" || child.name === "leg_R_GEO") {
                  child.material.map = texture4;
                } else if (child.isMesh && child.name.startsWith("hair_")) {
                  child.material.map = texture5;
                } else if (child.isMesh && child.name.startsWith("boot_")) {
                  child.material.map = texture6;
                }
              }
            });

        const m = new THREE.AnimationMixer(fbx);
        this.mixer_ = m;

        for (let i = 0; i < fbx.animations.length; ++i) {
          if (fbx.animations[i].name.includes('Run')) {
            const clip = fbx.animations[i];
            const action = this.mixer_.clipAction(clip);
            action.play();
          }
        }
      });
    }

    InitInput_() {
      this.keys_ = {
          left: false,
          right: false,
          space: false,
      };
      document.addEventListener('keydown', (event) => {
          if (event.keyCode === 37) {
              this.keys_.left = true;
          } else if (event.keyCode === 39) {
              this.keys_.right = true;
          } else if (event.keyCode === 32) {
              this.keys_.space = true;
          }
      });
      document.addEventListener('keyup', (event) => {
          if (event.keyCode === 37) {
              this.keys_.left = false;
          } else if (event.keyCode === 39) {
              this.keys_.right = false;
          } else if (event.keyCode === 32) {
              this.keys_.space = false;
          }
      });
  }
    
    OnKeyDown_(event) {
      switch(event.keyCode) {
        case 32:
          this.keys_.space = true;
          break;
        case 37: // left arrow key
          this.keys_.left = true;
          break;
        case 39: // right arrow key
          this.keys_.right = true;
          break;
      }
    }
    
    OnKeyUp_(event) {
      switch(event.keyCode) {
        case 32:
          this.keys_.space = false;
          break;
        case 37: // left arrow key
          this.keys_.left = false;
          break;
        case 39: // right arrow key
          this.keys_.right = false;
          break;
      }
    }   

    CheckCollisions_() {
      const colliders = this.params_.world.GetColliders();

      this.playerBox_.setFromObject(this.mesh_);

      for (let c of colliders) {
        const cur = c.collider;

        if (cur.intersectsBox(this.playerBox_)) {
          this.gameOver = true;
        }
      }
    }
    
    Update(timeElapsed) {
      if (this.keys_.space && this.position_.y == 0.0) {
        this.velocity_ = 30;
        this.inAir_ = true;
        var baileyYay = document.getElementById("bailey-yay");
        baileyYay.play();
      }
      if (!this.inAir_) {
        if (this.keys_.left) {
          this.position_.z += this.leftMovementSpeed;
          var baileyWoo = document.getElementById("bailey-woo");
          baileyWoo.play();
        }
        if (this.keys_.right) {
          this.position_.z += this.rightMovementSpeed;
          var baileyWoo = document.getElementById("bailey-woo");
          baileyWoo.play();
        }
      }
  
      const limit = 3;
      this.position_.z = Math.max(this.position_.z, -limit);
      this.position_.z = Math.min(this.position_.z, limit);
  
      const acceleration = -75 * timeElapsed;
  
      this.position_.y += timeElapsed * (this.velocity_ + acceleration * 0.5);
      this.position_.y = Math.max(this.position_.y, 0.0);
  
      this.velocity_ += acceleration;
      this.velocity_ = Math.max(this.velocity_, -100);
  
      if (this.position_.y == 0.0) {
        this.inAir_ = false;
      }
  
      if (this.mesh_) {
        this.mixer_.update(timeElapsed);
        this.mesh_.position.copy(this.position_);
        this.CheckCollisions_();
      }
    } 
  };

  return {
      Player: Player,
  };
})();