import * as math from "https://esm.sh/mathjs@11.3.2/";

interface FinPrim { score: string, sims: number[], words: string[] }
const finprims: { [index: string]: FinPrim } =
    JSON.parse(Deno.readTextFileSync("finprims.json"));

let lvalues: number[][] = [], rvalues: number[] = [], sols: DenseMatrix[] = [];
for (const data of Object.values(finprims)) {
    if (!data.sims) continue;
    lvalues.push(data.sims.map((s, i) => s ? s / data.words[i].length : 0));
    rvalues.push(parseFloat(data.score) / 100);
    if (lvalues.length == 6) {
        if (Math.abs(math.det(lvalues)) > 1e-5) {
            sols.push(math.matrix(math.multiply(math.inv(lvalues), rvalues)));
            //if (sols.length == 20) break;
        }
        lvalues = [];
        rvalues = [];
    }
}
const pow = 1000;
const fix = x => Math.round(x * pow) / pow;
const avg = math.divide(math.sum(sols), sols.length).valueOf().map(fix);
console.log(avg, ", // sum:", fix(math.sum(avg)));
