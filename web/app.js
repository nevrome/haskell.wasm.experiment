import { WASI } from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.3.0/+esm";

const input = document.getElementById("name");
const button = document.getElementById("helloButton");
const output = document.getElementById("output");

const wasi = new WASI([], [], []);

// this path is relative to app.js, which is also in web/
const wasm = await WebAssembly.compileStreaming(
    fetch("./haskell-wasm.wasm")
);

const inst = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: wasi.wasiImport,
});

wasi.initialize(inst);
inst.exports.hs_init(0, 0);

function callWithString(func, str) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");

    // convert JavaScript text to a null-terminated UTF-8 C string
    const encoded = encoder.encode(str + "\0");

    // allocate space in the WASM/Haskell heap
    const inputPtr = inst.exports.callocBuffer(encoded.length);

    new Uint8Array(
        inst.exports.memory.buffer,
        inputPtr,
        encoded.length
    ).set(encoded);

    // hs_sayHello receives CString and returns a newly allocated CString
    const resultPtr = func(inputPtr);

    // find the C string's terminating null byte
    const resultMemory = new Uint8Array(
        inst.exports.memory.buffer,
        resultPtr
    );

    const nullIndex = resultMemory.indexOf(0);

    const result = decoder.decode(
        new Uint8Array(
            inst.exports.memory.buffer,
            resultPtr,
            nullIndex
        )
    );

    // release both allocations in the Haskell/WASM heap
    inst.exports.freeBuffer(inputPtr);
    inst.exports.freeBuffer(resultPtr);

    return result;
}

function sayHello() {
    const name = input.value.trim();

    if (name === "") {
        output.textContent = "Please enter a name.";
        return;
    }

    output.textContent = callWithString(
        inst.exports.hs_sayHello,
        name
    );
}

button.addEventListener("click", sayHello);

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sayHello();
    }
});
