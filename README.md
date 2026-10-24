### Test repository: Compiling Haskell to WebAssembly and using it in a WebApp

I was following these resources:
- https://www.tushar-adhatrao.in/blogs/haskell_to_wasm.html
- https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta

#### Setup

1. Install a WASM version of GHC with ghcup:

```
curl https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta/-/raw/master/bootstrap.sh | SKIP_GHC=1 sh
source ~/.ghc-wasm/env
ghcup config add-release-channel https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta/-/raw/master/ghcup-wasm-0.0.9.yaml
ghcup install ghc wasm32-wasi-9.14 -- $CONFIGURE_ARGS
```

2. Test installation:

```
wasm32-wasi-ghc-9.14 --version
```

3. Build this project and run the WebApp:

```
make wasm
make serve
```
