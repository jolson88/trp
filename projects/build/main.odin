package main

import "core:os"
import "core:os/os2"
import "core:fmt"
import "core:strings"

ODIN_PATH :: "vendor/win/x64/odin/odin.exe"
BIN_DIR :: "bin"

main :: proc() {
  fmt.println(os.args)

  project_name := "kakuro"
  if len(os.args) > 1 {
    command := os.args[1]
    args := os.args[2:]

    if command == "odin" {
      run_process(ODIN_PATH, args)
      return
    }
  }

  
  run_process(ODIN_PATH, []string{
    "run",
    project_name,
    strings.concatenate([]string{"-out:", BIN_DIR, "/", project_name, ".exe"}),
    "-strict-style",
  })
}

run_process :: proc(executable: string, args: []string) {
  process_args: [dynamic]string
  append(&process_args, executable)
  append(&process_args, ..args[:])
  process, start_err := os2.process_start(os2.Process_Desc{
    command=process_args[:]
  })
  if start_err != nil {
    fmt.eprintln("Failed to start compiler: ", start_err)
    return
  }

  process_result, wait_err := os2.process_wait(process)
  if wait_err != nil {
    fmt.eprintln("Could not wait for process: ", wait_err)
    return
  }
  if process_result.exited && process_result.exit_code > 0 {
    fmt.eprintln("Program failed to run, returned exit code of ", process_result.exit_code)
    return
  }

  close_err := os2.process_close(process)
  if close_err != nil {
    fmt.eprintln("Failed to close process handle: ", close_err)
    return
  }
}
