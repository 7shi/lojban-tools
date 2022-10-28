function similarity(g: string, w: string) {
    if (!w) return [0, 0];
    const memo = Array(g.length).fill([]).map(() => Array(w.length));
    function f(gp: number, wp: number) {
        if (gp == g.length || wp == w.length) return 0;
        let m = memo[gp][wp];
        if (m >= 0) return m;
        const sc = f(gp, wp + 1);
        const p = g.indexOf(w[wp], gp);
        return memo[gp][wp] = p < 0 ? sc : Math.max(sc, f(p + 1, wp + 1) + 1);
    }
    const ret = f(0, 0);
    if (ret >= 3) return [ret, ret / w.length];
    for (let i = 0; i < w.length - 1; i++) {
        let j = -1;
        while ((j = g.indexOf(w[i], j + 1)) >= 0) {
            if ((g[j + 1] == w[i + 1] || (i < w.length - 2 && g[j + 2] == w[i + 2])))
                return [2, 2 / w.length];
        }
    }
    return [0, 0];
}

function gismu(weights: number[], jbo: string, words: string[]) {
    while (words.length < 6) words.push("");
    const scores = words.map(w => similarity(jbo, w));
    let sum = scores.map((sc, i) => sc[1] * weights[i]).reduce((x, y) => x + y);
    return { sum: sum, scores: scores.map(sc => sc[0]) };
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
    const score = Math.floor(sc.sum * 10000) / 100;
    const sc1 = score.toFixed(2), sc2 = sc.scores.join(" ");
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
