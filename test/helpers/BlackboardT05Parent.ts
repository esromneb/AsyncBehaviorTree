

class BlackboardT05Parent {

  blackBoard: any;
  fail: any = {};
 
  constructor() {

    // let blackBoard = this.blackBoard;

    let that = this;

    this.blackBoard = {
      called: [],
      PassThroughDoor:   ()=>{that.blackBoard.called.push('PassThroughDoor');    return 'PassThroughDoor'    in that.fail ? false : true},
      OpenDoor:          ()=>{that.blackBoard.called.push('OpenDoor');           return 'OpenDoor'           in that.fail ? false : true},
      PassThroughWindow: ()=>{that.blackBoard.called.push('PassThroughWindow');  return 'PassThroughWindow'  in that.fail ? false : true},
      CloseDoor:         ()=>{that.blackBoard.called.push('CloseDoor');          return 'CloseDoor'          in that.fail ? false : true},
      isDoorOpen: false,
    }

    // for good measure
    this.reset();
  }

  reset() {
    let b = this.blackBoard;
    this.fail = {};
    b.called = [];
    b.isDoorOpen = false;
  }
}

export {
BlackboardT05Parent
}
