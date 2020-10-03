

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
      go9:    ()=>{that.blackBoard.called.push('go9');    return 'go9'    in that.fail ? false : true},
      stay1:  ()=>{that.blackBoard.called.push('stay1');  return 'stay1'  in that.fail ? false : true},
      stay2:  ()=>{that.blackBoard.called.push('stay2');  return 'stay2'  in that.fail ? false : true},
      cIName: ()=>{that.blackBoard.called.push('cIName'); return 'cIName' in that.fail ? false : true},

      
    }

    // for good measure
    this.reset();
  }

  reset() {
    let b = this.blackBoard;
    this.fail = {};
    b.called = [];
    b.isFull = true;
    b.valueA = 0;
    b.valueB = 1;
    b.valueC = 2;
    b.valueD = 1.1;
    b.valueE = 3.14;
    b.valueF = -3.14;
    b.valueG = -1;
    b.valueH = -20;
    b.valueI = 'hello';
    b.valueJ = {a:true,b:0,c:'bye',d:1.1,e:-3.14,f:'true',g:'false'};
    b.valueK = '4';
    b.valueL = '0';
    b.valueM = '-1';
    b.valueN = '1';
    b.valueO = 'true';
    b.valueP = 'false';


  }
}

export {
Blackboard1Parent
}
