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

const SAT = require('..');
const assert = require('node:assert');

describe('Vector.scale', function () {
    it('should scale by zero properly', function () {
        const V = SAT.Vector;
        const v1 = new V(5, 5);
        v1.scale(10, 10);
        assert(v1.x === 50);
        assert(v1.y === 50);

        v1.scale(0, 1);
        assert(v1.x === 0);
        assert(v1.y === 50);

        v1.scale(1, 0);
        assert(v1.x === 0);
        assert(v1.y === 0);
    });
});

describe('Polygon.getCentroid', function () {
    it('should calculate the correct value for a square', function () {
        const V = SAT.Vector;
        const P = SAT.Polygon;

        // A square
        const polygon = new P(new V(0, 0), [
            new V(0, 0),
            new V(40, 0),
            new V(40, 40),
            new V(0, 40),
        ]);
        const c = polygon.getCentroid();
        assert(c.x === 20);
        assert(c.y === 20);
    });

    it('should calculate the correct value for a triangle', function () {
        const V = SAT.Vector;
        const P = SAT.Polygon;

        // A triangle
        const polygon = new P(new V(0, 0), [
            new V(0, 0),
            new V(100, 0),
            new V(50, 99),
        ]);
        const c = polygon.getCentroid();
        assert(c.x === 50);
        assert(c.y === 33);
    });
});

describe('Collision', function () {
    it('testCircleCircle', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;

        const circle1 = new C(new V(0, 0), 20);
        const circle2 = new C(new V(30, 0), 20);
        const response = new SAT.Response();
        let collided = SAT.testCircleCircle(circle1, circle2, response);

        assert(collided);
        assert(response.overlap == 10);
        assert(response.overlapV.x == 10 && response.overlapV.y === 0);

        circle1.offset = new V(-10, -10);
        collided = SAT.testCircleCircle(circle1, circle2, response);
        assert(!collided);
    });

    it('testPolygonCircle', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;
        const P = SAT.Polygon;

        const circle = new C(new V(50, 50), 20);
        // A square
        const polygon = new P(new V(0, 0), [
            new V(0, 0),
            new V(40, 0),
            new V(40, 40),
            new V(0, 40),
        ]);
        const response = new SAT.Response();
        let collided = SAT.testPolygonCircle(polygon, circle, response);

        assert(collided);
        assert(response.overlap.toFixed(2) == '5.86');
        assert(
            response.overlapV.x.toFixed(2) == '4.14' && response.overlapV.y.toFixed(2) == '4.14',
        );

        circle.offset = new V(10, 10);
        collided = SAT.testPolygonCircle(polygon, circle, response);
        assert(!collided);
    });

    it('testPolygonCircle - line - not collide', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;
        const B = SAT.Box;

        const circle = new C(new V(50, 50), 20);
        const polygon = new B(new V(1000, 1000), 100, 0).toPolygon();
        const response = new SAT.Response();
        const collided = SAT.testPolygonCircle(polygon, circle, response);
        assert(!collided);
    });

    it('testPolygonCircle - line - collide', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;
        const B = SAT.Box;

        const circle = new C(new V(50, 50), 20);
        const polygon = new B(new V(50, 50), 100, 0).toPolygon();
        const response = new SAT.Response();
        const collided = SAT.testPolygonCircle(polygon, circle, response);

        assert(collided);
        assert(response.overlap.toFixed(2) == '20.00');
    });

    it('testPolygonPolygon', function () {
        const V = SAT.Vector;
        const P = SAT.Polygon;

        // A square
        const polygon1 = new P(new V(0, 0), [
            new V(0, 0),
            new V(40, 0),
            new V(40, 40),
            new V(0, 40),
        ]);
        // A triangle
        const polygon2 = new P(new V(30, 0), [
            new V(0, 0),
            new V(30, 0),
            new V(0, 30),
        ]);
        const response = new SAT.Response();
        const collided = SAT.testPolygonPolygon(polygon1, polygon2, response);

        assert(collided);
        assert(response.overlap == 10);
        assert(response.overlapV.x == 10 && response.overlapV.y === 0);
    });
});

describe('No collision', function () {
    it('testPolygonPolygon', function () {
        const V = SAT.Vector;
        const B = SAT.Box;

        const box1 = new B(new V(0, 0), 20, 20).toPolygon();
        const box2 = new B(new V(100, 100), 20, 20).toPolygon();
        const collided = SAT.testPolygonPolygon(box1, box2);
    });
});

describe('Point testing', function () {
    it('pointInCircle', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;

        const circle = new C(new V(100, 100), 20);

        assert(!SAT.pointInCircle(new V(0, 0), circle)); // false
        assert(SAT.pointInCircle(new V(110, 110), circle)); // true

        circle.offset = new V(-10, -10);
        assert(!SAT.pointInCircle(new V(110, 110), circle)); // false
    });

    it('pointInPolygon', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;
        const P = SAT.Polygon;

        const triangle = new P(new V(30, 0), [
            new V(0, 0),
            new V(30, 0),
            new V(0, 30),
        ]);
        assert(!SAT.pointInPolygon(new V(0, 0), triangle)); // false
        assert(SAT.pointInPolygon(new V(35, 5), triangle)); // true
    });

    it('pointInPolygon (small)', function () {
        const V = SAT.Vector;
        const C = SAT.Circle;
        const P = SAT.Polygon;

        const v1 = new V(1, 1.1);
        const p1 = new P(new V(0, 0), [
            new V(2, 1),
            new V(2, 2),
            new V(1, 3),
            new V(0, 2),
            new V(0, 1),
            new V(1, 0),
        ]);
        assert(SAT.pointInPolygon(v1, p1));
    });
});
