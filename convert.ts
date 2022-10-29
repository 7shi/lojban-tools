if (Deno.args.length != 2) {
    console.log("[require] https://www.lojban.org/publications/etymology/finprims")
    throw "usage: deno run --allow-read --allow-write convert.ts finprims output";
}

const finprims = Deno.readTextFileSync(Deno.args[0]);
const data = {};
let words: string[] = [];
let count = 0;
for (const line of finprims.split("\r\n")) {
    const d = line.substring(14);
    if (!words.length && d.match(/^[a-z]+( [a-z]+){3,5}$/)) {
        words = d.split(" ");
        while (words.length < 6) words.push("");
    } else if (words.length) {
        const m = d.match(/([a-z?]+)  (\d\d\.\d\d) (\d( \d){5})/);
        if (m) {
            const sims = m[3].split(" ").map(s => parseInt(s));
            data[m[1]] = { score: m[2], sims: sims, words: words };
            words = [];
        } else if (line.substring(0, 14).trim()) {
            words = [];
        }
    }
}
Deno.writeTextFileSync(Deno.args[1], JSON.stringify(data));
