package build

import "core:os"
import "core:os/os2"
import "core:fmt"
import "core:strings"

import "core:time"
import rl "vendor:raylib"

ODIN_PATH :: "vendor/win/x64/odin/odin.exe"
SUCCESS_SOUND_PATH :: "resources/sounds/success.ogg"
FAIL_SOUND_PATH :: "resources/sounds/fail.ogg"

main :: proc() {
  run(os.args)
}

Run_Error :: union {
  Init_Error,
  Sound_Loading_Error,
}

Init_Error :: enum {
  None = 0,
  Audio_Failed,
}

Sound_Loading_Error :: struct {
  path: string
}

run :: proc(args: []string) -> Run_Error {
  rl.InitAudioDevice()
  defer rl.CloseAudioDevice()
  if !rl.IsAudioDeviceReady() {
    return .Audio_Failed
  }

  success_sound := rl.LoadSound(SUCCESS_SOUND_PATH)
  defer rl.UnloadSound(success_sound)
  if !rl.IsSoundReady(success_sound) {
    return Sound_Loading_Error{
      path=SUCCESS_SOUND_PATH
    }
  }

  fail_sound := rl.LoadSound(FAIL_SOUND_PATH)
  defer rl.UnloadSound(fail_sound)
  if !rl.IsSoundReady(fail_sound) {
    return Sound_Loading_Error{
      path=FAIL_SOUND_PATH
    }
  }

  if len(args) > 1 {
    command := args[1]
    rem_args := args[2:]

    if command == "build" {
      run_kakuro_build()
      run_tests(success_sound, fail_sound)
    } else if command == "odin" {
      run_odin(rem_args)
    } else if command == "run" {
      run_kakuro()
    } else if command == "test" {
      run_tests(success_sound, fail_sound)
    }
  }
  
  for rl.IsSoundPlaying(success_sound) || rl.IsSoundPlaying(fail_sound) {
    time.sleep(100 * time.Millisecond)
  }

  return nil
}

run_odin :: proc(args: []string) {
  exec(ODIN_PATH, args)
}

run_kakuro :: proc() {
  exec(ODIN_PATH, []string{
    "run",
    "kakuro",
    "-out:bin/kakuro.exe",
    "-strict-style",
  })
}

run_kakuro_build :: proc() {
  exec(ODIN_PATH, []string{
    "build",
    "kakuro",
    "-out:bin/kakuro.exe",
    "-strict-style",
  })
}

run_tests :: proc(success_sound: rl.Sound, fail_sound: rl.Sound) {
  tests_passed := true
  proc_state, err := exec(ODIN_PATH, []string{
    "test",
    "build",
    "-out:bin/build_test.exe",
  })
  if proc_state.exit_code > 0 {
    tests_passed = false
  }

  proc_state, err = exec(ODIN_PATH, []string{
    "test",
    "kakuro",
    "-out:bin/kakuro_test.exe"
  })
  if proc_state.exit_code > 0 {
    tests_passed = false
  }

  if tests_passed {
    rl.PlaySound(success_sound)
  } else {
    rl.PlaySound(fail_sound)
  }
  return
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
    fmt.eprintln(err)
    return
  }

  process_state, err = os2.process_wait(process)
  if err != nil {
    fmt.eprintln(err)
    return
  }

  err = os2.process_close(process)
  if err != nil {
    fmt.eprintln(err)
    return
  }

  return
}
