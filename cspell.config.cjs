const {baseConfig} = require('@virmator/spellcheck/configs/cspell.config.base.cjs');

module.exports = {
    ...baseConfig,
    ignorePaths: [
        ...baseConfig.ignorePaths,
    ],
    words: [
        ...baseConfig.words,
        // axis-aligned bounding box
        'aabb',
        '_recalc',
        'voronoi',
        'riecken',
    ],
};
