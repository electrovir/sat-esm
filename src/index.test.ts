/**
 * Copied from
 * https://github.com/jriecken/sat-js/blob/20e612681d1f9eabc9ea34dc98c4d27f985ffec6/test/test.js and
 * modified for modern testing libraries. The original code has the following license:
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

import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import type * as OriginalSatTypes from 'sat';
import {
    Box,
    Circle,
    pointInCircle,
    pointInPolygon,
    Polygon,
    Response,
    testCircleCircle,
    testPolygonCircle,
    testPolygonPolygon,
    Vector,
    type testCirclePolygon,
} from './index.js';

describe('types', () => {
    it('equal original types', () => {
        const originalBox: OriginalSatTypes.Box = new Box();
        const originalCircle: OriginalSatTypes.Circle = new Circle();
        const originalPolygon: OriginalSatTypes.Polygon = new Polygon();
        const originalResponse: OriginalSatTypes.Response = new Response();
        const originalVector: OriginalSatTypes.Vector = new Vector();

        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['pointInCircle']>>()
            .equals<ReturnType<typeof pointInCircle>>();
        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['pointInPolygon']>>()
            .equals<ReturnType<typeof pointInPolygon>>();
        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['testCircleCircle']>>()
            .equals<ReturnType<typeof testCircleCircle>>();
        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['testPolygonCircle']>>()
            .equals<ReturnType<typeof testPolygonCircle>>();
        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['testPolygonPolygon']>>()
            .equals<ReturnType<typeof testPolygonPolygon>>();
        assert
            .tsType<ReturnType<(typeof OriginalSatTypes)['testCirclePolygon']>>()
            .equals<ReturnType<typeof testCirclePolygon>>();
    });
    it("aren't always assignable from original types", () => {
        // @ts-expect-error: toPolygon return type mismatch
        const originalBox: Box = {} as OriginalSatTypes.Box;
        // @ts-expect-error: original Circle type missing lots of properties
        const originalCircle: Circle = {} as OriginalSatTypes.Circle;
        // @ts-expect-error: original Polygon type missing properties
        const originalPolygon: Polygon = {} as OriginalSatTypes.Polygon;
        const originalResponse: Response = {} as OriginalSatTypes.Response;
        const originalVector: Vector = {} as OriginalSatTypes.Vector;
    });
});

describe('Vector.scale', () => {
    it('scales by zero properly', () => {
        const v1 = new Vector(5, 5);
        v1.scale(10, 10);
        assert.strictEquals(v1.x, 50 as number);
        assert.strictEquals(v1.y, 50 as number);

        v1.scale(0, 1);
        assert.strictEquals(v1.x, 0 as number);
        assert.strictEquals(v1.y, 50 as number);

        v1.scale(1, 0);
        assert.strictEquals(v1.x, 0);
        assert.strictEquals(v1.y, 0);
    });
});

describe('Polygon.getCentroid', () => {
    it('calculates the correct value for a square', () => {
        /** A square. */
        const polygon = new Polygon(new Vector(0, 0), [
            new Vector(0, 0),
            new Vector(40, 0),
            new Vector(40, 40),
            new Vector(0, 40),
        ]);
        const centroid = polygon.getCentroid();
        assert.strictEquals(centroid.x, 20);
        assert.strictEquals(centroid.y, 20);
    });

    it('calculates the correct value for a triangle', () => {
        /** A triangle. */
        const polygon = new Polygon(new Vector(0, 0), [
            new Vector(0, 0),
            new Vector(100, 0),
            new Vector(50, 99),
        ]);
        const centroid = polygon.getCentroid();
        assert.strictEquals(centroid.x, 50);
        assert.strictEquals(centroid.y, 33);
    });
});

describe('Collision', () => {
    it('works with testCircleCircle', () => {
        const circle1 = new Circle(new Vector(0, 0), 20);
        const circle2 = new Circle(new Vector(30, 0), 20);
        const response = new Response();

        assert.isTrue(testCircleCircle(circle1, circle2, response));
        assert.strictEquals(response.overlap, 10);
        assert.strictEquals(response.overlapV.x, 10);
        assert.strictEquals(response.overlapV.y, 0);

        circle1.offset = new Vector(-10, -10);

        assert.isFalse(testCircleCircle(circle1, circle2, response));
    });

    it('works with testPolygonCircle', () => {
        const circle = new Circle(new Vector(50, 50), 20);
        /** A square. */
        const polygon = new Polygon(new Vector(0, 0), [
            new Vector(0, 0),
            new Vector(40, 0),
            new Vector(40, 40),
            new Vector(0, 40),
        ]);
        const response = new Response();

        assert.isTrue(testPolygonCircle(polygon, circle, response));
        assert.strictEquals(response.overlap.toFixed(2), '5.86');
        assert.strictEquals(response.overlapV.x.toFixed(2), '4.14');
        assert.strictEquals(response.overlapV.y.toFixed(2), '4.14');

        circle.offset = new Vector(10, 10);
        assert.isFalse(testPolygonCircle(polygon, circle, response));
    });

    it('testPolygonCircle - line - not collide', () => {
        const circle = new Circle(new Vector(50, 50), 20);
        const polygon = new Box(new Vector(1000, 1000), 100, 0).toPolygon();
        const response = new Response();

        assert.isFalse(testPolygonCircle(polygon, circle, response));
    });

    it('testPolygonCircle - line - collide', () => {
        const circle = new Circle(new Vector(50, 50), 20);
        const polygon = new Box(new Vector(50, 50), 100, 0).toPolygon();
        const response = new Response();

        assert.isTrue(testPolygonCircle(polygon, circle, response));
        assert.strictEquals(response.overlap.toFixed(2), '20.00');
    });

    it('testPolygonPolygon', () => {
        /** A square. */
        const polygon1 = new Polygon(new Vector(0, 0), [
            new Vector(0, 0),
            new Vector(40, 0),
            new Vector(40, 40),
            new Vector(0, 40),
        ]);
        /** A triangle. */
        const polygon2 = new Polygon(new Vector(30, 0), [
            new Vector(0, 0),
            new Vector(30, 0),
            new Vector(0, 30),
        ]);
        const response = new Response();

        assert.isTrue(testPolygonPolygon(polygon1, polygon2, response));
        assert.strictEquals(response.overlap, 10);
        assert.strictEquals(response.overlapV.x, 10);
        assert.strictEquals(response.overlapV.y, 0);
    });
});

describe('No collision', () => {
    it('testPolygonPolygon', () => {
        const box1 = new Box(new Vector(0, 0), 20, 20).toPolygon();
        const box2 = new Box(new Vector(100, 100), 20, 20).toPolygon();
        assert.isFalse(testPolygonPolygon(box1, box2));
    });
});

describe('Point', () => {
    it('works with pointInCircle', () => {
        const circle = new Circle(new Vector(100, 100), 20);

        assert.isFalse(pointInCircle(new Vector(0, 0), circle));
        assert.isTrue(pointInCircle(new Vector(110, 110), circle));

        circle.offset = new Vector(-10, -10);
        assert.isFalse(pointInCircle(new Vector(110, 110), circle));
    });

    it('works with pointInPolygon', () => {
        const triangle = new Polygon(new Vector(30, 0), [
            new Vector(0, 0),
            new Vector(30, 0),
            new Vector(0, 30),
        ]);
        assert.isFalse(pointInPolygon(new Vector(0, 0), triangle));
        assert.isTrue(pointInPolygon(new Vector(35, 5), triangle));
    });

    it('works with pointInPolygon (small)', () => {
        const v1 = new Vector(1, 1.1);
        const p1 = new Polygon(new Vector(0, 0), [
            new Vector(2, 1),
            new Vector(2, 2),
            new Vector(1, 3),
            new Vector(0, 2),
            new Vector(0, 1),
            new Vector(1, 0),
        ]);
        assert.isTrue(pointInPolygon(v1, p1));
    });
});
