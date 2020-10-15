import {
AsyncBehaviorTree,
IJsonFunctionWriterCb,
ABTJsonLogger,
} from "../src/AsyncBehaviorTree";

import {
BlackboardT05Parent
} from "./helpers/BlackboardT05Parent";
const testT05 = require("./btrees/t05CrossdoorNoSubtree.xml");
const testT05_3 = require("./btrees/t05Crossdoor3.xml");
const testT05_4 = require("./btrees/t05Crossdoor4.xml");
const testT05_5 = require("./btrees/t05Crossdoor5.xml");

const util = require('util');

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
let color = {
'Reset' : "\x1b[0m",
'Bright' : "\x1b[1m",
'Dim' : "\x1b[2m",
'Underscore' : "\x1b[4m",
'Blink' : "\x1b[5m",
'Reverse' : "\x1b[7m",
'Hidden' : "\x1b[8m",

'FgBlack' : "\x1b[30m",
'FgRed' : "\x1b[31m",
'FgGreen' : "\x1b[32m",
'FgYellow' : "\x1b[33m",
'FgBlue' : "\x1b[34m",
'FgMagenta' : "\x1b[35m",
'FgCyan' : "\x1b[36m",
'FgWhite' : "\x1b[37m",

'BgBlack' : "\x1b[40m",
'BgRed' : "\x1b[41m",
'BgGreen' : "\x1b[42m",
'BgYellow' : "\x1b[43m",
'BgBlue' : "\x1b[44m",
'BgMagenta' : "\x1b[45m",
'BgCyan' : "\x1b[46m",
'BgWhite' : "\x1b[47m",
};



class MockAsyncBehaviorTreeJsonLogger implements ABTJsonLogger{

  nodeOffset: number = 100;

  savedXml: string;

  verifyTransitions = undefined;
  verifyNodes = undefined;

  constructor(public forceCb: any, public options: any = {print:false,printTransitions:true}) {
    this.currentNodeId = this.nodeOffset;
  }


  parseXML(xml: string): void {
    if(this.options.print) {
      console.log("Saved xml length " + xml.length);
    }
    this.savedXml = xml;
  }

  transitionCount: number = 0;


  //    idle: 0,
  //    running: 1,
  //    success: 2,
  //    failure: 3

  nameForStatus = {0:'IDLE', 1:'RUNNING', 2:'SUCCESS',3:'FAILURE'};
  colorNameForStatus = {0:`${color.FgCyan}IDLE${color.Reset}`, 1:`${color.FgYellow}RUNNING${color.Reset}`, 2:`${color.FgGreen}SUCCESS${color.Reset}`,3:`${color.FgRed}FAILURE${color.Reset}`};

  logTransition(uid: number, prev_status: number, status: number): void {

    const path = this.pathForNode[uid];
    const name = this.hardNames[uid];

    const cp = this.colorNameForStatus[prev_status];
    const cs = this.colorNameForStatus[status];
    const p = this.nameForStatus[prev_status];
    const s = this.nameForStatus[status];

    let len = cp.length + cs.length;



    if(this.options.printTransitions) {
      console.log(`${name.padEnd(26,' ')} ${cp} -> ${cs}      ${path.padStart(40-len+path.length, ' ')}`);
    }


    if( this.verifyTransitions != undefined && this.transitionCount < this.verifyTransitions.length ) {
      const got = `${p} -> ${s}`;
      const expected = this.verifyTransitions[this.transitionCount];
      expect(got).toBe(expected);

    }

    this.transitionCount++;
  }

  getNameForUID(u: number): string {
    if( this.options.print ) {
      // console.log(`getNameForUID ${u}`);
    }
    return this.preNames[''+u];
  }
  getForPath(path: string): number {
    if( this.options.print ) {
      // console.log(`getForPath ${path}`);
    }
    return this.preWalkPaths[path];
  }

  cb: IJsonFunctionWriterCb;

  writeJsonToCallback(cb: IJsonFunctionWriterCb) {
    this.cb = cb;
  }

  pathForNode = {};

  preNames = {};

  hardNames = {};

  preWalkPaths = {};

  currentNodeId: number;

  preWalkTree(cb: any): void {
    this.preWalkPaths[cb.path] = this.currentNodeId;

    this.pathForNode[this.currentNodeId] = cb.path;

    this.preNames[''+this.currentNodeId] = cb.name || cb.w;
    
    let hn = cb.name || cb.w;

    hn = this.forceCb(this.currentNodeId, hn);

    this.hardNames[''+this.currentNodeId] = hn;

    if( this.options.print || true ) {
      console.log(`set ${this.currentNodeId} = ${cb.path} = ${this.preNames[''+this.currentNodeId]}`);
    }

    this.currentNodeId++;
  }

  setVerifyTransitions(r: string): void {
    let s1 = r.split('\n').filter(x=>x.length!==0);
    // console.log(s1);

    this.verifyTransitions = s1;

  }


}

function force1(currentNodeId: number, hn:string): string {

  switch(this.currentNodeId) {
    case 100:
      hn = 'Sequence';
      break;
    case 101:
      hn = 'root_Fallback';
      break;
    case 102:
      hn = 'door_open_sequence';
      break;
    case 103:
      hn = 'IsDoorOpen';
      break;
    case 105:
      hn = 'door_closed_sequence';
      break;
    case 106:
      hn = 'Inverter';
      break;
    case 108:
      hn = 'RetryUntilSuccessful';
      break;
  }

  return hn;
}



// copied from test_abt_one nested sequence
test.skip("Test t05 log", async function(done) {


  let print: boolean = false;


  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger(force1, {print, printTransitions: true});
  dut.setJsonLogger(jut);


  helper.reset();

  helper.fail['OpenDoor'] = true;

  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }


  // expect(helper.blackBoard.called).toStrictEqual(['go1']);
  // }


  done();

});


function force3(currentNodeId: number, hn:string): string {

  switch(this.currentNodeId) {
    case 100:
      hn = 'SeqA';
      break;
    case 101:
      hn = 'root_Fallback';
      break;
    case 102:
      hn = 'SeqB';
      break;
    case 104:
      hn = 'SeqC';
      break;
    case 107:
      hn = 'SeqD';
      break;
    case 112:
      hn = 'SeqE';
      break;
    case 114:
      hn = 'SeqF';
      break;
    case 116:
      hn = 'SeqG';
      break;
  }

  return hn;
}

const expectedTransitions3 = `
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> FAILURE
SUCCESS -> IDLE
SUCCESS -> IDLE
SUCCESS -> IDLE
FAILURE -> IDLE
RUNNING -> FAILURE
SUCCESS -> IDLE
SUCCESS -> IDLE
FAILURE -> IDLE
RUNNING -> FAILURE
SUCCESS -> IDLE
FAILURE -> IDLE
RUNNING -> FAILURE
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
FAILURE -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
SUCCESS -> IDLE
`;






test.skip("Test t05 log 3", async function(done) {


  let print: boolean = false;


  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05_3, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger(force3, {print, printTransitions: true});
  dut.setJsonLogger(jut);

  // jut.setVerifyTransitions(expectedTransitions3);

  // jut.verifyTransitions = jut.verifyTransitions.slice(0,26);


  helper.reset();

  helper.fail['OpenDoor'] = true;
  helper.fail['PassThroughDoor'] = true;

  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }


  // expect(helper.blackBoard.called).toStrictEqual(['go1']);
  // }


  done();

});





function force4(currentNodeId: number, hn:string): string {

  switch(this.currentNodeId) {
    case 100:
      hn = 'SeqA';
      break;
    case 101:
      hn = 'root_Fallback';
      break;
    case 102:
      hn = 'SeqB';
      break;
    case 104:
      hn = 'SeqE';
      break;
    // case 107:
    //   hn = 'SeqD';
    //   break;
    // case 112:
    //   hn = 'SeqE';
    //   break;
    // case 114:
    //   hn = 'SeqF';
    //   break;
    // case 116:
    //   hn = 'SeqG';
    //   break;
  }

  return hn;
}

const expectedTransitions4 = `
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> FAILURE
FAILURE -> IDLE
RUNNING -> FAILURE
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
FAILURE -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
SUCCESS -> IDLE
`;





test("Test t05 log 4", async function(done) {
  let print: boolean = false;

  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05_4, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger(force4, {print, printTransitions: true});
  dut.setJsonLogger(jut);

  jut.setVerifyTransitions(expectedTransitions4);
  // jut.verifyTransitions = jut.verifyTransitions.slice(0,26);


  helper.reset();

  helper.fail['OpenDoor'] = true;
  helper.fail['PassThroughDoor'] = true;

  await dut.execute();

  done();
});







function force5(currentNodeId: number, hn:string): string {

  switch(this.currentNodeId) {
    case 100:
      hn = 'SeqA';
      break;
    case 101:
      hn = 'Sequence';
      break;
    case 102:
      hn = 'SeqB';
      break;
    case 104:
      hn = 'SeqE';
      break;
    // case 107:
    //   hn = 'SeqD';
    //   break;
    // case 112:
    //   hn = 'SeqE';
    //   break;
    // case 114:
    //   hn = 'SeqF';
    //   break;
    // case 116:
    //   hn = 'SeqG';
    //   break;
  }

  return hn;
}





const expectedTransitions5 = `
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
SUCCESS -> IDLE
`;




// First one I got working
// however as of now it's short due to shenanigans with the ptr = -1
// stuff.  I need a way to fix this without affecting call order
test("Test t05 log 5", async function(done) {
  let print: boolean = false;

  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05_5, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger(force5, {print, printTransitions: true});
  dut.setJsonLogger(jut);

  jut.setVerifyTransitions(expectedTransitions5);
  // jut.verifyTransitions = jut.verifyTransitions.slice(0,26);


  helper.reset();

  helper.fail['OpenDoor'] = true;
  helper.fail['PassThroughDoor'] = true;

  await dut.execute();

  expect(jut.transitionCount).toBe(jut.verifyTransitions.length);

  done();
});

const expectedTransitions5A = `
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
IDLE -> RUNNING
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
SUCCESS -> IDLE
SUCCESS -> IDLE
RUNNING -> SUCCESS
IDLE -> RUNNING
RUNNING -> FAILURE
SUCCESS -> IDLE
FAILURE -> IDLE
RUNNING -> FAILURE
FAILURE -> IDLE
`;


// same as above, but CloseDoor fails
test("Test t05 log 5 last node fails", async function(done) {
  let print: boolean = false;

  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05_5, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger(force5, {print, printTransitions: true});
  dut.setJsonLogger(jut);

  jut.setVerifyTransitions(expectedTransitions5A);


  helper.reset();

  helper.fail['OpenDoor'] = true;
  helper.fail['CloseDoor'] = true;
  helper.fail['PassThroughDoor'] = true;

  await dut.execute();

  expect(jut.transitionCount).toBe(jut.verifyTransitions.length);

  done();
});
