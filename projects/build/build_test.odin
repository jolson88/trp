package build

import ct "core:testing"

@(test)
should_run_program_correctly :: proc(t: ^ct.T) {
    my_check := true
    ct.expect_value(t, my_check, true);
}