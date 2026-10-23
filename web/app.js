import { WASI } from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.3.0/+esm";

const input = document.getElementById("url");
const button = document.getElementById("downloadButton");
const output = document.getElementById("output");
const status = document.getElementById("status");

const wasi = new WASI([], [], []);

// This path is relative to app.js, which is also in web/.
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

    // Convert JavaScript text to a null-terminated UTF-8 C string.
    const encoded = encoder.encode(str + "\0");

    // Allocate space in the WASM/Haskell heap.
    const inputPtr = inst.exports.callocBuffer(encoded.length);

    new Uint8Array(
        inst.exports.memory.buffer,
        inputPtr,
        encoded.length
    ).set(encoded);

    // hs_sayHello receives CString and returns a newly allocated CString.
    const resultPtr = func(inputPtr);

    // Find the C string's terminating null byte.
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

    // Release both allocations in the Haskell/WASM heap.
    inst.exports.freeBuffer(inputPtr);
    inst.exports.freeBuffer(resultPtr);

    return result;
}

// extract the last number from a URL
function extractNumberFromUrl(url) {
    const matches = url.match(/(\d+)(?!.*\d)/);
    return matches ? parseInt(matches[1]) : null;
}

// replace the last number in a URL with a new value
function replaceNumberInUrl(url, newNumber) {
    return url.replace(/(\d+)(?!.*\d)/, newNumber.toString());
}

// fetch a page through proxy
async function fetchPage(url) {
    const proxyUrl = `/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.text();
}

// main download loop
async function downloadSeries(startUrl) {
    const pages = [];
    let currentUrl = startUrl;
    let currentNumber = extractNumberFromUrl(startUrl);
    
    if (currentNumber === null) {
        throw new Error("URL must contain a number");
    }
    
    let previousContent = null;
    let maxPages = 3; // safety limit for testing
    
    for (let i = 0; i < maxPages; i++) {
        status.textContent = `Downloading page ${i + 1}: ${currentUrl}`;
        
        const content = await fetchPage(currentUrl);
        pages.push(content);
        
        // check if content is same as previous
        if (previousContent !== null && content === previousContent) {
            status.textContent = `Stopped: page ${i + 1} has same content as page ${i}`;
            break;
        }
        
        previousContent = content;
        currentNumber++;
        currentUrl = replaceNumberInUrl(currentUrl, currentNumber);
        // sleep
        await new Promise(r => setTimeout(r, 2000));
    }
    
    return pages;
}

function processPagesWithHaskell(pages) {
    const delimiter = "\n---PAGE_BREAK---\n";
    const combinedContent = pages.join(delimiter);
    return callWithString(inst.exports.hs_processPages, combinedContent);
}

// button handler
async function handleDownload() {
    const url = input.value.trim();
    
    if (url === "") {
        output.textContent = "Please enter a URL.";
        return;
    }
    
    try {
        button.disabled = true;
        output.textContent = "";
        const pages = await downloadSeries(url);
        status.textContent = `Downloaded ${pages.length} pages. Processing with Haskell...`;
        const result = processPagesWithHaskell(pages);
        output.textContent = result;
        status.textContent = `Processed ${pages.length} pages successfully.`;
        
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        status.textContent = "Download failed.";
    } finally {
        button.disabled = false;
    }
}

button.addEventListener("click", handleDownload);

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleDownload();
    }
});
