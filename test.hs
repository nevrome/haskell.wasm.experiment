{-# LANGUAGE ForeignFunctionInterface #-}

module Main where

import Foreign.C.Types (CInt (..))

addTen :: CInt -> CInt
addTen n = n + 10

foreign export ccall "addTen" addTen :: CInt -> CInt

main :: IO ()
main = pure ()
