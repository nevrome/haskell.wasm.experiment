{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import qualified Data.Text as T
import qualified Data.Text.Encoding as TE
import Data.Text (Text)
import Foreign.C.String (CString, newCString)
import Foreign.Marshal.Alloc (callocBytes, free)
import Foreign.Ptr (Ptr)
import qualified Data.ByteString as BS

-- Foreign exports for JavaScript interop
foreign export ccall "hs_processPages" processPages :: CString -> IO CString
foreign export ccall "callocBuffer" callocBuffer :: Int -> IO (Ptr a)
foreign export ccall "freeBuffer" freeBuffer :: Ptr a -> IO ()

-- memory allocation functions
callocBuffer :: Int -> IO (Ptr a)
callocBuffer = callocBytes
freeBuffer :: Ptr a -> IO ()
freeBuffer = free

processPages :: CString -> IO CString
processPages cstr = do
    inputBytes <- BS.packCString cstr
    let inputText = TE.decodeUtf8 inputBytes
    let pages = T.splitOn "---PAGE_BREAK---" inputText
    let result = processAllPages pages
    newCString (T.unpack result)

-- Process all pages (example transformations)
processAllPages :: [Text] -> Text
processAllPages pages = T.unlines $ 
    [ "=== Butterflybone Processing Report ==="
    , "Total pages downloaded: " <> T.pack (show (length pages))
    , ""
    ] <> 
    map processPage (zip [1..] pages) <>
    [ ""
    , "=== End Report ==="
    ]

-- Process a single page (you can customize this)
processPage :: (Int, Text) -> Text
processPage (idx, content) = 
    "--- Page " <> T.pack (show idx) <> " ---\n" <>
    "Length: " <> T.pack (show (T.length content)) <> " characters\n" <>
    "First 200 chars: " <> T.take 200 content <> "\n" <>
    "Contains 'title': " <> 
    (if "title" `T.isInfixOf` T.toLower content then "yes" else "no") <> "\n"

main :: IO ()
main = putStrLn "Butterflybone WASM module loaded"
