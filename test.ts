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
        let j = -1;
        while ((j = g.indexOf(w[i], j + 1)) >= 0) {
            if ((g[j + 1] == w[i + 1] || (i < w.length - 2 && g[j + 2] == w[i + 2])))
                return 2;
        }
    }
    return 0;
}

function similarity(g: string, w: string) {
    let s = similarity2a(g, w);
    return s < 3 ? similarity2b(g, w) : s;
}

function gismu(weights: number[], g: string, words: string[]) {
    let score = 0, sims: number[] = [];
    for (let i = 0; i < 6; i++) {
        const w = words[i];
        let s = similarity(g, w);
        score += s ? s / w.length * weights[i] : 0;
        sims.push(s);
    }
    return { score: score, sims: sims };
}

const weights = {
    //      [ zh  ,  en  ,  hi  ,  es  ,  ru  ,  ar  ]
    "1985": [0.360, 0.210, 0.160, 0.110, 0.090, 0.070], // sum: 1
    "1994": [0.348, 0.163, 0.194, 0.123, 0.088, 0.084], // sum: 1
    "1995": [0.347, 0.160, 0.196, 0.123, 0.089, 0.085], // sum: 1
    "1999": [0.334, 0.187, 0.195, 0.116, 0.081, 0.088], // sum: 1.001
    "????": [0.330, 0.180, 0.160, 0.120, 0.120, 0.070], // sum: 0.98
};

let all = 0, ng = 0;
function test(word, data) {
    const sc = gismu(weights["????"], word, data.words);
    const score = Math.floor(sc.score * 10000) / 100;
    const sc1 = score.toFixed(2), sc2 = sc.sims.join(" ");
    const ok1 = sc1 == data.score, ok2 = sc2 == data.scores;
    if (!ok1 || !ok2) {
        let diff = (score - parseFloat(data.score)).toFixed(2);
        if (!diff.startsWith("-")) diff = "+" + diff;
        console.log(word,
            ok1 ? "[OK]" : "[" + diff + "]", sc1, "exp =", data.score,
            ok2 ? "[OK]" : "[NG]", sc2, "exp =", data.scores,
            "|", data.words.join(" "));
        ng++;
    }
    all++;
}

const finprims = JSON.parse(Deno.readTextFileSync("finprims.json"));
for (const [word, data] of Object.entries(finprims)) test(word, data);
console.log("NG:", ng, "/", all);
