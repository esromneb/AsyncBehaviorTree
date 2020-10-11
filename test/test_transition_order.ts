import {
AsyncBehaviorTree,
IJsonFunctionWriterCb,
ABTJsonLogger,
} from "../src/AsyncBehaviorTree";

import {
BlackboardT05Parent
} from "./helpers/BlackboardT05Parent";
const testT05 = require("./btrees/t05CrossdoorNoSubtree.xml");

const util = require('util');


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

  constructor(public options: any = {print:false}) {
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

    const p = this.colorNameForStatus[prev_status];
    const s = this.colorNameForStatus[status];


    if(this.options.print || true) {
      console.log(`${name.padEnd(26,' ')} ${p} -> ${s}`);
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
    this.hardNames[''+this.currentNodeId] = hn;

    if( this.options.print || true ) {
      console.log(`set ${this.currentNodeId} = ${cb.path} = ${this.preNames[''+this.currentNodeId]}`);
    }

    this.currentNodeId++;
  }


}





// copied from test_abt_one nested sequence
test("Test AlwaysFailure", async function(done) {


  let print: boolean = false;


  let helper = new BlackboardT05Parent();

  let dut = new AsyncBehaviorTree(testT05, helper.blackBoard);

  dut.printCall = false;
  dut.printParse = false;


  let jut = new MockAsyncBehaviorTreeJsonLogger({print});
  dut.setJsonLogger(jut);


  helper.reset();

  await dut.execute();

  // console.log(helper.blackBoard.called);

    // if( print ) {
    //   console.log('called', helper.blackBoard.called);
    // }


  // expect(helper.blackBoard.called).toStrictEqual(['go1']);
  // }


  done();

});

