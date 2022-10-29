if (Deno.args.length != 2) {
    console.log("[require] https://www.lojban.org/publications/etymology/finprims")
    throw "usage: deno run --allow-read --allow-write convert.ts finprims output";
}

const finprims = Deno.readTextFileSync(Deno.args[0]);
const data = {};
let word = "", words: string[] = [], reserved = {};
let count = 0;
for (const line of finprims.split("\r\n")) {
    const d = line.substring(14);
    const m1 = d.match(/^([a-z]+) {5}\d\d\.\d\d {5}/);
    const m2 = d.match(/^[a-z]+( [a-z]*){3,5}$/);
    const m3 = d.match(/([a-z?]+)  (\d\d\.\d\d) (\d( \d){5})/);
    if (m1) {
        if (word && reserved["score"]) data[word] = reserved;
        word = m1[1];
        words = [];
        reserved = {};
    } else if (m2 && (!words.length || reserved["score"])) {
        words = d.split(" ");
        while (words.length < 6) words.push("");
        reserved = {};
    } else if (m3 && words.length) {
        const sims = m3[3].split(" ").map(s => parseInt(s));
        const r = { score: m3[2], sims: sims, words: words };
        if (m3[1] == word) {
            data[word] = r;
            word = "";
        } else reserved = r;
    }
}
if (word && reserved["score"]) data[word] = reserved;

Deno.writeTextFileSync(Deno.args[1], JSON.stringify(data));
//Deno.writeTextFileSync(Deno.args[1] + ".txt", Object.keys(data).join("\n") + "\n");
