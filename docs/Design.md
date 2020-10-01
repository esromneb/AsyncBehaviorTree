# Design
Right now the code is really messy. I walk the tree in different ways in 3 different functions

* execute()
* walkTree()
* loadPath()
* recurse()


# Add a new node type
* Decide what to do in recurse
  * This is the first place the node is found
* Decide what to do in loadPath
  * This is where the .exe is written