WASM_OUT := web/haskell-wasm.wasm

.PHONY: wasm serve clean

wasm:
	cabal build exe:butterflybone
	cp "$$(cabal list-bin exe:butterflybone)" "$(WASM_OUT)"

serve: wasm
	cd web && python3 -m http.server 8000

clean:
	cabal clean
	rm -f "$(WASM_OUT)"
