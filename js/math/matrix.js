export class Matrix {
    constructor() {
        this.identity()
    }

    identity() {
        this.m00 = 1;
        this.m01 = 0;
        this.m02 = 0;
        this.m03 = 0;
        this.m10 = 0;
        this.m11 = 1;
        this.m12 = 0;
        this.m13 = 0;
        this.m20 = 0;
        this.m21 = 0;
        this.m22 = 1;
        this.m23 = 0;
        this.m30 = 0;
        this.m31 = 0;
        this.m32 = 0;
        this.m33 = 1;
        return this
    }

    values() {
        return [
            this.m00, this.m01, this.m02, this.m03,
            this.m10, this.m11, this.m12, this.m13,
            this.m20, this.m21, this.m22, this.m23,
            this.m30, this.m31, this.m32, this.m33,
        ]
    }

    ortho2D(left, right, bottom, top, near, far) {
        const xOrt = 2.0 / (right - left)
        const yOrt = 2.0 / (top - bottom)
        const zOrt = -2.0 / (far - near)

        const tx = -(right + left) / (right - left)
        const ty = -(top + bottom) / (top - bottom)
        const tz = -(far + near) / (far - near)

        this.m00 = xOrt
        this.m10 = 0
        this.m20 = 0
        this.m30 = tx
        this.m01 = 0
        this.m11 = yOrt
        this.m21 = 0
        this.m31 = ty
        this.m02 = 0
        this.m12 = 0
        this.m22 = zOrt
        this.m32 = tz
        this.m03 = 0
        this.m13 = 0
        this.m23 = 0
        this.m33 = 1

        return this
    }

    copy() {
        const dest = this

        dest.m00 = this.m00;
        dest.m01 = this.m01;
        dest.m02 = this.m02;
        dest.m03 = this.m03;
        dest.m10 = this.m10;
        dest.m11 = this.m11;
        dest.m12 = this.m12;
        dest.m13 = this.m13;
        dest.m20 = this.m20;
        dest.m21 = this.m21;
        dest.m22 = this.m22;
        dest.m23 = this.m23;
        dest.m30 = this.m30;
        dest.m31 = this.m31;
        dest.m32 = this.m32;
        dest.m33 = this.m33;

        return dest
    }

    translate(x, y) {
        const src = this.copy()

        this.m30 += src.m00 * x + src.m10 * y
        this.m31 += src.m01 * x + src.m11 * y
        this.m32 += src.m02 * x + src.m12 * y
        this.m33 += src.m03 * x + src.m13 * y

        return this
    }

    rotate(angle, x, y, z) {
        const src = this.copy()

        const c = Math.cos(angle)
        const s = Math.sin(angle)
        const cM = 1.0 - c
        const xy = x * y
        const yz = y * z
        const xz = x * z
        const xs = x * s
        const ys = y * s
        const zs = z * s

        const f00 = x * x * cM + c
        const f01 = xy * cM + zs
        const f02 = xz * cM - ys
        const f10 = xy * cM - zs
        const f11 = y * y * cM + c
        const f12 = yz * cM + xs
        const f20 = xz * cM + ys
        const f21 = yz * cM - xs
        const f22 = z * z * cM + c

        const t00 = src.m00 * f00 + src.m10 * f01 + src.m20 * f02
        const t01 = src.m01 * f00 + src.m11 * f01 + src.m21 * f02
        const t02 = src.m02 * f00 + src.m12 * f01 + src.m22 * f02
        const t03 = src.m03 * f00 + src.m13 * f01 + src.m23 * f02
        const t10 = src.m00 * f10 + src.m10 * f11 + src.m20 * f12
        const t11 = src.m01 * f10 + src.m11 * f11 + src.m21 * f12
        const t12 = src.m02 * f10 + src.m12 * f11 + src.m22 * f12
        const t13 = src.m03 * f10 + src.m13 * f11 + src.m23 * f12
        this.m20 = src.m00 * f20 + src.m10 * f21 + src.m20 * f22
        this.m21 = src.m01 * f20 + src.m11 * f21 + src.m21 * f22
        this.m22 = src.m02 * f20 + src.m12 * f21 + src.m22 * f22
        this.m23 = src.m03 * f20 + src.m13 * f21 + src.m23 * f22
        this.m00 = t00
        this.m01 = t01
        this.m02 = t02
        this.m03 = t03
        this.m10 = t10
        this.m11 = t11
        this.m12 = t12
        this.m13 = t13

        return this
    }

    scale(x, y) {
        this.m00 = this.m00 * x
        this.m01 = this.m01 * x
        this.m02 = this.m02 * x
        this.m03 = this.m03 * x
        this.m10 = this.m10 * y
        this.m11 = this.m11 * y
        this.m12 = this.m12 * y
        this.m13 = this.m13 * y
        this.m20 = this.m20 * 1
        this.m21 = this.m21 * 1
        this.m22 = this.m22 * 1
        this.m23 = this.m23 * 1

        return this
    }
}
