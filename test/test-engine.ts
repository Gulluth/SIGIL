import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SigilEngine } from '../src/template-engine';
import { loadSigilData } from '../src/yaml-loader';

describe('SIGIL Template Engine', () => {
    let engine: SigilEngine;
    let testData: any;

    // Setup test data before running tests
    const setupData = () => {
        if (!testData) {
            testData = loadSigilData([
                './examples/data/themes/fantasy.yaml',
                './examples/data/themes/scifi.yaml',
                './examples/data/templates.yaml'
            ]);
            engine = new SigilEngine(testData.lists);
        }
    };
});
