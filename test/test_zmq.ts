const assert = require("assert");
const merge = require('deepmerge');



import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

import {
BehaviorTreeFlatBuffer
} from "behavior-tree-flat-buffer";

import {
BehaviorTreeZmq
} from "behavior-tree-zmq";

const testTree3a = require("./btrees/testTree3a.xml");
const testTree5 = require("./btrees/testTree5.xml");
const testTree5a = require("./btrees/testTree5a.xml");
const testTree5b = require("./btrees/testTree5b.xml");
const testTree7 = require("./btrees/testTree7.xml");
const testTree13 = require("./btrees/testTree13.xml");
const testTree14 = require("./btrees/testTree14.xml");
const testTree14a = require("./btrees/testTree14a.xml");
const testTree14b = require("./btrees/testTree14b.xml");
const testTree15 = require("./btrees/testTree15.xml");
const testTree16 = require("./btrees/testTree16.xml");
const testTree16a = require("./btrees/testTree16a.xml");
const testTree16_default = require("./btrees/testTree16_default.xml");


// global single instance of this
let btfb;

// can return a promise, but doesn't have to
beforeAll(() => {
  btfb = new BehaviorTreeFlatBuffer();

  return btfb.start();

  // return initializeCityDatabase();
});



function injectD(dut, id, p: string, n: string, duraton: number): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransitionDuration(id, t[p], t[n], duraton);
}

let adtime = 0;

function injectAD(dut, id, p: string, n: string): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransitionDuration(id, t[p], t[n], adtime);
  adtime += 100;
}



async function _sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}



let fail = {};
let blackBoard: any = {
  called: [],
  go1:    async ()=>{blackBoard.called.push('go1');    await _sleep(1000); return 'go1'    in fail ? false : true},
  go2:    async ()=>{blackBoard.called.push('go2');    await _sleep(1000); return 'go2'    in fail ? false : true},
  go3:    async ()=>{blackBoard.called.push('go3');    await _sleep(1000); return 'go3'    in fail ? false : true},
  go4:    async ()=>{blackBoard.called.push('go4');    await _sleep(1000); return 'go4'    in fail ? false : true},
  go5:    async ()=>{blackBoard.called.push('go5');    await _sleep(1000); return 'go5'    in fail ? false : true},
  go6:    async ()=>{blackBoard.called.push('go6');    await _sleep(1000); return 'go6'    in fail ? false : true},
  go7:    async ()=>{blackBoard.called.push('go7');    await _sleep(1000); return 'go7'    in fail ? false : true},
  go8:    async ()=>{blackBoard.called.push('go8');    await _sleep(1000); return 'go8'    in fail ? false : true},
  stay1:  async ()=>{blackBoard.called.push('stay1');  await _sleep(1000); return 'stay1'  in fail ? false : true},
  stay2:  async ()=>{blackBoard.called.push('stay2');  await _sleep(1000); return 'stay2'  in fail ? false : true},
  cIName: async ()=>{blackBoard.called.push('cIName'); await _sleep(1000); return 'cIName' in fail ? false : true},
  isFull: true,
}

function reset() {
  fail = {};
  blackBoard.called = [];
  blackBoard2.called = [];

  blackBoard.isFull = true;

  blackBoard2.foo = {
    baz: "yes this is baz",
  };
  blackBoard2.baz = "Baz is unnested";
  delete blackBoard2.long;

  blackBoard2.altOutputD = false;
  blackBoard2.altOutputInOnlyA = false;
}







let blackBoard2: any = {
  altOutputInOnlyA: false,
  altOutputD: false,
  called: [],
  inOnlyA: (opts: any = {})=>{
    // const opts = merge({frames: 1, stagger:1}, _opts);

    blackBoard2.called.push(['inOnlyA',opts]);

    if( blackBoard2.altOutputInOnlyA ) {
      return undefined;
    }

    let ret = 'inOnlyA' in fail ? false : true;

    return ret;

    // return 
  },
  inOnlyB: (opts: any = {})=>{
    blackBoard2.called.push(['inOnlyB',opts]);

    let ret = 'inOnlyA' in fail ? false : true;

    return ret;
  },
  outOnlyA: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyA',opts]);

    let ret = 'outOnlyA' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should discard outOnlyA'
    };

    return o;
  },
  outOnlyB: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyB',opts]);

    let ret = 'outOnlyB' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should discard outOnlyB'
    };

    return o;
  },
  outOnlyC: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyC',opts]);

    let ret = 'outOnlyC' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyC'
    };

    return o;
  },

  outOnlyD: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyD',opts]);

    let ret = 'outOnlyD' in fail ? false : true;

    let o;
    // FIXME issue #1
    if( blackBoard2.altOutputD ) {
      o = {
        ret: ret,
        out0: 'should keep outOnlyD',
        outB: 'going to B',
        outC: 'going to C',
      };

    } else {
      o = {
        ret: ret,
        out0: 'should keep outOnlyD'
      };
    }

    return o;
  },

  outOnlyE: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyE',opts]);

    let ret = 'outOnlyE' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyE'
    };

    return o;
  },

  outOnlyF: (opts: any = {})=>{
    blackBoard2.called.push(['outOnlyF',opts]);

    let ret = 'outOnlyF' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep outOnlyF'
    };

    return o;
  },

  // do not change these without also changing reset()
  foo: {
    baz: "yes this is baz",
  },
  // do not change these without also changing reset()
  baz: "Baz is unnested",
}



function inject(dut, id, p: string, n: string): void {
  const t = {
    idle: 0,
    running: 1,
    success: 2,
    failure: 3
  };


  dut.logTransition(id, t[p], t[n]);
}






const util = require('util')


const runServerFor = 990000;
// jest.setTimeout(runServerFor);


test.skip("test zmq integration", async function(done) {

  const logpath = './node5b.fbl';


  let zut = new BehaviorTreeZmq();


  let print: boolean = false;

  // const expected = ['go1'];

  let dut = new AsyncBehaviorTree(testTree5b, blackBoard);

  await dut.setZmqLogger(btfb, zut);

  await zut.run();

  // await dut.setFileLogger(btfb, logpath);

  dut.printCall = true;

  // console.log(dut.exe);

  // console.log(util.inspect(dut.exe, {showHidden: false, depth: null}))



  reset();

  fail = []
  blackBoard.isFull = false;

  while(1) {
    await dut.execute();
  }


  setTimeout(()=>{

    done();
  }, runServerFor-1000);


});





