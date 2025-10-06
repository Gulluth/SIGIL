/**
 * SIGIL Markov Chain Generator
 * A lightweight Markov chain implementation designed specifically for SIGIL's text generation needs.
 */

export interface MarkovOptions {
    order?: number;        // N-gram size (default: 2)
    minLength?: number;    // Minimum generated word length
    maxLength?: number;    // Maximum generated word length
    attempts?: number;     // Max attempts to generate valid word (default: 100)
}

export interface MarkovChain {
    [ngram: string]: string[];
}

/**
 * Simple Markov chain generator optimized for SIGIL list processing
 */
export class SigilMarkov {
    private chain: MarkovChain = {};
    private order: number;
    private startTokens: string[] = [];

    constructor(order: number = 2) {
        this.order = Math.max(1, order);
    }

    /**
     * Train the Markov chain from an array of words/names
     */
    public train(words: string[]): void {
        this.chain = {};
        this.startTokens = [];

        for (const word of words) {
            if (!word || word.length < this.order) continue;

            this.trainFromWord(word);
        }
    }

    /**
     * Train from a single word by creating character n-grams
     */
    private trainFromWord(word: string): void {
        // Add start marker and prepare word
        const paddedWord = '^'.repeat(this.order) + word.toLowerCase() + '$';

        // Track starting n-grams (for generation start points)
        const startNgram = paddedWord.substring(0, this.order);
        if (!this.startTokens.includes(startNgram)) {
            this.startTokens.push(startNgram);
        }

        // Create n-grams and next character mappings
        for (let i = 0; i <= paddedWord.length - this.order - 1; i++) {
            const ngram = paddedWord.substring(i, i + this.order);
            const nextChar = paddedWord[i + this.order];

            if (!this.chain[ngram]) {
                this.chain[ngram] = [];
            }
            this.chain[ngram].push(nextChar);
        }
    }

    /**
     * Generate a new word using the trained Markov chain
     */
    public generate(options: MarkovOptions = {}): string {
        const {
            minLength = 3,
            maxLength = 12,
            attempts = 100
        } = options;

        if (this.startTokens.length === 0) {
            return ''; // No training data
        }

        for (let attempt = 0; attempt < attempts; attempt++) {
            const word = this.generateAttempt(minLength, maxLength);
            if (word && word.length >= minLength && word.length <= maxLength) {
                return word;
            }
        }

        // Fallback: return a random word from training data if generation fails
        return '';
    }

    /**
     * Single generation attempt
     */
    private generateAttempt(minLength: number, maxLength: number): string {
        // Start with a random starting n-gram
        let current = this.startTokens[Math.floor(Math.random() * this.startTokens.length)];
        let result = '';

        // Generate until we hit end marker or max length
        for (let i = 0; i < maxLength + this.order; i++) {
            const nextChars = this.chain[current];
            if (!nextChars || nextChars.length === 0) break;

            const nextChar = nextChars[Math.floor(Math.random() * nextChars.length)];

            if (nextChar === '$') {
                // End of word
                if (result.length >= minLength) {
                    return this.capitalizeFirst(result);
                }
                break;
            }

            if (nextChar !== '^') {
                result += nextChar;
            }

            // Update current n-gram for next iteration
            current = current.substring(1) + nextChar;
        }

        return '';
    }

    /**
     * Capitalize the first letter of a word
     */
    private capitalizeFirst(word: string): string {
        if (!word) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    /**
     * Get chain statistics for debugging
     */
    public getStats(): { ngramCount: number; startTokens: number; totalTransitions: number } {
        const totalTransitions = Object.values(this.chain).reduce((sum, arr) => sum + arr.length, 0);
        return {
            ngramCount: Object.keys(this.chain).length,
            startTokens: this.startTokens.length,
            totalTransitions
        };
    }
}

/**
 * Convenience function for generating Markov text from a word list
 * This is the main function that the template engine will use
 */
export function generateMarkov(words: string[], options: MarkovOptions = {}): string {
    if (!words || words.length === 0) {
        return '[empty-list]';
    }

    // Clean and filter the words
    const cleanWords = words
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(word => word.replace(/\s*\^[\d.]+\s*$/, '')); // Remove SIGIL weights

    if (cleanWords.length === 0) {
        return '[no-valid-words]';
    }

    const markov = new SigilMarkov(options.order || 2);
    markov.train(cleanWords);

    const result = markov.generate(options);
    return result || cleanWords[Math.floor(Math.random() * cleanWords.length)]; // Fallback to random word
}