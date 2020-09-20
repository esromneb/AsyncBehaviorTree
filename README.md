# AsyncBehaviorTree
My attempt to bring Behavior Trees to js with support for a visual editor.  This project was reverse engineered around the open source tool Groot https://github.com/BehaviorTree/Groot.  This Groot tool was designed to output trees for https://github.com/BehaviorTree/BehaviorTree.CPP.  Note that this library is meant as a js port of BehaviorTree without being a direct port.  Many features supported by BehaiorTree.CPP are not supported by this library.

# Basics
Create an xml tree file with Groot.  Bind to a "Blackboard" object during instantiation of the class.

# Blackboard
The blackboard stores both variables and functions.  If the functions are async they are executed as such.  Access blackboard variables with `${}` notation, similar to the notation in template literals https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals.

By default, functions expect a single argument which is a object with keys.  The Groot tool allows the setting and retreiving of these keys.

Functions can be called with normal arguments. To do this name the inputs like `_in_0` and `_in_1` in the Groot Action notes.



# Internals
`exe` is a member which has the tree.  Each tree node can have a member called `seq` which is an array of children.  Each tree node has a member called `path` which is a dot notation of numbers.  `path` skips the root node, however in most (all?) trees the first node is a nesting type (sqeuence, fallback, invert) etc.  Thus the first element of the path will always be `0`.

# Rules
