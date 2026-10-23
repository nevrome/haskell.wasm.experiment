WASM_OUT := web/haskell-wasm.wasm

.PHONY: wasm serve clean

wasm:
	cabal build --project-file=cabal.project.wasm exe:butterflybone
	cp "$$(cabal list-bin --project-file=cabal.project.wasm exe:butterflybone)" "$(WASM_OUT)"

serve: wasm
	cd web && python3 server.py 8000

clean:
	cabal clean
	rm -f "$(WASM_OUT)"
