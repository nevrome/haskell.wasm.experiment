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
# cabal --with-compiler=wasm32-wasi-ghc-9.14 --with-hc-pkg=wasm32-wasi-ghc-pkg-9.14 --with-hsc2hs=wasm32-wasi-hsc2hs-9.14 --with-haddock=wasm32-wasi-haddock-9.14 build
wasm32-wasi-ghc-9.14 test.hs -optl-Wl,--export=hs_init,--export=addTen
```

`--export=hs_init` initializes the Haskell runtime.
`--export=addTen` exposes the addTen function for external calls.