# install ghc-wasm

https://www.tushar-adhatrao.in/blogs/haskell_to_wasm.html
https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta

Install with ghcup:

```
curl https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta/-/raw/master/bootstrap.sh | SKIP_GHC=1 sh
source ~/.ghc-wasm/env
ghcup config add-release-channel https://gitlab.haskell.org/haskell-wasm/ghc-wasm-meta/-/raw/master/ghcup-wasm-0.0.9.yaml
ghcup install ghc wasm32-wasi-9.14 -- $CONFIGURE_ARGS
```

Test installation:
```
wasm32-wasi-ghc-9.14 --version
```

Build project:
```
make wasm
make serve
```
