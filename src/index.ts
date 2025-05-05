/**
 * Copied from
 * https://github.com/jriecken/sat-js/blob/20e612681d1f9eabc9ea34dc98c4d27f985ffec6/SAT.js and
 * modified for ES6 and ESM format. The original code has the following license:
 *
 *     Copyright (C) 2012 - 2015 by Jim Riecken
 *
 *     Permission is hereby granted, free of charge, to any person obtaining a copy
 *     of this software and associated documentation files (the "Software"), to deal
 *     in the Software without restriction, including without limitation the rights
 *     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *     copies of the Software, and to permit persons to whom the Software is
 *     furnished to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included in
 *     all copies or substantial portions of the Software.
 *
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *     THE SOFTWARE.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Represents a vector in two dimensions with `x` and `y` components.
 *
 * If a coordinate is not specified, it will be set to `0`.
 */
export class Vector {
    /** X component of this vector. */
    public x: number;
    /** Y component of this vector. */
    public y: number;

    constructor(x?: number | undefined, y?: number | undefined) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * Copy the values of another Vector into this one.
     *
     * @returns This vector, for method chaining.
     */
    public copy(
        /** The vector to copy from. */
        other: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
     * Create a new vector with the same coordinates as this one.
     *
     * @returns The new cloned vector.
     */
    public clone(): Vector {
        return new Vector(this.x, this.y);
    }

    /**
     * Change this vector to be perpendicular to what it was before. (Effectively rotates it 90
     * degrees in a clockwise direction)
     *
     * @returns This vector, for method chaining.
     */
    public perp(): this {
        const x = this.x;
        this.x = this.y;
        this.y = -x;
        return this;
    }

    /**
     * Rotate this vector (counter-clockwise) by the specified angle (in radians).
     *
     * @returns This vector, for method chaining.
     */
    public rotate(
        /** The angle to rotate (in radians). */
        angle: number,
    ): this {
        const x = this.x;
        const y = this.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);
        return this;
    }

    /**
     * Reverse this vector.
     *
     * @returns This vector, for method chaining.
     */
    public reverse(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * Normalize this vector (make it have length of `1`).
     *
     * @returns This vector, for method chaining.
     */
    public normalize(): this {
        const d = this.len();
        if (d > 0) {
            this.x = this.x / d;
            this.y = this.y / d;
        }
        return this;
    }

    /**
     * Add another vector to this one.
     *
     * @returns This vector, for method chaining.
     */
    public add(
        /** The vector to be added. */
        other: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Subtract another vector from this one.
     *
     * @returns This vector, for method chaining.
     */
    public sub(
        /** The vector to be subtracted. */
        other: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Scale this vector. An independent scaling factor can be provided for each axis, or a single
     * scaling factor that will scale both `x` and `y`.
     *
     * @returns This vector, for method chaining.
     */
    public scale(
        /** The scaling factor in the x direction. */
        x: number,
        /**
         * The scaling factor in the y direction. If this is not specified, or is `undefined`, the x
         * scaling factor will be used.
         */
        y?: number | undefined,
    ): this {
        this.x *= x;
        this.y *= y ?? x;
        return this;
    }

    /**
     * Project this vector on to another vector.
     *
     * @returns This vector, for method chaining.
     */
    public project(
        /** The vector to project onto. */
        other: Readonly<Pick<Vector, 'x' | 'y' | 'len2'>>,
    ): this {
        const amt = this.dot(other) / other.len2();
        this.x = amt * other.x;
        this.y = amt * other.y;
        return this;
    }

    /**
     * Project this vector onto a vector of unit length. This is slightly more efficient than
     * {@link Vector.project} when dealing with unit vectors.
     *
     * @returns This vector, for method chaining.
     */
    public projectN(
        /** The unit vector to project onto. */
        unitOther: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        const amt = this.dot(unitOther);
        this.x = amt * unitOther.x;
        this.y = amt * unitOther.y;
        return this;
    }

    /**
     * Reflect this vector on an arbitrary axis.
     *
     * @returns This vector, for method chaining.
     */
    public reflect(
        /** The vector representing the axis. */
        axis: Readonly<Pick<Vector, 'x' | 'y' | 'len2'>>,
    ): this {
        this.project(axis).scale(2);
        this.x -= this.x;
        this.y -= this.y;
        return this;
    }

    /**
     * Reflect this vector on an arbitrary axis (represented by a unit vector). This is slightly
     * more efficient than {@link Vector.reflect} when dealing with an axis that is a unit vector.
     *
     * @returns This vector, for method chaining.
     */
    public reflectN(
        /** The unit vector representing the axis. */
        unitAxis: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        this.projectN(unitAxis).scale(2);
        this.x -= this.x;
        this.y -= this.y;
        return this;
    }

    /**
     * Get the dot product of this vector and another.
     *
     * @returns This vector, for method chaining.
     */
    public dot(
        /** The vector to dot this one against. */
        other: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): number {
        return this.x * other.x + this.y * other.y;
    }

    /** Get the squared length of this vector. */
    public len2(): number {
        return this.dot(this);
    }

    /** Get the length of this vector. */
    public len(): number {
        return Math.sqrt(this.len2());
    }
}

/**
 * Represents a circle with a position and a radius.
 *
 * If no position is given, the circle will be at `(0,0)`. If no radius is provided, the circle will
 * have a radius of `0`.
 */
export class Circle {
    /** Position of the center of this circle. */
    public pos: Vector;
    /** Radius of this circle. */
    public r: number;
    /** The current offset to apply to the radius. */
    public offset: Readonly<Pick<Vector, 'x' | 'y'>> = new Vector();

    constructor(
        /**
         * The position of the center of the circle. If this is omitted or `undefined`, the circle
         * will be centered at `(0,0)`.
         */
        position?: Vector | undefined,
        /**
         * The radius of the circle. If this is omitted or `undefined`, the circle will have a
         * radius of 0.
         */
        radius?: number | undefined,
    ) {
        this.pos = position ?? new Vector();
        this.r = radius ?? 0;
    }

    /**
     * Compute the axis-aligned bounding box (AABB) of this Circle.
     *
     * Note: Returns a _new_ `Box` each time you call this.
     */
    public getAABBAsBox(): Box {
        const corner = this.pos.clone().add(this.offset).sub(new Vector(this.r, this.r));
        return new Box(corner, this.r * 2, this.r * 2);
    }

    /**
     * Compute the axis-aligned bounding box (AABB) of this Circle.
     *
     * Note: Returns a _new_ `Polygon` each time you call this.
     */
    public getAABB(): Polygon {
        return this.getAABBAsBox().toPolygon();
    }

    /**
     * Set the current offset to apply to the radius.
     *
     * @returns This circle, for method chaining.
     */
    public setOffset(
        /** The new offset vector. */
        offset: Readonly<Pick<Vector, 'x' | 'y'>>,
    ): this {
        this.offset = offset;
        return this;
    }
}

/**
 * Represents a _convex_ polygon with any number of points (specified in counter-clockwise order).
 *
 * If no position is given, the polygon will be at `(0,0)`. If no points are given an empty array
 * will be used.
 */
export class Polygon {
    public pos: Vector;
    /**
     * Do _not_ manually update this property. Use {@link Polygon.setAngle} Otherwise the calculated
     * properties will not be updated correctly.
     */
    public angle = 0 as number;
    /**
     * Do _not_ manually update this property. Use {@link Polygon.setOffset} Otherwise the calculated
     * properties will not be updated correctly.
     */
    public offset: Readonly<Vector> = new Vector();
    /**
     * Do _not_ manually update this property. Use {@link Polygon.setPoints} Otherwise the calculated
     * properties will not be updated correctly.
     */
    public points: Vector[] = [];

    /**
     * Calculated points - this is what is used for underlying collisions and takes into account the
     * angle/offset set on the polygon.
     */
    public calcPoints: Vector[] = [];
    /**
     * The edges here are the direction of the `n`th edge of the polygon, relative to the `n`th
     * point. If you want to draw a given edge from the edge value, you must first translate to the
     * position of the starting point.
     */
    public edges: Vector[] = [];
    /**
     * The normals here are the direction of the normal for the `n`th edge of the polygon, relative
     * to the position of the `n`th point. If you want to draw an edge normal, you must first
     * translate to the position of the starting point.
     */
    public normals: Vector[] = [];

    constructor(
        /** Position of the polygon. If this is omitted or undefined, the position will be `(0,0)`. */
        position?: Vector | undefined,
        /** An array of points (represented by vectors relative to the position vector). */
        points?: Vector[] | undefined,
    ) {
        this.pos = position || new Vector();
        this.setPoints(points || []);
    }

    /**
     * Set the points of the polygon. Any consecutive duplicate points will be combined.
     *
     * Note: The points are counter-clockwise _with respect to the coordinate system_. If you
     * directly draw the points on a screen that has the origin at the top-left corner it will
     * _appear_ visually that the points are being specified clockwise. This is just because of the
     * inversion of the Y-axis when being displayed.
     *
     * @returns This polygon, for method chaining.
     */
    public setPoints(
        /** An array of vectors representing the points in the polygon, in counter-clockwise order. */
        points: typeof this.points,
    ): this {
        /** Only re-allocate if this is a new polygon or the number of points has changed. */
        const lengthChanged = this.points.length !== points.length;
        if (lengthChanged) {
            this.calcPoints = [];
            this.edges = [];
            this.normals = [];
            /** Allocate the vector arrays for the calculated properties. */
            for (let i = 0; i < points.length; i++) {
                /** Remove consecutive duplicate points. */
                const p1 = points[i]!;
                const p2 = i < points.length - 1 ? points[i + 1]! : points[0]!;
                if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
                    points.splice(i, 1);
                    // eslint-disable-next-line sonarjs/updated-loop-counter
                    i -= 1;
                    continue;
                }
                this.calcPoints.push(new Vector());
                this.edges.push(new Vector());
                this.normals.push(new Vector());
            }
        }
        this.points = points;
        return this._recalc();
    }

    /**
     * Set the current rotation angle of the polygon.
     *
     * @returns This polygon, for method chaining.
     */
    public setAngle(
        /** The current rotation angle (in radians). */
        angle: number,
    ): this {
        this.angle = angle;
        return this._recalc();
    }

    /**
     * Set the current offset to apply to the points before applying the angle rotation.
     *
     * @returns This polygon, for method chaining.
     */
    public setOffset(
        /** The new offset vector. */
        offset: typeof this.offset,
    ): this {
        this.offset = offset;
        return this._recalc();
    }

    /**
     * Rotates this polygon counter-clockwise around the origin of _its local coordinate system_
     * (i.e. `pos`).
     *
     * Note: This changes the **original** points (so any `angle` will be applied on top of this
     * rotation).
     *
     * @returns This polygon, for method chaining.
     */
    public rotate(
        /** The angle to rotate (in radians). */
        angle: number,
    ): this {
        const len = this.points.length;
        for (let i = 0; i < len; i++) {
            this.points[i]!.rotate(angle);
        }
        return this._recalc();
    }

    /**
     * Translates the points of this polygon by a specified amount relative to the origin of _its
     * own coordinate system_ (i.e. `pos`).
     *
     * This is most useful to change the "center point" of a polygon. If you just want to move the
     * whole polygon, change the coordinates of `pos`.
     *
     * Note: This changes the **original** points (so any `offset` will be applied on top of this
     * translation)
     *
     * @returns This polygon, for method chaining.
     */
    public translate(
        /** The horizontal amount to translate. */
        x: number,
        /** The vertical amount to translate. */
        y: number,
    ): this {
        const len = this.points.length;
        for (let i = 0; i < len; i++) {
            this.points[i]!.x += x;
            this.points[i]!.y += y;
        }
        return this._recalc();
    }

    /**
     * Computes the calculated collision polygon. Applies the `angle` and `offset` to the original
     * points then recalculates the edges and normals of the collision polygon.
     *
     * @returns This polygon, for method chaining.
     */
    private _recalc(): this {
        const len = this.points.length;
        for (let i = 0; i < len; i++) {
            const calcPoint = this.calcPoints[i]!.copy(this.points[i]!);
            calcPoint.x += this.offset.x;
            calcPoint.y += this.offset.y;
            if (this.angle) {
                calcPoint.rotate(this.angle);
            }
        }
        /** Calculate the edges/normals. */
        for (let i = 0; i < len; i++) {
            const p1 = this.calcPoints[i]!;
            const p2 = i < len - 1 ? this.calcPoints[i + 1]! : this.calcPoints[0]!;
            const e = this.edges[i]!.copy(p2).sub(p1);
            this.normals[i]!.copy(e).perp().normalize();
        }
        return this;
    }
    /**
     * Compute the axis-aligned bounding box. Any current state (translations/rotations) will be
     * applied before constructing the AABB.
     *
     * Note: Returns a _new_ `Box` each time you call this.
     */
    public getAABBAsBox() {
        let xMin = this.calcPoints[0]!.x;
        let yMin = this.calcPoints[0]!.y;
        let xMax = this.calcPoints[0]!.x;
        let yMax = this.calcPoints[0]!.y;
        for (let i = 1; i < this.calcPoints.length; i++) {
            const point = this.calcPoints[i]!;
            if (point.x < xMin) {
                xMin = point.x;
            } else if (point.x > xMax) {
                xMax = point.x;
            }
            if (point.y < yMin) {
                yMin = point.y;
            } else if (point.y > yMax) {
                yMax = point.y;
            }
        }
        return new Box(this.pos.clone().add(new Vector(xMin, yMin)), xMax - xMin, yMax - yMin);
    }

    /**
     * Compute the axis-aligned bounding box. Any current state (translations/rotations) will be
     * applied before constructing the AABB.
     *
     * Note: Returns a _new_ `Polygon` each time you call this.
     */
    public getAABB(): Polygon {
        return this.getAABBAsBox().toPolygon();
    }

    /**
     * Compute the centroid (geometric center) of the polygon. Any current state
     * (translations/rotations) will be applied before computing the centroid.
     *
     * See https://en.wikipedia.org/wiki/Centroid#Centroid_of_a_polygon
     *
     * Note: Returns a _new_ `Vector` each time you call this.
     */
    public getCentroid(): Vector {
        let cx = 0;
        let cy = 0;
        let ar = 0;
        for (let i = 0; i < this.calcPoints.length; i++) {
            const p1 = this.calcPoints[i]!;
            const p2 =
                i === this.calcPoints.length - 1
                    ? this.calcPoints[0]!
                    : /** Loop around if last point. */ this.calcPoints[i + 1]!;
            const a = p1.x * p2.y - p2.x * p1.y;
            cx += (p1.x + p2.x) * a;
            cy += (p1.y + p2.y) * a;
            ar += a;
        }
        /** We want 1 / 6 the area and we currently have 2*area. */
        ar = ar * 3;
        cx = cx / ar;
        cy = cy / ar;
        return new Vector(cx, cy);
    }
}

/**
 * Represents an axis-aligned box, with a width and height.
 *
 * If no position is given, the position will be `(0,0)`. If no width or height are given, they will
 * be set to `0`.
 */
export class Box {
    /** A vector representing the bottom-left of the box (i.e. the smallest x and smallest y value). */
    public pos: Readonly<Vector>;
    /** Width of the box. */
    public w: number;
    /** Height of the box. */
    public h: number;

    constructor(
        /**
         * A vector representing the bottom-left of the box (i.e. the smallest x and smallest y
         * value). If this is omitted or `undefined`, the position will be `(0,0)`.
         */
        position?: typeof this.pos | undefined,
        /** The width of the box. If this is omitted or `undefined`, the width will be `0`. */
        width?: number | undefined,
        /** The height of the box. If this is omitted or `undefined`, the height will be `0`. */
        height?: number | undefined,
    ) {
        this.pos = position || new Vector();
        this.w = width || 0;
        this.h = height || 0;
    }

    /** Returns a polygon whose edges are the same as this box. */
    public toPolygon(): Polygon {
        return new Polygon(new Vector(this.pos.x, this.pos.y), [
            new Vector(),
            new Vector(this.w, 0),
            new Vector(this.w, this.h),
            new Vector(0, this.h),
        ]);
    }
}

/**
 * An object representing the result of an intersection. Contains:
 *
 * - The two objects participating in the intersection
 * - The vector representing the minimum change necessary to extract the first object from the second
 *   one (as well as a unit vector in that direction and the magnitude of the overlap)
 * - Whether the first object is entirely inside the second, and vice versa.
 */
export class Response {
    public a: any;
    public b: any;
    public overlapN = new Vector();
    public overlapV = new Vector();
    public aInB = true;
    public bInA = true;
    public overlap = Number.MAX_VALUE;

    constructor() {}

    /**
     * Set some values of the response back to their defaults. Call this between tests if you are
     * going to reuse a single Response object for multiple intersection tests (recommended as it
     * will avoid allocating extra memory)
     *
     * @returns This response, for method chaining.
     */
    public clear(): this {
        this.aInB = true;
        this.bInA = true;
        this.overlap = Number.MAX_VALUE;
        return this;
    }
}

/** ## Object Pools */

/** A pool of {@link Vector} objects that are used in calculations to avoid allocating memory. */
const T_VECTORS: Vector[] = [
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
    new Vector(),
];

/** A pool of arrays of numbers used in calculations to avoid allocating memory. */
const T_ARRAYS: number[][] = [
    [],
    [],
    [],
    [],
    [],
];

/** Temporary response used for polygon hit detection. */
const T_RESPONSE: Response = new Response();

/** Tiny "point" polygon used for polygon hit detection. */
const TEST_POINT: Polygon = new Box(new Vector(), 0.000_001, 0.000_001).toPolygon();

/** ## Helper Functions */

/**
 * Flattens the specified array of points onto a unit vector axis, resulting in a one dimensional
 * range of the minimum and maximum value on that axis.
 */
function flattenPointsOn(
    /** The points to flatten. */
    points: Vector[],
    /** The unit vector axis to flatten on. */
    normal: Vector,
    /**
     * After calling this function, result[0] will be the minimum value, result[1] will be the
     * maximum value.
     */
    result: number[],
) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    const len = points.length;
    for (let i = 0; i < len; i++) {
        /** The magnitude of the projection of the point onto the normal. */
        const dot = points[i]!.dot(normal);
        if (dot < min) {
            min = dot;
        }
        if (dot > max) {
            max = dot;
        }
    }
    result[0] = min;
    result[1] = max;
}

/**
 * Check whether two convex polygons are separated by the specified axis (must be a unit vector).
 *
 * @returns `true` if it is a separating axis, `false` otherwise. If `false`, and a response is
 *   passed in, information about how much overlap and the direction of the overlap will be
 *   populated.
 */
export function isSeparatingAxis(
    /** The position of the first polygon. */
    aPos: Vector,
    /** The position of the second polygon. */
    bPos: Vector,
    /** The points in the first polygon. */
    aPoints: Vector[],
    /** The points in the second polygon. */
    bPoints: Vector[],
    /**
     * The axis (unit sized) to test against. The points of both polygons will be projected onto
     * this axis.
     */
    axis: Vector,
    /** A Response object (optional) which will be populated if the axis is not a separating axis. */
    response?: Response | undefined,
): boolean {
    const rangeA = T_ARRAYS.pop()!;
    const rangeB = T_ARRAYS.pop()!;
    /** The magnitude of the offset between the two polygons */
    const offsetV = T_VECTORS.pop()!.copy(bPos).sub(aPos);
    const projectedOffset = offsetV.dot(axis);
    /** Project the polygons onto the axis. */
    flattenPointsOn(aPoints, axis, rangeA);
    flattenPointsOn(bPoints, axis, rangeB);
    /** Move B's range to its position relative to A. */
    rangeB[0]! += projectedOffset;
    rangeB[1]! += projectedOffset;
    /** Check if there is a gap. If there is, this is a separating axis and we can stop */
    if (rangeA[0]! > rangeB[1]! || rangeB[0]! > rangeA[1]!) {
        T_VECTORS.push(offsetV);
        T_ARRAYS.push(rangeA);
        T_ARRAYS.push(rangeB);
        return true;
    }
    /** This is not a separating axis. If we're calculating a response, calculate the overlap. */
    if (response) {
        let overlap = 0;
        /** A starts further left than B */
        if (rangeA[0]! < rangeB[0]!) {
            response.aInB = false;
            /** A ends before B does. We have to pull A out of B */
            if (rangeA[1]! < rangeB[1]!) {
                overlap = rangeA[1]! - rangeB[0]!;
                response.bInA = false;
                /** B is fully inside A. Pick the shortest way out. */
            } else {
                const option1 = rangeA[1]! - rangeB[0]!;
                const option2 = rangeB[1]! - rangeA[0]!;
                overlap = option1 < option2 ? option1 : -option2;
            }
            /** B starts further left than A */
        } else {
            response.bInA = false;
            /** B ends before A ends. We have to push A out of B */
            if (rangeA[1]! > rangeB[1]!) {
                overlap = rangeA[0]! - rangeB[1]!;
                response.aInB = false;
                /** A is fully inside B. Pick the shortest way out. */
            } else {
                const option1 = rangeA[1]! - rangeB[0]!;
                const option2 = rangeB[1]! - rangeA[0]!;
                overlap = option1 < option2 ? option1 : -option2;
            }
        }
        /**
         * If this is the smallest amount of overlap we've seen so far, set it as the minimum
         * overlap.
         */
        const absOverlap = Math.abs(overlap);
        if (absOverlap < response.overlap) {
            response.overlap = absOverlap;
            response.overlapN.copy(axis);
            if (overlap < 0) {
                response.overlapN.reverse();
            }
        }
    }
    T_VECTORS.push(offsetV);
    T_ARRAYS.push(rangeA);
    T_ARRAYS.push(rangeB);
    return false;
}

/**
 * Calculates which Voronoi region a point is on a line segment. It is assumed that both the line
 * and the point are relative to `(0,0)`
 *
 *             |       (0)      |
 *      (-1)  [S]--------------[E]  (1)
 *             |       (0)      |
 *
 * @returns {@link LEFT_VORONOI_REGION} (-1) if it is the left region, {@link MIDDLE_VORONOI_REGION}
 *   (0) if it is the middle region, {@link RIGHT_VORONOI_REGION} (1) if it is the right region.
 */
function voronoiRegion(line: Vector, point: Vector): number {
    const len2 = line.len2();
    const dp = point.dot(line);
    if (dp < 0) {
        /** If the point is beyond the start of the line, it is in the left voronoi region. */
        return LEFT_VORONOI_REGION;
    } else if (dp > len2) {
        /** If the point is beyond the end of the line, it is in the right voronoi region. */
        return RIGHT_VORONOI_REGION;
    } else {
        /** Otherwise, it's in the middle one. */
        return MIDDLE_VORONOI_REGION;
    }
}

/** Constants for Voronoi regions */

const LEFT_VORONOI_REGION = -1;

const MIDDLE_VORONOI_REGION = 0;

const RIGHT_VORONOI_REGION = 1;

/** ## Collision Tests */

/** Check if a point is inside a circle. */
export function pointInCircle(point: Vector, circle: Circle): boolean {
    const differenceV = T_VECTORS.pop()!.copy(point).sub(circle.pos).sub(circle.offset);
    const radiusSq = circle.r * circle.r;
    const distanceSq = differenceV.len2();
    T_VECTORS.push(differenceV);
    /** If the distance between is smaller than the radius then the point is inside the circle. */
    return distanceSq <= radiusSq;
}

/** Check if a point is inside a convex polygon. */
export function pointInPolygon(point: Vector, polygon: Polygon): boolean {
    TEST_POINT.pos.copy(point);
    T_RESPONSE.clear();
    let result = testPolygonPolygon(TEST_POINT, polygon, T_RESPONSE);
    if (result) {
        result = T_RESPONSE.aInB;
    }
    return result;
}

/** Check if two circles collide. */
export function testCircleCircle(
    a: Circle,
    b: Circle,
    /** Response object (optional) that will be populated if the circles intersect. */
    response?: Response | undefined,
): boolean {
    /**
     * Check if the distance between the centers of the two circles is greater than their combined
     * radius.
     */
    const differenceV = T_VECTORS.pop()!.copy(b.pos).add(b.offset).sub(a.pos).sub(a.offset);
    const totalRadius = a.r + b.r;
    const totalRadiusSq = totalRadius * totalRadius;
    const distanceSq = differenceV.len2();
    /** If the distance is bigger than the combined radius, they don't intersect. */
    if (distanceSq > totalRadiusSq) {
        T_VECTORS.push(differenceV);
        return false;
    }
    /** They intersect. If we're calculating a response, calculate the overlap. */
    if (response) {
        const dist = Math.sqrt(distanceSq);
        response.a = a;
        response.b = b;
        response.overlap = totalRadius - dist;
        response.overlapN.copy(differenceV.normalize());
        response.overlapV.copy(differenceV).scale(response.overlap);
        response.aInB = a.r <= b.r && dist <= b.r - a.r;
        response.bInA = b.r <= a.r && dist <= a.r - b.r;
    }
    T_VECTORS.push(differenceV);
    return true;
}

/** Check if a polygon and a circle collide. */
export function testPolygonCircle(
    polygon: Polygon,
    circle: Circle,
    /** Response object (optional) that will be populated if they intersect. */
    response?: Response | undefined,
): boolean {
    /** Get the position of the circle relative to the polygon. */
    const circlePos = T_VECTORS.pop()!.copy(circle.pos).add(circle.offset).sub(polygon.pos);
    const radius2 = circle.r * circle.r;
    const edge = T_VECTORS.pop()!;
    const point = T_VECTORS.pop()!;

    /** For each edge in the polygon: */
    for (let i = 0; i < polygon.calcPoints.length; i++) {
        const next = i === polygon.calcPoints.length - 1 ? 0 : i + 1;
        const prev = i === 0 ? polygon.calcPoints.length - 1 : i - 1;
        let overlap = 0;
        let overlapN = undefined;

        /** Get the edge. */
        edge.copy(polygon.edges[i]!);
        /** Calculate the center of the circle relative to the starting point of the edge. */
        point.copy(circlePos).sub(polygon.calcPoints[i]!);

        /**
         * If the distance between the center of the circle and the point is bigger than the radius,
         * the polygon is definitely not fully in the circle.
         */
        if (response && point.len2() > radius2) {
            response.aInB = false;
        }

        /** Calculate which Voronoi region the center of the circle is in. */
        let region = voronoiRegion(edge, point);
        /** If it's the left region: */
        if (region === LEFT_VORONOI_REGION) {
            /** We need to make sure we're in the RIGHT_VORONOI_REGION of the previous edge. */
            edge.copy(polygon.edges[prev]!);
            /** Calculate the center of the circle relative the starting point of the previous edge */
            const point2 = T_VECTORS.pop()!.copy(circlePos).sub(polygon.calcPoints[prev]!);
            region = voronoiRegion(edge, point2);
            if (region === RIGHT_VORONOI_REGION) {
                /** It's in the region we want. Check if the circle intersects the point. */
                const dist = point.len();
                if (dist > circle.r) {
                    /** No intersection */
                    T_VECTORS.push(circlePos);
                    T_VECTORS.push(edge);
                    T_VECTORS.push(point);
                    T_VECTORS.push(point2);
                    return false;
                } else if (response) {
                    /** It intersects, calculate the overlap. */
                    response.bInA = false;
                    overlapN = point.normalize();
                    overlap = circle.r - dist;
                }
            }
            T_VECTORS.push(point2);
            /** If it's the right region: */
        } else if (region === RIGHT_VORONOI_REGION) {
            /** We need to make sure we're in the left region on the next edge */
            edge.copy(polygon.edges[next]!);
            /** Calculate the center of the circle relative to the starting point of the next edge. */
            point.copy(circlePos).sub(polygon.calcPoints[next]!);
            region = voronoiRegion(edge, point);
            if (region === LEFT_VORONOI_REGION) {
                /** It's in the region we want. Check if the circle intersects the point. */
                const dist = point.len();
                if (dist > circle.r) {
                    /** No intersection */
                    T_VECTORS.push(circlePos);
                    T_VECTORS.push(edge);
                    T_VECTORS.push(point);
                    return false;
                } else if (response) {
                    /** It intersects, calculate the overlap. */
                    response.bInA = false;
                    overlapN = point.normalize();
                    overlap = circle.r - dist;
                }
            }
            /** Otherwise, it's the middle region: */
        } else {
            /**
             * Need to check if the circle is intersecting the edge. change the edge into its "edge
             * normal".
             */
            const normal = edge.perp().normalize();
            /** Find the perpendicular distance between the center of the circle and the edge. */
            const dist = point.dot(normal);
            const distAbs = Math.abs(dist);
            /** If the circle is on the outside of the edge, there is no intersection. */
            if (dist > 0 && distAbs > circle.r) {
                /** No intersection */
                T_VECTORS.push(circlePos);
                T_VECTORS.push(normal);
                T_VECTORS.push(point);
                return false;
            } else if (response) {
                /** It intersects, calculate the overlap. */
                overlapN = normal;
                overlap = circle.r - dist;
                /**
                 * If the center of the circle is on the outside of the edge, or part of the circle
                 * is on the outside, the circle is not fully inside the polygon.
                 */
                if (dist >= 0 || overlap < 2 * circle.r) {
                    response.bInA = false;
                }
            }
        }

        /**
         * If this is the smallest overlap we've seen, keep it. ({@link overlapN} may be `undefined`
         * if the circle was in the wrong Voronoi region).
         */
        if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
            response.overlap = overlap;
            response.overlapN.copy(overlapN);
        }
    }

    /** Calculate the final overlap vector - based on the smallest overlap. */
    if (response) {
        response.a = polygon;
        response.b = circle;
        response.overlapV.copy(response.overlapN).scale(response.overlap);
    }
    T_VECTORS.push(circlePos);
    T_VECTORS.push(edge);
    T_VECTORS.push(point);
    return true;
}

/**
 * Check if a circle and a polygon collide.
 *
 * **NOTE:** This is slightly less efficient than {@link testPolygonCircle} as it just runs
 * {@link testPolygonCircle} and reverses everything at the end.
 */
export function testCirclePolygon(
    circle: Circle,
    polygon: Polygon,
    /** Response object (optional) that will be populated if they intersect. */
    response?: Response | undefined,
) {
    /** Test the polygon against the circle. */
    const result = testPolygonCircle(polygon, circle, response);
    if (result && response) {
        /** Swap A and B in the response. */
        const a = response.a;
        const aInB = response.aInB;
        response.overlapN.reverse();
        response.overlapV.reverse();
        response.a = response.b;
        response.b = a;
        response.aInB = response.bInA;
        response.bInA = aInB;
    }
    return result;
}

/** Checks whether polygons collide. */
export function testPolygonPolygon(
    a: Polygon,
    b: Polygon,
    response?: /** Response object (optional) that will be populated if they intersect. */
    Response | undefined,
) {
    /** If any of the edge normals of A is a separating axis, no intersection. */
    for (let i = 0; i < a.calcPoints.length; i++) {
        if (isSeparatingAxis(a.pos, b.pos, a.calcPoints, b.calcPoints, a.normals[i]!, response)) {
            return false;
        }
    }
    /** If any of the edge normals of B is a separating axis, no intersection. */
    for (let i = 0; i < b.calcPoints.length; i++) {
        if (isSeparatingAxis(a.pos, b.pos, a.calcPoints, b.calcPoints, b.normals[i]!, response)) {
            return false;
        }
    }
    /**
     * Since none of the edge normals of A or B are a separating axis, there is an intersection and
     * we've already calculated the smallest overlap (in isSeparatingAxis). Calculate the final
     * overlap vector.
     */
    if (response) {
        response.a = a;
        response.b = b;
        response.overlapV.copy(response.overlapN).scale(response.overlap);
    }
    return true;
}
