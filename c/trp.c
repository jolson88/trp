#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "cu.h"

/// @brief Clears the console
void con_clear() {
    printf("\033[2J");
}

/// @brief Sets the cursor position in the console
/// @param x the x position, starting from 1
/// @param y the y position, starting from 1
void con_set_cursor(int x, int y) {
    printf("\033[%d;%dH", y, x);
}

void my_passing_test() {
    CU_ASSERT(true, "Should always be true");
}

void my_failing_test() {
    CU_ASSERT_STRINGS_EQUAL("Hello", "World");
}

void run_tests() {
    printf("Running tests...\n\n");

    cu_TestSuite suite = cu_suite_create("cu");
    cu_suite_test(&suite, "my_first_test", my_passing_test);
    cu_suite_test(&suite, "my_second_test", my_failing_test);
}

int main(int argc, char *argv[]) {
    for (int i = 0; i < argc; i++) {
        if (strcmp(argv[i], "--test") == 0) {
            con_clear();
            con_set_cursor(0, 0);
            run_tests();
            return 0;
        }
    }

    printf("Normal program running...\n");

    return 0;
}
