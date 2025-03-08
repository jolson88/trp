@echo off
setlocal EnableDelayedExpansion

set "ARGS="
for %%A in (%*) do (
    set "ARGS=!ARGS! "%%A""
)

set "ODIN_PATH=vendor\win\x64\odin\odin.exe"
"%ODIN_PATH%" run build -out:bin/build.exe -- !ARGS!

endlocal
