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

function diff(x: string, y: string) {
    if (x.length != y.length) throw "length not match";
    const ret = [];
    for (let i = 0; i < x.length; i++) {
        if (x[i] != y[i]) ret.push(i);
    }
    return ret;
}

function similar(g1: string, g2: string) {
    if (g1.length != 5 || g2.length != 5) throw "length != 5";
    if (g1.substring(0, 4) == g2.substring(0, 4)) return true;
    let d = diff(g1, g2);
    if (d.length != 1) return false;
    const p = d[0];
    const c = similarC[g1[p]];
    return c && c.includes(g2[p]);
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
    if (!data || !data.words) throw "illegal: " + g;
    const scores = {};
    const keys = Object.keys(candidates);
    let max = 0;
    for (const c of keys) {
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
    return { score: sc, rank: rank, total: keys.length, max: max, tops: tops };
}

function setRanks(ranks, candidates, list) {
    for (let i = 0; i < list.length; i++) {
        const g = list[i];
        const r = checkRank(candidates, g);
        console.log(i + 1, "/", list.length, g, r);
        ranks[g] = r;
    }
}

function readRanks(path: string) {
    try {
        return JSON.parse(Deno.readTextFileSync(path));
    } catch {
        return null;
    }
}

function deleteIf(ranks, candidates, gismu, f) {
    let del = 0;
    for (const [g, r] of Object.entries(ranks)) {
        if (f(g, r)) {
            delete ranks[g];
            deleteConflicts(candidates, g);
            delete gismu[g];
            del++;
        }
    }
    if (del) {
        const len = Object.keys(candidates).length;
        for (const [g, r] of Object.entries(ranks)) {
            r.total = len;
            const len1 = r.tops.length;
            if (r.rank <= len1 + 1) {
                r.tops = r.tops.filter(c => c in candidates);
                const len2 = r.tops.length;
                if (!len2) {
                    delete r.rank;
                } else if (len1 != len2 && r.rank > 1) {
                    r.rank = len2 + 1;
                }
            } else delete r.rank;
        }
    }
    return del;
}

function testRank() {
    const candidates = {};
    for (const c of candidateGismu) candidates[c] = 1;
    const gismu = { ...T.finprims };
    console.log(Object.keys(candidates).length, Object.keys(gismu).length);
    for (const [g, data] of Object.entries(gismu)) {
        if (!data.words) {
            deleteConflicts(candidates, g);
            delete gismu[g];
        }
    }
    console.log(Object.keys(candidates).length, Object.keys(gismu).length);
    let ranks = {};
    let del = 1;
    for (let i = 1; del; i++) {
        const path = `rank-${i}.json`;
        const cache = readRanks(path);
        if (cache) {
            ranks = cache;
        } else {
            const list = i == 1 ? Object.keys(gismu)
                : Object.keys(ranks).filter(g => !ranks[g].rank);
            setRanks(ranks, candidates, list);
            Deno.writeTextFileSync(path, JSON.stringify(ranks));
        }
        const len = Object.keys(gismu).length;
        del = deleteIf(ranks, candidates, gismu, (_, r) =>
            r.rank == 1 && r.tops.length == 1);
        console.log("[", i, "] determine:", del, "/", len);
        if (del == 0) {
            del = deleteIf(ranks, candidates, gismu, (g, r) =>
                r.tops.length == 1 && diff(g, r.tops[0]).length == 1);
            console.log("[", i, "] typo:", del, "/", len);
        }
        if (del == 0) {
            del = deleteIf(ranks, candidates, gismu, (_, r) => r.rank == 1);
            console.log("[", i, "] select:", del, "/", len);
        }
    }
    console.log(Object.keys(candidates).length, Object.keys(gismu).length);
}
testRank();
