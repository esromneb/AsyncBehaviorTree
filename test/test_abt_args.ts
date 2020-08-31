const assert = require("assert");
const merge = require('deepmerge');



import {
AsyncBehaviorTree
} from "../src/AsyncBehaviorTree";

const testTree13 = require("./btrees/testTree13.xml");
const testTree14 = require("./btrees/testTree14.xml");
const testTree15 = require("./btrees/testTree15.xml");
const testTree16 = require("./btrees/testTree16.xml");
const testTree16_default = require("./btrees/testTree16_default.xml");


let fail = {};
let blackBoard: any = {
  called: [],
  go1: ()=>{blackBoard.called.push('go1'); return 'go1' in fail ? false : true},
  go2: ()=>{blackBoard.called.push('go2'); return 'go2' in fail ? false : true},
  go3: ()=>{blackBoard.called.push('go3'); return 'go3' in fail ? false : true},
  go4: ()=>{blackBoard.called.push('go4'); return 'go4' in fail ? false : true},
  go5: ()=>{blackBoard.called.push('go5'); return 'go5' in fail ? false : true},
  go6: ()=>{blackBoard.called.push('go6'); return 'go6' in fail ? false : true},
  go7: ()=>{blackBoard.called.push('go7'); return 'go7' in fail ? false : true},
  go8: ()=>{blackBoard.called.push('go8'); return 'go8' in fail ? false : true},
  isFull: true,
}

function reset() {
  fail = {};
  blackBoard.called = [];
  blackBoard2.called = [];
  blackBoard3.called = [];

  blackBoard.isFull = true;

  blackBoard2.foo = {
    baz: "yes this is baz",
  };
  blackBoard2.baz = "Baz is unnested";
  delete blackBoard2.long;

  blackBoard3.foo = 'default string';
}



test("test condition", async function(done) {

  let print: boolean = false;

  const expected = ['go1'];

  let dut = this.bt = new AsyncBehaviorTree(testTree13, blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  await dut.execute();
  expect(blackBoard.called).toStrictEqual(expected);

  reset();
  blackBoard.isFull = false;
  await dut.execute();
  expect(blackBoard.called).toStrictEqual([]);


  done();

});





let blackBoard2: any = {
  called: [],
  inOnlyA: (opts: any = {})=>{
    // const opts = merge({frames: 1, stagger:1}, _opts);

    blackBoard2.called.push(['inOnlyA',opts]);

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

    let o = {
      ret: ret,
      out0: 'should keep outOnlyD'
    };

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






test("test args", async function(done) {

  let print: boolean = false;


  let dut = this.bt = new AsyncBehaviorTree(testTree14, blackBoard2);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  fail['outOnlyA'] = true;
  await dut.execute();




  const expected =[   [ 'inOnlyA', { in0: '' } ],
    [ 'inOnlyB', { in0: 'ice' } ],
    [ 'inOnlyB', { in0: 'foo' } ],
    [ 'inOnlyA', { in0: 'yes this is baz' } ],
  ];

  for(let i = 0; i < 4; i++ ) {
    expect(blackBoard2.called[i]).toStrictEqual(expected[i]);
  }

  expect(blackBoard2.baz).toBe("Baz is unnested");


  reset();
  fail['outOnlyC'] = true;
  await dut.execute();

  expect(blackBoard2.baz).toBe('should keep outOnlyC');



  reset();
  fail['outOnlyD'] = true;
  await dut.execute();

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');



  reset();
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.foo.goo).toBe('should keep outOnlyD');



  reset();
  fail['outOnlyD'] = true;
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.foo.goo).toBe('should keep outOnlyD');

  reset();
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.long.untraveled.path).toBe('should keep outOnlyF');


  done();

});


test("test undefined fetch blackboard value", async function(done) {

  let print: boolean = false;

  let warnings = [];


  let dut = this.bt = new AsyncBehaviorTree(testTree14, blackBoard2, (m)=>{warnings.push(m)});

  dut.printCall = false;
  dut.printParse = false;


  reset();
  fail['outOnlyA'] = true;

  blackBoard2.foo = {
  };

  await dut.execute();




  const expected =[   [ 'inOnlyA', { in0: '' } ],
    [ 'inOnlyB', { in0: 'ice' } ],
    [ 'inOnlyB', { in0: 'foo' } ],
    [ 'inOnlyA', { in0: undefined } ],
  ];

  for(let i = 0; i < 4; i++ ) {
    expect(blackBoard2.called[i]).toStrictEqual(expected[i]);
  }

  // console.log(blackBoard2);

  // console.log(warnings);

  expect(blackBoard2.foo).toStrictEqual({});
  // expect(blackBoard2.baz).toBe("Baz is unnested");

  done()


});


test("test warn create new objects", async function(done) {

  let print: boolean = false;

  let warnings = [];

  let dut = this.bt = new AsyncBehaviorTree(testTree14, blackBoard2, (m)=>{warnings.push(m)});

  dut.printCall = false;
  dut.printParse = false;
  dut.warnWhenCreatingNewObjects = false;


  reset();
  await dut.execute();

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.long.untraveled.path).toBe('should keep outOnlyF');

  // verify we are getting no warnings
  expect(warnings).toStrictEqual([]);



  dut.warnWhenCreatingNewObjects = true;

  reset();
  // blackboard reset is not correcly deleting this
  delete blackBoard2.long;
  await dut.execute();

  // console.log(blackBoard2.called);
  // console.log(blackBoard2);

  expect(blackBoard2.baz).not.toBe("Baz is unnested");
  expect(blackBoard2.baz).toBe('should keep outOnlyC');
  expect(blackBoard2.long.untraveled.path).toBe('should keep outOnlyF');

  // we should get 2 warnings, too lazy to parse into the text
  expect(warnings.length).toBe(2);




  done();

});














let blackBoard3: any = {
  called: [],
  inoutA: (opts: any = {})=>{
    blackBoard3.called.push(['inoutA',opts]);

    let ret = 'inoutA' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep inoutA'
    };

    return o;
  },
  inoutB: (opts: any = {})=>{
    blackBoard3.called.push(['inoutB',opts]);

    let ret = 'inoutB' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep inoutB'
    };

    return o;
  },

  inoutC: (opts: any = {})=>{
    blackBoard3.called.push(['inoutC',opts]);

    let ret = 'inoutC' in fail ? false : true;

    let o = {
      ret: ret,
      out0: 'should keep inoutC'
    };

    return o;
  },

  addObjOut: (_a: string, _b: string) => {
    const a = Number(_a);
    const b = Number(_b);

    let ret = 'addObjOut' in fail ? false : true;

    let o = {
      ret: ret,
      out: a+b,
    };

    // console.log(_a);
    // console.log(`add called with ${_a} ${b}`);
    return o;
  },

  add: (_a: string, _b: string) => {
    const a = Number(_a);
    const b = Number(_b);

    let ret = 'addObjOut' in fail ? false : true;

    // let o = {
    //   ret: ret,
    //   out: a+b,
    // };

    // console.log(_a);
    // console.log(`add called with ${_a} ${b}`);
    // return o;
    return a+b;
  },

  // do not change these without also changing reset()
  foo: 'default string'

}



test("test inout", async function(done) {

  let print: boolean = false;


  let dut = this.bt = new AsyncBehaviorTree(testTree15, blackBoard3);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  // fail['outOnlyA'] = true;
  await dut.execute();


  const expected =[
  [ 'inoutA', { out0: 'default string' } ],
  [ 'inoutB', { out0: 'should keep inoutA' } ],
  [ 'inoutC', { out0: 'should keep inoutB' } ]
];

  for(let i = 0; i < 3; i++ ) {
    expect(blackBoard3.called[i]).toStrictEqual(expected[i]);
  }

  expect(blackBoard3.foo).toBe('should keep inoutC');

  

  reset();
  fail['inoutA'] = true;
  await dut.execute();

  expect(blackBoard3.foo).toBe('should keep inoutA');


  reset();
  fail['inoutB'] = true;
  await dut.execute();

  expect(blackBoard3.foo).toBe('should keep inoutB');

  // console.log(blackBoard3.called);
  // console.log(blackBoard3);

  reset();
  fail['inoutC'] = true;
  await dut.execute();

  expect(blackBoard3.foo).toBe('should keep inoutC');

  done();

});


test("test unnamed ports", async function(done) {



  let print: boolean = false;


  let dut = this.bt = new AsyncBehaviorTree(testTree16, blackBoard3);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  // fail['outOnlyA'] = true;
  await dut.execute();

  if( print ) {
    console.log(blackBoard3.called);
    console.log(blackBoard3);
  }

  expect(blackBoard3.foo).toBe(3);
  expect(blackBoard3.zaz).toBe(7);

  if( print ) {
    console.log(blackBoard3);
  }

  done();
});


test("test unnamed ports default", async function(done) {

  let print: boolean = false;


  let dut = this.bt = new AsyncBehaviorTree(testTree16_default, blackBoard3);

  dut.printCall = false;
  dut.printParse = false;


  reset();
  // fail['outOnlyA'] = true;
  await dut.execute();

  if( print ) {
    console.log(blackBoard3.called);
    console.log(blackBoard3);
  }

  expect(blackBoard3.foo).toBe(3);
  expect(blackBoard3.zaz).toBe(198);

  if( print ) {
    console.log(blackBoard3);
  }

  done();
});
