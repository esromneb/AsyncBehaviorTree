const testTree9 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Fallback><Action ID="go1"/><Sequence name="Sequence2"><Action ID="go2"/><Fallback><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/></Fallback><Action ID="go6"/></Sequence><Action ID="go7"/><Action ID="go8"/></Fallback></BehaviorTree><TreeNodesModel><Action ID="dumpRun"/><Action ID="go1"/><Action ID="go2"/><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/><Action ID="go7"/><Action ID="go8"/><Action ID="goClosestR"/><Condition ID="isFull"/><Action ID="mineResource"/><Action ID="mineResources"/><Action ID="moveBaseToGoal"><input_port name="key_name">goal</input_port></Action><Action ID="stay1"/><Action ID="stay2"/><Action ID="waitFrames"><output_port name="barout"/><input_port name="baz"/><input_port name="fooin"/><input_port default="15" name="frames">frames</input_port></Action><Action ID="waitFrames2"><input_port default="15" name="frames">frames</input_port></Action><Action ID="waitFrames3"><inout_port default="4" name="d_one">has default</inout_port><inout_port name="d_zero">d1</inout_port><input_port default="2" name="frames"/><input_port name="stagger">not a real argument, the other has a default</input_port></Action></TreeNodesModel></root>';
const testTree10 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Action ID="go1"/><Sequence name="Sequence2"><Action ID="go2"/><Sequence name="Sequence3"><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/></Sequence><Action ID="go6"/></Sequence><Action ID="go7"/><Action ID="go8"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="dumpRun"/><Action ID="go1"/><Action ID="go2"/><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/><Action ID="go7"/><Action ID="go8"/><Action ID="goClosestR"/><Condition ID="isFull"/><Action ID="mineResource"/><Action ID="mineResources"/><Action ID="moveBaseToGoal"><input_port name="key_name">goal</input_port></Action><Action ID="stay1"/><Action ID="stay2"/><Action ID="waitFrames"><output_port name="barout"/><input_port name="baz"/><input_port name="fooin"/><input_port default="15" name="frames">frames</input_port></Action><Action ID="waitFrames2"><input_port default="15" name="frames">frames</input_port></Action><Action ID="waitFrames3"><inout_port default="4" name="d_one">has default</inout_port><inout_port name="d_zero">d1</inout_port><input_port default="2" name="frames"/><input_port name="stagger">not a real argument, the other has a default</input_port></Action></TreeNodesModel></root>';
const testTree11 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Action ID="go1"/><Sequence name="Sequence2"><Action ID="go2"/><Action ID="go3"/><Inverter><Action ID="go4"/></Inverter><Action ID="go5"/><Action ID="go6"/></Sequence><Action ID="go7"/><Action ID="go8"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="dumpRun"/><Action ID="go1"/><Action ID="go2"/><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/><Action ID="go7"/><Action ID="go8"/></TreeNodesModel></root>';
const testTree12 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Action ID="go1"/><Sequence name="Sequence2"><Action ID="go2"/><ForceSuccess><Action ID="go3"/></ForceSuccess><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/></Sequence><Action ID="go7"/><Action ID="go8"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="go1"/><Action ID="go2"/><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/><Action ID="go7"/><Action ID="go8"/></TreeNodesModel></root>';
const testTree13 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Condition ID="isFull"/><Action ID="go1"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="go1"/><Action ID="go2"/><Action ID="go3"/><Action ID="go4"/><Action ID="go5"/><Action ID="go6"/><Action ID="go7"/><Action ID="go8"/><Condition ID="isFull"/></TreeNodesModel></root>';
const testTree14 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Action ID="inOnlyA" in0=""/><Action ID="inOnlyB" in0="ice"/><Action ID="inOnlyB" in0=""/><Action ID="inOnlyA" in0="  ${foo.baz}"/><Action ID="outOnlyA" out0=""/><Action ID="outOnlyB" out0="baz"/><Action ID="outOnlyC" out0="${baz}"/><Action ID="outOnlyD" out0="${foo.goo}"/><Action ID="outOnlyE" out0="${fan}"/><Action ID="outOnlyF" out0="${long.untraveled.path}"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="inOnlyA"><input_port name="in0"/></Action><Action ID="inOnlyB"><input_port default="foo" name="in0"/></Action><Action ID="outOnlyA"><output_port name="out0"/></Action><Action ID="outOnlyB"><output_port default="${baz}" name="out0"/></Action><Action ID="outOnlyC"><output_port name="out0"/></Action><Action ID="outOnlyD"><output_port name="out0"/></Action><Action ID="outOnlyE"><output_port name="out0"/></Action><Action ID="outOnlyF"><output_port name="out0"/></Action></TreeNodesModel></root>';
const testTree15 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence name="Sequence1"><Action ID="inoutA" out0="${foo}"/><Action ID="inoutB" out0="${foo}"/><Action ID="inoutC" out0="${foo}"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="inoutA"><inout_port name="out0"/></Action><Action ID="inoutB"><inout_port default="foobar" name="out0"/></Action><Action ID="inoutC"><inout_port name="out0"/></Action></TreeNodesModel></root>';
const testTree16 = '<?xml version="1.0"?><root main_tree_to_execute="BehaviorTree"><BehaviorTree ID="BehaviorTree"><Sequence><Action ID="addObjOut" _in_0="1" _in_1="2" out="${foo}"/><Action ID="add" _in_0="3" _in_1="4" _out_0="${zaz}"/></Sequence></BehaviorTree><TreeNodesModel><Action ID="add"><input_port name="_in_0"/><input_port name="_in_1"/><output_port name="_out_0"/></Action><Action ID="addObjOut"><input_port name="_in_0"/><input_port name="_in_1"/><output_port name="out"/></Action></TreeNodesModel></root>';

export {
testTree9,
testTree10,
testTree11,
testTree12,
testTree13,
testTree14,
testTree15,
testTree16,
}
