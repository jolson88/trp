package build

import "core:os"
import "core:os/os2"
import "core:fmt"
import "core:strings"

import "core:time"
import rl "vendor:raylib"

ODIN_PATH :: "vendor/win/x64/odin/odin.exe"
BIN_DIR :: "bin"

main :: proc() {
  rl.InitAudioDevice()
  defer rl.CloseAudioDevice()
  if !rl.IsAudioDeviceReady() {
    fmt.eprintln("Failed to initialize audio device.")
    return
  }

  success_sound := rl.LoadSound("resources/sounds/success.ogg")
  defer rl.UnloadSound(success_sound)
  if !rl.IsSoundReady(success_sound) {
    fmt.eprintln("Failed to load sound file.")
    return
  }

  fail_sound := rl.LoadSound("resources/sounds/fail.ogg")
  defer rl.UnloadSound(fail_sound)
  if !rl.IsSoundReady(fail_sound) {
    fmt.eprintln("Failed to load sound file.")
    return
  }

  if len(os.args) > 1 {
    command := os.args[1]
    args := os.args[2:]

    if command == "odin" {
      exec(ODIN_PATH, args)
      return
    }
    
    if command == "test" {
      tests_all_passed := true
      proc_state, err := exec(ODIN_PATH, []string{
        "test",
        "build",
        "-out:bin/build_test.exe",
      })
      if proc_state.exit_code > 0 {
        tests_all_passed = false
      }

      proc_state, err = exec(ODIN_PATH, []string{
        "test",
        "kakuro",
        "-out:bin/kakuro_test.exe"
      })
      if proc_state.exit_code > 0 {
        tests_all_passed = false
      }

      if tests_all_passed {
        rl.PlaySound(success_sound)
        fmt.println("\nAll tests passed!")
      } else {
        rl.PlaySound(fail_sound)
        fmt.eprintln("\nSome tests failed!")
      }
      for rl.IsSoundPlaying(success_sound) || rl.IsSoundPlaying(fail_sound) {
        time.sleep(100 * time.Millisecond)
      }
      return
    }
  }
  
  exec(ODIN_PATH, []string{
    "run",
    "kakuro",
    strings.concatenate([]string{"-out:", BIN_DIR, "/", "kakuro", ".exe"}),
    "-strict-style",
  })
}

exec :: proc(executable: string, args: []string) -> (process_state: os2.Process_State, err: os2.Error) {
  process_args: [dynamic]string
  append(&process_args, executable)
  append(&process_args, ..args[:])
  process: os2.Process
  process, err = os2.process_start(os2.Process_Desc{
    command=process_args[:]
  })
  if err != nil {
    return
  }

  process_state, err = os2.process_wait(process)
  if err != nil {
    return
  }

  err = os2.process_close(process)
  if err != nil {
    return
  }

  return
}
