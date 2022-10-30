import * as T from "./test.ts";

// https://lojban.github.io/cll/4/1/
const V = "aeiou";
const C = "bcdfgjklmnprstvxz";
const initialCC = [
    "bl", "br",
    "cf", "ck", "cl", "cm", "cn", "cp", "cr", "ct",
    "dj", "dr", "dz",
    "fl", "fr",
    "gl", "gr",
    "jb", "jd", "jg", "jm", "jv",
    "kl", "kr",
    "ml", "mr",
    "pl", "pr",
    "sf", "sk", "sl", "sm", "sn", "sp", "sr", "st",
    "tc", "tr", "ts",
    "vl", "vr",
    "xl", "xr",
    "zb", "zd", "zg", "zm", "zv",
];

// https://lojban.github.io/cll/4/14/
const similarC = {
    "b": "pv",
    "c": "js",
    "d": "t",
    "f": "pv",
    "g": "kx",
    "j": "cz",
    "k": "gx",
    "l": "r",
    "m": "n",
    "n": "m",
    "p": "bf",
    "r": "l",
    "s": "cz",
    "t": "d",
    "v": "bf",
    "x": "gk",
    "z": "js",
};

function isSimilar(g1: string, g2: string) {
    if (g1.length != 5 || g2.length != 5) throw "length != 5";
    if (g1.substring(0, 4) == g2.substring(0, 4)) return true;
    let s = -1;
    for (let i = 0; i < 5; i++) {
        if (g1[i] != g2[i]) {
            if (s >= 0) return false;
            s = i;
        }
    }
    if (s < 0) return true;
    let c = similarC[g1[s]];
    return c && c.includes(g2[s]);
}

function* generateConflicts(g: string) {
    for (const v of V) {
        yield g.substring(0, 4) + v;
    }
    for (let i = 0; i < g.length; i++) {
        const s = similarC[g[i]];
        if (s) {
            for (const c of s) {
                yield g.substring(0, i) + c + g.substring(i + 1);
            }
        }
    }
}
//console.log(Array.from(generateConflicts("gismu")).join(" "));

function checkConflicts() {
    for (const g1 of Object.keys(T.finprims)) {
        let conflicts = Array.from(generateConflicts(g1))
            .filter(g2 => g1 != g2 && g2 in T.finprims);
        if (conflicts.length) {
            console.log(g1, "conflicts", conflicts.length, conflicts.join(" "));
        }
    }
}
//checkConflicts();

function deleteConflicts(candidates, g) {
    for (const c of generateConflicts(g)) delete candidates[c];
}

// https://lojban.github.io/cll/3/6/
const unvoicedC = "ptkfcsx";
const voicedC = "bdgvjz";
const fricativeC = "cjsz";
const forbiddenCC = ["cx", "kx", "xc", "xk", "mz"];
function isPermissiveCC(c1: string, c2: string) {
    if (!C.includes(c1) || !C.includes(c2)) return false;
    if (c1 == c2) return false;
    if (unvoicedC.includes(c1) && voicedC.includes(c2)) return false;
    if (voicedC.includes(c1) && unvoicedC.includes(c2)) return false;
    if (fricativeC.includes(c1) && fricativeC.includes(c2)) return false;
    if (forbiddenCC.includes(c1 + c2)) return false;
    return true;
}
const permissiveCC = Array.from((function* () {
    for (const c1 of C) {
        for (const c2 of C) {
            if (isPermissiveCC(c1, c2)) yield c1 + c2;
        }
    }
})());
// console.log(permissiveCC.length, permissiveCC);

// https://lojban.github.io/cll/4/4/
const candidateGismu = Array.from((function* () {
    // CVC/CV
    for (const c of C) {
        for (const v1 of V) {
            for (const cc of permissiveCC) {
                for (const v2 of V) {
                    yield c + v1 + cc + v2;
                }
            }
        }
    }
    // CCVCV
    for (const cc of initialCC) {
        for (const v1 of V) {
            for (const c of C) {
                for (const v2 of V) {
                    yield cc + v1 + c + v2;
                }
            }
        }
    }
})());
// console.log(candidateGismu.length, candidateGismu);

// https://mw.lojban.org/papri/free_gismu_space
function checkTotal() {
    const cvccv = [C, V, permissiveCC, V].map(a => a.length);
    const cvccvTotal = cvccv.reduce((x, y) => x * y);
    console.log("CVC/CV:", cvccv.join(" * "), "=", cvccvTotal);

    const ccvcv = [initialCC, V, C, V].map(a => a.length);
    const ccvcvTotal = ccvcv.reduce((x, y) => x * y);
    console.log("CCVCV:", ccvcv.join(" * "), "=", ccvcvTotal);

    const total = cvccvTotal + ccvcvTotal
    console.log(cvccvTotal, "+", ccvcvTotal, "=", total);
    console.log("drop last vowel:", total, "/", 5, "=", total / 5);

    const count = Object.keys(T.finprims).length;
    console.log("existing gismu:", count);

    const candidates = {};
    for (const c of candidateGismu) candidates[c] = 1;
    for (const g of Object.keys(T.finprims)) {
        if (!candidateGismu.includes(g)) console.log("illegal form:", g);
        deleteConflicts(candidates, g);
    }
    const available = Object.keys(candidates).length;
    const consume = total - available;
    console.log("available:", total, "-", consume, "=", available);

    let totalTrial = 0;
    const trials = 10;
    for (let i = 1; i <= trials; i++) {
        const availables = { ...candidates };
        let trial = 0, keys: string[] = [];
        while ((keys = Object.keys(availables)).length) {
            const g = keys[Math.floor(Math.random() * keys.length)];
            deleteConflicts(availables, g);
            trial++;
        }
        console.log("trial[", i, "/", trials, "]", trial);
        totalTrial += trial;
    }
    console.log("average:", Math.floor(totalTrial / trials));
}
//checkTotal();

function score(words: string[], sims: number[]) {
    return T.scoreInt(words, sims, T.weights2);
}

function checkRank(candidates, g: string) {
    const data = T.finprims[g];
    if (!data || !data.words) return;
    const scores = {};
    let max = 0;
    for (const c of Object.keys(candidates)) {
        let sims = data.words.map(w => T.similarity(c, w));
        const s = scores[c] = score(data.words, sims);
        if (max < s) max = s;
    }
    const sc = score(data.words, data.words.map(w => T.similarity(g, w)));
    const rank = Object.values(scores).filter(s => s > sc).length + 1;
    const tops: string[] = [];
    for (const [key, value] of Object.entries(scores)) {
        if (value == max) tops.push(key);
    }
    console.log(g,
        "score:", sc, "rank:", rank, "/", Object.keys(candidates).length,
        "max:", max, tops.length, tops.join(" "));
}

function testRank() {
    const candidates = {};
    for (const c of candidateGismu) candidates[c] = 1;
    for (const g of Object.keys(T.finprims)) {
        checkRank(candidates, g);
    }
}
testRank();
