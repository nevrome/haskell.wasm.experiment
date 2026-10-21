module Main where

import Foreign.C.String (CString, peekCString, newCString)
import Foreign.Marshal.Alloc (callocBytes, free)
import Foreign.Ptr (Ptr)

foreign export ccall "hs_sayHello" sayHello :: CString -> IO CString
foreign export ccall "callocBuffer" callocBuffer :: Int -> IO (Ptr a)
foreign export ccall "freeBuffer" freeBuffer :: Ptr a -> IO ()

sayHello :: CString -> IO CString
sayHello cstr = do
    inputStr <- peekCString cstr
    newCString $ "Hello, " <> inputStr

callocBuffer :: Int -> IO (Ptr a)
callocBuffer = callocBytes

freeBuffer :: Ptr a -> IO ()
freeBuffer = free

main :: IO ()
main = putStrLn "Hello, Haskell!"