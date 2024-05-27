class Camera {
    constructor() {
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);
    }

    moveForward() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        let d = copy_at.sub(this.eye);
        d.normalize();
      
        this.eye.add(d);
        this.at.add(d);
    }
      
    moveBackward() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);

        // d = at - eye
        let d = copy_at.sub(this.eye);
        d.normalize();
      
        this.eye.sub(d);
        this.at.sub(d);
    }
      
    moveLeft() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        // d = at - eye
        let d = copy_at.sub(this.eye);
        let left = Vector3.cross(d, this.up);
        left.normalize();
      
        this.eye.sub(left);
        this.at.sub(left);
    }
      
    moveRight() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);
      
        // d = at - eye
        let d = copy_at.sub(this.eye);
        d.mul(-1);
        
        let right = Vector3.cross(d, this.up);
        right.normalize();
      
        this.eye.sub(right);
        this.at.sub(right);
    }

    rotatLeft() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);

        let d = copy_at.sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(4, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let rotated_d = rotationMatrix.multiplyVector3(d);  
        let a = new Vector3();
        a.set(this.eye);
        a.add(rotated_d);
        this.at.set(a);
    }

    rotatRight() {
        // Make a copy of this.at for calculating d
        let copy_at = new Vector3();
        copy_at.set(this.at);

        let d = copy_at.sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(-4, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let rotated_d = rotationMatrix.multiplyVector3(d);  
        let a = new Vector3();
        a.set(this.eye);
        a.add(rotated_d);
        this.at.set(a);
    }
}