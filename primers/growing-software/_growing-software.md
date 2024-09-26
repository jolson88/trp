## Growing Software

If you look at the composition of living organisms like humans from a high level biologically, you could see it
as a series of building blocks that start with cells, then similar cells group into tissues, then organs build from two or more tissue types, and multiple organs form an organ system. You can also zoom deeper into cells to see molecules, atoms, quarks, etc.

We don't typically think of "building" organisms. Organisms live. Organisms grow. Runaway mutations or unexpected changes may result in damage or even loss of life. Some organisms form with defects that inhibit its viability for life, defects that may remove a needed purpose or prevent the ability to adapt to the environment.

Software systems exhibit the same behavior. Software is grown. Sometimes it forms defects that prevent it from adapting to change or growing in some key way. Some software may be unable to withstand its own structure and will collapse under its own weight.

While we may create or write code, **Great Software Is Grown**.

TODO (the quark/atom/molecule/cell/tissue/organ continuum for software like primitive/data-structure/procedure/program/system/network)

Entropy tells us that as the entropy compounds across all the inter-connections, some part of the system will always be non-functioning at any given point in time. We make a system more available by building in resilience and recovery into the software. We assume software breakage and errors are a Fact of Life that we need to accept and account for in our software.

This all adds complexity to our software. The higher up "The Food Chain" we grow our software, the more inherent complexity in that software. The larger the software, the slower it becomes. The large paths of communication within a system also contributes to it changing at a slower rate.

Software change has to take inertia into account. A large system comprised of many different communicating web services each interacting with databases and other async processes and programs naturally contains more inertia than the name of a variable used within the scope of a single function in a single program. Changing the structure of the individual variable is going to take a lot less effort and time than changing the structure of the different web services and how they communicate within a network.

The last thing we want to do is purposefully introduce un-needed complexity into the software by prematurely working our way up this abstraction food chain. We want to keep it as simple as we can for as long as possible. We want to see how the software will need to change over time and let it tell us what its structure needs to be.