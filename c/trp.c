#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct TestSuite TestSuite;

struct TestSuite {
    char *name;
};

TestSuite cu_suite_create(char *name) {
    printf("Starting %s tests\n", name);

    TestSuite suite;
    suite.name = name;
    return suite;
}

void cu_suite_test(TestSuite *suite, char *name, void (*test_function)(void)) {
    printf("%s - %s... ", suite->name, name);
    test_function();
    printf("[OK]\n");
}

void my_simple_test() {
    // do nothing
}

void run_tests() {
    printf("Running tests...\n\n");

    TestSuite suite = cu_suite_create("cu");
    cu_suite_test(&suite, "my_simple_test", my_simple_test);
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
