

class Blackboard1Parent {

  blackBoard: any;
  fail: any = {};
 
  constructor() {

    // let blackBoard = this.blackBoard;

    let that = this;

    this.blackBoard = {
      called: [],
      go1:    ()=>{that.blackBoard.called.push('go1');    return 'go1'    in that.fail ? false : true},
      go2:    ()=>{that.blackBoard.called.push('go2');    return 'go2'    in that.fail ? false : true},
      go3:    ()=>{that.blackBoard.called.push('go3');    return 'go3'    in that.fail ? false : true},
      go4:    ()=>{that.blackBoard.called.push('go4');    return 'go4'    in that.fail ? false : true},
      go5:    ()=>{that.blackBoard.called.push('go5');    return 'go5'    in that.fail ? false : true},
      go6:    ()=>{that.blackBoard.called.push('go6');    return 'go6'    in that.fail ? false : true},
      go7:    ()=>{that.blackBoard.called.push('go7');    return 'go7'    in that.fail ? false : true},
      go8:    ()=>{that.blackBoard.called.push('go8');    return 'go8'    in that.fail ? false : true},
      stay1:  ()=>{that.blackBoard.called.push('stay1');  return 'stay1'  in that.fail ? false : true},
      stay2:  ()=>{that.blackBoard.called.push('stay2');  return 'stay2'  in that.fail ? false : true},
      cIName: ()=>{that.blackBoard.called.push('cIName'); return 'cIName' in that.fail ? false : true},
      isFull: true,
    }

    // for good measure
    this.reset();
  }

  reset() {
    this.fail = {};
    this.blackBoard.called = [];
    this.blackBoard.isFull = true;

  }
}

export {
Blackboard1Parent
}
