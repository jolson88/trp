#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct TestSuite TestSuite;

struct TestSuite {
    char *name;
    bool current_test_passed;
};

static TestSuite *cu_current_suite;

TestSuite cu_suite_create(char *name) {
    printf("Starting %s tests\n", name);

    TestSuite suite;
    suite.name = name;
    return suite;
}

void cu_suite_test(TestSuite *suite, char *name, void (*test_function)(void)) {
    printf("%s - %s... ", suite->name, name);
    
    suite->current_test_passed = true;
    cu_current_suite = suite;
    test_function();
    if (suite->current_test_passed) {
        printf("\033[32m[OK]\033[0m\n");
    } else {
        printf("\033[31m[FAIL]\033[0m\n");
    }
}

void cu_assert(bool value, char *name) {
    if (!value && cu_current_suite) {
        cu_current_suite->current_test_passed = false;
    }
}

void my_passing_test() {
    cu_assert(true, "Should always be true");
}

void my_failing_test() {
    cu_assert(false, "Should always be false");
}

void run_tests() {
    printf("Running tests...\n\n");

    TestSuite suite = cu_suite_create("cu");
    cu_suite_test(&suite, "my_first_test", my_passing_test);
    cu_suite_test(&suite, "my_second_test", my_failing_test);
}

int main(int argc, char *argv[]) {
    for (int i = 0; i < argc; i++) {
        if (strcmp(argv[i], "--test") == 0) {
            run_tests();
            return 0;
        }
    }

    printf("Normal program running...\n");

    return 0;
}
