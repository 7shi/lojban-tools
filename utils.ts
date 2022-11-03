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

export function* splitLines(text: string) {
    let line = "", prev = "";
    for (const ch of text) {
        if (ch == '\r') {
            yield line;
            line = "";
        } else if (ch == '\n') {
            if (prev != '\r') yield line;
            line = "";
        } else {
            line += ch;
        }
        prev = ch;
    }
    if (line.length) yield line;
}

export function readLines(fileName: string) {
    return Array.from(splitLines(Deno.readTextFileSync(fileName)));
}

export function writeLines(fileName: string, lines: string[]) {
    Deno.writeTextFileSync(fileName, lines.join("\n") + "\n");
}
