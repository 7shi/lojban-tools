function similarity2a(g: string, w: string): number {
    if (!g || !w) return 0;
    const memo = Array(g.length).fill([]).map(() => Array(w.length));
    function f(gp: number, wp: number) {
        if (gp == g.length || wp == w.length) return 0;
        let m = memo[gp][wp];
        if (m >= 0) return m;
        const sc = f(gp, wp + 1);
        const p = g.indexOf(w[wp], gp);
        return memo[gp][wp] = p < 0 ? sc : Math.max(sc, f(p + 1, wp + 1) + 1);
    }
    return f(0, 0);
}

function similarity2b(g: string, w: string): number {
    if (!g || !w) return 0;
    for (let i = 0; i < w.length - 1; i++) {
        for (let j = 0; j < g.length - 1; j++) {
            if (g[j] == w[i] &&
                (g[j + 1] == w[i + 1] || (g[j + 2] ?? "") == w[i + 2]))
                return 2;
        }
    }
    return 0;
}

function similarity(g: string, w: string) {
    let s = similarity2a(g, w);
    return s < 3 ? similarity2b(g, w) : s;
}

interface FinPrim { score: string, sims: string, words: string[] }
const finprims: { [index: string]: FinPrim } =
    JSON.parse(Deno.readTextFileSync("finprims.json"));

(function testSimilarity() {
    let all = 0, ng = 0;
    for (const [g, data] of Object.entries(finprims)) {
        const sims = data.words.map(w => similarity(g, w));
        if (sims.join(" ") != data.sims) ng++;
        all++;
    }
    console.log("[testSimilarity] NG:", ng, "/", all);
})();

const weights = {
    //      [ zh  ,  en  ,  hi  ,  es  ,  ru  ,  ar  ]
    "1985": [0.360, 0.210, 0.160, 0.110, 0.090, 0.070], // sum: 1
    "1994": [0.348, 0.163, 0.194, 0.123, 0.088, 0.084], // sum: 1
    "1995": [0.347, 0.160, 0.196, 0.123, 0.089, 0.085], // sum: 1
    "1999": [0.334, 0.187, 0.195, 0.116, 0.081, 0.088], // sum: 1.001
};

function score(words: string[], sims: number[], weights: number[]) {
    return words
        .map((w, i) => w ? sims[i] / w.length * weights[i] : 0)
        .reduce((x, y) => x + y);
}

function gismuScore(g: string, weights: number[]) {
    const data = finprims[g];
    return score(data.words, data.words.map(w => similarity(g, w)), weights);
}

function testWeightsScore(g: string) {
    console.log(g, "expected:", finprims[g].score);
    for (const [key, ws] of Object.entries(weights)) {
        console.log(key, (gismuScore(g, ws) * 100).toFixed(2));
    }
}
testWeightsScore("gismu");

const weights1 = [0.330, 0.180, 0.160, 0.120, 0.121, 0.070]; // sum: 0.98
console.log("gismu", (gismuScore("gismu", weights1) * 100).toFixed(2));
console.log("gismu", (Math.floor(gismuScore("gismu", weights1) * 10000) / 100).toFixed(2));

function scoreInt(words: string[], sims: number[], weights: number[]) {
    const ws = weights.map(w => Math.floor(w * 10000));
    return words
        .map((w, i) => w ? Math.floor(sims[i] * ws[i] / w.length) : 0)
        .reduce((x, y) => x + y);
}

function gismuScoreInt(g: string, weights: number[]) {
    const data = finprims[g];
    return scoreInt(data.words, data.words.map(w => similarity(g, w)), weights);
}

console.log("gismu", (gismuScoreInt("gismu", weights1) / 100).toFixed(2));

function testScore(weights: number[]) {
    let all = 0, ng = 0;
    for (const [g, data] of Object.entries(finprims)) {
        const sc = (gismuScoreInt(g, weights) / 100).toFixed(2);
        if (sc != data.score) {
            console.log(g, "[NG]", sc, "exp =", data.score, data.sims);
            ng++;
        }
        all++;
    }
    console.log("NG:", ng, "/", all);
}
//testScore(weights1);

const weights2 = [0.330, 0.180, 0.160, 0.120, 0.120, 0.070]; // sum: 0.98
testScore(weights2);
