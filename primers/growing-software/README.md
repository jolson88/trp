# A Young Coder's Primer on Growing Software

This primer serves as a guide to software coders on the Art of Growing Software. Software programs and systems are organic creatures. They might not be conscious and they may not be like us carbon-based lifeforms. But in many ways, they grow, evolve, and break down in similar ways as us. Their structure and evoluation can be intelligently guided over time as we aim to provide our users with more and more valuable experiences. 

This primer covers concepts like:
- The Stages of Software Growth (from a single-cell organism to complex creatures with organs and tissues)
- Entropy Reigns (even in the software world, entropy impacts us just like the physical world; more dependencies often introduce more sources of entropy into our software resulting in even more rapid "software rot" when energy is not expended in keeping the software runnable)
- Evolution Markers: Clues that help you know when your software might be ready for its next stage of growth
- TASTAAFL (There Ain't No Such Thing As A Free Lunch): Nothing comes free; every software design decision involves trade-offs
- There Is No Single Right Answer
- The Law of Complexity: You can't escape complexity; it will always find you
  - Don't optimize or focus on hiding away complexity. Our challenge is removing as much accidental complexity from a problem as possible (TODO: Link to Ball of Mud paper or whichever one discusses different types of complexity, Fred Brooks maybe?). Complexity should not be hidden. Complexity gives us hints of when our solution may be incorrect or our problem is evolving. Allow the complexity to be front and center. Don't think of abstraction as a way to brush a bunch of complexity under the carpet. Abstraction should be used as a tool for _compressing_ our solution in a way where the essential complexity of the problem becomes more clear.
- Software's Principle of Least Action (similar to light following the quickest path possible, we should strive for our software to do the same; each detailed layer hidden away through abstraction makes our code more massive and less flexible; instead of abstracting away the lower level, start with the lower level and then "automate" or "protocol" on top of it; abstractions are always defined in terms of composing the lower levels, not hiding them).
