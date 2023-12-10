#ifndef CU_H
#define CU_H

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CU_ASSERT(value, description) __cu_assert(value, description, __FILE__, __LINE__)
#define CU_ASSERT_STRINGS_EQUAL(expected, actual) __cu_assert_strings_equal(expected, actual, __FILE__, __LINE__)

typedef struct cu_TestSuite cu_TestSuite;

struct cu_TestSuite {
    char *name;
    char *current_test_failure;
    bool current_test_passed;
};

static cu_TestSuite *cu_current_suite;

cu_TestSuite cu_suite_create(char *name) {
    printf("Starting %s tests\n", name);

    cu_TestSuite suite;
    suite.name = name;
    return suite;
}

void cu_suite_test(cu_TestSuite *suite, char *name, void (*test_function)(void)) {
    printf("%s - %s... ", suite->name, name);
    
    suite->current_test_passed = true;
    suite->current_test_failure = "";
    cu_current_suite = suite;
    test_function();
    if (suite->current_test_passed) {
        printf("\033[32m[OK]\033[0m\n");
    } else {
        printf("\033[31m[%s]\033[0m\n", suite->current_test_failure);
    }
}

void __cu_assert(bool value, char *description, char *file, int line) {
    if (!value && cu_current_suite) {
        fprintf(stderr, "Assertion failed at %s:%d\n", file, line);
        cu_current_suite->current_test_failure = description;
        cu_current_suite->current_test_passed = false;
    }
}

void __cu_assert_strings_equal(char *expected, char *actual, char *file, int line) {
    if (strcmp(expected, actual) != 0) {
        fprintf(stderr, "Assertion failed: (%s) == (%s), at %s:%d\n", expected, actual, file, line);
        cu_current_suite->current_test_failure = "Strings are not equal";
        cu_current_suite->current_test_passed = false;
    }
}

#endif // CU_H
