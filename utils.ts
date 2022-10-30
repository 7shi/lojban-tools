export function readJSON(path: string) {
    try {
        return JSON.parse(Deno.readTextFileSync(path));
    } catch {
        return null;
    }
}

export function writeJSON(path: string, data: {}) {
    let text = "";
    let kvs = Object.entries(data);
    for (let i = 0; i < kvs.length; i++) {
        const [k, v] = kvs[i];
        text += i == 0 ? "{" : " ";
        text += `"${k}": ${JSON.stringify(v)}`;
        text += i < kvs.length - 1 ? ",\n" : "}\n";
    }
    Deno.writeTextFileSync(path, text);
}
