WASM_OUT := web/haskell-wasm.wasm

.PHONY: wasm serve clean

wasm:
	cabal build --project-file=cabal.wasm.project exe:experiment
	cp "$$(cabal list-bin --project-file=cabal.wasm.project exe:experiment)" "$(WASM_OUT)"

serve: wasm
	cd web && python3 -m http.server 8000

clean:
	cabal clean
	rm -f "$(WASM_OUT)"
