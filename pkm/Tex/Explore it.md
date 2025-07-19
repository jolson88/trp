---
tags:
  - media/book
  - testing
  - development
  - software
  
title: "Explore it: reduce risk and increase confidence with exploratory testing"

author: Elisabeth Hendrickson

url: "https://www.amazon.com/Explore-Increase-Confidence-Exploratory-Testing/dp/1937785025"

summary: "A comprehensive testing strategy requires both preplanned and automated tests as well as interactive exploratory testing. Planned testing is not sufficient by itself and can only ever account for known and identified conditions."
---

## On Testing and Exploration:

**Key Takeaways:**
- A comprehensive testing strategy requires both preplanned and automated tests as well as interactive exploratory testing. Planned testing is not sufficient by itself and can only ever account for known and identified conditions.

References:
- To understand the real capabilities and limitations of software, you need to find your way off The Happy Path. But without purpose, there will be little insight and you will simply be lost. Exploratory Testing is a way to have the techniques and skills to be a Master Explorer and gather loads of insights into your software. (p16)
- The essence of testing is designing an experiment to gather empirical evidence to answer a question about a risk. (p22)
  - During the design of the ENIAC, the choice of wire turned out to be a crucial one: "Then there was the potential problem of mice eating the wire. As a test some mice were put in a cage, starved for some time, and then offered different kinds of wires. When it was discovered that the mice loved the type of wiring that has been planned for the ENIAC, other wiring, which passed the mouse test, was chosen instead."
- You can't plan tests in advance to cover every possible condition. There are too many subtle variations in data, configurations, interactions, sequences, and timing, and they all compound on each other. Users do crazy things, production data has a tendency to drift over time, and features have a way to interact with each other in unexpected ways. (p23)
- Even if you could have comprehensive test cases, it would be insufficient. You need a strategy that answers two questions: 1) Does the software **behave as intended** under the **conditions it's supposed to handle**? and 2) Are there other risks? (p23)
- A testing strategy is not comprehensive until two facets of testing are both covered: **checking** that the software meets expectations, and **potential risks are explored**. Exploratory testing helps navigate towards risks through the infinite possible variations in a way preplanned tests cannot. Preplanned tests cases can only account for known conditions, not the unknown. To discover these surprises, repetition doesn't help, but variation does. (p25)
- Exploratory Testing is "simultaneously designing and executing tests to learn about the system, using your insights from the last experiment to inform the next". It is composed of four parts: designing tests, executing tests, learning, and steering. (p26)
- Good observation skills are crucial for exploratory testing. It requires looking for subtle clues of where a "nest of bugs" may be lurking. You have to be able to look past what you expect, avoid confirmation bias, and see what's _really_ happening in the system. (p28)
- Exploratory testing is good at finding issues where active investigation is needed: unintended consequences and side effects, surprising interactions, or unanticipated usage scenarios.