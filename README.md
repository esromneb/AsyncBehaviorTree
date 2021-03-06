[![Build Status](https://travis-ci.com/esromneb/AsyncBehaviorTree.svg?branch=master)](https://travis-ci.com/esromneb/AsyncBehaviorTree) [![npm version](https://badge.fury.io/js/async-behavior-tree.svg)](https://badge.fury.io/js/async-behavior-tree)
# AsyncBehaviorTree
My attempt to bring Behavior Trees to js with support for a visual editor.  This project was reverse engineered around the open source tool [Groot](https://github.com/BehaviorTree/Groot).  This [Groot](https://github.com/BehaviorTree/Groot) tool was designed to output trees for [BehaviorTree.CPP](https://github.com/BehaviorTree/BehaviorTree.CPP).  Note that this library is meant as a js port of BehaviorTree without being a direct port.  Many features supported by [BehaviorTree.CPP](https://github.com/BehaviorTree/BehaviorTree.CPP) are not supported by this library.  (I didn't look at the source code of [BehaviorTree.CPP](https://github.com/BehaviorTree/BehaviorTree.CPP) at all when developing this library).

# Example
![](img/abt-groot-screenshot.png)
This is a screenshot of [Groot](https://github.com/BehaviorTree/Groot) with a logfile that was written to disk during one of the unit tests.

# Basics
Create an xml tree file with Groot.  Bind to a "Blackboard" object during instantiation of the class in js.  Execute the tree.

# Blackboard
The blackboard stores both variables and functions.  If the functions are async they are executed as such.  Access blackboard variables with `${}` notation, similar to the notation in template literals https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals.

By default, functions expect a single argument which is a object with keys.  The Groot tool allows the setting and retreiving of these keys.

Functions can be called with normal arguments. To do this name the inputs like `_in_0` and `_in_1` in the Groot Action notes.

# Note Type Support
This app suports a subset of node that Groot supports.  As of today I'm not sure how to make "reactive" node types work.  For this reason I've skipped them.

<table>
<thead>
<tr>
<th>Node Type</th>
<th>Support Status</th>
</tr>
<tr>
  <td><b>Sequence</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>Fallback</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>Inverter</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>ForceSuccess</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>Action</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>Condition</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>AlwaysFailure</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>AlwaysSuccess</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>ForceFailure</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>Repeat</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>SetBlackboard</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>
<tr>
  <td><b>RetryUntilSuccesful</b></td>
  <td><pre lang="diff">+ Supported</pre>
</tr>


<tr>
  <td><b>KeepRunningUntilFailure</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Switch2</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Switch3</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Switch4</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Switch5</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Switch6</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>BlackboardCheckDouble</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>BlackboardCheckInt</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>BlackboardCheckString</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Timeout</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>SubTree</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>
<tr>
  <td><b>Delay</b></td>
  <td><pre lang="diff">! Plan To Support</pre>
</tr>




<tr>
  <td><b>SubTreePlus</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>ReactiveFallback</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>ReactiveSequence</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>IfThenElse</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>ManualSelector</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>SequenceStar</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>Parallel</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>
<tr>
  <td><b>WhileDoElse</b></td>
  <td><pre lang="diff">- Will Not Support</pre>
</tr>

</thead>
</table>


# Internals
`exe` is a member which has the tree.  Each tree node can have a member called `seq` which is an array of children.  Each tree node has a member called `path` which is a dot notation of numbers.  `path` skips the root node, however in most (all?) trees the first node is a nesting type (sqeuence, fallback, invert) etc.  Thus the first element of the path will always be `0`.


# Log Details
If a fallback has 2 failures and a success under it. The nodes will stay marked as such.  Once the final fallback has completed. The log will "go back" and mark the nodes from "failure" to "idle". The success will be marked from "success" to "idle".  This "dims" the entire subtree.  Then the Fallback will be marked success.  I don't copy this behavior very well atm.

# Log Playback
Because the log file-format is so complex, I opted to wrap part of actual [BehaviorTree.CPP](https://github.com/BehaviorTree/BehaviorTree.CPP) in WASM, and then call the internals to get log files.  This is optional as running WASM can be complicated.  If you don't need logs you can skip reading this.  See `setFileLogger()`


# Rules
