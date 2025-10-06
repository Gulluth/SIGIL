const assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const { SigilEngine } = require('../dist/src/template-engine.js');

describe('SIGIL YAML literal handling', () => {
    let data;
    let engine;

    before(() => {
        data = yaml.load(fs.readFileSync(__dirname + '/literal-handling.yaml', 'utf8'));
        engine = new SigilEngine(data);
    });

    it('returns quoted values as literals', () => {
        assert.strictEqual(engine.generate('[quoted]'), '{this|that}');
        assert.strictEqual(engine.generate('[single_quoted]'), '[fake_reference]');
    });

    it('processes unquoted values for sigils', () => {
        const result = engine.generate('[unquoted]');
        assert.ok(['this', 'that'].includes(result), 'Should process {this|that} as a template');

        // For [fake_reference], since the table doesn\'t exist, should return ""
        assert.strictEqual(engine.generate('[unquoted_table]'), '');
    });
});
